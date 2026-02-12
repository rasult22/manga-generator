import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProject, useAddEntity, useUpdateEntity } from '@/hooks/useEntities';
import { generateId } from '@/utils/id';
import { ENTITY_CONFIG } from '@/utils/entityHelpers';
import type {
  EntityType,
  Entity,
  CharacterEntity,
  WorldEntity,
  LocationEntity,
  StoryBeatEntity,
} from '@/types/entities';

const ROLE_OPTIONS: CharacterEntity['role'][] = ['protagonist', 'antagonist', 'support'];
const CATEGORY_OPTIONS: WorldEntity['category'][] = [
  'magic',
  'tech',
  'society',
  'history',
  'rules',
  'other',
];
const TIMING_OPTIONS: StoryBeatEntity['timing'][] = ['past', 'present', 'future'];

export default function CreateEntityScreen() {
  const { id, type, entityId } = useLocalSearchParams<{
    id: string;
    type: EntityType;
    entityId?: string;
  }>();
  const router = useRouter();
  const { data: project } = useProject(id);
  const addEntityMutation = useAddEntity(id);
  const updateEntityMutation = useUpdateEntity(id);

  const insets = useSafeAreaInsets();
  const isEditing = !!entityId;
  const existingEntity = project?.entities.find((e) => e.id === entityId);
  const entityType = (existingEntity?.type ?? type) as EntityType;
  const config = ENTITY_CONFIG[entityType];

  // Shared fields
  const [name, setName] = useState('');

  // Character fields
  const [role, setRole] = useState<CharacterEntity['role']>(undefined);
  const [age, setAge] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [traitInput, setTraitInput] = useState('');
  const [motivation, setMotivation] = useState('');
  const [backstory, setBackstory] = useState('');
  const [appearance, setAppearance] = useState('');

  // World fields
  const [category, setCategory] = useState<WorldEntity['category']>('other');
  const [description, setDescription] = useState('');

  // Story Beat fields
  const [timing, setTiming] = useState<StoryBeatEntity['timing']>(undefined);
  const [involvedCharacters, setInvolvedCharacters] = useState<string[]>([]);
  const [locationId, setLocationId] = useState<string | undefined>(undefined);

  // Picker modals
  const [rolePickerVisible, setRolePickerVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [timingPickerVisible, setTimingPickerVisible] = useState(false);
  const [characterPickerVisible, setCharacterPickerVisible] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);

  useEffect(() => {
    if (isEditing && existingEntity) {
      setName(existingEntity.name);
      if (existingEntity.type === 'character') {
        setRole(existingEntity.role);
        setAge(existingEntity.age?.toString() ?? '');
        setTraits(existingEntity.traits);
        setMotivation(existingEntity.motivation ?? '');
        setBackstory(existingEntity.backstory ?? '');
        setAppearance(existingEntity.appearance ?? '');
      } else if (existingEntity.type === 'world') {
        setCategory(existingEntity.category);
        setDescription(existingEntity.description);
      } else if (existingEntity.type === 'location') {
        setDescription(existingEntity.description);
      } else if (existingEntity.type === 'story') {
        setDescription(existingEntity.description);
        setTiming(existingEntity.timing);
        setInvolvedCharacters(existingEntity.involvedCharacters ?? []);
        setLocationId(existingEntity.location);
      }
    }
  }, [isEditing, existingEntity]);

  const availableCharacters = project?.entities.filter(
    (e) => e.type === 'character',
  ) ?? [];
  const availableLocations = project?.entities.filter(
    (e) => e.type === 'location',
  ) ?? [];

  const addTrait = () => {
    const t = traitInput.trim();
    if (t && !traits.includes(t)) {
      setTraits([...traits, t]);
    }
    setTraitInput('');
  };

  const removeTrait = (index: number) => {
    setTraits(traits.filter((_, i) => i !== index));
  };

  const toggleCharacter = (charId: string) => {
    setInvolvedCharacters((prev) =>
      prev.includes(charId)
        ? prev.filter((c) => c !== charId)
        : [...prev, charId],
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Name is required');
      return;
    }

    const base = {
      id: isEditing ? entityId! : generateId(),
      name: name.trim(),
      linkedTo: existingEntity?.linkedTo ?? [],
      createdAt: existingEntity?.createdAt ?? Date.now(),
      generationMetadata: existingEntity?.generationMetadata,
    };

    let entity: Entity;

    switch (entityType) {
      case 'character':
        entity = {
          ...base,
          type: 'character',
          role,
          age: age ? parseInt(age, 10) : undefined,
          traits,
          motivation: motivation || undefined,
          backstory: backstory || undefined,
          appearance: appearance || undefined,
        } as CharacterEntity;
        break;
      case 'world':
        entity = {
          ...base,
          type: 'world',
          category,
          description: description.trim(),
        } as WorldEntity;
        break;
      case 'location':
        entity = {
          ...base,
          type: 'location',
          description: description.trim(),
        } as LocationEntity;
        break;
      case 'story':
        entity = {
          ...base,
          type: 'story',
          description: description.trim(),
          timing,
          involvedCharacters:
            involvedCharacters.length > 0 ? involvedCharacters : undefined,
          location: locationId,
        } as StoryBeatEntity;
        break;
      default:
        return;
    }

    try {
      if (isEditing) {
        await updateEntityMutation.mutateAsync(entity);
      } else {
        await addEntityMutation.mutateAsync(entity);
      }
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to save entity');
    }
  };

  const isSaving =
    addEntityMutation.isPending || updateEntityMutation.isPending;

  const renderPickerModal = <T extends string>(
    visible: boolean,
    onClose: () => void,
    options: T[],
    selected: T | undefined,
    onSelect: (val: T) => void,
    title: string,
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((opt) => {
            const isSelected = selected === opt;
            return (
              <Pressable
                key={opt}
                style={[
                  styles.modalOption,
                  isSelected && styles.modalOptionActive,
                ]}
                onPress={() => {
                  onSelect(opt);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    isSelected && styles.modalOptionTextActive,
                  ]}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
                {isSelected && (
                  <Text style={styles.checkmark}>&#x2713;</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );

  const renderSectionHeader = (label: string) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: config?.color }]} />
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{config?.icon}</Text>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit' : 'New'} {config?.label}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          style={[
            styles.saveButton,
            isSaving && styles.saveButtonDisabled,
          ]}
          activeOpacity={0.7}
          disabled={isSaving}
        >
          <Text style={[styles.saveText, isSaving && styles.saveTextDisabled]}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {/* Name - always first */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.nameInput]}
            value={name}
            onChangeText={setName}
            placeholder={`Enter ${config?.label.toLowerCase()} name...`}
            placeholderTextColor="#bbb"
            autoFocus={!isEditing}
          />
        </View>

        {/* CHARACTER FIELDS */}
        {entityType === 'character' && (
          <>
            {renderSectionHeader('Basic Info')}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Role</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setRolePickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={role ? styles.pickerText : styles.pickerPlaceholder}>
                    {role
                      ? role.charAt(0).toUpperCase() + role.slice(1)
                      : 'Select...'}
                  </Text>
                  <Text style={styles.pickerChevron}>&#x203A;</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { width: 100 }]}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="—"
                  placeholderTextColor="#bbb"
                  keyboardType="numeric"
                  textAlign="center"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Traits</Text>
              {traits.length > 0 && (
                <View style={styles.chipsContainer}>
                  {traits.map((trait, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.chip, { backgroundColor: config.color + '14' }]}
                      onPress={() => removeTrait(idx)}
                      activeOpacity={0.6}
                    >
                      <Text style={[styles.chipText, { color: config.color }]}>
                        {trait}
                      </Text>
                      <Text style={[styles.chipRemove, { color: config.color }]}>
                        &#x2715;
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={styles.chipInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={traitInput}
                  onChangeText={setTraitInput}
                  placeholder="Add a trait..."
                  placeholderTextColor="#bbb"
                  onSubmitEditing={addTrait}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[
                    styles.addChipButton,
                    !traitInput.trim() && styles.addChipButtonDisabled,
                  ]}
                  onPress={addTrait}
                  activeOpacity={0.7}
                  disabled={!traitInput.trim()}
                >
                  <Text style={styles.addChipText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            {renderSectionHeader('Story & Background')}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Motivation</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={motivation}
                onChangeText={setMotivation}
                placeholder="What drives this character..."
                placeholderTextColor="#bbb"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Backstory</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={backstory}
                onChangeText={setBackstory}
                placeholder="Character's backstory..."
                placeholderTextColor="#bbb"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Appearance</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={appearance}
                onChangeText={setAppearance}
                placeholder="Describe appearance..."
                placeholderTextColor="#bbb"
                multiline
              />
            </View>
          </>
        )}

        {/* WORLD FIELDS */}
        {entityType === 'world' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setCategoryPickerVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerText}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                <Text style={styles.pickerChevron}>&#x203A;</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe this world element..."
                placeholderTextColor="#bbb"
                multiline
              />
            </View>
          </>
        )}

        {/* LOCATION FIELDS */}
        {entityType === 'location' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe this location..."
                placeholderTextColor="#bbb"
                multiline
              />
            </View>
          </>
        )}

        {/* STORY BEAT FIELDS */}
        {entityType === 'story' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe this story beat..."
                placeholderTextColor="#bbb"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Timing</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setTimingPickerVisible(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={timing ? styles.pickerText : styles.pickerPlaceholder}
                >
                  {timing
                    ? timing.charAt(0).toUpperCase() + timing.slice(1)
                    : 'Select timing...'}
                </Text>
                <Text style={styles.pickerChevron}>&#x203A;</Text>
              </TouchableOpacity>
            </View>

            {renderSectionHeader('Connections')}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Involved Characters</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setCharacterPickerVisible(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    involvedCharacters.length > 0
                      ? styles.pickerText
                      : styles.pickerPlaceholder
                  }
                >
                  {involvedCharacters.length > 0
                    ? `${involvedCharacters.length} character${involvedCharacters.length !== 1 ? 's' : ''} selected`
                    : 'Select characters...'}
                </Text>
                <Text style={styles.pickerChevron}>&#x203A;</Text>
              </TouchableOpacity>
              {involvedCharacters.length > 0 && (
                <View style={styles.chipsContainer}>
                  {involvedCharacters.map((charId) => {
                    const char = availableCharacters.find((c) => c.id === charId);
                    return (
                      <TouchableOpacity
                        key={charId}
                        style={[styles.chip, { backgroundColor: '#6366f1' + '14' }]}
                        onPress={() => toggleCharacter(charId)}
                        activeOpacity={0.6}
                      >
                        <Text style={[styles.chipText, { color: '#6366f1' }]}>
                          {char?.name ?? charId}
                        </Text>
                        <Text style={[styles.chipRemove, { color: '#6366f1' }]}>
                          &#x2715;
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setLocationPickerVisible(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={locationId ? styles.pickerText : styles.pickerPlaceholder}
                >
                  {locationId
                    ? availableLocations.find((l) => l.id === locationId)?.name ??
                      'Unknown'
                    : 'Select location...'}
                </Text>
                <Text style={styles.pickerChevron}>&#x203A;</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Picker Modals */}
      {renderPickerModal(
        rolePickerVisible,
        () => setRolePickerVisible(false),
        ROLE_OPTIONS as string[],
        role,
        (val) => setRole(val as CharacterEntity['role']),
        'Select Role',
      )}
      {renderPickerModal(
        categoryPickerVisible,
        () => setCategoryPickerVisible(false),
        CATEGORY_OPTIONS as string[],
        category,
        (val) => setCategory(val as WorldEntity['category']),
        'Select Category',
      )}
      {renderPickerModal(
        timingPickerVisible,
        () => setTimingPickerVisible(false),
        TIMING_OPTIONS as string[],
        timing,
        (val) => setTiming(val as StoryBeatEntity['timing']),
        'Select Timing',
      )}

      {/* Character multi-select modal */}
      <Modal
        visible={characterPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCharacterPickerVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCharacterPickerVisible(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Characters</Text>
            {availableCharacters.length === 0 ? (
              <View style={styles.emptyPicker}>
                <Text style={styles.emptyPickerEmoji}>&#x1F464;</Text>
                <Text style={styles.emptyPickerText}>
                  No characters created yet
                </Text>
                <Text style={styles.emptyPickerHint}>
                  Create a character first, then come back here
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableCharacters}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const selected = involvedCharacters.includes(item.id);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.modalOption,
                        selected && styles.modalOptionActive,
                      ]}
                      onPress={() => toggleCharacter(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.checkBox}>
                        {selected && (
                          <Text style={styles.checkBoxCheck}>&#x2713;</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.modalOptionText,
                          selected && styles.modalOptionTextActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setCharacterPickerVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Location select modal */}
      <Modal
        visible={locationPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationPickerVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setLocationPickerVisible(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Location</Text>
            {availableLocations.length === 0 ? (
              <View style={styles.emptyPicker}>
                <Text style={styles.emptyPickerEmoji}>&#x1F4CD;</Text>
                <Text style={styles.emptyPickerText}>
                  No locations created yet
                </Text>
                <Text style={styles.emptyPickerHint}>
                  Create a location first, then come back here
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    !locationId && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    setLocationId(undefined);
                    setLocationPickerVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalOptionText}>None</Text>
                  {!locationId && (
                    <Text style={styles.checkmark}>&#x2713;</Text>
                  )}
                </TouchableOpacity>
                <FlatList
                  data={availableLocations}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const selected = locationId === item.id;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.modalOption,
                          selected && styles.modalOptionActive,
                        ]}
                        onPress={() => {
                          setLocationId(item.id);
                          setLocationPickerVisible(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            selected && styles.modalOptionTextActive,
                          ]}
                        >
                          {item.name}
                        </Text>
                        {selected && (
                          <Text style={styles.checkmark}>&#x2713;</Text>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </>
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
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerEmoji: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  cancelText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
  saveTextDisabled: {
    opacity: 0.8,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 60,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
    fontWeight: '400',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    borderWidth: 1.5,
    borderColor: '#eeeff2',
  },
  nameInput: {
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#eeeff2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: '#bbb',
  },
  pickerChevron: {
    fontSize: 20,
    color: '#ccc',
    fontWeight: '300',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipRemove: {
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.6,
  },
  chipInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addChipButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addChipButtonDisabled: {
    opacity: 0.4,
  },
  addChipText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
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
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
    borderRadius: 10,
  },
  modalOptionActive: {
    backgroundColor: '#6366f1' + '0a',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalOptionTextActive: {
    color: '#6366f1',
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 18,
    color: '#6366f1',
    fontWeight: '700',
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  checkBoxCheck: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '700',
  },
  modalDoneButton: {
    marginTop: 16,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modalDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyPicker: {
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
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyPickerHint: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
  },
});
