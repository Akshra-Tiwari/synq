import { Router }          from 'express';
import * as AdminController from './admin.controller';
import { authenticate }     from '../../middleware/authenticate';
import { authorize }        from '../../middleware/authorize';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/analytics',              AdminController.getAnalytics);
router.get('/users',                  AdminController.listUsers);
router.patch('/users/:userId/role',   AdminController.setUserRole);
router.patch('/users/:userId/verify', AdminController.verifyUser);
router.delete('/users/:userId',       AdminController.deleteUser);
router.get('/reports',                AdminController.getReportedContent);
router.patch('/posts/:postId/hide',   AdminController.hidePost);
router.patch('/posts/:postId/unhide', AdminController.unhidePost);
router.delete('/posts/:postId',       AdminController.deletePostAdmin);

export default router;
