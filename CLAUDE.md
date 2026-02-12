# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MangaFlow is an Expo React Native mobile app for AI-assisted manga story creation. It uses a modular, entity-based architecture where users can start from any element (character, world, location, story beat) and generate related content with AI context engineering.

## Development Commands

```bash
npm install          # Install dependencies
npx expo start       # Start development server
npx expo start --android  # Start on Android
npx expo start --ios      # Start on iOS
expo lint            # Run ESLint
npx tsc              # Type check
```

## Architecture

### Tech Stack
- **Framework:** Expo 54 with React Native 0.81
- **Navigation:** Expo Router (file-based routing in `app/` directory)
- **State Management:** TanStack Query for async state
- **TypeScript:** Strict mode enabled with `@/*` path alias

### Key Patterns
- Use TanStack Query for all async state management (see `queries/index.ts`)
- Root layout wraps app with `QueryClientProvider` and `SafeAreaProvider`
- File-based routing: screens go in `app/` directory

### Entity-Based Data Model
The app uses a unified entity system with these types:
- `CharacterEntity` - characters with traits, motivation, appearance
- `WorldEntity` - lore elements (magic, tech, society, history, rules)
- `LocationEntity` - places with descriptions and visual references
- `StoryBeatEntity` - plot points with timing and involved characters

All entities share: `id`, `type`, `name`, `linkedTo[]` (relationships), `generationMetadata` (AI context tracking).

### AI Integration Pattern
AI generation requests include:
- `targetType` - what to generate
- `userPrompt` - user's description
- `context` - selected existing entities for coherent generation
- AI never auto-generates; user always controls prompt and context selection

### PocketBase Integration
When integrating PocketBase backend:
```typescript
import PB from "pocketbase";
export const pb = new PB('https://rasult22.pockethost.io')

// For SSE support in React Native:
import EventSource from "react-native-sse";
if (!global.EventSource) {
  (EventSource as any).CONNECTING = 0;
  (EventSource as any).OPEN = 1;
  (EventSource as any).CLOSED = 2;
  global.EventSource = EventSource as typeof global.EventSource;
}
```

## Project Constraints
- Max 10 projects, 50 entities per project
- Max 10 episodes per project, 15 panels per episode
- Offline-first: all core features work with local storage
- Mobile-first: optimize for portrait orientation
