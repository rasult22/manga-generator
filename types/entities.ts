export type EntityType = 'character' | 'world' | 'location' | 'story';

export interface GenerationMetadata {
  generatedFrom?: string;
  userPrompt?: string;
  usedContext?: string[];
  timestamp: number;
}

export interface BaseEntity {
  id: string;
  type: EntityType;
  name: string;
  linkedTo: string[];
  createdAt: number;
  generationMetadata?: GenerationMetadata;
}

export interface CharacterEntity extends BaseEntity {
  type: 'character';
  role?: 'protagonist' | 'antagonist' | 'support';
  age?: number;
  traits: string[];
  motivation?: string;
  backstory?: string;
  appearance?: string;
  referenceImage?: string;
}

export interface WorldEntity extends BaseEntity {
  type: 'world';
  category: 'magic' | 'tech' | 'society' | 'history' | 'rules' | 'other';
  description: string;
}

export interface LocationEntity extends BaseEntity {
  type: 'location';
  description: string;
  visualReference?: string;
  associatedCharacters?: string[];
}

export interface StoryBeatEntity extends BaseEntity {
  type: 'story';
  description: string;
  involvedCharacters?: string[];
  location?: string;
  timing?: 'past' | 'present' | 'future';
}

export type Entity =
  | CharacterEntity
  | WorldEntity
  | LocationEntity
  | StoryBeatEntity;

export type Project = {
  id: string;
  name: string;
  entities: Entity[];
  settings: {
    defaultStyle: 'anime' | 'realistic' | 'sketchy';
    genre?: string;
  };
  createdAt: number;
  updatedAt: number;
};

export type Panel = {
  id: string;
  order: number;
  description: string;
  shotType: 'wide' | 'medium' | 'close-up' | 'extreme-close';
  characters: string[];
  location?: string;
  dialogue?: string;
  generatedImage?: string;
  aiPrompt?: string;
};

export type Episode = {
  id: string;
  title: string;
  storyBeats: string[];
  structure?: {
    ki: string;
    sho: string;
    ten: string;
    ketsu: string;
  };
  panels: Panel[];
  involvedCharacters: string[];
  createdAt: number;
};
