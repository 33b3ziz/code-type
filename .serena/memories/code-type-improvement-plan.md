# Code-Type Comprehensive Improvement Plan

## Overview
A phased approach to improve state management, add features (sound, themes, practice modes, multiplayer), and enhance code quality.

---

## Phase 1: Foundation & Quick Wins

### 1.1 Install & Configure Zustand
```bash
pnpm add zustand
```

**Create stores:**
- `src/stores/test-config-store.ts` - Test wizard state (language, difficulty, challenge, options)
- `src/stores/auth-store.ts` - User session, isAuthenticated
- `src/stores/settings-store.ts` - User preferences with persist middleware
- `src/stores/sound-store.ts` - Sound enabled, volume, audio context
- `src/stores/index.ts` - Barrel export

### 1.2 Integrate TanStack Query (already installed, unused)

**Modify:** `src/integrations/tanstack-query/root-provider.tsx`
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```

**Create query hooks:**
- `src/hooks/queries/useSnippets.ts`
- `src/hooks/queries/useUserStats.ts`
- `src/hooks/queries/useLeaderboard.ts`
- `src/hooks/queries/useSettings.ts`
- `src/hooks/mutations/useSaveResult.ts`

### 1.3 Create Shared UI Components
- `src/components/ui/stat-card.tsx` - Extract from UserProfile.tsx
- `src/components/ui/loading-skeleton.tsx`
- `src/components/ui/error-boundary.tsx`
- `src/components/ui/trend-indicator.tsx`

### 1.4 Consolidate Utilities
- `src/lib/formatters.ts` - Merge formatTime, formatDate, formatDuration

---

## Phase 2: Theme System

**Modify:** `src/components/ThemeProvider.tsx` - Add CSS custom properties

**Create:**
- `src/styles/themes/light.css`
- `src/styles/themes/dark.css`

**Update:** `src/components/Header.tsx` - Add theme toggle (Sun/Moon/Monitor icons)

---

## Phase 3: Sound Effects

### 3.1 Sound Infrastructure
**Create:**
- `src/lib/sound-manager.ts` - Web Audio API wrapper
- `src/hooks/useSound.ts` - React hook for sound playback
- `public/sounds/` - Audio files (keypress, error, backspace, completion, achievement)

### 3.2 Sound Types
```typescript
type SoundType = 'keypress' | 'keypress-correct' | 'keypress-error' | 'backspace' | 'completion' | 'achievement'
```

### 3.3 Integration Points
**Modify:** `src/hooks/useTypingTest.ts`
- Line ~302: Play correct keypress sound
- Line ~305: Play error sound
- Line ~288: Play backspace sound
- Line ~331: Play completion sound

**Modify:** `src/routes/settings.tsx` - Add sound settings UI (already has soundEnabled, soundVolume in schema)

---

## Phase 4: Component Refactoring

### 4.1 Split UserProfile.tsx (412 lines)
**Create:**
- `src/components/profile/ProfileHeader.tsx`
- `src/components/profile/ProfileStats.tsx`
- `src/components/profile/ProfileTrends.tsx`
- `src/components/profile/ProfileLanguages.tsx`
- `src/components/profile/ProfileWeaknesses.tsx`

### 4.2 Split TestSetup.tsx (336 lines)
**Create:**
- `src/components/test-setup/StepIndicator.tsx`
- `src/components/test-setup/LanguageStep.tsx`
- `src/components/test-setup/DifficultyStep.tsx`
- `src/components/test-setup/ChallengeStep.tsx`
- `src/components/test-setup/OptionsStep.tsx`

### 4.3 Add Error Boundary
**Create:** `src/components/ErrorBoundary.tsx`
**Modify:** `src/routes/__root.tsx` - Wrap content

---

## Phase 5: Performance Optimizations

### 5.1 Memoization
**Modify:** `src/hooks/useTypingTest.ts`
- Wrap `getCharacterStates` with `useMemo`
- Wrap `getCurrentStats` with `useMemo`

### 5.2 Virtualization
```bash
pnpm add @tanstack/react-virtual
```
**Modify:**
- `src/components/TypingHistory.tsx` - Virtualize list
- `src/components/Leaderboard.tsx` - Virtualize list

### 5.3 Loading Skeletons
**Modify:** UserProfile, Leaderboard, test route - Replace loading text

---

## Phase 6: Practice Modes

### 6.1 Create Practice System
**Create:**
- `src/lib/practice-modes.ts` - Mode definitions
- `src/routes/practice.tsx` - Practice route
- `src/components/practice/PracticeSelector.tsx`
- `src/components/practice/SymbolPractice.tsx`
- `src/components/practice/WeakSpotDrill.tsx`
- `src/components/practice/WarmUpRoutine.tsx`

### 6.2 Practice Mode Types
```typescript
type PracticeMode = 'symbols' | 'keywords' | 'weak-spots' | 'speed' | 'accuracy' | 'warm-up'
```

### 6.3 Database Schema
**Modify:** `src/db/schema.ts` - Add `practiceSessions` table
```bash
pnpm db:generate && pnpm db:migrate
```

---

## Phase 7: Accessibility

### 7.1 ARIA Labels
**Modify:**
- `src/components/TypingTest.tsx` - Add role="application", aria-label
- `src/components/TestSetup.tsx` - Form accessibility
- `src/components/Leaderboard.tsx` - Table accessibility

### 7.2 Screen Reader Support
**Create:** `src/components/LiveAnnouncer.tsx` - Announce test events

### 7.3 Keyboard Navigation
**Modify:** `src/components/TestSetup.tsx` - Arrow key navigation

---

## Phase 8: Multiplayer Foundation

### 8.1 WebSocket Infrastructure
```bash
pnpm add ws @types/ws
```
**Create:**
- `src/lib/websocket/client.ts`
- `src/lib/websocket/types.ts`
- `src/hooks/useWebSocket.ts`

### 8.2 Multiplayer Components
**Create:**
- `src/routes/race.tsx`
- `src/components/multiplayer/RaceLobby.tsx`
- `src/components/multiplayer/RaceProgress.tsx`
- `src/components/multiplayer/RaceResults.tsx`
- `src/components/multiplayer/PlayerCard.tsx`

### 8.3 Database Schema
**Modify:** `src/db/schema.ts`
- Add `races` table
- Add `raceParticipants` table

---

## Critical Files Reference

| File | Purpose |
|------|---------|
| `src/hooks/useTypingTest.ts` | Core typing logic - sound integration, perf optimization |
| `src/components/ThemeProvider.tsx` | Theme system base - extend with CSS vars |
| `src/lib/settings-api.ts` | Settings structure - soundEnabled, soundVolume exist |
| `src/integrations/tanstack-query/root-provider.tsx` | Query setup - needs config |
| `src/components/UserProfile.tsx` | Largest component (412 lines) - refactor target |
| `src/db/schema.ts` | Database schema - add practice/multiplayer tables |

---

## Implementation Order

1. **Phase 1** (Foundation) - Required for all other phases
2. **Phase 4** (Refactoring) - Reduces complexity for feature work
3. **Phase 2** (Themes) - Quick win, high visibility
4. **Phase 3** (Sound) - Settings already exist, just implement
5. **Phase 5** (Performance) - Better UX
6. **Phase 7** (Accessibility) - Important for all users
7. **Phase 6** (Practice Modes) - New feature, medium complexity
8. **Phase 8** (Multiplayer) - Most complex, do last

---

## Testing Strategy

Each phase should include:
- Unit tests in `src/__tests__/unit/` following existing patterns
- Update E2E tests in `e2e/app.spec.ts`
- Run `pnpm test` and `pnpm lint` before committing
