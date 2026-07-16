import { Request, Response } from 'express';
import { ConnectionsService } from './connections.service';
import { ApiResponse }        from '../../utils/ApiResponse';
import { asyncHandler }       from '../../utils/asyncHandler';

export const sendRequest = asyncHandler(async (req: Request, res: Response) => {
  const connection = await ConnectionsService.sendRequest(
    (req.user as any)._id.toString(),
    req.params.userId,
  );
  res.status(201).json(ApiResponse.created('Connection request sent', { connection }));
});

export const acceptRequest = asyncHandler(async (req: Request, res: Response) => {
  const connection = await ConnectionsService.acceptRequest(
    (req.user as any)._id.toString(),
    req.params.userId,
  );
  res.json(ApiResponse.ok('Connection accepted', { connection }));
});

export const rejectRequest = asyncHandler(async (req: Request, res: Response) => {
  const connection = await ConnectionsService.rejectRequest(
    (req.user as any)._id.toString(),
    req.params.userId,
  );
  res.json(ApiResponse.ok('Connection request rejected', { connection }));
});

export const removeConnection = asyncHandler(async (req: Request, res: Response) => {
  await ConnectionsService.removeConnection(
    (req.user as any)._id.toString(),
    req.params.userId,
  );
  res.json(ApiResponse.ok('Connection removed', null));
});

export const withdrawRequest = asyncHandler(async (req: Request, res: Response) => {
  await ConnectionsService.withdrawRequest(
    (req.user as any)._id.toString(),
    req.params.userId,
  );
  res.json(ApiResponse.ok('Request withdrawn', null));
});

export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = await ConnectionsService.getStatus(
    (req.user as any)._id.toString(),
    req.params.userId,
  );
  res.json(ApiResponse.ok('Status fetched', status));
});

export const getConnections = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const result = await ConnectionsService.getConnections(
    req.params.userId ?? (req.user as any)._id.toString(),
    parseInt(page),
    parseInt(limit),
  );
  res.json(new ApiResponse(200, 'Connections fetched', result));
});

export const getPendingReceived = asyncHandler(async (req: Request, res: Response) => {
  const requests = await ConnectionsService.getPendingReceived((req.user as any)._id.toString());
  res.json(ApiResponse.ok('Pending requests fetched', { requests }));
});

export const getPendingSent = asyncHandler(async (req: Request, res: Response) => {
  const requests = await ConnectionsService.getPendingSent((req.user as any)._id.toString());
  res.json(ApiResponse.ok('Sent requests fetched', { requests }));
});

export const getMutualCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await ConnectionsService.getMutualCount(
    (req.user as any)._id.toString(),
    req.params.userId,
  );
  res.json(ApiResponse.ok('Mutual count fetched', { count }));
});

export const getSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const users = await ConnectionsService.getSuggestions((req.user as any)._id.toString());
  res.json(ApiResponse.ok('Suggestions fetched', { users }));
});
