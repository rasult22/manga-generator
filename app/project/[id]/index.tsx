import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProject } from '@/hooks/useEntities';
import type { EntityType, Entity } from '@/types/entities';
import EntityCard from '@/components/entities/EntityCard';
import EntityFilterTabs from '@/components/entities/EntityFilterTabs';
import AddEntitySheet from '@/components/entities/AddEntitySheet';
import { ENTITY_CONFIG } from '@/utils/entityHelpers';

type FilterOption = 'all' | EntityType;

export default function ProjectDashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);

  const [filter, setFilter] = useState<FilterOption>('all');
  const [search, setSearch] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);

  const filteredEntities = useMemo(() => {
    if (!project) return [];
    let entities = project.entities;
    if (filter !== 'all') {
      entities = entities.filter((e) => e.type === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      entities = entities.filter((e) => e.name.toLowerCase().includes(q));
    }
    return entities;
  }, [project, filter, search]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>&#x1F50D;</Text>
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  const handleEntityPress = (entity: Entity) => {
    router.push(`/project/${id}/entity/${entity.id}`);
  };

  const handleAddEntity = (type: EntityType) => {
    router.push(`/project/${id}/entity/create?type=${type}`);
  };

  const hasSearch = search.length > 0;

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>&#x1F50D;</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search entities..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
          {hasSearch && (
            <Pressable
              style={styles.clearButton}
              onPress={() => setSearch('')}
              hitSlop={8}
            >
              <Text style={styles.clearText}>&#x2715;</Text>
            </Pressable>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => setSheetVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <EntityFilterTabs
        active={filter}
        onSelect={setFilter}
        entities={project.entities}
      />

      <FlatList
        data={filteredEntities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntityCard entity={item} onPress={() => handleEntityPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {hasSearch ? (
              <>
                <Text style={styles.emptyEmoji}>&#x1F50D;</Text>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySubtext}>
                  Try a different search term
                </Text>
                <TouchableOpacity
                  style={styles.emptyClearButton}
                  activeOpacity={0.7}
                  onPress={() => setSearch('')}
                >
                  <Text style={styles.emptyClearText}>Clear search</Text>
                </TouchableOpacity>
              </>
            ) : filter !== 'all' ? (
              <>
                <Text style={styles.emptyEmoji}>
                  {ENTITY_CONFIG[filter].icon}
                </Text>
                <Text style={styles.emptyTitle}>
                  No {ENTITY_CONFIG[filter].label.toLowerCase()}s yet
                </Text>
                <Text style={styles.emptySubtext}>
                  Create your first {ENTITY_CONFIG[filter].label.toLowerCase()}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.emptyAddButton,
                    { backgroundColor: ENTITY_CONFIG[filter].color },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleAddEntity(filter)}
                >
                  <Text style={styles.emptyAddButtonText}>
                    + Add {ENTITY_CONFIG[filter].label}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.emptyEmoji}>&#x2728;</Text>
                <Text style={styles.emptyTitle}>Start building your world</Text>
                <Text style={styles.emptySubtext}>
                  Add characters, locations, world elements and story beats to bring your manga to life
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddButton}
                  activeOpacity={0.7}
                  onPress={() => setSheetVisible(true)}
                >
                  <Text style={styles.emptyAddButtonText}>+ Add Entity</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
      />

      <AddEntitySheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelect={handleAddEntity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1a1a1a',
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
    marginTop: -1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyAddButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyClearButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  emptyClearText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
});
