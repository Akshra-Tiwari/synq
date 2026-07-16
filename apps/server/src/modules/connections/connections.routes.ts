import { Router }                 from 'express';
import * as ConnectionsController from './connections.controller';
import { authenticate }           from '../../middleware/authenticate';

const router = Router();

// All connections routes require authentication
router.use(authenticate);

// ─── Discovery ────────────────────────────────────────────────────────────────
router.get('/suggestions',         ConnectionsController.getSuggestions);
router.get('/pending/received',    ConnectionsController.getPendingReceived);
router.get('/pending/sent',        ConnectionsController.getPendingSent);

// ─── Own connection list ──────────────────────────────────────────────────────
router.get('/my',                  ConnectionsController.getConnections);

// ─── Per-user actions ─────────────────────────────────────────────────────────
router.get('/status/:userId',      ConnectionsController.getStatus);
router.get('/mutual/:userId',      ConnectionsController.getMutualCount);
router.get('/user/:userId',        ConnectionsController.getConnections);

router.post('/request/:userId',    ConnectionsController.sendRequest);
router.post('/accept/:userId',     ConnectionsController.acceptRequest);
router.post('/reject/:userId',     ConnectionsController.rejectRequest);
router.post('/withdraw/:userId',   ConnectionsController.withdrawRequest);
router.delete('/remove/:userId',   ConnectionsController.removeConnection);

export default router;
