import { Router }          from 'express';
import * as PostsController from './posts.controller';
import { validate }         from '../../middleware/validate';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate';
import { uploadArray }      from '../../middleware/upload';
import { uploadLimiter }    from '../../middleware/rateLimiter';
import {
  createPostSchema,
  updatePostSchema,
  postIdParamSchema,
  createCommentSchema,
  updateCommentSchema,
  commentIdParamSchema,
  feedQuerySchema,
} from './posts.validators';

const router = Router();

// ─── Feed ─────────────────────────────────────────────────────────────────────
router.get('/',
  authenticate,
  validate(feedQuerySchema),
  PostsController.getFeed,
);

// ─── User posts (public profile tab) ─────────────────────────────────────────
router.get('/user/:username',
  optionalAuthenticate,
  PostsController.getUserPosts,
);

// ─── Single post ──────────────────────────────────────────────────────────────
router.get('/:postId',
  optionalAuthenticate,
  validate(postIdParamSchema),
  PostsController.getPost,
);

// ─── Create post (with optional image upload) ─────────────────────────────────
router.post('/',
  authenticate,
  uploadLimiter,
  uploadArray('images', 4),
  validate(createPostSchema),
  PostsController.createPost,
);

// ─── Update / delete post ─────────────────────────────────────────────────────
router.patch('/:postId',
  authenticate,
  validate(updatePostSchema),
  PostsController.updatePost,
);

router.delete('/:postId',
  authenticate,
  validate(postIdParamSchema),
  PostsController.deletePost,
);

// ─── Engagement ───────────────────────────────────────────────────────────────
router.post('/:postId/like',
  authenticate,
  validate(postIdParamSchema),
  PostsController.toggleLike,
);

router.post('/:postId/share',
  authenticate,
  validate(postIdParamSchema),
  PostsController.recordShare,
);

router.post('/:postId/report',
  authenticate,
  validate(postIdParamSchema),
  PostsController.reportPost,
);

// ─── Comments ─────────────────────────────────────────────────────────────────
router.get('/:postId/comments',
  optionalAuthenticate,
  validate(postIdParamSchema),
  PostsController.getComments,
);

router.post('/:postId/comments',
  authenticate,
  validate(createCommentSchema),
  PostsController.createComment,
);

router.patch('/:postId/comments/:commentId',
  authenticate,
  validate(updateCommentSchema),
  PostsController.updateComment,
);

router.delete('/:postId/comments/:commentId',
  authenticate,
  validate(commentIdParamSchema),
  PostsController.deleteComment,
);

router.post('/:postId/comments/:commentId/like',
  authenticate,
  validate(commentIdParamSchema),
  PostsController.toggleCommentLike,
);

export default router;
