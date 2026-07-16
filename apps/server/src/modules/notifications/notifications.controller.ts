import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
import { ApiResponse }          from '../../utils/ApiResponse';
import { asyncHandler }         from '../../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const result = await NotificationsService.list(
    req.user._id.toString(),
    parseInt(page),
    Math.min(50, parseInt(limit)),
  );
  res.json(new ApiResponse(200, 'Notifications fetched', result));
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await NotificationsService.getUnreadCount(req.user._id.toString());
  res.json(ApiResponse.ok('Unread count', { count }));
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  await NotificationsService.markRead(
    req.params.notificationId,
    req.user._id.toString(),
  );
  res.json(ApiResponse.ok('Marked as read', null));
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await NotificationsService.markAllRead(req.user._id.toString());
  res.json(ApiResponse.ok('All marked as read', null));
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  await NotificationsService.delete(
    req.params.notificationId,
    req.user._id.toString(),
  );
  res.json(ApiResponse.ok('Notification deleted', null));
});
