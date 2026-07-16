import mongoose from 'mongoose';
import { User, IUser, IEducation, IExperience } from './users.model';
import { UploadService } from '../../services/upload.service';
import { ApiError } from '../../utils/ApiError';
import type {
  UpdateProfileInput,
  EducationInput,
  ExperienceInput,
  ChangePasswordInput,
} from './users.validators';

export class UsersService {
  // ─── Get public profile by username ───────────────────────────────────────
  static async getProfile(username: string, viewerId?: string): Promise<IUser> {
    const user = await User.findByUsername(username);
    if (!user) throw ApiError.notFound('Developer not found');

    // Increment profile views — only for other users, not self
    if (viewerId && viewerId !== user._id.toString()) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'stats.profileViews': 1 },
      });
    }

    return user;
  }

  // ─── Get profile by ID ─────────────────────────────────────────────────────
  static async getProfileById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  // ─── Update basic profile fields ──────────────────────────────────────────
  static async updateProfile(userId: string, input: UpdateProfileInput): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    // Apply only defined fields (partial update)
    const fields: (keyof UpdateProfileInput)[] = [
      'name', 'bio', 'location', 'website', 'pronouns',
      'openToWork', 'availability', 'yearsOfExperience',
      'skills', 'techStack',
      'githubUrl', 'linkedinUrl', 'twitterUrl', 'portfolioUrl',
    ];

    for (const field of fields) {
      if (input[field] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any)[field] = input[field];
      }
    }

    await user.save();
    return user;
  }

  // ─── Upload avatar ─────────────────────────────────────────────────────────
  static async uploadAvatar(userId: string, buffer: Buffer): Promise<IUser> {
    const user = await User.findById(userId).select('+avatarPublicId');
    if (!user) throw ApiError.notFound('User not found');

    // Delete old avatar from Cloudinary
    if (user.avatarPublicId) {
      await UploadService.delete(user.avatarPublicId);
    }

    const result = await UploadService.upload(buffer, 'avatars', userId);

    user.avatar = result.url;
    user.avatarPublicId = result.publicId;
    await user.save();

    return user;
  }

  // ─── Upload cover banner ───────────────────────────────────────────────────
  static async uploadBanner(userId: string, buffer: Buffer): Promise<IUser> {
    const user = await User.findById(userId).select('+coverBannerPublicId');
    if (!user) throw ApiError.notFound('User not found');

    if (user.coverBannerPublicId) {
      await UploadService.delete(user.coverBannerPublicId);
    }

    const result = await UploadService.upload(buffer, 'banners', userId);

    user.coverBanner = result.url;
    user.coverBannerPublicId = result.publicId;
    await user.save();

    return user;
  }

  // ─── Remove avatar ─────────────────────────────────────────────────────────
  static async removeAvatar(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('+avatarPublicId');
    if (!user) throw ApiError.notFound('User not found');

    if (user.avatarPublicId) {
      await UploadService.delete(user.avatarPublicId);
    }

    user.avatar = undefined;
    user.avatarPublicId = undefined;
    await user.save();

    return user;
  }

  // ─── Education CRUD ────────────────────────────────────────────────────────
  static async addEducation(userId: string, input: EducationInput): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    if (user.education.length >= 10) {
      throw ApiError.badRequest('Maximum 10 education entries');
    }

    user.education.push({ ...input, _id: new mongoose.Types.ObjectId() } as IEducation);
    await user.save();
    return user;
  }

  static async updateEducation(
    userId: string,
    entryId: string,
    input: EducationInput,
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const entry = user.education.id(entryId);
    if (!entry) throw ApiError.notFound('Education entry not found');

    Object.assign(entry, input);
    await user.save();
    return user;
  }

  static async deleteEducation(userId: string, entryId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const entry = user.education.id(entryId);
    if (!entry) throw ApiError.notFound('Education entry not found');

    entry.deleteOne();
    await user.save();
    return user;
  }

  // ─── Experience CRUD ───────────────────────────────────────────────────────
  static async addExperience(userId: string, input: ExperienceInput): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    if (user.experience.length >= 15) {
      throw ApiError.badRequest('Maximum 15 experience entries');
    }

    user.experience.push({ ...input, _id: new mongoose.Types.ObjectId() } as IExperience);
    // Sort by most recent first
    user.experience.sort((a, b) =>
      b.startYear !== a.startYear
        ? b.startYear - a.startYear
        : b.startMonth - a.startMonth,
    );
    await user.save();
    return user;
  }

  static async updateExperience(
    userId: string,
    entryId: string,
    input: ExperienceInput,
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const entry = user.experience.id(entryId);
    if (!entry) throw ApiError.notFound('Experience entry not found');

    Object.assign(entry, input);
    await user.save();
    return user;
  }

  static async deleteExperience(userId: string, entryId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const entry = user.experience.id(entryId);
    if (!entry) throw ApiError.notFound('Experience entry not found');

    entry.deleteOne();
    await user.save();
    return user;
  }

  // ─── Change password ───────────────────────────────────────────────────────
  static async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) throw ApiError.notFound('User not found');

    const isValid = await user.comparePassword(input.currentPassword);
    if (!isValid) throw ApiError.badRequest('Current password is incorrect');

    user.password = input.newPassword;
    await user.save(); // pre-save hook re-hashes
  }

  // ─── Search / suggested developers ────────────────────────────────────────
  static async searchUsers(
    query: string,
    filters: { skills?: string[]; location?: string; openToWork?: boolean },
    page: number,
    limit: number,
    excludeUserId?: string,
  ) {
    const filter: Record<string, unknown> = {};

    if (excludeUserId) {
      filter._id = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
    }

    if (query) {
      filter.$text = { $search: query };
    }

    if (filters.skills?.length) {
      filter.skills = { $in: filters.skills.map((s) => s.toLowerCase()) };
    }

    if (filters.location) {
      filter.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.openToWork) {
      filter.openToWork = true;
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name username avatar bio skills techStack location openToWork stats availability')
        .sort(query ? { score: { $meta: 'textScore' } } : { 'stats.connectionsCount': -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return { users, total };
  }

  // ─── Suggested developers (people you might know) ─────────────────────────
  static async getSuggested(userId: string, limit = 6) {
    const currentUser = await User.findById(userId).select('skills techStack');
    if (!currentUser) return [];

    // Find devs sharing similar skills, excluding self
    return User.find({
      _id: { $ne: userId },
      $or: [
        { skills: { $in: currentUser.skills } },
        { techStack: { $in: currentUser.techStack } },
      ],
    })
      .select('name username avatar bio skills techStack location openToWork availability')
      .sort({ 'stats.connectionsCount': -1 })
      .limit(limit)
      .lean();
  }
}
