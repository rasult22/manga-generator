import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Project, Entity } from '@/types/entities';

const PROJECTS_KEY = 'mangaflow_projects';
const MAX_PROJECTS = 10;
const MAX_ENTITIES_PER_PROJECT = 50;

export async function getProjects(): Promise<Project[]> {
  const data = await AsyncStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getProject(id: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((p) => p.id === id);
}

export async function saveProject(project: Project): Promise<void> {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === project.id);

  if (index >= 0) {
    projects[index] = { ...project, updatedAt: Date.now() };
  } else {
    if (projects.length >= MAX_PROJECTS) {
      throw new Error(`Maximum ${MAX_PROJECTS} projects allowed`);
    }
    projects.push(project);
  }

  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function deleteProject(id: string): Promise<void> {
  const projects = await getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
}

export async function addEntity(
  projectId: string,
  entity: Entity,
): Promise<void> {
  const projects = await getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) throw new Error('Project not found');

  if (project.entities.length >= MAX_ENTITIES_PER_PROJECT) {
    throw new Error(`Maximum ${MAX_ENTITIES_PER_PROJECT} entities per project`);
  }

  project.entities.push(entity);
  project.updatedAt = Date.now();
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function updateEntity(
  projectId: string,
  entity: Entity,
): Promise<void> {
  const projects = await getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) throw new Error('Project not found');

  const index = project.entities.findIndex((e) => e.id === entity.id);
  if (index < 0) throw new Error('Entity not found');

  project.entities[index] = entity;
  project.updatedAt = Date.now();
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function deleteEntity(
  projectId: string,
  entityId: string,
): Promise<void> {
  const projects = await getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) throw new Error('Project not found');

  // Remove entity
  project.entities = project.entities.filter((e) => e.id !== entityId);

  // Remove references from linkedTo in other entities
  for (const entity of project.entities) {
    entity.linkedTo = entity.linkedTo.filter((id) => id !== entityId);
  }

  project.updatedAt = Date.now();
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function linkEntities(
  projectId: string,
  entityId1: string,
  entityId2: string,
): Promise<void> {
  const projects = await getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) throw new Error('Project not found');

  const entity1 = project.entities.find((e) => e.id === entityId1);
  const entity2 = project.entities.find((e) => e.id === entityId2);
  if (!entity1 || !entity2) throw new Error('Entity not found');

  if (!entity1.linkedTo.includes(entityId2)) {
    entity1.linkedTo.push(entityId2);
  }
  if (!entity2.linkedTo.includes(entityId1)) {
    entity2.linkedTo.push(entityId1);
  }

  project.updatedAt = Date.now();
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function unlinkEntities(
  projectId: string,
  entityId1: string,
  entityId2: string,
): Promise<void> {
  const projects = await getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) throw new Error('Project not found');

  const entity1 = project.entities.find((e) => e.id === entityId1);
  const entity2 = project.entities.find((e) => e.id === entityId2);
  if (!entity1 || !entity2) throw new Error('Entity not found');

  entity1.linkedTo = entity1.linkedTo.filter((id) => id !== entityId2);
  entity2.linkedTo = entity2.linkedTo.filter((id) => id !== entityId1);

  project.updatedAt = Date.now();
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}
