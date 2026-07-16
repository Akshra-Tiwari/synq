import { Router } from 'express';
import * as UsersController from './users.controller';
import { validate } from '../../middleware/validate';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate';
import { uploadSingle } from '../../middleware/upload';
import { uploadLimiter } from '../../middleware/rateLimiter';
import {
  updateProfileSchema,
  educationSchema,
  experienceSchema,
  changePasswordSchema,
  entryIdSchema,
  usernameParamSchema,
} from './users.validators';

const router = Router();

// ─── Search & discovery (authenticated) ──────────────────────────────────────
router.get('/search',    authenticate, UsersController.searchUsers);
router.get('/suggested', authenticate, UsersController.getSuggested);

// ─── Own profile mutations (authenticated) ────────────────────────────────────
router.patch(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  UsersController.updateProfile,
);

router.post(
  '/avatar',
  authenticate,
  uploadLimiter,
  uploadSingle('avatar'),
  UsersController.uploadAvatar,
);

router.post(
  '/banner',
  authenticate,
  uploadLimiter,
  uploadSingle('banner'),
  UsersController.uploadBanner,
);

router.delete('/avatar', authenticate, UsersController.removeAvatar);

// ─── Education ────────────────────────────────────────────────────────────────
router.post(
  '/education',
  authenticate,
  validate(educationSchema),
  UsersController.addEducation,
);
router.patch(
  '/education/:entryId',
  authenticate,
  validate(educationSchema.merge(entryIdSchema)),
  UsersController.updateEducation,
);
router.delete(
  '/education/:entryId',
  authenticate,
  validate(entryIdSchema),
  UsersController.deleteEducation,
);

// ─── Experience ───────────────────────────────────────────────────────────────
router.post(
  '/experience',
  authenticate,
  validate(experienceSchema),
  UsersController.addExperience,
);
router.patch(
  '/experience/:entryId',
  authenticate,
  validate(experienceSchema.merge(entryIdSchema)),
  UsersController.updateExperience,
);
router.delete(
  '/experience/:entryId',
  authenticate,
  validate(entryIdSchema),
  UsersController.deleteExperience,
);

// ─── Security ─────────────────────────────────────────────────────────────────
router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  UsersController.changePassword,
);

// ─── Public profile (optional auth — self gets richer data) ──────────────────
router.get(
  '/:username',
  optionalAuthenticate,
  validate(usernameParamSchema),
  UsersController.getProfile,
);

export default router;
