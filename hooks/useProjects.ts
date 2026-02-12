import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, saveProject, deleteProject } from '@/services/storage';
import { generateId } from '@/utils/id';
import type { Project } from '@/types/entities';

export const PROJECTS_QUERY_KEY = ['projects'] as const;

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: getProjects,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const now = Date.now();
      const project: Project = {
        id: generateId(),
        name: name.trim(),
        entities: [],
        settings: { defaultStyle: 'anime' },
        createdAt: now,
        updatedAt: now,
      };
      await saveProject(project);
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}
