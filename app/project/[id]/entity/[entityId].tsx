import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useProject,
  useDeleteEntity,
  useLinkEntities,
  useUnlinkEntities,
} from '@/hooks/useEntities';
import { ENTITY_CONFIG, getEntitySubtitle } from '@/utils/entityHelpers';
import type { Entity } from '@/types/entities';

export default function EntityDetailScreen() {
  const { id, entityId } = useLocalSearchParams<{
    id: string;
    entityId: string;
  }>();
  const router = useRouter();
  const { data: project } = useProject(id);
  const deleteEntityMutation = useDeleteEntity(id);
  const linkMutation = useLinkEntities(id);
  const unlinkMutation = useUnlinkEntities(id);

  const insets = useSafeAreaInsets();
  const [linkPickerVisible, setLinkPickerVisible] = useState(false);

  const entity = project?.entities.find((e) => e.id === entityId);

  if (!entity) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundEmoji}>&#x1F50D;</Text>
        <Text style={styles.notFoundText}>Entity not found</Text>
      </View>
    );
  }

  const config = ENTITY_CONFIG[entity.type];
  const linkedEntities = project?.entities.filter((e) =>
    entity.linkedTo.includes(e.id),
  ) ?? [];
  const unlinkableEntities = project?.entities.filter(
    (e) => e.id !== entityId && !entity.linkedTo.includes(e.id),
  ) ?? [];

  const handleDelete = () => {
    Alert.alert(
      'Delete Entity',
      `Are you sure you want to delete "${entity.name}"? All relations will also be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntityMutation.mutateAsync(entityId);
              router.back();
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'Failed to delete');
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    router.push(`/project/${id}/entity/create?type=${entity.type}&entityId=${entityId}`);
  };

  const handleLink = async (targetId: string) => {
    try {
      await linkMutation.mutateAsync({ entityId1: entityId, entityId2: targetId });
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to link');
    }
    setLinkPickerVisible(false);
  };

  const handleUnlink = (targetId: string) => {
    const targetEntity = project?.entities.find((e) => e.id === targetId);
    Alert.alert(
      'Remove Relation',
      `Unlink "${targetEntity?.name ?? targetId}" from "${entity.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: () =>
            unlinkMutation.mutate({ entityId1: entityId, entityId2: targetId }),
        },
      ],
    );
  };

  const renderField = (label: string, value: string | undefined | null) => {
    if (!value) return null;
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    );
  };

  const renderCharacterDetails = () => {
    if (entity.type !== 'character') return null;
    return (
      <>
        {entity.role && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Role</Text>
            <View style={[styles.roleBadge, {
              backgroundColor: entity.role === 'protagonist' ? '#10b981' + '18'
                : entity.role === 'antagonist' ? '#ef4444' + '18'
                : '#6366f1' + '18',
            }]}>
              <Text style={[styles.roleBadgeText, {
                color: entity.role === 'protagonist' ? '#10b981'
                  : entity.role === 'antagonist' ? '#ef4444'
                  : '#6366f1',
              }]}>
                {entity.role.charAt(0).toUpperCase() + entity.role.slice(1)}
              </Text>
            </View>
          </View>
        )}
        {renderField('Age', entity.age?.toString())}
        {entity.traits.length > 0 && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Traits</Text>
            <View style={styles.tagsRow}>
              {entity.traits.map((t, idx) => (
                <View key={idx} style={[styles.tag, { backgroundColor: config.color + '12' }]}>
                  <Text style={[styles.tagText, { color: config.color }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {renderField('Motivation', entity.motivation)}
        {renderField('Backstory', entity.backstory)}
        {renderField('Appearance', entity.appearance)}
      </>
    );
  };

  const renderWorldDetails = () => {
    if (entity.type !== 'world') return null;
    return (
      <>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={[styles.roleBadge, { backgroundColor: config.color + '18' }]}>
            <Text style={[styles.roleBadgeText, { color: config.color }]}>
              {entity.category.charAt(0).toUpperCase() + entity.category.slice(1)}
            </Text>
          </View>
        </View>
        {renderField('Description', entity.description)}
      </>
    );
  };

  const renderLocationDetails = () => {
    if (entity.type !== 'location') return null;
    return <>{renderField('Description', entity.description)}</>;
  };

  const renderStoryDetails = () => {
    if (entity.type !== 'story') return null;
    const locationEntity = entity.location
      ? project?.entities.find((e) => e.id === entity.location)
      : undefined;
    const characters = (entity.involvedCharacters ?? [])
      .map((cId) => project?.entities.find((e) => e.id === cId))
      .filter(Boolean) as Entity[];

    return (
      <>
        {renderField('Description', entity.description)}
        {entity.timing && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Timing</Text>
            <View style={[styles.roleBadge, { backgroundColor: config.color + '18' }]}>
              <Text style={[styles.roleBadgeText, { color: config.color }]}>
                {entity.timing.charAt(0).toUpperCase() + entity.timing.slice(1)}
              </Text>
            </View>
          </View>
        )}
        {locationEntity && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Location</Text>
            <TouchableOpacity
              style={styles.locationLink}
              onPress={() => router.push(`/project/${id}/entity/${locationEntity.id}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.locationLinkIcon}>&#x1F4CD;</Text>
              <Text style={styles.locationLinkText}>{locationEntity.name}</Text>
              <Text style={styles.locationLinkChevron}>&#x203A;</Text>
            </TouchableOpacity>
          </View>
        )}
        {characters.length > 0 && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Involved Characters</Text>
            <View style={styles.tagsRow}>
              {characters.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.characterTag]}
                  onPress={() => router.push(`/project/${id}/entity/${c.id}`)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.characterTagIcon}>&#x1F464;</Text>
                  <Text style={styles.characterTagText}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backChevron}>&#x2039;</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, styles.deleteButton]}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Entity Hero */}
        <View style={styles.entityHero}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: config.color + '14' },
            ]}
          >
            <Text style={styles.iconText}>{config.icon}</Text>
          </View>
          <Text style={styles.entityName}>{entity.name}</Text>
          <View style={[styles.typeBadge, { backgroundColor: config.color + '14' }]}>
            <Text style={[styles.typeLabel, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          {renderCharacterDetails()}
          {renderWorldDetails()}
          {renderLocationDetails()}
          {renderStoryDetails()}
        </View>

        {/* Related Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Related Items</Text>
              {linkedEntities.length > 0 && (
                <Text style={styles.sectionCount}>
                  {linkedEntities.length} connection{linkedEntities.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
            {unlinkableEntities.length > 0 && (
              <TouchableOpacity
                onPress={() => setLinkPickerVisible(true)}
                style={styles.addRelationButton}
                activeOpacity={0.7}
              >
                <Text style={styles.addRelationText}>+ Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {linkedEntities.length === 0 ? (
            <View style={styles.emptyRelations}>
              <Text style={styles.emptyRelationsEmoji}>&#x1F517;</Text>
              <Text style={styles.emptyRelationsText}>No connections yet</Text>
              <Text style={styles.emptyRelationsHint}>
                Link this entity to characters, locations, and more
              </Text>
              {unlinkableEntities.length > 0 && (
                <TouchableOpacity
                  onPress={() => setLinkPickerVisible(true)}
                  style={styles.emptyAddButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emptyAddButtonText}>+ Add Relation</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {linkedEntities.map((linked) => {
                const linkedConfig = ENTITY_CONFIG[linked.type];
                return (
                  <TouchableOpacity
                    key={linked.id}
                    style={styles.linkedCard}
                    onPress={() =>
                      router.push(`/project/${id}/entity/${linked.id}`)
                    }
                    onLongPress={() => handleUnlink(linked.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.linkedIcon,
                        { backgroundColor: linkedConfig.color + '14' },
                      ]}
                    >
                      <Text style={styles.linkedIconEmoji}>
                        {linkedConfig.icon}
                      </Text>
                    </View>
                    <View style={styles.linkedInfo}>
                      <Text style={styles.linkedName}>{linked.name}</Text>
                      <Text style={[styles.linkedType, { color: linkedConfig.color }]}>
                        {linkedConfig.label}
                      </Text>
                    </View>
                    <Text style={styles.linkedChevron}>&#x203A;</Text>
                  </TouchableOpacity>
                );
              })}
              <Text style={styles.hintText}>
                Long press to unlink
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Link picker modal */}
      <Modal
        visible={linkPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLinkPickerVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setLinkPickerVisible(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Link to Entity</Text>
            {unlinkableEntities.length === 0 ? (
              <View style={styles.emptyPickerContainer}>
                <Text style={styles.emptyPickerEmoji}>&#x2705;</Text>
                <Text style={styles.emptyPickerText}>
                  All entities are already linked
                </Text>
              </View>
            ) : (
              <FlatList
                data={unlinkableEntities}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const itemConfig = ENTITY_CONFIG[item.type];
                  return (
                    <TouchableOpacity
                      style={styles.linkOption}
                      onPress={() => handleLink(item.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.linkOptionIconBg,
                          { backgroundColor: itemConfig.color + '14' },
                        ]}
                      >
                        <Text style={styles.linkOptionIcon}>
                          {itemConfig.icon}
                        </Text>
                      </View>
                      <View style={styles.linkOptionInfo}>
                        <Text style={styles.linkOptionName}>{item.name}</Text>
                        <Text
                          style={[
                            styles.linkOptionType,
                            { color: itemConfig.color },
                          ]}
                        >
                          {itemConfig.label}
                        </Text>
                      </View>
                      <Text style={styles.linkOptionPlus}>+</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </Pressable>
      </Modal>
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
  notFoundEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  notFoundText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    gap: 2,
  },
  backChevron: {
    fontSize: 26,
    color: '#6366f1',
    fontWeight: '300',
    marginTop: -2,
  },
  backText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#6366f1' + '10',
  },
  deleteButton: {
    backgroundColor: '#ef4444' + '10',
  },
  editText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  entityHero: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 36,
  },
  entityName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  sectionCount: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  addRelationButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addRelationText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  characterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1' + '12',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  characterTagIcon: {
    fontSize: 14,
  },
  characterTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  locationLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981' + '10',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  locationLinkIcon: {
    fontSize: 16,
  },
  locationLinkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  locationLinkChevron: {
    fontSize: 20,
    color: '#10b981',
    fontWeight: '300',
  },
  emptyRelations: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyRelationsEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyRelationsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyRelationsHint: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAddButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  linkedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  linkedIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkedIconEmoji: {
    fontSize: 20,
  },
  linkedInfo: {
    flex: 1,
  },
  linkedName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  linkedType: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  linkedChevron: {
    fontSize: 22,
    color: '#ccc',
    fontWeight: '300',
  },
  hintText: {
    fontSize: 12,
    color: '#c8c8c8',
    textAlign: 'center',
    marginTop: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: '65%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  emptyPickerContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyPickerEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyPickerText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  linkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  linkOptionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkOptionIcon: {
    fontSize: 20,
  },
  linkOptionInfo: {
    flex: 1,
  },
  linkOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  linkOptionType: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  linkOptionPlus: {
    fontSize: 20,
    color: '#6366f1',
    fontWeight: '600',
  },
});
