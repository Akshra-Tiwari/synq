import { Request, Response } from 'express';
import { MessagesService }   from './messages.service';
import { ApiResponse }       from '../../utils/ApiResponse';
import { asyncHandler }      from '../../utils/asyncHandler';
import { ApiError }          from '../../utils/ApiError';

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await MessagesService.getConversations((req.user as any)._id.toString());
  res.json(ApiResponse.ok('Conversations fetched', { conversations }));
});

export const getOrCreateConversation = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await MessagesService.getOrCreateConversation(
    (req.user as any)._id.toString(),
    req.params.userId,
  );
  res.json(ApiResponse.ok('Conversation ready', { conversation }));
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { cursor, limit = '30' } = req.query as Record<string, string>;
  const result = await MessagesService.getMessages(
    req.params.conversationId,
    (req.user as any)._id.toString(),
    cursor,
    parseInt(limit),
  );
  res.json(ApiResponse.ok('Messages fetched', result));
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content, type = 'text' } = req.body as { content: string; type?: 'text' | 'image' };
  if (!content?.trim()) throw ApiError.badRequest('Message content is required');

  const message = await MessagesService.sendMessage(
    req.params.conversationId,
    (req.user as any)._id.toString(),
    content.trim(),
    type,
  );
  res.status(201).json(ApiResponse.created('Message sent', { message }));
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  await MessagesService.markAsRead(
    req.params.conversationId,
    (req.user as any)._id.toString(),
  );
  res.json(ApiResponse.ok('Marked as read', null));
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await MessagesService.deleteMessage(
    req.params.messageId,
    (req.user as any)._id.toString(),
  );
  res.json(ApiResponse.ok('Message deleted', { message }));
});

export const getTotalUnread = asyncHandler(async (req: Request, res: Response) => {
  const count = await MessagesService.getTotalUnread((req.user as any)._id.toString());
  res.json(ApiResponse.ok('Unread count', { count }));
});
