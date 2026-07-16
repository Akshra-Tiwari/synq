import { Router, Request, Response } from 'express';
import { SearchService }        from './search.service';
import { asyncHandler }         from '../../utils/asyncHandler';
import { optionalAuthenticate } from '../../middleware/authenticate';

const router = Router();

// Full search
router.get('/', optionalAuthenticate, asyncHandler(async (req: Request, res: Response) => {
  const { q = '', filter = 'all', page = '1', limit = '20' } = req.query as Record<string, string>;

  const results = await SearchService.search(
    q,
    filter as 'all' | 'users' | 'posts' | 'projects',
    Math.max(1, parseInt(page)),
    Math.min(50, parseInt(limit)),
    req.user?._id?.toString(),
  );

  res.json({
    success: true,
    message: 'Search results',
    data: { ...results, query: q, filter },
  });
}));

// Autocomplete
router.get('/autocomplete', asyncHandler(async (req: Request, res: Response) => {
  const { q = '' } = req.query as { q: string };
  const suggestions = await SearchService.autocomplete(q);
  res.json({ success: true, message: 'Suggestions', data: { suggestions } });
}));

export default router;
