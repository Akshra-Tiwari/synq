import mongoose from 'mongoose';
import { Post, IPost }       from './posts.model';
import { Comment, IComment } from './comments.model';
import { User }              from '../users/users.model';
import { UploadService }     from '../../services/upload.service';
import { ApiError }          from '../../utils/ApiError';
import { NotificationsService } from '../notifications/notifications.service';
import type { CreatePostInput, UpdatePostInput, CreateCommentInput } from './posts.validators';

const AUTHOR_SELECT = 'name username avatar skills';

export class PostsService {
  // ─── Cursor-based feed ─────────────────────────────────────────────────────
  static async getFeed(
    viewerId: string,
    cursor: string | undefined,
    limit: number,
    filter: 'all' | 'following' | 'trending',
  ) {
    const query: Record<string, unknown> = { isHidden: false };

    // Cursor: fetch posts older than the cursor's createdAt
    if (cursor) {
      try {
        const cursorPost = await Post.findById(cursor).select('createdAt');
        if (cursorPost) {
          query.createdAt = { $lt: cursorPost.createdAt };
        }
      } catch {
        throw ApiError.badRequest('Invalid cursor');
      }
    }

    // Trending: sort by likes in last 48h
    const sort: Record<string, 1 | -1> =
      filter === 'trending'
        ? { likesCount: -1, createdAt: -1 }
        : { createdAt: -1 };

    const posts = await Post.find(query)
      .sort(sort)
      .limit(limit + 1)          // fetch one extra to determine hasNextPage
      .populate('author', AUTHOR_SELECT)
      .lean<IPost[]>();

    const hasNextPage = posts.length > limit;
    if (hasNextPage) posts.pop();

    const nextCursor = hasNextPage && posts.length > 0
      ? String(posts[posts.length - 1]._id)
      : undefined;

    // Attach isLiked flag for the viewer
    const postsWithMeta = posts.map((p) => ({
      ...p,
      isLiked: p.likes.some((id) => id.toString() === viewerId),
      likes:   undefined,  // don't send the full array to client
    }));

    return { posts: postsWithMeta, nextCursor, hasNextPage };
  }

  // ─── Single post ───────────────────────────────────────────────────────────
  static async getPost(postId: string, viewerId?: string) {
    const post = await Post.findOne({ _id: postId, isHidden: false })
      .populate('author', AUTHOR_SELECT)
      .lean<IPost>();

    if (!post) throw ApiError.notFound('Post not found');

    return {
      ...post,
      isLiked: viewerId
        ? post.likes.some((id) => id.toString() === viewerId)
        : false,
      likes: undefined,
    };
  }

