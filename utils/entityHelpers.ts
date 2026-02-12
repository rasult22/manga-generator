import type { EntityType, Entity } from '@/types/entities';

export const ENTITY_CONFIG: Record<
  EntityType,
  { label: string; icon: string; color: string }
> = {
  character: { label: 'Character', icon: '\u{1F464}', color: '#6366f1' },
  world: { label: 'World Element', icon: '\u{1F30D}', color: '#f59e0b' },
  location: { label: 'Location', icon: '\u{1F4CD}', color: '#10b981' },
  story: { label: 'Story Beat', icon: '\u{1F4D6}', color: '#ef4444' },
};

export function getEntitySubtitle(entity: Entity): string {
  switch (entity.type) {
    case 'character':
      return [entity.role, entity.traits.slice(0, 2).join(', ')]
        .filter(Boolean)
        .join(' \u2022 ');
    case 'world':
      return entity.category;
    case 'location':
      return entity.description.length > 60
        ? entity.description.substring(0, 60) + '...'
        : entity.description;
    case 'story':
      return [entity.timing, entity.description.substring(0, 40)]
        .filter(Boolean)
        .join(' \u2022 ');
  }
}
