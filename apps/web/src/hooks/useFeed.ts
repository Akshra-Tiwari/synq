'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useFeedStore }   from '../lib/store/feed.store';
import * as postsApi      from '../lib/api/posts.api';
import { getApiErrorMessage } from '../lib/utils/errors';
import type { Post }      from '../lib/api/posts.api';

export function useFeed() {
  const store = useFeedStore();
  const initialFetched = useRef(false);

  // ─── Initial fetch / re-fetch on filter change ───────────────────────────
  const fetchFeed = useCallback(async (filter: typeof store.filter = store.filter) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const res = await postsApi.getFeed({ limit: 20, filter });
      store.setPosts(res.data.posts, res.data.nextCursor, res.data.hasNextPage);
    } catch (e) {
      store.setError(getApiErrorMessage(e));
    }
  }, [store]);

  useEffect(() => {
    if (initialFetched.current) return;
    initialFetched.current = true;
    fetchFeed();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when filter changes
  useEffect(() => {
    if (!initialFetched.current) return;
    fetchFeed(store.filter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.filter]);

  // ─── Load more (cursor pagination) ──────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!store.hasNextPage || store.isFetching) return;
    store.setFetching(true);
    try {
      const res = await postsApi.getFeed({
        cursor: store.nextCursor,
        limit:  20,
        filter: store.filter,
      });
      store.appendPosts(res.data.posts, res.data.nextCursor, res.data.hasNextPage);
    } catch (e) {
      store.setFetching(false);
      console.error(getApiErrorMessage(e));
    }
  }, [store]);

  // ─── Create post ─────────────────────────────────────────────────────────
  const createPost = useCallback(async (payload: Parameters<typeof postsApi.createPost>[0]) => {
    const res = await postsApi.createPost(payload);
    store.prependPost(res.data.post);
    return res.data.post;
  }, [store]);

  // ─── Update post ─────────────────────────────────────────────────────────
  const updatePost = useCallback(async (postId: string, payload: Parameters<typeof postsApi.updatePost>[1]) => {
    const res = await postsApi.updatePost(postId, payload);
    store.updatePost(postId, res.data.post);
    return res.data.post;
  }, [store]);

  // ─── Delete post ─────────────────────────────────────────────────────────
  const deletePost = useCallback(async (postId: string) => {
    // Optimistic remove
    store.removePost(postId);
    try {
      await postsApi.deletePost(postId);
    } catch (e) {
      // Re-fetch if optimistic removal failed
      fetchFeed();
      throw e;
    }
  }, [store, fetchFeed]);

  // ─── Toggle like (optimistic) ─────────────────────────────────────────────
  const toggleLike = useCallback(async (postId: string, currentLiked: boolean, currentCount: number) => {
    // Optimistic update
    store.updatePost(postId, {
      isLiked:    !currentLiked,
      likesCount: currentLiked ? currentCount - 1 : currentCount + 1,
    });
    try {
      const res = await postsApi.toggleLike(postId);
      store.updatePost(postId, {
        isLiked:    res.data.liked,
        likesCount: res.data.likesCount,
      });
    } catch (e) {
      // Revert on failure
      store.updatePost(postId, { isLiked: currentLiked, likesCount: currentCount });
      throw e;
    }
  }, [store]);

  return {
    posts:       store.posts,
    isLoading:   store.isLoading,
    isFetching:  store.isFetching,
    hasNextPage: store.hasNextPage,
    filter:      store.filter,
    error:       store.error,
    setFilter:   store.setFilter,
    loadMore,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    refresh:     () => fetchFeed(),
  };
}

// ─── Single post comments hook ────────────────────────────────────────────────
export function useComments(postId: string) {
  const fetchComments = useCallback(async (parentId?: string) => {
    const res = await postsApi.getComments(postId, parentId);
    return res.data.comments;
  }, [postId]);

  const addComment = useCallback(async (content: string, parentComment?: string) => {
    const res = await postsApi.createComment(postId, { content, parentComment });
    return res.data.comment;
  }, [postId]);

  const editComment = useCallback(async (commentId: string, content: string) => {
    const res = await postsApi.updateComment(postId, commentId, content);
    return res.data.comment;
  }, [postId]);

  const removeComment = useCallback(async (commentId: string) => {
    await postsApi.deleteComment(postId, commentId);
  }, [postId]);

  const likeComment = useCallback(async (commentId: string) => {
    const res = await postsApi.toggleCommentLike(postId, commentId);
    return res.data;
  }, [postId]);

  return { fetchComments, addComment, editComment, removeComment, likeComment };
}