  // ─── User's posts ──────────────────────────────────────────────────────────
  static async getUserPosts(
    username: string,
    viewerId: string | undefined,
    cursor: string | undefined,
    limit: number,
  ) {
    const user = await User.findOne({ username }).select('_id');
    if (!user) throw ApiError.notFound('User not found');

    const query: Record<string, unknown> = {
      author:   user._id,
      isHidden: false,
    };

    if (cursor) {
      const cursorPost = await Post.findById(cursor).select('createdAt');
      if (cursorPost) query.createdAt = { $lt: cursorPost.createdAt };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('author', AUTHOR_SELECT)
      .lean<IPost[]>();

    const hasNextPage = posts.length > limit;
    if (hasNextPage) posts.pop();

    const nextCursor = hasNextPage ? String(posts[posts.length - 1]._id) : undefined;

    return {
      posts: posts.map((p) => ({
        ...p,
        isLiked: viewerId
          ? p.likes.some((id) => id.toString() === viewerId)
          : false,
        likes: undefined,
      })),
      nextCursor,
      hasNextPage,
    };
  }

  // ─── Create post ──────────────────────────────────────────────────────────
  static async createPost(
    authorId: string,
    input: CreatePostInput,
    imageBuffers: Buffer[],
  ) {
    // Upload images in parallel
    let images: string[] = [];
    let imagePublicIds: string[] = [];

    if (imageBuffers.length > 0) {
      const results = await Promise.all(
        imageBuffers.map((buf) => UploadService.upload(buf, 'posts', authorId)),
      );
      images        = results.map((r) => r.url);
      imagePublicIds = results.map((r) => r.publicId);
    }

    const post = await Post.create({
      author: authorId,
      ...input,
      images,
      imagePublicIds,
      type: imageBuffers.length > 0 && input.type === 'text' ? 'image' : input.type,
    });

    // Increment user's post count
    await User.findByIdAndUpdate(authorId, { $inc: { 'stats.postsCount': 1 } });

    await post.populate('author', AUTHOR_SELECT);
    return post;
  }

  // ─── Update post ───────────────────────────────────────────────────────────
  static async updatePost(postId: string, authorId: string, input: UpdatePostInput) {
    const post = await Post.findOne({ _id: postId, author: authorId });
    if (!post) throw ApiError.notFound('Post not found or not authorised');

    if (input.content)    post.content    = input.content;
    if (input.tags)       post.tags       = input.tags;
    if (input.visibility) post.visibility = input.visibility;
    post.isEdited = true;

    await post.save();
    await post.populate('author', AUTHOR_SELECT);
    return post;
  }

  // ─── Delete post ───────────────────────────────────────────────────────────
  static async deletePost(postId: string, requesterId: string, requesterRole: string) {
    const post = await Post.findById(postId).select('+imagePublicIds');
    if (!post) throw ApiError.notFound('Post not found');

    const isAuthor = post.author.toString() === requesterId;
    const isAdmin  = requesterRole === 'admin';
    if (!isAuthor && !isAdmin) throw ApiError.forbidden('Not authorised to delete this post');

    // Delete Cloudinary images
    if (post.imagePublicIds?.length) {
      await UploadService.deleteMany(post.imagePublicIds);
    }

    // Delete all comments on the post
    await Comment.deleteMany({ post: postId });

    await post.deleteOne();

    // Decrement user's post count
    await User.findByIdAndUpdate(post.author, { $inc: { 'stats.postsCount': -1 } });
  }

  // ─── Like / unlike (toggle) ────────────────────────────────────────────────
  static async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const post = await Post.findById(postId);
    if (!post || post.isHidden) throw ApiError.notFound('Post not found');

    const uid = new mongoose.Types.ObjectId(userId);
    const alreadyLiked = post.likes.some((id) => id.equals(uid));

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => !id.equals(uid));
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likes.push(uid);
      post.likesCount += 1;
    }

    await post.save();

    // Notify post author (non-blocking)
    if (!alreadyLiked) {
      const liker = await User.findById(userId).select('name').lean();
      if (liker && post.author.toString() !== userId) {
        NotificationsService.notifyPostLike(
          post.author.toString(),
          userId,
          (liker as { name: string }).name,
          post._id.toString(),
          post.content,
        ).catch(() => {});
      }
    }

    return { liked: !alreadyLiked, likesCount: post.likesCount };
  }

  // ─── Share (increment counter) ─────────────────────────────────────────────
  static async recordShare(postId: string) {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { sharesCount: 1 } },
      { new: true },
    );
    if (!post) throw ApiError.notFound('Post not found');
    return { sharesCount: post.sharesCount };
  }

  // ─── Report post ───────────────────────────────────────────────────────────
  static async reportPost(postId: string) {
    await Post.findByIdAndUpdate(postId, { $inc: { reportCount: 1 } });
  }

  // ─── Get comments ─────────────────────────────────────────────────────────
  static async getComments(postId: string, viewerId?: string, parentComment?: string) {
    const query: Record<string, unknown> = {
      post:      postId,
      isHidden:  false,
      parentComment: parentComment
        ? new mongoose.Types.ObjectId(parentComment)
        : { $exists: false },
    };

    const comments = await Comment.find(query)
      .sort({ createdAt: 1 })
      .limit(50)
      .populate('author', AUTHOR_SELECT)
      .lean<IComment[]>();

    return comments.map((c) => ({
      ...c,
      isLiked: viewerId
        ? c.likes.some((id) => id.toString() === viewerId)
        : false,
      likes: undefined,
    }));
  }

  // ─── Create comment ────────────────────────────────────────────────────────
  static async createComment(
    postId: string,
    authorId: string,
    input: CreateCommentInput,
  ) {
    const post = await Post.findOne({ _id: postId, isHidden: false });
    if (!post) throw ApiError.notFound('Post not found');

    const comment = await Comment.create({
      post:          postId,
      author:        authorId,
      content:       input.content,
      parentComment: input.parentComment,
    });

    // Increment parent reply count if it's a reply
    if (input.parentComment) {
      await Comment.findByIdAndUpdate(input.parentComment, {
        $inc: { repliesCount: 1 },
      });
    }

    // Increment post comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    await comment.populate('author', AUTHOR_SELECT);

    // Notify post author (non-blocking)
    if (post.author.toString() !== authorId) {
      const commenter = await User.findById(authorId).select('name').lean();
      if (commenter) {
        NotificationsService.notifyPostComment(
          post.author.toString(),
          authorId,
          (commenter as { name: string }).name,
          postId,
          input.content,
        ).catch(() => {});
      }
    }

    return comment;
  }

  // ─── Update comment ────────────────────────────────────────────────────────
  static async updateComment(commentId: string, authorId: string, content: string) {
    const comment = await Comment.findOne({ _id: commentId, author: authorId });
    if (!comment) throw ApiError.notFound('Comment not found or not authorised');

    comment.content  = content;
    comment.isEdited = true;
    await comment.save();
    await comment.populate('author', AUTHOR_SELECT);
    return comment;
  }

  // ─── Delete comment ────────────────────────────────────────────────────────
  static async deleteComment(
    commentId: string,
    requesterId: string,
    requesterRole: string,
  ) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw ApiError.notFound('Comment not found');

    const isAuthor = comment.author.toString() === requesterId;
    if (!isAuthor && requesterRole !== 'admin') {
      throw ApiError.forbidden('Not authorised');
    }

    // Decrement parent repliesCount if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { repliesCount: -1 },
      });
    }

    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -1 },
    });

    await comment.deleteOne();
  }

  // ─── Toggle comment like ───────────────────────────────────────────────────
  static async toggleCommentLike(
    commentId: string,
    userId: string,
  ): Promise<{ liked: boolean; likesCount: number }> {
    const comment = await Comment.findById(commentId);
    if (!comment) throw ApiError.notFound('Comment not found');

    const uid          = new mongoose.Types.ObjectId(userId);
    const alreadyLiked = comment.likes.some((id) => id.equals(uid));

    if (alreadyLiked) {
      comment.likes      = comment.likes.filter((id) => !id.equals(uid));
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      comment.likes.push(uid);
      comment.likesCount += 1;
    }

    await comment.save();
    return { liked: !alreadyLiked, likesCount: comment.likesCount };
  }
}
