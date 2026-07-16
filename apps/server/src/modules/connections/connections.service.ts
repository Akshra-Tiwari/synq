import mongoose from 'mongoose';
import { Connection } from './connections.model';
import { User }       from '../users/users.model';
import { ApiError }   from '../../utils/ApiError';
import { NotificationsService } from '../notifications/notifications.service';

const USER_SELECT = 'name username avatar bio skills techStack location openToWork availability stats';

export class ConnectionsService {
  // ─── Send connection request ───────────────────────────────────────────────
  static async sendRequest(requesterId: string, recipientId: string) {
    if (requesterId === recipientId) {
      throw ApiError.badRequest('You cannot connect with yourself');
    }

    const recipientExists = await User.exists({ _id: recipientId });
    if (!recipientExists) throw ApiError.notFound('User not found');

    // Check for any existing connection between the two users (either direction)
    const existing = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === 'pending')  throw ApiError.conflict('Connection request already sent');
      if (existing.status === 'accepted') throw ApiError.conflict('Already connected');

      // Allow re-sending if previously rejected/removed — reuse the document
      existing.requester = new mongoose.Types.ObjectId(requesterId);
      existing.recipient = new mongoose.Types.ObjectId(recipientId);
      existing.status    = 'pending';
      await existing.save();
      return existing;
    }

    const connection = await Connection.create({ requester: requesterId, recipient: recipientId });

    // Notify recipient (non-blocking)
    const requester = await User.findById(requesterId).select('name').lean();
    if (requester) {
      NotificationsService.notifyConnectionRequest(
        recipientId,
        requesterId,
        (requester as { name: string }).name,
      ).catch(() => {});
    }

    return connection;
  }

  // ─── Accept request ────────────────────────────────────────────────────────
  static async acceptRequest(recipientId: string, requesterId: string) {
    const connection = await Connection.findOne({
      requester: requesterId,
      recipient: recipientId,
      status:    'pending',
    });

    if (!connection) throw ApiError.notFound('Connection request not found');

    connection.status = 'accepted';
    await connection.save();

    await Promise.all([
      User.findByIdAndUpdate(requesterId, { $inc: { 'stats.connectionsCount': 1 } }),
      User.findByIdAndUpdate(recipientId, { $inc: { 'stats.connectionsCount': 1 } }),
    ]);

    // Notify the original requester (non-blocking)
    const accepter = await User.findById(recipientId).select('name').lean();
    if (accepter) {
      NotificationsService.notifyConnectionAccepted(
        requesterId,
        recipientId,
        (accepter as { name: string }).name,
      ).catch(() => {});
    }

    return connection;
  }

  // ─── Reject request ────────────────────────────────────────────────────────
  static async rejectRequest(recipientId: string, requesterId: string) {
    const connection = await Connection.findOne({
      requester: requesterId,
      recipient: recipientId,
      status:    'pending',
    });

    if (!connection) throw ApiError.notFound('Connection request not found');

    connection.status = 'rejected';
    await connection.save();
    return connection;
  }

  // ─── Remove connection ─────────────────────────────────────────────────────
  static async removeConnection(userId: string, otherUserId: string) {
    const connection = await Connection.findOne({
      $or: [
        { requester: userId, recipient: otherUserId },
        { requester: otherUserId, recipient: userId },
      ],
      status: 'accepted',
    });

    if (!connection) throw ApiError.notFound('Connection not found');

    connection.status = 'removed';
    await connection.save();

    // Decrement both users' connection counts
    await Promise.all([
      User.findByIdAndUpdate(connection.requester, { $inc: { 'stats.connectionsCount': -1 } }),
      User.findByIdAndUpdate(connection.recipient, { $inc: { 'stats.connectionsCount': -1 } }),
    ]);

    return connection;
  }

  // ─── Withdraw sent request ─────────────────────────────────────────────────
  static async withdrawRequest(requesterId: string, recipientId: string) {
    const connection = await Connection.findOne({
      requester: requesterId,
      recipient: recipientId,
      status:    'pending',
    });

    if (!connection) throw ApiError.notFound('Connection request not found');
    await connection.deleteOne();
  }

  // ─── Get relationship status between two users ────────────────────────────
  static async getStatus(userId: string, otherUserId: string) {
    const connection = await Connection.findOne({
      $or: [
        { requester: userId,      recipient: otherUserId },
        { requester: otherUserId, recipient: userId },
      ],
    }).lean();

    if (!connection) return { status: 'none' as const, connectionId: null };

    const isSender = connection.requester.toString() === userId;

    return {
      status:       connection.status,
      connectionId: connection._id.toString(),
      isSender,
    };
  }

  // ─── List accepted connections ─────────────────────────────────────────────
  static async getConnections(userId: string, page: number, limit: number) {
    const uid  = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    const [connections, total] = await Promise.all([
      Connection.find({
        $or: [{ requester: uid }, { recipient: uid }],
        status: 'accepted',
      })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'requester', select: USER_SELECT })
        .populate({ path: 'recipient', select: USER_SELECT })
        .lean(),
      Connection.countDocuments({
        $or: [{ requester: uid }, { recipient: uid }],
        status: 'accepted',
      }),
    ]);

    // Return the "other" user in each connection
    const peers = connections.map((c) => {
      const isRequester = c.requester._id.toString() === userId;
      return {
        connectionId: c._id,
        connectedAt:  c.updatedAt,
        user: isRequester ? c.recipient : c.requester,
      };
    });

    return { connections: peers, total, totalPages: Math.ceil(total / limit), page };
  }

  // ─── Pending requests received ────────────────────────────────────────────
  static async getPendingReceived(userId: string) {
    const requests = await Connection.find({
      recipient: userId,
      status:    'pending',
    })
      .sort({ createdAt: -1 })
      .populate({ path: 'requester', select: USER_SELECT })
      .lean();

    return requests.map((r) => ({
      connectionId: r._id,
      requestedAt:  r.createdAt,
      user:         r.requester,
    }));
  }

  // ─── Sent requests ────────────────────────────────────────────────────────
  static async getPendingSent(userId: string) {
    const requests = await Connection.find({
      requester: userId,
      status:    'pending',
    })
      .sort({ createdAt: -1 })
      .populate({ path: 'recipient', select: USER_SELECT })
      .lean();

    return requests.map((r) => ({
      connectionId: r._id,
      requestedAt:  r.createdAt,
      user:         r.recipient,
    }));
  }

  // ─── Mutual connections count ──────────────────────────────────────────────
  static async getMutualCount(userId: string, otherUserId: string): Promise<number> {
    const uid      = new mongoose.Types.ObjectId(userId);
    const otherId  = new mongoose.Types.ObjectId(otherUserId);

    // Get all connection peer IDs for userId
    const myConnections = await Connection.find({
      $or: [{ requester: uid }, { recipient: uid }],
      status: 'accepted',
    }).select('requester recipient').lean();

    const myPeerIds = myConnections.map((c) =>
      c.requester.toString() === userId
        ? c.recipient.toString()
        : c.requester.toString(),
    );

    // Get all connection peer IDs for otherUserId
    const otherConnections = await Connection.find({
      $or: [{ requester: otherId }, { recipient: otherId }],
      status: 'accepted',
    }).select('requester recipient').lean();

    const otherPeerIds = new Set(
      otherConnections.map((c) =>
        c.requester.toString() === otherUserId
          ? c.recipient.toString()
          : c.requester.toString(),
      ),
    );

    return myPeerIds.filter((id) => otherPeerIds.has(id)).length;
  }

  // ─── Suggested connections (people you may know) ──────────────────────────
  static async getSuggestions(userId: string, limit = 8) {
    // Get IDs of people already connected or with pending requests
    const existing = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: { $in: ['pending', 'accepted'] },
    }).select('requester recipient').lean();

    const excludeIds = new Set<string>([userId]);
    existing.forEach((c) => {
      excludeIds.add(c.requester.toString());
      excludeIds.add(c.recipient.toString());
    });

    const currentUser = await User.findById(userId).select('skills techStack').lean();
    if (!currentUser) return [];

    // Find users sharing skills/tech not already connected
    const suggestions = await User.find({
      _id: { $nin: Array.from(excludeIds).map((id) => new mongoose.Types.ObjectId(id)) },
      $or: [
        { skills:    { $in: currentUser.skills } },
        { techStack: { $in: currentUser.techStack } },
      ],
    })
      .select(USER_SELECT)
      .sort({ 'stats.connectionsCount': -1 })
      .limit(limit)
      .lean();

    return suggestions;
  }

  // ─── Check if two users are connected ─────────────────────────────────────
  static async areConnected(userId: string, otherUserId: string): Promise<boolean> {
    const exists = await Connection.exists({
      $or: [
        { requester: userId,      recipient: otherUserId },
        { requester: otherUserId, recipient: userId },
      ],
      status: 'accepted',
    });
    return !!exists;
  }
}
