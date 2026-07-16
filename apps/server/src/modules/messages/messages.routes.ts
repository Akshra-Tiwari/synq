import { Router }              from 'express';
import * as MessagesController from './messages.controller';
import { authenticate }        from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/',                                     MessagesController.getConversations);
router.get('/unread',                               MessagesController.getTotalUnread);
router.get('/with/:userId',                         MessagesController.getOrCreateConversation);
router.get('/:conversationId',                      MessagesController.getMessages);
router.post('/:conversationId',                     MessagesController.sendMessage);
router.patch('/:conversationId/read',               MessagesController.markAsRead);
router.delete('/:conversationId/messages/:messageId', MessagesController.deleteMessage);

export default router;
