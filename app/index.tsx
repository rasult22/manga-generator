import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/useProjects';
import ProjectCard from '@/components/projects/ProjectCard';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import type { Project } from '@/types/entities';

export default function ProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreate = useCallback(
    (name: string) => {
      createProject.mutate(name, {
        onSuccess: (project) => {
          setModalVisible(false);
          router.push(`/project/${project.id}`);
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
      });
    },
    [createProject, router],
  );

  const confirmDelete = useCallback(
    (project: Project) => {
      Alert.alert(
        'Delete Project',
        `Are you sure you want to delete "${project.name}"? All entities inside will be permanently removed.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteProjectMutation.mutate(project.id),
          },
        ],
      );
    },
    [deleteProjectMutation],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Project; index: number }) => (
      <ProjectCard
        project={item}
        onPress={() => router.push(`/project/${item.id}`)}
        onLongPress={() => confirmDelete(item)}
        index={index}
      />
    ),
    [router, confirmDelete],
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      </View>
    );
  }

  const isEmpty = !projects || projects.length === 0;
  const projectCount = projects?.length ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>MangaFlow</Text>
          <Text style={styles.subtitle}>
            {isEmpty
              ? 'Start creating your manga'
              : `${projectCount} project${projectCount !== 1 ? 's' : ''}`}
          </Text>
        </View>
        {!isEmpty && (
          <TouchableOpacity
            style={styles.headerAddButton}
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.headerAddButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIconEmoji}>&#x1F4D6;</Text>
          </View>
          <Text style={styles.emptyTitle}>Create your first project</Text>
          <Text style={styles.emptySubtitle}>
            Build characters, worlds, locations and story beats for your manga
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.createButtonText}>+ New Project</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlashList
          data={projects}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <Text style={styles.hintText}>Long press a project to delete</Text>
          }
        />
      )}

      <CreateProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreate}
        loading={createProject.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    marginTop: 2,
  },
  headerAddButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerAddButtonText: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIconEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#c4c4c4',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});
