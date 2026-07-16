import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id:          mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  sender:       mongoose.Types.ObjectId;
  content:      string;
  type:         'text' | 'image';
  imageUrl?:    string;
  imagePublicId?: string;
  readBy: {
    user:   mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  isDeleted:  boolean;
  createdAt:  Date;
  updatedAt:  Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender:       { type: Schema.Types.ObjectId, ref: 'User',         required: true },
    content:      { type: String, required: true, maxlength: 2000 },
    type:         { type: String, enum: ['text', 'image'], default: 'text' },
    imageUrl:     String,
    imagePublicId: { type: String, select: false },
    readBy: [{
      user:   { type: Schema.Types.ObjectId, ref: 'User' },
      readAt: { type: Date, default: Date.now },
      _id:    false,
    }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
