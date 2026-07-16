import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  _id:          mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: {
    content:  string;
    sender:   mongoose.Types.ObjectId;
    sentAt:   Date;
    type:     'text' | 'image';
  };
  // Map of userId → unread count (stored as plain object in Mongo)
  unreadCounts: Map<string, number>;
  createdAt:    Date;
  updatedAt:    Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: {
      content: String,
      sender:  { type: Schema.Types.ObjectId, ref: 'User' },
      sentAt:  Date,
      type:    { type: String, enum: ['text', 'image'], default: 'text' },
    },
    unreadCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });
// Composite: quickly find a conversation between exactly two users
ConversationSchema.index({ 'participants.0': 1, 'participants.1': 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
