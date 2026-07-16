import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IRefreshToken {
  token: string;
  tokenId: string;
  createdAt: Date;
  expiresAt: Date;
  userAgent?: string;
}

export interface IEducation {
  _id: mongoose.Types.ObjectId;
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  current: boolean;
  description?: string;
}

export interface IExperience {
  _id: mongoose.Types.ObjectId;
  company: string;
  role: string;
  location?: string;
  startMonth: number;
  startYear: number;
  endMonth?: number;
  endYear?: number;
  current: boolean;
  description?: string;
  techUsed: string[];
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  password: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;

  // Profile
  name: string;
  avatar?: string;
  avatarPublicId?: string;      // Cloudinary public_id for deletion
  coverBanner?: string;
  coverBannerPublicId?: string;
  bio?: string;
  location?: string;
  website?: string;
  pronouns?: string;

  // Developer identity
  skills: string[];
  techStack: string[];
  openToWork: boolean;
  availability: 'full-time' | 'part-time' | 'freelance' | 'not-available';
  yearsOfExperience?: number;

  // Career history
  education: IEducation[];
  experience: IExperience[];

  // Social links
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  portfolioUrl?: string;

  // Denormalized stats
  stats: {
    connectionsCount: number;
    postsCount: number;
    projectsCount: number;
    profileViews: number;
  };

  // Profile completion score 0-100 (computed on save)
  profileCompletion: number;

  refreshTokens: IRefreshToken[];
  lastSeen: Date;
  provider: 'local' | 'google';
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
  computeProfileCompletion(): number;
}

interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────
const EducationSchema = new Schema<IEducation>({
  school:      { type: String, required: true, trim: true, maxlength: 100 },
  degree:      { type: String, required: true, trim: true, maxlength: 80 },
  field:       { type: String, required: true, trim: true, maxlength: 80 },
  startYear:   { type: Number, required: true, min: 1950, max: 2100 },
  endYear:     { type: Number, min: 1950, max: 2100 },
  current:     { type: Boolean, default: false },
  description: { type: String, maxlength: 500 },
});

const ExperienceSchema = new Schema<IExperience>({
  company:     { type: String, required: true, trim: true, maxlength: 100 },
  role:        { type: String, required: true, trim: true, maxlength: 100 },
  location:    { type: String, trim: true, maxlength: 100 },
  startMonth:  { type: Number, required: true, min: 1, max: 12 },
  startYear:   { type: Number, required: true, min: 1950, max: 2100 },
  endMonth:    { type: Number, min: 1, max: 12 },
  endYear:     { type: Number, min: 1950, max: 2100 },
  current:     { type: Boolean, default: false },
  description: { type: String, maxlength: 1000 },
  techUsed:    [{ type: String, trim: true }],
});

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    token:     { type: String, required: true },
    tokenId:   { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    userAgent: String,
  },
  { _id: false },
);

// ─── Main schema ──────────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser, IUserModel>(
  {
    email: {
      type: String, required: true, unique: true,
      lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    username: {
      type: String, required: true, unique: true,
      lowercase: true, trim: true,
      match: [/^[a-z0-9_-]{3,30}$/, 'Username: 3-30 chars, letters/numbers/hyphens/underscores'],
    },
    password:                  { type: String, required: true, select: false, minlength: 8 },
    role:                      { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified:                { type: Boolean, default: false },
    verificationToken:         { type: String, select: false },
    verificationTokenExpiry:   { type: Date,   select: false },
    resetPasswordToken:        { type: String, select: false },
    resetPasswordExpiry:       { type: Date,   select: false },

    name:                  { type: String, required: true, trim: true, maxlength: 60 },
    avatar:                String,
    avatarPublicId:        { type: String, select: false },
    coverBanner:           String,
    coverBannerPublicId:   { type: String, select: false },
    bio:                   { type: String, maxlength: 500 },
    location:              { type: String, maxlength: 100 },
    website:               String,
    pronouns:              { type: String, maxlength: 30 },

    skills:                [{ type: String, lowercase: true, trim: true }],
    techStack:             [{ type: String, trim: true }],
    openToWork:            { type: Boolean, default: false },
    availability: {
      type: String,
      enum: ['full-time', 'part-time', 'freelance', 'not-available'],
      default: 'not-available',
    },
    yearsOfExperience:     { type: Number, min: 0, max: 50 },

    education:   { type: [EducationSchema],  default: [] },
    experience:  { type: [ExperienceSchema], default: [] },

    githubUrl:    String,
    linkedinUrl:  String,
    twitterUrl:   String,
    portfolioUrl: String,

    stats: {
      connectionsCount: { type: Number, default: 0, min: 0 },
      postsCount:       { type: Number, default: 0, min: 0 },
      projectsCount:    { type: Number, default: 0, min: 0 },
      profileViews:     { type: Number, default: 0, min: 0 },
    },

    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },

    refreshTokens: { type: [RefreshTokenSchema], default: [], select: false },
    lastSeen:      { type: Date, default: Date.now },
    provider:      { type: String, enum: ['local', 'google'], default: 'local' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.verificationToken;
        delete ret.verificationTokenExpiry;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpiry;
        delete ret.avatarPublicId;
        delete ret.coverBannerPublicId;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ skills: 1 });
UserSchema.index({ techStack: 1 });
UserSchema.index({ location: 1 });
UserSchema.index({ openToWork: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'stats.connectionsCount': -1 });
UserSchema.index(
  { name: 'text', username: 'text', bio: 'text', skills: 'text', techStack: 'text' },
  { weights: { name: 10, username: 8, skills: 5, techStack: 5, bio: 2 } },
);

// ─── Pre-save: password hash + profile completion ─────────────────────────────
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  // Recompute completion score on every save
  this.profileCompletion = this.computeProfileCompletion();
  next();
});

// ─── Instance methods ─────────────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.computeProfileCompletion = function (): number {
  const checks: [boolean, number][] = [
    [!!this.avatar,                    15],
    [!!this.bio && this.bio.length > 20, 15],
    [this.skills.length >= 3,          15],
    [!!this.location,                   5],
    [!!this.githubUrl,                 10],
    [this.experience.length > 0,       20],
    [this.education.length > 0,        10],
    [!!this.coverBanner,               10],
  ];
  return checks.reduce((sum, [passes, weight]) => sum + (passes ? weight : 0), 0);
};

// ─── Static methods ───────────────────────────────────────────────────────────
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase().trim() })
    .select('+password +refreshTokens');
};

UserSchema.statics.findByUsername = function (username: string) {
  return this.findOne({ username: username.toLowerCase().trim() });
};

export const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
