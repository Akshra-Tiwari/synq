import { Router }               from 'express';
import * as ProjectsController   from './projects.controller';
import { validate }              from '../../middleware/validate';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate';
import { uploadArray }           from '../../middleware/upload';
import { uploadLimiter }         from '../../middleware/rateLimiter';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  projectsQuerySchema,
} from './projects.validators';

const router = Router();

// ─── Public / optional-auth ───────────────────────────────────────────────────
router.get('/',
  optionalAuthenticate,
  validate(projectsQuerySchema),
  ProjectsController.listProjects,
);

router.get('/saved',
  authenticate,
  ProjectsController.getSavedProjects,
);

router.get('/user/:username',
  optionalAuthenticate,
  ProjectsController.getUserProjects,
);

router.get('/:projectId',
  optionalAuthenticate,
  ProjectsController.getProject,
);

// ─── Authenticated ────────────────────────────────────────────────────────────
router.post('/',
  authenticate,
  uploadLimiter,
  uploadArray('screenshots', 6),
  validate(createProjectSchema),
  ProjectsController.createProject,
);

router.patch('/:projectId',
  authenticate,
  uploadLimiter,
  uploadArray('screenshots', 6),
  validate(updateProjectSchema),
  ProjectsController.updateProject,
);

router.delete('/:projectId/screenshots',
  authenticate,
  validate(projectIdSchema),
  ProjectsController.deleteScreenshot,
);

router.delete('/:projectId',
  authenticate,
  validate(projectIdSchema),
  ProjectsController.deleteProject,
);

router.post('/:projectId/like',
  authenticate,
  validate(projectIdSchema),
  ProjectsController.toggleLike,
);

router.post('/:projectId/save',
  authenticate,
  validate(projectIdSchema),
  ProjectsController.toggleSave,
);

export default router;
