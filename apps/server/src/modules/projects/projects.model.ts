import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  _id:              mongoose.Types.ObjectId;
  owner:            mongoose.Types.ObjectId;
  title:            string;
  slug:             string;
  description:      string;
  longDescription?: string;
  techStack:        string[];
  screenshots:      string[];
  screenshotPublicIds: string[];
  thumbnail?:       string;
  thumbnailPublicId?: string;
  githubUrl?:       string;
  liveUrl?:         string;
  status:           'in-progress' | 'completed' | 'archived';
  featured:         boolean;

  likes:            mongoose.Types.ObjectId[];
  likesCount:       number;
  saves:            mongoose.Types.ObjectId[];
  savesCount:       number;
  viewsCount:       number;

  isHidden:         boolean;
  createdAt:        Date;
  updatedAt:        Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title:       { type: String, required: true, trim: true, maxlength: 100 },
    slug:        { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    longDescription: { type: String, maxlength: 5000 },
    techStack:   [{ type: String, trim: true }],
    screenshots: [{ type: String }],
    screenshotPublicIds: { type: [String], select: false },
    thumbnail:   String,
    thumbnailPublicId: { type: String, select: false },
    githubUrl:   String,
    liveUrl:     String,
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'archived'],
      default: 'in-progress',
    },
    featured:    { type: Boolean, default: false },

    likes:        { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    likesCount:   { type: Number, default: 0, min: 0 },
    saves:        { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    savesCount:   { type: Number, default: 0, min: 0 },
    viewsCount:   { type: Number, default: 0, min: 0 },
    isHidden:     { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

ProjectSchema.index({ owner: 1, createdAt: -1 });
ProjectSchema.index({ techStack: 1 });
ProjectSchema.index({ likesCount: -1 });
ProjectSchema.index({ savesCount: -1 });
ProjectSchema.index({ isHidden: 1, createdAt: -1 });
ProjectSchema.index(
  { title: 'text', description: 'text', techStack: 'text' },
  { weights: { title: 10, techStack: 8, description: 3 } },
);

// ─── Auto-generate slug from title + owner + timestamp ───────────────────────
ProjectSchema.pre('save', function (next) {
  if (this.isNew && !this.slug) {
    const base = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    this.slug = `${base}-${Date.now().toString(36)}`;
  }
  next();
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
