import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Entity } from '@/types/entities';
import { ENTITY_CONFIG, getEntitySubtitle } from '@/utils/entityHelpers';

interface EntityCardProps {
  entity: Entity;
  onPress: () => void;
}

export default function EntityCard({ entity, onPress }: EntityCardProps) {
  const config = ENTITY_CONFIG[entity.type];
  const subtitle = getEntitySubtitle(entity);
  const linkedCount = entity.linkedTo.length;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.color + '14' }]}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {entity.name}
          </Text>
          {linkedCount > 0 && (
            <View style={styles.linkedBadge}>
              <Text style={styles.linkedText}>{linkedCount} linked</Text>
            </View>
          )}
        </View>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        <View style={[styles.typeBadge, { backgroundColor: config.color + '14' }]}>
          <Text style={[styles.typeLabel, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>
      <Text style={styles.chevron}>&#x203A;</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
    flex: 1,
  },
  linkedBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  linkedText: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
    lineHeight: 18,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 22,
    color: '#ccc',
    marginLeft: 4,
    fontWeight: '300',
  },
});
