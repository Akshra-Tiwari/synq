'use client';

import { useCallback, useEffect } from 'react';
import { useProfileStore } from '../lib/store/profile.store';
import { useAuthStore } from '../lib/store/auth.store';
import * as usersApi from '../lib/api/users.api';
import { getApiErrorMessage } from '../lib/utils/errors';
import type { User } from '../lib/api/auth.api';

// ─── Fetch any public profile by username ─────────────────────────────────────
export function useProfile(username: string) {
  const { getProfile, setProfile, setLoading, isLoading, invalidate } = useProfileStore();

  const profile = getProfile(username);
  const loading = isLoading(username);

  useEffect(() => {
    if (profile || loading) return;

    setLoading(username, true);
    usersApi
      .getProfile(username)
      .then((res) => setProfile(username, res.data.user))
      .catch(() => setLoading(username, false));
  }, [username, profile, loading, setProfile, setLoading]);

  const refresh = useCallback(() => {
    invalidate(username);
  }, [username, invalidate]);

  return { profile, loading, refresh };
}

// ─── Own profile mutations ────────────────────────────────────────────────────
export function useOwnProfile() {
  const { setUser } = useAuthStore();
  const { invalidate } = useProfileStore();

  const syncUser = useCallback(
    (user: User) => {
      setUser(user);
      invalidate(user.username);
    },
    [setUser, invalidate],
  );

  const updateProfile = useCallback(
    async (payload: usersApi.UpdateProfilePayload) => {
      const res = await usersApi.updateProfile(payload);
      syncUser(res.data.user);
      return res.data.user;
    },
    [syncUser],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      const res = await usersApi.uploadAvatar(file);
      syncUser(res.data.user);
      return res.data.user;
    },
    [syncUser],
  );

  const uploadBanner = useCallback(
    async (file: File) => {
      const res = await usersApi.uploadBanner(file);
      syncUser(res.data.user);
      return res.data.user;
    },
    [syncUser],
  );

  const removeAvatar = useCallback(async () => {
    const res = await usersApi.removeAvatar();
    syncUser(res.data.user);
  }, [syncUser]);

  const addEducation = useCallback(
    async (payload: Parameters<typeof usersApi.addEducation>[0]) => {
      const res = await usersApi.addEducation(payload);
      syncUser(res.data.user);
      return res.data.user;
    },
    [syncUser],
  );

  const updateEducation = useCallback(
    async (id: string, payload: Parameters<typeof usersApi.updateEducation>[1]) => {
      const res = await usersApi.updateEducation(id, payload);
      syncUser(res.data.user);
      return res.data.user;
    },
    [syncUser],
  );

  const deleteEducation = useCallback(
    async (id: string) => {
      const res = await usersApi.deleteEducation(id);
      syncUser(res.data.user);
    },
    [syncUser],
  );

  const addExperience = useCallback(
    async (payload: Parameters<typeof usersApi.addExperience>[0]) => {
      const res = await usersApi.addExperience(payload);
      syncUser(res.data.user);
      return res.data.user;
    },
    [syncUser],
  );

  const updateExperience = useCallback(
    async (id: string, payload: Parameters<typeof usersApi.updateExperience>[1]) => {
      const res = await usersApi.updateExperience(id, payload);
      syncUser(res.data.user);
      return res.data.user;
    },
    [syncUser],
  );

  const deleteExperience = useCallback(
    async (id: string) => {
      const res = await usersApi.deleteExperience(id);
      syncUser(res.data.user);
    },
    [syncUser],
  );

  return {
    updateProfile,
    uploadAvatar,
    uploadBanner,
    removeAvatar,
    addEducation,
    updateEducation,
    deleteEducation,
    addExperience,
    updateExperience,
    deleteExperience,
    getApiErrorMessage,
  };
}
