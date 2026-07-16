import mongoose, { Document, Schema } from 'mongoose';

export type PostType = 'text' | 'image' | 'project-showcase' | 'achievement';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  type: PostType;
  content: string;
  images: string[];
  imagePublicIds: string[];      // Cloudinary public_ids for deletion
  tags: string[];
  projectRef?: mongoose.Types.ObjectId;

  // Engagement — likes stored as array for O(1) toggle check
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;

  visibility: 'public' | 'connections-only';
  isEdited: boolean;
  isPinned: boolean;

  // Moderation
  reportCount: number;
  isHidden: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:     { type: String, enum: ['text', 'image', 'project-showcase', 'achievement'], default: 'text' },
    content:  { type: String, required: true, trim: true, maxlength: 3000 },
    images:   [{ type: String }],
    imagePublicIds: [{ type: String, select: false }],
    tags:     [{ type: String, lowercase: true, trim: true }],
    projectRef: { type: Schema.Types.ObjectId, ref: 'Project' },

    likes:         { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    likesCount:    { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
    sharesCount:   { type: Number, default: 0, min: 0 },

    visibility: { type: String, enum: ['public', 'connections-only'], default: 'public' },
    isEdited:   { type: Boolean, default: false },
    isPinned:   { type: Boolean, default: false },

    reportCount: { type: Number, default: 0, min: 0 },
    isHidden:    { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
PostSchema.index({ author: 1, createdAt: -1 }); // compound ok
PostSchema.index({ createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ likesCount: -1 });
PostSchema.index({ isHidden: 1, createdAt: -1 });
// Full-text on content + tags
PostSchema.index(
  { content: 'text', tags: 'text' },
  { weights: { content: 5, tags: 10 } },
);

export const Post = mongoose.model<IPost>('Post', PostSchema);
