import mongoose from 'mongoose';
import { Project, IProject } from './projects.model';
import { User }              from '../users/users.model';
import { UploadService }     from '../../services/upload.service';
import { ApiError }          from '../../utils/ApiError';
import { NotificationsService } from '../notifications/notifications.service';
import type { CreateProjectInput, UpdateProjectInput } from './projects.validators';

const OWNER_SELECT = 'name username avatar skills';

export class ProjectsService {
  // ─── List / search projects ────────────────────────────────────────────────
  static async listProjects(
    query:  string | undefined,
    tech:   string | undefined,
    status: string | undefined,
    sort:   'newest' | 'popular' | 'saved',
    page:   number,
    limit:  number,
    viewerId?: string,
  ) {
    const filter: Record<string, unknown> = { isHidden: false };

    if (query) filter.$text = { $search: query };
    if (tech)  filter.techStack = { $in: tech.split(',').map((t) => t.trim()) };
    if (status) filter.status = status;

    const sortMap = {
      newest:  { createdAt: -1 },
      popular: { likesCount: -1 },
      saved:   { savesCount: -1 },
    } as const;

    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort(sortMap[sort])
        .skip(skip)
        .limit(limit)
        .populate('owner', OWNER_SELECT)
        .lean<IProject[]>(),
      Project.countDocuments(filter),
    ]);

    return {
      projects: projects.map((p) => ({
        ...p,
        isLiked: viewerId ? p.likes.some((id) => id.toString() === viewerId) : false,
        isSaved: viewerId ? p.saves.some((id) => id.toString() === viewerId) : false,
        likes: undefined,
        saves: undefined,
      })),
      total,
      totalPages: Math.ceil(total / limit),
      page,
    };
  }

  // ─── Single project by ID or slug ─────────────────────────────────────────
  static async getProject(idOrSlug: string, viewerId?: string) {
    const isId = /^[0-9a-f]{24}$/i.test(idOrSlug);
    const project = await Project.findOne(
      isId ? { _id: idOrSlug, isHidden: false } : { slug: idOrSlug, isHidden: false },
    )
      .populate('owner', OWNER_SELECT)
      .lean<IProject>();

    if (!project) throw ApiError.notFound('Project not found');

    // Increment view count (fire-and-forget)
    Project.findByIdAndUpdate(project._id, { $inc: { viewsCount: 1 } }).exec();

    return {
      ...project,
      isLiked: viewerId ? project.likes.some((id) => id.toString() === viewerId) : false,
      isSaved: viewerId ? project.saves.some((id) => id.toString() === viewerId) : false,
      likes: undefined,
      saves: undefined,
    };
  }

  // ─── User's projects ───────────────────────────────────────────────────────
  static async getUserProjects(username: string, viewerId?: string) {
    const user = await User.findOne({ username }).select('_id');
    if (!user) throw ApiError.notFound('User not found');

    const projects = await Project.find({ owner: user._id, isHidden: false })
      .sort({ createdAt: -1 })
      .populate('owner', OWNER_SELECT)
      .lean<IProject[]>();

    return projects.map((p) => ({
      ...p,
      isLiked: viewerId ? p.likes.some((id) => id.toString() === viewerId) : false,
      isSaved: viewerId ? p.saves.some((id) => id.toString() === viewerId) : false,
      likes: undefined,
      saves: undefined,
    }));
  }

  // ─── Create project ────────────────────────────────────────────────────────
  static async createProject(
    ownerId:         string,
    input:           CreateProjectInput,
    screenshotBuffers: Buffer[],
    thumbnailBuffer?:  Buffer,
  ) {
    let screenshots:        string[] = [];
    let screenshotPublicIds: string[] = [];
    let thumbnail:           string | undefined;
    let thumbnailPublicId:   string | undefined;

    if (screenshotBuffers.length > 0) {
      const results = await Promise.all(
        screenshotBuffers.map((buf) => UploadService.upload(buf, 'projects', ownerId)),
      );
      screenshots         = results.map((r) => r.url);
      screenshotPublicIds = results.map((r) => r.publicId);
    }

    if (thumbnailBuffer) {
      const r       = await UploadService.upload(thumbnailBuffer, 'projects', ownerId);
      thumbnail      = r.url;
      thumbnailPublicId = r.publicId;
    } else if (screenshots.length > 0) {
      // Auto-use first screenshot as thumbnail
      thumbnail      = screenshots[0];
      thumbnailPublicId = screenshotPublicIds[0];
    }

    const project = await Project.create({
      owner: ownerId,
      ...input,
      screenshots,
      screenshotPublicIds,
      thumbnail,
      thumbnailPublicId,
    });

    // Increment owner's project count
    await User.findByIdAndUpdate(ownerId, { $inc: { 'stats.projectsCount': 1 } });

    await project.populate('owner', OWNER_SELECT);
    return project;
  }

  // ─── Update project ────────────────────────────────────────────────────────
  static async updateProject(
    projectId: string,
    ownerId:   string,
    input:     UpdateProjectInput,
    newScreenshotBuffers: Buffer[],
  ) {
    const project = await Project.findOne({ _id: projectId, owner: ownerId })
      .select('+screenshotPublicIds +thumbnailPublicId');
    if (!project) throw ApiError.notFound('Project not found or not authorised');

    // Upload new screenshots and append
    if (newScreenshotBuffers.length > 0) {
      if (project.screenshots.length + newScreenshotBuffers.length > 6) {
        throw ApiError.badRequest('Maximum 6 screenshots per project');
      }
      const results = await Promise.all(
        newScreenshotBuffers.map((buf) => UploadService.upload(buf, 'projects', ownerId)),
      );
      project.screenshots         = [...project.screenshots, ...results.map((r) => r.url)];
      project.screenshotPublicIds = [...(project.screenshotPublicIds ?? []), ...results.map((r) => r.publicId)];

      // Update thumbnail to first screenshot if none set
      if (!project.thumbnail) {
        project.thumbnail      = project.screenshots[0];
        project.thumbnailPublicId = project.screenshotPublicIds[0];
      }
    }

    // Apply text field updates
    const fields = ['title', 'description', 'longDescription', 'techStack', 'githubUrl', 'liveUrl', 'status'] as const;
    for (const f of fields) {
      if (input[f] !== undefined) (project as Record<string, unknown>)[f] = input[f];
    }

    await project.save();
    await project.populate('owner', OWNER_SELECT);
    return project;
  }

  // ─── Delete screenshot ─────────────────────────────────────────────────────
  static async deleteScreenshot(projectId: string, ownerId: string, screenshotUrl: string) {
    const project = await Project.findOne({ _id: projectId, owner: ownerId })
      .select('+screenshotPublicIds');
    if (!project) throw ApiError.notFound('Project not found');

    const idx = project.screenshots.indexOf(screenshotUrl);
    if (idx === -1) throw ApiError.notFound('Screenshot not found');

    const publicId = project.screenshotPublicIds?.[idx];
    if (publicId) await UploadService.delete(publicId);

    project.screenshots.splice(idx, 1);
    project.screenshotPublicIds?.splice(idx, 1);

    // Update thumbnail if deleted screenshot was thumbnail
    if (project.thumbnail === screenshotUrl) {
      project.thumbnail         = project.screenshots[0];
      project.thumbnailPublicId = project.screenshotPublicIds?.[0];
    }

    await project.save();
    return project;
  }

  // ─── Delete project ────────────────────────────────────────────────────────
  static async deleteProject(projectId: string, requesterId: string, requesterRole: string) {
    const project = await Project.findById(projectId)
      .select('+screenshotPublicIds +thumbnailPublicId');
    if (!project) throw ApiError.notFound('Project not found');

    const isOwner = project.owner.toString() === requesterId;
    if (!isOwner && requesterRole !== 'admin') throw ApiError.forbidden('Not authorised');

    // Clean up all Cloudinary assets
    const publicIds = [
      ...(project.screenshotPublicIds ?? []),
    ].filter(Boolean);
    await UploadService.deleteMany(publicIds);

    await project.deleteOne();
    await User.findByIdAndUpdate(project.owner, { $inc: { 'stats.projectsCount': -1 } });
  }

  // ─── Toggle like ───────────────────────────────────────────────────────────
  static async toggleLike(projectId: string, userId: string) {
    const project = await Project.findById(projectId);
    if (!project || project.isHidden) throw ApiError.notFound('Project not found');

    const uid          = new mongoose.Types.ObjectId(userId);
    const alreadyLiked = project.likes.some((id) => id.equals(uid));

    if (alreadyLiked) {
      project.likes      = project.likes.filter((id) => !id.equals(uid));
      project.likesCount = Math.max(0, project.likesCount - 1);
    } else {
      project.likes.push(uid);
      project.likesCount += 1;
    }

    await project.save();

    if (!alreadyLiked && project.owner.toString() !== userId) {
      const liker = await User.findById(userId).select('name').lean();
      if (liker) {
        NotificationsService.notifyProjectLike(
          project.owner.toString(),
          userId,
          (liker as { name: string }).name,
          project._id.toString(),
          project.title,
        ).catch(() => {});
      }
    }

    return { liked: !alreadyLiked, likesCount: project.likesCount };
  }

  // ─── Toggle save ───────────────────────────────────────────────────────────
  static async toggleSave(projectId: string, userId: string) {
    const project = await Project.findById(projectId);
    if (!project || project.isHidden) throw ApiError.notFound('Project not found');

    const uid          = new mongoose.Types.ObjectId(userId);
    const alreadySaved = project.saves.some((id) => id.equals(uid));

    if (alreadySaved) {
      project.saves      = project.saves.filter((id) => !id.equals(uid));
      project.savesCount = Math.max(0, project.savesCount - 1);
    } else {
      project.saves.push(uid);
      project.savesCount += 1;
    }

    await project.save();

    if (!alreadySaved && project.owner.toString() !== userId) {
      const saver = await User.findById(userId).select('name').lean();
      if (saver) {
        NotificationsService.notifyProjectSave(
          project.owner.toString(),
          userId,
          (saver as { name: string }).name,
          project._id.toString(),
          project.title,
        ).catch(() => {});
      }
    }

    return { saved: !alreadySaved, savesCount: project.savesCount };
  }

  // ─── Saved projects for current user ──────────────────────────────────────
  static async getSavedProjects(userId: string, page: number, limit: number) {
    const uid  = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find({ saves: uid, isHidden: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('owner', OWNER_SELECT)
        .lean<IProject[]>(),
      Project.countDocuments({ saves: uid, isHidden: false }),
    ]);

    return {
      projects: projects.map((p) => ({
        ...p,
        isLiked: p.likes.some((id) => id.toString() === userId),
        isSaved: true,
        likes: undefined,
        saves: undefined,
      })),
      total,
      totalPages: Math.ceil(total / limit),
      page,
    };
  }
}
