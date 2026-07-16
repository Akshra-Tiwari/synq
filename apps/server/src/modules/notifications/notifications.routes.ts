import { Router }                   from 'express';
import * as NotificationsController  from './notifications.controller';
import { authenticate }              from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/',           NotificationsController.list);
router.get('/unread',     NotificationsController.getUnreadCount);
router.patch('/read-all', NotificationsController.markAllRead);
router.patch('/:notificationId/read',   NotificationsController.markRead);
router.delete('/:notificationId',       NotificationsController.deleteNotification);

export default router;
