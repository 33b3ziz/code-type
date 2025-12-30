import { describe, it, expect } from 'vitest'
import { ACHIEVEMENTS } from '@/lib/achievements'

// Test the achievement checking logic without database dependencies
// These tests verify the criteria matching logic

describe('Achievement Tracker Logic', () => {
  describe('Speed Achievement Criteria', () => {
    const speedAchievements = ACHIEVEMENTS.filter((a) => a.type === 'speed')

    it('speed achievements have progressive WPM thresholds', () => {
      const thresholds = speedAchievements.map((a) => {
        const criteria = a.criteria as { type: 'speed'; minWpm: number }
        return criteria.minWpm
      })

      // Should be sorted ascending
      for (let i = 1; i < thresholds.length; i++) {
        expect(thresholds[i]).toBeGreaterThan(thresholds[i - 1])
      }
    })

    it('lowest speed threshold is achievable for beginners (40 WPM)', () => {
      const lowestThreshold = Math.min(
        ...speedAchievements.map((a) => {
          const criteria = a.criteria as { type: 'speed'; minWpm: number }
          return criteria.minWpm
        })
      )
      expect(lowestThreshold).toBe(40)
    })

    it('highest speed threshold is challenging (100 WPM)', () => {
      const highestThreshold = Math.max(
        ...speedAchievements.map((a) => {
          const criteria = a.criteria as { type: 'speed'; minWpm: number }
          return criteria.minWpm
        })
      )
      expect(highestThreshold).toBe(100)
    })
  })

  describe('Accuracy Achievement Criteria', () => {
    const accuracyAchievements = ACHIEVEMENTS.filter((a) => a.type === 'accuracy')

    it('has single-test and consecutive test achievements', () => {
      const singleTest = accuracyAchievements.filter((a) => {
        const criteria = a.criteria as {
          type: 'accuracy'
          minAccuracy: number
          consecutiveTests?: number
        }
        return !criteria.consecutiveTests
      })
      const consecutive = accuracyAchievements.filter((a) => {
        const criteria = a.criteria as {
          type: 'accuracy'
          minAccuracy: number
          consecutiveTests?: number
        }
        return !!criteria.consecutiveTests
      })

      expect(singleTest.length).toBeGreaterThan(0)
      expect(consecutive.length).toBeGreaterThan(0)
    })

    it('has a perfectionist achievement requiring 100% accuracy', () => {
      const perfectionist = accuracyAchievements.find((a) => {
        const criteria = a.criteria as { type: 'accuracy'; minAccuracy: number }
        return criteria.minAccuracy === 100
      })
      expect(perfectionist).toBeDefined()
      expect(perfectionist?.slug).toBe('perfectionist-100')
    })
  })

  describe('Consistency Achievement Criteria', () => {
    const consistencyAchievements = ACHIEVEMENTS.filter(
      (a) => a.type === 'consistency'
    )

    it('has progressive test count milestones', () => {
      const thresholds = consistencyAchievements.map((a) => {
        const criteria = a.criteria as { type: 'consistency'; minTests: number }
        return criteria.minTests
      })

      // Check we have reasonable milestones
      expect(thresholds).toContain(10)
      expect(thresholds).toContain(50)
      expect(thresholds).toContain(100)
      expect(thresholds).toContain(500)
    })

    it('milestones are in ascending order', () => {
      const thresholds = consistencyAchievements.map((a) => {
        const criteria = a.criteria as { type: 'consistency'; minTests: number }
        return criteria.minTests
      })

      const sorted = [...thresholds].sort((a, b) => a - b)
      expect(thresholds).toEqual(sorted)
    })
  })

  describe('Special Achievement Criteria', () => {
    const specialAchievements = ACHIEVEMENTS.filter((a) => a.type === 'special')

    it('has first test achievement', () => {
      const firstTest = specialAchievements.find((a) => {
        const criteria = a.criteria as { type: 'special'; condition: string }
        return criteria.condition === 'first_test'
      })
      expect(firstTest).toBeDefined()
      expect(firstTest?.slug).toBe('first-steps')
    })

    it('has no backspace achievement', () => {
      const noBackspace = specialAchievements.find((a) => {
        const criteria = a.criteria as { type: 'special'; condition: string }
        return criteria.condition === 'no_backspace'
      })
      expect(noBackspace).toBeDefined()
    })

    it('has streak achievements with different thresholds', () => {
      const streakAchievements = specialAchievements.filter((a) => {
        const criteria = a.criteria as { type: 'special'; condition: string }
        return criteria.condition === 'streak'
      })
      expect(streakAchievements.length).toBeGreaterThanOrEqual(2)

      const values = streakAchievements.map((a) => {
        const criteria = a.criteria as {
          type: 'special'
          condition: string
          value: number
        }
        return criteria.value
      })
      expect(values).toContain(5)
      expect(values).toContain(10)
    })

    it('has language mastery achievements for each supported language', () => {
      const masteryAchievements = specialAchievements.filter((a) => {
        const criteria = a.criteria as { type: 'special'; condition: string }
        return criteria.condition === 'language_mastery'
      })

      const languages = masteryAchievements.map((a) => {
        const criteria = a.criteria as {
          type: 'special'
          condition: string
          value: string
        }
        return criteria.value
      })

      expect(languages).toContain('javascript')
      expect(languages).toContain('typescript')
      expect(languages).toContain('python')
    })
  })

  describe('Achievement Points', () => {
    it('all achievements have positive points', () => {
      ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement.points).toBeGreaterThan(0)
      })
    })

    it('harder achievements have more points', () => {
      const speedAchievements = ACHIEVEMENTS.filter((a) => a.type === 'speed')
      const sorted = [...speedAchievements].sort((a, b) => {
        const aWpm = (a.criteria as { minWpm: number }).minWpm
        const bWpm = (b.criteria as { minWpm: number }).minWpm
        return aWpm - bWpm
      })

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].points).toBeGreaterThanOrEqual(sorted[i - 1].points)
      }
    })

    it('total possible points is reasonable', () => {
      const totalPoints = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0)
      expect(totalPoints).toBeGreaterThan(500) // At least 500 points available
      expect(totalPoints).toBeLessThan(2000) // Not too inflated
    })
  })

  describe('Achievement Icons', () => {
    it('all achievements have icon names', () => {
      ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement.iconName).toBeTruthy()
        expect(typeof achievement.iconName).toBe('string')
      })
    })

    it('icon names follow Lucide naming convention (PascalCase)', () => {
      const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/
      ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement.iconName).toMatch(pascalCaseRegex)
      })
    })
  })

  describe('Achievement Slugs', () => {
    it('all slugs are lowercase with hyphens', () => {
      const slugRegex = /^[a-z0-9-]+$/
      ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement.slug).toMatch(slugRegex)
      })
    })

    it('slugs are descriptive and include key information', () => {
      // Speed achievements should include WPM threshold
      const speedAchievements = ACHIEVEMENTS.filter((a) => a.type === 'speed')
      speedAchievements.forEach((achievement) => {
        const criteria = achievement.criteria as { minWpm: number }
        expect(achievement.slug).toContain(criteria.minWpm.toString())
      })
    })
  })
})
