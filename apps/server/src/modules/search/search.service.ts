import { User }    from '../users/users.model';
import { Post }    from '../posts/posts.model';
import { Project } from '../projects/projects.model';

export interface SearchResults {
  users:    unknown[];
  posts:    unknown[];
  projects: unknown[];
  total:    number;
}

export class SearchService {
  static async search(
    query:  string,
    filter: 'all' | 'users' | 'posts' | 'projects',
    page:   number,
    limit:  number,
    viewerId?: string,
  ): Promise<SearchResults> {
    if (!query.trim()) return { users: [], posts: [], projects: [], total: 0 };

    const skip = (page - 1) * limit;
    const textQuery = { $text: { $search: query } };
    const scoreSort = { score: { $meta: 'textScore' } };

    const [users, posts, projects] = await Promise.all([
      filter === 'all' || filter === 'users'
        ? User.find(textQuery)
            .sort(scoreSort)
            .skip(skip)
            .limit(limit)
            .select('name username avatar bio skills techStack location openToWork availability stats')
            .lean()
        : Promise.resolve([]),

      filter === 'all' || filter === 'posts'
        ? Post.find({ ...textQuery, isHidden: false })
            .sort(scoreSort)
            .skip(skip)
            .limit(filter === 'all' ? Math.floor(limit / 2) : limit)
            .populate('author', 'name username avatar')
            .lean()
        : Promise.resolve([]),

      filter === 'all' || filter === 'projects'
        ? Project.find({ ...textQuery, isHidden: false })
            .sort(scoreSort)
            .skip(skip)
            .limit(filter === 'all' ? Math.floor(limit / 2) : limit)
            .populate('owner', 'name username avatar')
            .lean()
        : Promise.resolve([]),
    ]);

    const total = users.length + posts.length + projects.length;

    return { users, posts, projects, total };
  }

  // ─── Autocomplete suggestions (fast, name/username prefix only) ────────────
  static async autocomplete(query: string) {
    if (!query.trim() || query.length < 2) return [];

    const regex = new RegExp(`^${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

    return User.find({
      $or: [{ username: regex }, { name: regex }],
    })
      .select('name username avatar')
      .limit(6)
      .lean();
  }
}
