/**
 * User Profile Dashboard Component
 * Displays user statistics, typing history, per-language breakdown, and analytics
 */

import { useEffect, useState } from 'react'

import {
  ProfileAchievements,
  ProfileActivity,
  ProfileCharts,
  ProfileDifficulty,
  ProfileHeader,
  ProfileLanguages,
  ProfileRecommendations,
  ProfileStats,
  ProfileTrends,
  ProfileWeaknesses,
} from './profile'
import type { AccuracyTrend, DifficultyStats, LanguageBreakdown, WPMTrend, WeaknessArea } from '@/lib/analytics-api'
import type { AchievementProgress } from '@/lib/achievement-tracker'
import type { UserStats } from '@/lib/results-api'
import {
  getAccuracyTrend,
  getDifficultyStats,
  getLanguageStats,
  getWPMTrend,
  identifyWeaknesses,
} from '@/lib/analytics-api'
import { getAchievementProgress } from '@/lib/achievement-tracker'
import { getUserRank } from '@/lib/leaderboard-api'
import { getUserStats } from '@/lib/results-api'

export interface UserProfileProps {
  userId: string
  username: string
  className?: string
}

interface ProfileData {
  stats: UserStats | null
  languageBreakdown: LanguageBreakdown | null
  accuracyTrend: AccuracyTrend | null
  wpmTrend: WPMTrend | null
  weaknesses: Array<WeaknessArea>
  globalRank: number | null
  achievements: Array<AchievementProgress>
  difficultyStats: Array<DifficultyStats>
}

async function loadProfileData(userId: string): Promise<ProfileData> {
  const [userStats, langStats, accTrend, wTrend, weak, rank, achievementProgress, diffStats] = await Promise.all([
    getUserStats(userId),
    getLanguageStats(userId),
    getAccuracyTrend(userId),
    getWPMTrend(userId),
    identifyWeaknesses(userId),
    getUserRank(userId, { timeFrame: 'alltime' }),
    getAchievementProgress(userId),
    getDifficultyStats(userId),
  ])

  return {
    stats: userStats,
    languageBreakdown: langStats,
    accuracyTrend: accTrend,
    wpmTrend: wTrend,
    weaknesses: weak,
    globalRank: rank,
    achievements: achievementProgress,
    difficultyStats: diffStats,
  }
}

export function UserProfile({ userId, username, className = '' }: UserProfileProps) {
  const [data, setData] = useState<ProfileData>({
    stats: null,
    languageBreakdown: null,
    accuracyTrend: null,
    wpmTrend: null,
    weaknesses: [],
    globalRank: null,
    achievements: [],
    difficultyStats: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    loadProfileData(userId)
      .then(setData)
      .catch((error) => {
        console.error('Failed to load profile data:', error)
      })
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className={`user-profile ${className}`} data-testid="user-profile-loading">
        <div className="profile-loading">Loading profile...</div>
      </div>
    )
  }

  if (!data.stats) {
    return (
      <div className={`user-profile ${className}`} data-testid="user-profile-error">
        <div className="profile-error">Failed to load profile data</div>
      </div>
    )
  }

  return (
    <div className={`user-profile ${className}`} data-testid="user-profile">
      <ProfileHeader username={username} globalRank={data.globalRank} />

      <ProfileStats
        stats={data.stats}
        wpmTrend={data.wpmTrend}
        accuracyTrend={data.accuracyTrend}
      />

      <ProfileCharts
        wpmTrend={data.wpmTrend}
        accuracyTrend={data.accuracyTrend}
      />

      <ProfileTrends
        wpmTrend={data.wpmTrend}
        accuracyTrend={data.accuracyTrend}
      />

      {data.languageBreakdown && (
        <ProfileLanguages languageBreakdown={data.languageBreakdown} />
      )}

      {data.difficultyStats.length > 0 && (
        <ProfileDifficulty difficultyStats={data.difficultyStats} />
      )}

      {data.achievements.length > 0 && (
        <ProfileAchievements achievements={data.achievements} />
      )}

      <ProfileWeaknesses weaknesses={data.weaknesses} />

      <ProfileRecommendations userId={userId} />

      <ProfileActivity stats={data.stats} />
    </div>
  )
}

export default UserProfile
