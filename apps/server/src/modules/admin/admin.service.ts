import mongoose from 'mongoose';
import { User }         from '../users/users.model';
import { Post }         from '../posts/posts.model';
import { Project }      from '../projects/projects.model';
import { Connection }   from '../connections/connections.model';
import { ApiError }     from '../../utils/ApiError';

export class AdminService {
  static async getAnalytics() {
    const [
      totalUsers, verifiedUsers, totalPosts, totalProjects,
      totalConnections, openToWorkUsers,
      newUsersToday, newUsersThisWeek, newPostsToday, newPostsThisWeek,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      Post.countDocuments({ isHidden: false }),
      Project.countDocuments({ isHidden: false }),
      Connection.countDocuments({ status: 'accepted' }),
      User.countDocuments({ openToWork: true }),
      User.countDocuments({ createdAt: { $gte: startOf('day') } }),
      User.countDocuments({ createdAt: { $gte: startOf('week') } }),
      Post.countDocuments({ createdAt: { $gte: startOf('day') } }),
      Post.countDocuments({ createdAt: { $gte: startOf('week') } }),
    ]);

    const [topSkills, topTech, signupTrend, postTrend, topPosters, availabilityDist] =
      await Promise.all([
        User.aggregate([
          { $unwind: '$skills' },
          { $group: { _id: '$skills', count: { $sum: 1 } } },
          { $sort: { count: -1 } }, { $limit: 10 },
          { $project: { skill: '$_id', count: 1, _id: 0 } },
        ]),
        User.aggregate([
          { $unwind: '$techStack' },
          { $group: { _id: '$techStack', count: { $sum: 1 } } },
          { $sort: { count: -1 } }, { $limit: 10 },
          { $project: { tech: '$_id', count: 1, _id: 0 } },
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: daysAgo(14) } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } }, { $project: { date: '$_id', count: 1, _id: 0 } },
        ]),
        Post.aggregate([
          { $match: { createdAt: { $gte: daysAgo(14) } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } }, { $project: { date: '$_id', count: 1, _id: 0 } },
        ]),
        User.find().sort({ 'stats.postsCount': -1 }).limit(5)
          .select('name username avatar stats.postsCount').lean(),
        User.aggregate([
          { $group: { _id: '$availability', count: { $sum: 1 } } },
          { $project: { availability: '$_id', count: 1, _id: 0 } },
        ]),
      ]);

    return {
      overview: {
        totalUsers, verifiedUsers, totalPosts, totalProjects,
        totalConnections, openToWorkUsers,
        newUsersToday, newUsersThisWeek, newPostsToday, newPostsThisWeek,
        verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
      },
      topSkills, topTech, signupTrend, postTrend, topPosters, availabilityDist,
    };
  }

  static async listUsers(query: string | undefined, page: number, limit: number, filter: string) {
    const match: Record<string, unknown> = {};
    if (query) match.$text = { $search: query };
    if (filter === 'verified')   match.isVerified = true;
    if (filter === 'unverified') match.isVerified = false;
    if (filter === 'admins')     match.role = 'admin';
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(match).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .select('name username email avatar role isVerified createdAt stats').lean(),
      User.countDocuments(match),
    ]);
    return { users, total, totalPages: Math.ceil(total / limit), page };
  }

  static async setUserRole(userId: string, role: 'user' | 'admin') {
    const user = await User.findByIdAndUpdate(userId, { $set: { role } }, { new: true })
      .select('name username role');
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  static async verifyUser(userId: string) {
    const user = await User.findByIdAndUpdate(userId, { $set: { isVerified: true } }, { new: true })
      .select('name username isVerified');
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  static async deleteUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    if (user.role === 'admin') throw ApiError.forbidden('Cannot delete another admin');
    await User.findByIdAndDelete(userId);
  }

  static async getReportedContent(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      Post.find({ reportCount: { $gt: 0 } }).sort({ reportCount: -1 }).skip(skip).limit(limit)
        .populate('author', 'name username avatar').lean(),
      Post.countDocuments({ reportCount: { $gt: 0 } }),
    ]);
    return { posts, total, totalPages: Math.ceil(total / limit), page };
  }

  static async hidePost(postId: string) {
    const post = await Post.findByIdAndUpdate(postId, { $set: { isHidden: true } }, { new: true });
    if (!post) throw ApiError.notFound('Post not found');
    return post;
  }

  static async unhidePost(postId: string) {
    const post = await Post.findByIdAndUpdate(postId, { $set: { isHidden: false, reportCount: 0 } }, { new: true });
    if (!post) throw ApiError.notFound('Post not found');
    return post;
  }

  static async deletePostAdmin(postId: string) {
    const post = await Post.findByIdAndDelete(postId);
    if (!post) throw ApiError.notFound('Post not found');
  }
}

function startOf(unit: 'day' | 'week'): Date {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  if (unit === 'week') d.setDate(d.getDate() - d.getDay());
  return d;
}

function daysAgo(n: number): Date {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0);
  return d;
}
