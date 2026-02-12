import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProject,
  addEntity,
  updateEntity,
  deleteEntity,
  linkEntities,
  unlinkEntities,
} from '@/services/storage';
import type { Entity } from '@/types/entities';

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });
}

export function useAddEntity(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entity: Entity) => addEntity(projectId, entity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateEntity(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entity: Entity) => updateEntity(projectId, entity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteEntity(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entityId: string) => deleteEntity(projectId, entityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useLinkEntities(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityId1,
      entityId2,
    }: {
      entityId1: string;
      entityId2: string;
    }) => linkEntities(projectId, entityId1, entityId2),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}

export function useUnlinkEntities(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityId1,
      entityId2,
    }: {
      entityId1: string;
      entityId2: string;
    }) => unlinkEntities(projectId, entityId1, entityId2),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}
