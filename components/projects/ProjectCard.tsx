import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Project } from '@/types/entities';
import { ENTITY_CONFIG } from '@/utils/entityHelpers';
import type { EntityType } from '@/types/entities';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onLongPress: () => void;
  index?: number;
}

function formatDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function getEntityBreakdown(project: Project): Record<EntityType, number> {
  const counts: Record<EntityType, number> = {
    character: 0,
    world: 0,
    location: 0,
    story: 0,
  };
  project.entities.forEach((e) => {
    counts[e.type]++;
  });
  return counts;
}

export default function ProjectCard({ project, onPress, onLongPress }: ProjectCardProps) {
  const entityCount = project.entities.length;
  const breakdown = getEntityBreakdown(project);
  const activeTypes = (Object.entries(breakdown) as [EntityType, number][]).filter(
    ([, count]) => count > 0,
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.topRow}>
        <View style={styles.projectIcon}>
          <Text style={styles.projectInitial}>
            {project.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={styles.date}>Updated {formatDate(project.updatedAt)}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countNumber}>{entityCount}</Text>
          <Text style={styles.countLabel}>
            {entityCount === 1 ? 'entity' : 'entities'}
          </Text>
        </View>
      </View>

      {activeTypes.length > 0 && (
        <View style={styles.breakdown}>
          {activeTypes.map(([type, count]) => {
            const config = ENTITY_CONFIG[type];
            return (
              <View
                key={type}
                style={[styles.breakdownChip, { backgroundColor: config.color + '12' }]}
              >
                <Text style={styles.breakdownIcon}>{config.icon}</Text>
                <Text style={[styles.breakdownCount, { color: config.color }]}>
                  {count}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: '#9ca3af',
  },
  countBadge: {
    alignItems: 'center',
    paddingLeft: 12,
  },
  countNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366f1',
  },
  countLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: -1,
  },
  breakdown: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  breakdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  breakdownIcon: {
    fontSize: 13,
  },
  breakdownCount: {
    fontSize: 13,
    fontWeight: '600',
  },
});
