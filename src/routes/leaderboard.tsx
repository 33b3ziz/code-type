import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import { Trophy, Users } from 'lucide-react'
import type { Difficulty, Language } from '@/db/schema'
import type {
  LeaderboardEntry,
  LeaderboardFilters as LeaderboardFiltersType,
  SortBy,
  SortOrder,
  TimeFrame,
} from '@/lib/leaderboard-server-api'
import { Button } from '@/components/ui/button'
import {
  getLeaderboardFn,
  getUserLeaderboardRankFn,
} from '@/lib/leaderboard-server-api'
import { getCurrentUserFn } from '@/lib/auth'
import { VirtualLeaderboard } from '@/components/VirtualLeaderboard'
import { LeaderboardFilters } from '@/components/leaderboard/LeaderboardFilters'

// Page size for initial load and pagination
const PAGE_SIZE = 50

// Search params interface for the leaderboard page
interface LeaderboardSearchParams {
  timeFrame?: TimeFrame
  language?: Language
  difficulty?: Difficulty
  sortBy?: SortBy
  sortOrder?: SortOrder
}

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
  loaderDeps: ({ search }) => {
    const params = search as LeaderboardSearchParams
    return {
      timeFrame: params.timeFrame || 'alltime',
      language: params.language,
      difficulty: params.difficulty,
      sortBy: params.sortBy || 'wpm',
      sortOrder: params.sortOrder || 'desc',
    }
  },
  loader: async ({ deps }) => {
    const filters: LeaderboardFiltersType = {
      timeFrame: deps.timeFrame,
      language: deps.language,
      difficulty: deps.difficulty,
      sortBy: deps.sortBy,
      sortOrder: deps.sortOrder,
      limit: PAGE_SIZE,
      offset: 0,
    }

    const [leaderboard, user] = await Promise.all([
      getLeaderboardFn({ data: filters }),
      getCurrentUserFn(),
    ])

    let userRank: number | null = null
    if (user) {
      userRank = await getUserLeaderboardRankFn({
        data: {
          userId: user.id,
          timeFrame: deps.timeFrame,
          language: deps.language,
          difficulty: deps.difficulty,
          sortBy: deps.sortBy,
        },
      })
    }

    return {
      leaderboard,
      user,
      userRank,
      filters: deps,
    }
  },
  validateSearch: (search: Record<string, unknown>): LeaderboardSearchParams => ({
    timeFrame: (search.timeFrame as TimeFrame | undefined) ?? 'alltime',
    language: search.language as Language | undefined,
    difficulty: search.difficulty as Difficulty | undefined,
    sortBy: (search.sortBy as SortBy | undefined) ?? 'wpm',
    sortOrder: (search.sortOrder as SortOrder | undefined) ?? 'desc',
  }),
})

function LeaderboardPage() {
  const { leaderboard, user, userRank, filters } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  // Handler functions for filter changes - navigate with new search params
  const handleTimeFrameChange = (timeFrame: TimeFrame) => {
    navigate({ search: (prev) => ({ ...prev, timeFrame }) })
  }

  const handleLanguageChange = (language: Language | undefined) => {
    navigate({ search: (prev) => ({ ...prev, language }) })
  }

  const handleDifficultyChange = (difficulty: Difficulty | undefined) => {
    navigate({ search: (prev) => ({ ...prev, difficulty }) })
  }

  const handleSortByChange = (sortBy: SortBy) => {
    navigate({ search: (prev) => ({ ...prev, sortBy }) })
  }

  const handleSortOrderChange = (sortOrder: SortOrder) => {
    navigate({ search: (prev) => ({ ...prev, sortOrder }) })
  }

  // Callback to load more entries with current filters
  const handleLoadMore = useCallback(
    async (offset: number, limit: number): Promise<LeaderboardEntry[]> => {
      const result = await getLeaderboardFn({
        data: {
          timeFrame: filters.timeFrame,
          language: filters.language,
          difficulty: filters.difficulty,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          limit,
          offset,
        },
      })
      return result.entries
    },
    [filters]
  )

  const timeFrameLabels: Record<TimeFrame, string> = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    alltime: 'All Time',
  }

  const sortByLabels: Record<SortBy, string> = {
    wpm: 'Speed (WPM)',
    accuracy: 'Accuracy',
    consistency: 'Consistency',
  }

  // Build description text based on current filters
  const getDescription = () => {
    const sortLabel = sortByLabels[filters.sortBy]
    return `Top typists ranked by ${sortLabel.toLowerCase()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-gray-400">{getDescription()}</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <LeaderboardFilters
            timeFrame={filters.timeFrame}
            language={filters.language}
            difficulty={filters.difficulty}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onTimeFrameChange={handleTimeFrameChange}
            onLanguageChange={handleLanguageChange}
            onDifficultyChange={handleDifficultyChange}
            onSortByChange={handleSortByChange}
            onSortOrderChange={handleSortOrderChange}
          />
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-3">
            <Users className="w-4 h-4" />
            <span>{leaderboard.total} participants</span>
            {filters.language && (
              <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
                {filters.language}
              </span>
            )}
            {filters.difficulty && (
              <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
                {filters.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* User's Rank Card (if logged in) */}
        {user && userRank && (
          <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">Your Rank</p>
                  <p className="text-sm text-gray-400">
                    {timeFrameLabels[filters.timeFrame]}
                    {filters.language && ` - ${filters.language}`}
                    {filters.difficulty && ` - ${filters.difficulty}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-400">#{userRank}</p>
                <p className="text-sm text-gray-400">of {leaderboard.total}</p>
              </div>
            </div>
          </div>
        )}

        {/* Virtual Leaderboard Table */}
        <VirtualLeaderboard
          initialEntries={leaderboard.entries}
          totalCount={leaderboard.total}
          timeFrame={filters.timeFrame}
          timeFrameLabel={timeFrameLabels[filters.timeFrame]}
          currentUserId={user?.id}
          onLoadMore={handleLoadMore}
          pageSize={PAGE_SIZE}
          maxHeight={600}
          sortBy={filters.sortBy}
        />

        {/* CTA for non-logged in users */}
        {!user && leaderboard.entries.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">
              Sign in to track your rank and compete!
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/login">
                <Button className="bg-cyan-500 hover:bg-cyan-600">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
