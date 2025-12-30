import { describe, expect, it } from 'vitest'
import type {AccuracyCriteria, ConsistencyCriteria, SpeedCriteria} from '@/lib/achievements';
import {
  ACHIEVEMENTS,
  
  
  
  
  checkAccuracyAchievement,
  checkConsistencyAchievement,
  checkSpeedAchievement,
  getAchievementBySlug,
  getAchievementsByType,
  parseCriteria,
  serializeCriteria
} from '@/lib/achievements'

describe('Achievement Definitions', () => {
  describe('ACHIEVEMENTS array', () => {
    it('contains all expected achievements', () => {
      expect(ACHIEVEMENTS.length).toBe(20)
    })

    it('has unique slugs for all achievements', () => {
      const slugs = ACHIEVEMENTS.map((a) => a.slug)
      const uniqueSlugs = new Set(slugs)
      expect(uniqueSlugs.size).toBe(slugs.length)
    })

    it('has all required fields for each achievement', () => {
      ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement).toHaveProperty('slug')
        expect(achievement).toHaveProperty('name')
        expect(achievement).toHaveProperty('description')
        expect(achievement).toHaveProperty('type')
        expect(achievement).toHaveProperty('criteria')
        expect(achievement).toHaveProperty('points')
        expect(achievement).toHaveProperty('iconName')

        expect(typeof achievement.slug).toBe('string')
        expect(typeof achievement.name).toBe('string')
        expect(typeof achievement.description).toBe('string')
        expect(typeof achievement.points).toBe('number')
        expect(typeof achievement.iconName).toBe('string')
        expect(achievement.points).toBeGreaterThan(0)
      })
    })

    it('has valid types matching criteria types', () => {
      ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement.type).toBe(achievement.criteria.type)
      })
    })

    it('contains speed achievements', () => {
      const speedAchievements = ACHIEVEMENTS.filter((a) => a.type === 'speed')
      expect(speedAchievements.length).toBe(4)
      expect(speedAchievements.map((a) => a.slug)).toContain('speed-demon-40')
      expect(speedAchievements.map((a) => a.slug)).toContain('code-wizard-100')
    })

    it('contains accuracy achievements', () => {
      const accuracyAchievements = ACHIEVEMENTS.filter(
        (a) => a.type === 'accuracy'
      )
      expect(accuracyAchievements.length).toBe(4)
      expect(accuracyAchievements.map((a) => a.slug)).toContain(
        'perfectionist-100'
      )
    })

    it('contains consistency achievements', () => {
      const consistencyAchievements = ACHIEVEMENTS.filter(
        (a) => a.type === 'consistency'
      )
      expect(consistencyAchievements.length).toBe(4)
      expect(consistencyAchievements.map((a) => a.slug)).toContain(
        'dedicated-10'
      )
    })

    it('contains special achievements', () => {
      const specialAchievements = ACHIEVEMENTS.filter(
        (a) => a.type === 'special'
      )
      expect(specialAchievements.length).toBe(8)
      expect(specialAchievements.map((a) => a.slug)).toContain('first-steps')
      expect(specialAchievements.map((a) => a.slug)).toContain(
        'no-mistakes-allowed'
      )
    })
  })

  describe('getAchievementBySlug', () => {
    it('returns the correct achievement for a valid slug', () => {
      const achievement = getAchievementBySlug('speed-demon-40')
      expect(achievement).toBeDefined()
      expect(achievement?.name).toBe('Speed Demon')
      expect(achievement?.criteria).toEqual({ type: 'speed', minWpm: 40 })
    })

    it('returns undefined for an invalid slug', () => {
      const achievement = getAchievementBySlug('non-existent-slug')
      expect(achievement).toBeUndefined()
    })

    it('returns undefined for empty string', () => {
      const achievement = getAchievementBySlug('')
      expect(achievement).toBeUndefined()
    })
  })

  describe('getAchievementsByType', () => {
    it('returns all speed achievements', () => {
      const achievements = getAchievementsByType('speed')
      expect(achievements.length).toBe(4)
      achievements.forEach((a) => {
        expect(a.type).toBe('speed')
      })
    })

    it('returns all accuracy achievements', () => {
      const achievements = getAchievementsByType('accuracy')
      expect(achievements.length).toBe(4)
      achievements.forEach((a) => {
        expect(a.type).toBe('accuracy')
      })
    })

    it('returns all consistency achievements', () => {
      const achievements = getAchievementsByType('consistency')
      expect(achievements.length).toBe(4)
      achievements.forEach((a) => {
        expect(a.type).toBe('consistency')
      })
    })

    it('returns all special achievements', () => {
      const achievements = getAchievementsByType('special')
      expect(achievements.length).toBe(8)
      achievements.forEach((a) => {
        expect(a.type).toBe('special')
      })
    })

    it('returns empty array for unknown type', () => {
      const achievements = getAchievementsByType('unknown' as never)
      expect(achievements).toEqual([])
    })
  })

  describe('serializeCriteria and parseCriteria', () => {
    it('correctly serializes and parses speed criteria', () => {
      const criteria: SpeedCriteria = { type: 'speed', minWpm: 60 }
      const serialized = serializeCriteria(criteria)
      const parsed = parseCriteria(serialized)
      expect(parsed).toEqual(criteria)
    })

    it('correctly serializes and parses accuracy criteria', () => {
      const criteria: AccuracyCriteria = {
        type: 'accuracy',
        minAccuracy: 95,
        consecutiveTests: 3,
      }
      const serialized = serializeCriteria(criteria)
      const parsed = parseCriteria(serialized)
      expect(parsed).toEqual(criteria)
    })

    it('correctly serializes and parses consistency criteria', () => {
      const criteria: ConsistencyCriteria = {
        type: 'consistency',
        minTests: 10,
        minWpm: 40,
        minAccuracy: 90,
      }
      const serialized = serializeCriteria(criteria)
      const parsed = parseCriteria(serialized)
      expect(parsed).toEqual(criteria)
    })

    it('produces valid JSON strings', () => {
      const criteria: SpeedCriteria = { type: 'speed', minWpm: 100 }
      const serialized = serializeCriteria(criteria)
      expect(() => JSON.parse(serialized)).not.toThrow()
    })
  })

  describe('checkSpeedAchievement', () => {
    const criteria: SpeedCriteria = { type: 'speed', minWpm: 60 }

    it('returns true when WPM meets the minimum', () => {
      expect(checkSpeedAchievement(criteria, 60)).toBe(true)
    })

    it('returns true when WPM exceeds the minimum', () => {
      expect(checkSpeedAchievement(criteria, 100)).toBe(true)
    })

    it('returns false when WPM is below the minimum', () => {
      expect(checkSpeedAchievement(criteria, 59)).toBe(false)
    })

    it('returns false for zero WPM', () => {
      expect(checkSpeedAchievement(criteria, 0)).toBe(false)
    })
  })

  describe('checkAccuracyAchievement', () => {
    describe('without consecutive tests requirement', () => {
      const criteria: AccuracyCriteria = { type: 'accuracy', minAccuracy: 95 }

      it('returns true when accuracy meets the minimum', () => {
        expect(checkAccuracyAchievement(criteria, 95)).toBe(true)
      })

      it('returns true when accuracy exceeds the minimum', () => {
        expect(checkAccuracyAchievement(criteria, 100)).toBe(true)
      })

      it('returns false when accuracy is below the minimum', () => {
        expect(checkAccuracyAchievement(criteria, 94)).toBe(false)
      })
    })

    describe('with consecutive tests requirement', () => {
      const criteria: AccuracyCriteria = {
        type: 'accuracy',
        minAccuracy: 95,
        consecutiveTests: 3,
      }

      it('returns true when consecutive tests meet the requirement', () => {
        expect(checkAccuracyAchievement(criteria, 95, 3)).toBe(true)
      })

      it('returns true when consecutive tests exceed the requirement', () => {
        expect(checkAccuracyAchievement(criteria, 95, 5)).toBe(true)
      })

      it('returns false when consecutive tests are below the requirement', () => {
        expect(checkAccuracyAchievement(criteria, 95, 2)).toBe(false)
      })

      it('returns false when consecutive tests is undefined', () => {
        expect(checkAccuracyAchievement(criteria, 100)).toBe(false)
      })

      it('returns false when consecutive tests is zero', () => {
        expect(checkAccuracyAchievement(criteria, 100, 0)).toBe(false)
      })
    })
  })

  describe('checkConsistencyAchievement', () => {
    const criteria: ConsistencyCriteria = { type: 'consistency', minTests: 10 }

    it('returns true when total tests meet the minimum', () => {
      expect(checkConsistencyAchievement(criteria, 10)).toBe(true)
    })

    it('returns true when total tests exceed the minimum', () => {
      expect(checkConsistencyAchievement(criteria, 50)).toBe(true)
    })

    it('returns false when total tests are below the minimum', () => {
      expect(checkConsistencyAchievement(criteria, 9)).toBe(false)
    })

    it('returns false for zero tests', () => {
      expect(checkConsistencyAchievement(criteria, 0)).toBe(false)
    })
  })

  describe('Achievement progression', () => {
    it('speed achievements have increasing WPM requirements', () => {
      const speedAchievements = getAchievementsByType('speed')
      const wpmRequirements = speedAchievements.map(
        (a) => (a.criteria as SpeedCriteria).minWpm
      )
      for (let i = 1; i < wpmRequirements.length; i++) {
        expect(wpmRequirements[i]).toBeGreaterThan(wpmRequirements[i - 1])
      }
    })

    it('consistency achievements have increasing test requirements', () => {
      const consistencyAchievements = getAchievementsByType('consistency')
      const testRequirements = consistencyAchievements.map(
        (a) => (a.criteria as ConsistencyCriteria).minTests
      )
      for (let i = 1; i < testRequirements.length; i++) {
        expect(testRequirements[i]).toBeGreaterThan(testRequirements[i - 1])
      }
    })

    it('higher tier achievements have more points', () => {
      const speedAchievements = getAchievementsByType('speed')
      const points = speedAchievements.map((a) => a.points)
      for (let i = 1; i < points.length; i++) {
        expect(points[i]).toBeGreaterThan(points[i - 1])
      }
    })
  })
})
