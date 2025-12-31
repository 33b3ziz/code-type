/**
 * User Profile Dashboard Component
 * Displays user statistics, typing history, per-language breakdown, and analytics
 */

import { useEffect, useState } from 'react'

import {
  ProfileActivity,
  ProfileHeader,
  ProfileLanguages,
  ProfileStats,
  ProfileTrends,
  ProfileWeaknesses,
} from './profile'
import type { AccuracyTrend, LanguageBreakdown, WPMTrend, WeaknessArea } from '@/lib/analytics-api'
import type { UserStats } from '@/lib/results-api'
import {
  getAccuracyTrend,
  getLanguageStats,
  getWPMTrend,
  identifyWeaknesses,
} from '@/lib/analytics-api'
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
}

async function loadProfileData(userId: string): Promise<ProfileData> {
  const [userStats, langStats, accTrend, wTrend, weak, rank] = await Promise.all([
    getUserStats(userId),
    getLanguageStats(userId),
    getAccuracyTrend(userId),
    getWPMTrend(userId),
    identifyWeaknesses(userId),
    getUserRank(userId, { timeFrame: 'alltime' }),
  ])

  return {
    stats: userStats,
    languageBreakdown: langStats,
    accuracyTrend: accTrend,
    wpmTrend: wTrend,
    weaknesses: weak,
    globalRank: rank,
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

      <ProfileTrends
        wpmTrend={data.wpmTrend}
        accuracyTrend={data.accuracyTrend}
      />

      {data.languageBreakdown && (
        <ProfileLanguages languageBreakdown={data.languageBreakdown} />
      )}

      <ProfileWeaknesses weaknesses={data.weaknesses} />

      <ProfileActivity stats={data.stats} />
    </div>
  )
}

export default UserProfile
