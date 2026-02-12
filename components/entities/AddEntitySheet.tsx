import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import type { EntityType } from '@/types/entities';
import { ENTITY_CONFIG } from '@/utils/entityHelpers';

interface AddEntitySheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: EntityType) => void;
}

const TYPE_DESCRIPTIONS: Record<EntityType, string> = {
  character: 'Heroes, villains, and supporting cast',
  world: 'Magic systems, technology, lore',
  location: 'Places and environments',
  story: 'Plot points, events, and arcs',
};

const ROWS: [EntityType, EntityType][] = [
  ['character', 'world'],
  ['location', 'story'],
];

export default function AddEntitySheet({
  visible,
  onClose,
  onSelect,
}: AddEntitySheetProps) {
  const renderOption = (type: EntityType) => {
    const config = ENTITY_CONFIG[type];
    return (
      <View key={type} style={styles.optionWrapper}>
        <Pressable
          style={({ pressed }) => [
            styles.option,
            pressed && styles.optionPressed,
          ]}
          onPress={() => {
            onSelect(type);
            onClose();
          }}
        >
          <View
            style={[
              styles.optionIcon,
              { backgroundColor: config.color + '14' },
            ]}
          >
            <Text style={styles.optionEmoji}>{config.icon}</Text>
          </View>
          <Text style={styles.optionLabel}>{config.label}</Text>
          <Text style={styles.optionDesc}>
            {TYPE_DESCRIPTIONS[type]}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.title}>What do you want to create?</Text>
          <View style={styles.grid}>
            {ROWS.map(([left, right]) => (
              <View key={left} style={styles.row}>
                {renderOption(left)}
                {renderOption(right)}
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  grid: {
    marginHorizontal: -6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  optionWrapper: {
    flex: 1,
    paddingHorizontal: 6,
  },
  option: {
    backgroundColor: '#f0f1f5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
  },
  optionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16,
  },
});
