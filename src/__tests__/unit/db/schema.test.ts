import { describe, expect, it } from 'vitest'
import {
  achievementTypeEnum,
  achievements,
  difficultyEnum,
  languageEnum,
  leaderboardEntries,
  leaderboardPeriodEnum,
  snippetCategoryEnum,
  snippets,
  testResults,
  userAchievements,
  userSettings,
  users,
} from '@/db/schema'

describe('Database Schema', () => {
  describe('Enums', () => {
    it('languageEnum has correct values', () => {
      expect(languageEnum.enumValues).toEqual([
        'javascript',
        'typescript',
        'python',
      ])
    })

    it('difficultyEnum has correct values', () => {
      expect(difficultyEnum.enumValues).toEqual([
        'beginner',
        'intermediate',
        'advanced',
        'hardcore',
      ])
    })

    it('snippetCategoryEnum has correct values', () => {
      expect(snippetCategoryEnum.enumValues).toEqual([
        'functions',
        'loops',
        'conditionals',
        'classes',
        'react-components',
        'async',
        'data-structures',
        'algorithms',
      ])
    })

    it('achievementTypeEnum has correct values', () => {
      expect(achievementTypeEnum.enumValues).toEqual([
        'speed',
        'accuracy',
        'consistency',
        'special',
      ])
    })

    it('leaderboardPeriodEnum has correct values', () => {
      expect(leaderboardPeriodEnum.enumValues).toEqual([
        'daily',
        'weekly',
        'alltime',
      ])
    })
  })

  describe('Tables', () => {
    it('users table has required columns', () => {
      const columns = Object.keys(users)
      expect(columns).toContain('id')
      expect(columns).toContain('email')
      expect(columns).toContain('username')
      expect(columns).toContain('passwordHash')
      expect(columns).toContain('createdAt')
      expect(columns).toContain('updatedAt')
    })

    it('userSettings table has required columns', () => {
      const columns = Object.keys(userSettings)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('theme')
      expect(columns).toContain('autoIndent')
      expect(columns).toContain('tabSize')
    })

    it('snippets table has required columns', () => {
      const columns = Object.keys(snippets)
      expect(columns).toContain('id')
      expect(columns).toContain('title')
      expect(columns).toContain('content')
      expect(columns).toContain('language')
      expect(columns).toContain('difficulty')
      expect(columns).toContain('category')
      expect(columns).toContain('characterCount')
      expect(columns).toContain('lineCount')
    })

    it('testResults table has required columns', () => {
      const columns = Object.keys(testResults)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('snippetId')
      expect(columns).toContain('wpm')
      expect(columns).toContain('rawWpm')
      expect(columns).toContain('accuracy')
      expect(columns).toContain('symbolAccuracy')
      expect(columns).toContain('keywordAccuracy')
      expect(columns).toContain('duration')
    })

    it('achievements table has required columns', () => {
      const columns = Object.keys(achievements)
      expect(columns).toContain('id')
      expect(columns).toContain('slug')
      expect(columns).toContain('name')
      expect(columns).toContain('description')
      expect(columns).toContain('type')
      expect(columns).toContain('criteria')
    })

    it('userAchievements table has required columns', () => {
      const columns = Object.keys(userAchievements)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('achievementId')
      expect(columns).toContain('progress')
      expect(columns).toContain('unlockedAt')
    })

    it('leaderboardEntries table has required columns', () => {
      const columns = Object.keys(leaderboardEntries)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('period')
      expect(columns).toContain('language')
      expect(columns).toContain('difficulty')
      expect(columns).toContain('bestWpm')
      expect(columns).toContain('bestAccuracy')
    })
  })
})
