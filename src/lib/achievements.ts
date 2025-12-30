import type { AchievementType } from '@/db/schema'

// Achievement criteria types
export interface SpeedCriteria {
  type: 'speed'
  minWpm: number
}

export interface AccuracyCriteria {
  type: 'accuracy'
  minAccuracy: number
  consecutiveTests?: number
}

export interface ConsistencyCriteria {
  type: 'consistency'
  minTests: number
  minWpm?: number
  minAccuracy?: number
}

export interface SpecialCriteria {
  type: 'special'
  condition: 'no_backspace' | 'perfect_symbols' | 'first_test' | 'streak' | 'language_mastery'
  value?: number | string
}

export type AchievementCriteria =
  | SpeedCriteria
  | AccuracyCriteria
  | ConsistencyCriteria
  | SpecialCriteria

export interface AchievementDefinition {
  slug: string
  name: string
  description: string
  type: AchievementType
  criteria: AchievementCriteria
  points: number
  iconName: string // Lucide icon name
}

// Achievement definitions
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Speed achievements
  {
    slug: 'speed-demon-40',
    name: 'Speed Demon',
    description: 'Achieve 40 WPM or higher on any test',
    type: 'speed',
    criteria: { type: 'speed', minWpm: 40 },
    points: 10,
    iconName: 'Zap',
  },
  {
    slug: 'lightning-fast-60',
    name: 'Lightning Fast',
    description: 'Achieve 60 WPM or higher on any test',
    type: 'speed',
    criteria: { type: 'speed', minWpm: 60 },
    points: 25,
    iconName: 'Bolt',
  },
  {
    slug: 'supersonic-80',
    name: 'Supersonic',
    description: 'Achieve 80 WPM or higher on any test',
    type: 'speed',
    criteria: { type: 'speed', minWpm: 80 },
    points: 50,
    iconName: 'Rocket',
  },
  {
    slug: 'code-wizard-100',
    name: 'Code Wizard',
    description: 'Achieve 100 WPM or higher on any test',
    type: 'speed',
    criteria: { type: 'speed', minWpm: 100 },
    points: 100,
    iconName: 'Wand2',
  },

  // Accuracy achievements
  {
    slug: 'sharp-shooter-95',
    name: 'Sharp Shooter',
    description: 'Complete a test with 95% accuracy or higher',
    type: 'accuracy',
    criteria: { type: 'accuracy', minAccuracy: 95 },
    points: 15,
    iconName: 'Target',
  },
  {
    slug: 'perfectionist-100',
    name: 'Perfectionist',
    description: 'Complete a test with 100% accuracy',
    type: 'accuracy',
    criteria: { type: 'accuracy', minAccuracy: 100 },
    points: 50,
    iconName: 'Star',
  },
  {
    slug: 'consistent-accuracy-3',
    name: 'Steady Hands',
    description: 'Achieve 95%+ accuracy on 3 consecutive tests',
    type: 'accuracy',
    criteria: { type: 'accuracy', minAccuracy: 95, consecutiveTests: 3 },
    points: 35,
    iconName: 'Shield',
  },
  {
    slug: 'consistent-accuracy-10',
    name: 'Accuracy Master',
    description: 'Achieve 95%+ accuracy on 10 consecutive tests',
    type: 'accuracy',
    criteria: { type: 'accuracy', minAccuracy: 95, consecutiveTests: 10 },
    points: 100,
    iconName: 'Crown',
  },

  // Consistency achievements
  {
    slug: 'dedicated-10',
    name: 'Dedicated',
    description: 'Complete 10 typing tests',
    type: 'consistency',
    criteria: { type: 'consistency', minTests: 10 },
    points: 10,
    iconName: 'Trophy',
  },
  {
    slug: 'committed-50',
    name: 'Committed',
    description: 'Complete 50 typing tests',
    type: 'consistency',
    criteria: { type: 'consistency', minTests: 50 },
    points: 30,
    iconName: 'Medal',
  },
  {
    slug: 'devoted-100',
    name: 'Devoted',
    description: 'Complete 100 typing tests',
    type: 'consistency',
    criteria: { type: 'consistency', minTests: 100 },
    points: 60,
    iconName: 'Award',
  },
  {
    slug: 'legendary-500',
    name: 'Legendary',
    description: 'Complete 500 typing tests',
    type: 'consistency',
    criteria: { type: 'consistency', minTests: 500 },
    points: 150,
    iconName: 'Sparkles',
  },

  // Special achievements
  {
    slug: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first typing test',
    type: 'special',
    criteria: { type: 'special', condition: 'first_test' },
    points: 5,
    iconName: 'Footprints',
  },
  {
    slug: 'no-mistakes-allowed',
    name: 'No Mistakes Allowed',
    description: 'Complete a test without using backspace',
    type: 'special',
    criteria: { type: 'special', condition: 'no_backspace' },
    points: 40,
    iconName: 'Ban',
  },
  {
    slug: 'symbol-master',
    name: 'Symbol Master',
    description: 'Achieve 100% accuracy on symbols in a test',
    type: 'special',
    criteria: { type: 'special', condition: 'perfect_symbols' },
    points: 35,
    iconName: 'Hash',
  },
  {
    slug: 'hot-streak-5',
    name: 'Hot Streak',
    description: 'Complete 5 tests in a single day',
    type: 'special',
    criteria: { type: 'special', condition: 'streak', value: 5 },
    points: 20,
    iconName: 'Flame',
  },
  {
    slug: 'hot-streak-10',
    name: 'On Fire',
    description: 'Complete 10 tests in a single day',
    type: 'special',
    criteria: { type: 'special', condition: 'streak', value: 10 },
    points: 40,
    iconName: 'Flame',
  },
  {
    slug: 'js-master',
    name: 'JavaScript Master',
    description: 'Complete 25 JavaScript tests with 90%+ accuracy',
    type: 'special',
    criteria: { type: 'special', condition: 'language_mastery', value: 'javascript' },
    points: 50,
    iconName: 'FileCode',
  },
  {
    slug: 'ts-master',
    name: 'TypeScript Master',
    description: 'Complete 25 TypeScript tests with 90%+ accuracy',
    type: 'special',
    criteria: { type: 'special', condition: 'language_mastery', value: 'typescript' },
    points: 50,
    iconName: 'FileType',
  },
  {
    slug: 'py-master',
    name: 'Python Master',
    description: 'Complete 25 Python tests with 90%+ accuracy',
    type: 'special',
    criteria: { type: 'special', condition: 'language_mastery', value: 'python' },
    points: 50,
    iconName: 'FileCode2',
  },
]

// Helper functions
export function getAchievementBySlug(slug: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.slug === slug)
}

export function getAchievementsByType(type: AchievementType): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => a.type === type)
}

export function serializeCriteria(criteria: AchievementCriteria): string {
  return JSON.stringify(criteria)
}

export function parseCriteria(criteriaJson: string): AchievementCriteria {
  return JSON.parse(criteriaJson) as AchievementCriteria
}

// Achievement checking functions
export function checkSpeedAchievement(
  criteria: SpeedCriteria,
  wpm: number
): boolean {
  return wpm >= criteria.minWpm
}

export function checkAccuracyAchievement(
  criteria: AccuracyCriteria,
  accuracy: number,
  consecutiveHighAccuracyTests?: number
): boolean {
  if (criteria.consecutiveTests) {
    return (consecutiveHighAccuracyTests ?? 0) >= criteria.consecutiveTests
  }
  return accuracy >= criteria.minAccuracy
}

export function checkConsistencyAchievement(
  criteria: ConsistencyCriteria,
  totalTests: number
): boolean {
  return totalTests >= criteria.minTests
}
