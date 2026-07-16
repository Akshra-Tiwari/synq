import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'post_like'
  | 'post_comment'
  | 'comment_like'
  | 'project_like'
  | 'project_save'
  | 'connection_request'
  | 'connection_accepted'
  | 'mention';

export interface INotification extends Document {
  _id:        mongoose.Types.ObjectId;
  recipient:  mongoose.Types.ObjectId;
  sender:     mongoose.Types.ObjectId;
  type:       NotificationType;
  isRead:     boolean;

  // Polymorphic reference — what the notification is about
  entityType: 'Post' | 'Project' | 'Comment' | 'Connection' | 'User';
  entityId:   mongoose.Types.ObjectId;

  // Pre-composed message stored at creation time — no re-fetch on read
  message:    string;

  // Optional short metadata for rich display (avoids populate in list view)
  meta?: {
    postContent?:    string;   // first 80 chars
    projectTitle?:   string;
    commentContent?: string;   // first 80 chars
  };

  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient:  { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:       { type: String, required: true },
    isRead:     { type: Boolean, default: false },
    entityType: { type: String, enum: ['Post', 'Project', 'Comment', 'Connection', 'User'] },
    entityId:   { type: Schema.Types.ObjectId, refPath: 'entityType' },
    message:    { type: String, required: true },
    meta: {
      postContent:    String,
      projectTitle:   String,
      commentContent: String,
    },
  },
  { timestamps: true },
);

// Index for fast unread count + sorted list per user
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
// TTL: auto-delete notifications older than 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
