import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  post:          mongoose.Types.ObjectId;
  author:        mongoose.Types.ObjectId;
  content:       string;
  parentComment?: mongoose.Types.ObjectId; // 1 level deep only
  likes:         mongoose.Types.ObjectId[];
  likesCount:    number;
  repliesCount:  number;
  isEdited:      boolean;
  isHidden:      boolean;
  createdAt:     Date;
  updatedAt:     Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post:          { type: Schema.Types.ObjectId, ref: 'Post',    required: true, index: true },
    author:        { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    content:       { type: String, required: true, trim: true, maxlength: 1000 },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    likes:         { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    likesCount:    { type: Number, default: 0, min: 0 },
    repliesCount:  { type: Number, default: 0, min: 0 },
    isEdited:      { type: Boolean, default: false },
    isHidden:      { type: Boolean, default: false },
  },
  { timestamps: true },
);

CommentSchema.index({ post: 1, parentComment: 1, createdAt: 1 });
CommentSchema.index({ author: 1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
