'use client';

import { useState, useCallback } from 'react';
import * as projectsApi from '../lib/api/projects.api';
import { getApiErrorMessage } from '../lib/utils/errors';
import type { Project, ProjectsQuery } from '../lib/api/projects.api';

export function useProjects() {
  const [projects,    setProjects]    = useState<Project[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const [page,        setPage]        = useState(1);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const fetchProjects = useCallback(async (params: ProjectsQuery = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await projectsApi.listProjects(params);
      setProjects(res.data.projects);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (payload: Parameters<typeof projectsApi.createProject>[0]) => {
    const res = await projectsApi.createProject(payload);
    setProjects((prev) => [res.data.project, ...prev]);
    return res.data.project;
  }, []);

  const updateProject = useCallback(async (projectId: string, payload: Parameters<typeof projectsApi.updateProject>[1]) => {
    const res = await projectsApi.updateProject(projectId, payload);
    setProjects((prev) => prev.map((p) => p._id === projectId ? res.data.project : p));
    return res.data.project;
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p._id !== projectId));
    try {
      await projectsApi.deleteProject(projectId);
    } catch (e) {
      // re-fetch on failure
      fetchProjects();
      throw e;
    }
  }, [fetchProjects]);

  const toggleLike = useCallback(async (projectId: string, currentLiked: boolean, currentCount: number) => {
    // Optimistic
    setProjects((prev) => prev.map((p) =>
      p._id === projectId
        ? { ...p, isLiked: !currentLiked, likesCount: currentLiked ? currentCount - 1 : currentCount + 1 }
        : p,
    ));
    try {
      const res = await projectsApi.toggleLike(projectId);
      setProjects((prev) => prev.map((p) =>
        p._id === projectId ? { ...p, isLiked: res.data.liked, likesCount: res.data.likesCount } : p,
      ));
    } catch {
      // Revert
      setProjects((prev) => prev.map((p) =>
        p._id === projectId ? { ...p, isLiked: currentLiked, likesCount: currentCount } : p,
      ));
    }
  }, []);

  const toggleSave = useCallback(async (projectId: string, currentSaved: boolean, currentCount: number) => {
    setProjects((prev) => prev.map((p) =>
      p._id === projectId
        ? { ...p, isSaved: !currentSaved, savesCount: currentSaved ? currentCount - 1 : currentCount + 1 }
        : p,
    ));
    try {
      const res = await projectsApi.toggleSave(projectId);
      setProjects((prev) => prev.map((p) =>
        p._id === projectId ? { ...p, isSaved: res.data.saved, savesCount: res.data.savesCount } : p,
      ));
    } catch {
      setProjects((prev) => prev.map((p) =>
        p._id === projectId ? { ...p, isSaved: currentSaved, savesCount: currentCount } : p,
      ));
    }
  }, []);

  return {
    projects, total, totalPages, page,
    isLoading, error,
    fetchProjects, createProject, updateProject, deleteProject,
    toggleLike, toggleSave,
  };
}
