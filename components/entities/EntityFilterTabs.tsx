import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import type { EntityType, Entity } from '@/types/entities';
import { ENTITY_CONFIG } from '@/utils/entityHelpers';

type FilterOption = 'all' | EntityType;

interface EntityFilterTabsProps {
  active: FilterOption;
  onSelect: (filter: FilterOption) => void;
  entities?: Entity[];
}

const TABS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'character', label: 'Characters' },
  { key: 'world', label: 'World' },
  { key: 'story', label: 'Story' },
  { key: 'location', label: 'Locations' },
];

export default function EntityFilterTabs({
  active,
  onSelect,
  entities,
}: EntityFilterTabsProps) {
  const getCounts = (key: FilterOption): number => {
    if (!entities) return 0;
    if (key === 'all') return entities.length;
    return entities.filter((e) => e.type === key).length;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const color =
          tab.key === 'all'
            ? '#6366f1'
            : ENTITY_CONFIG[tab.key as EntityType].color;
        const count = entities ? getCounts(tab.key) : -1;

        return (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              isActive && { backgroundColor: color + '15' },
            ]}
            onPress={() => onSelect(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                isActive && { color, fontWeight: '700' },
              ]}
            >
              {tab.label}
            </Text>
            {count >= 0 && (
              <View
                style={[
                  styles.countBadge,
                  isActive
                    ? { backgroundColor: color }
                    : { backgroundColor: '#e0e0e0' },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isActive ? { color: '#fff' } : { color: '#888' },
                  ]}
                >
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
