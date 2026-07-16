import { create } from 'zustand';
import type { Post } from '../api/posts.api';

interface FeedState {
  posts:       Post[];
  nextCursor?: string;
  hasNextPage: boolean;
  isLoading:   boolean;
  isFetching:  boolean;      // loading MORE (not initial)
  filter:      'all' | 'following' | 'trending';
  error:       string | null;

  // Actions
  setPosts:     (posts: Post[], nextCursor?: string, hasNextPage?: boolean) => void;
  appendPosts:  (posts: Post[], nextCursor?: string, hasNextPage?: boolean) => void;
  prependPost:  (post: Post) => void;
  updatePost:   (postId: string, patch: Partial<Post>) => void;
  removePost:   (postId: string) => void;
  setFilter:    (filter: 'all' | 'following' | 'trending') => void;
  setLoading:   (v: boolean) => void;
  setFetching:  (v: boolean) => void;
  setError:     (e: string | null) => void;
  reset:        () => void;
}

export const useFeedStore = create<FeedState>()((set) => ({
  posts:       [],
  nextCursor:  undefined,
  hasNextPage: false,
  isLoading:   false,
  isFetching:  false,
  filter:      'all',
  error:       null,

  setPosts: (posts, nextCursor, hasNextPage = false) =>
    set({ posts, nextCursor, hasNextPage, isLoading: false }),

  appendPosts: (posts, nextCursor, hasNextPage = false) =>
    set((s) => ({
      posts:      [...s.posts, ...posts],
      nextCursor,
      hasNextPage,
      isFetching: false,
    })),

  prependPost: (post) =>
    set((s) => ({ posts: [post, ...s.posts] })),

  updatePost: (postId, patch) =>
    set((s) => ({
      posts: s.posts.map((p) => p._id === postId ? { ...p, ...patch } : p),
    })),

  removePost: (postId) =>
    set((s) => ({ posts: s.posts.filter((p) => p._id !== postId) })),

  setFilter:  (filter)  => set({ filter, posts: [], nextCursor: undefined }),
  setLoading: (isLoading)  => set({ isLoading }),
  setFetching: (isFetching) => set({ isFetching }),
  setError:   (error)   => set({ error, isLoading: false }),
  reset:      () => set({ posts: [], nextCursor: undefined, hasNextPage: false }),
}));
