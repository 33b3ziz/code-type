import { Link, createFileRoute } from '@tanstack/react-router'
import { Clock, Trophy, Users } from 'lucide-react'
import type {LeaderboardEntry, TimeFrame} from '@/lib/leaderboard-server-api';
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  
  
  getLeaderboardFn,
  getRankMedal,
  getUserLeaderboardRankFn
} from '@/lib/leaderboard-server-api'
import { getCurrentUserFn } from '@/lib/auth'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
  loaderDeps: ({ search }) => ({
    timeFrame: (search as { timeFrame?: TimeFrame }).timeFrame || 'alltime',
  }),
  loader: async ({ deps }) => {
    const [leaderboard, user] = await Promise.all([
      getLeaderboardFn({ data: { timeFrame: deps.timeFrame, limit: 50 } }),
      getCurrentUserFn(),
    ])

    let userRank: number | null = null
    if (user) {
      userRank = await getUserLeaderboardRankFn({
        data: { userId: user.id, timeFrame: deps.timeFrame },
      })
    }

    return { leaderboard, user, userRank, timeFrame: deps.timeFrame }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    timeFrame: (search.timeFrame as TimeFrame | undefined) ?? 'alltime',
  }),
})

function LeaderboardPage() {
  const { leaderboard, user, userRank, timeFrame } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    navigate({ search: { timeFrame: newTimeFrame } })
  }

  const timeFrameLabels: Record<TimeFrame, string> = {
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    alltime: 'All Time',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-gray-400">Top typists ranked by best WPM</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <Select value={timeFrame} onValueChange={handleTimeFrameChange}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Today</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="alltime">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{leaderboard.total} participants</span>
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
                  <p className="text-sm text-gray-400">{timeFrameLabels[timeFrame]}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-400">
                  #{userRank}
                </p>
                <p className="text-sm text-gray-400">
                  of {leaderboard.total}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          {leaderboard.entries.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">
                No results yet for {timeFrameLabels[timeFrame].toLowerCase()}
              </p>
              <Link to="/test">
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  Be the First!
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400 text-sm">
                  <th className="text-left py-4 px-6 font-medium">Rank</th>
                  <th className="text-left py-4 px-6 font-medium">User</th>
                  <th className="text-right py-4 px-6 font-medium">Best WPM</th>
                  <th className="text-right py-4 px-6 font-medium hidden md:table-cell">
                    Avg WPM
                  </th>
                  <th className="text-right py-4 px-6 font-medium hidden md:table-cell">
                    Accuracy
                  </th>
                  <th className="text-right py-4 px-6 font-medium hidden sm:table-cell">
                    Tests
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.entries.map((entry) => (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    isCurrentUser={user?.id === entry.userId}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

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

function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry
  isCurrentUser: boolean
}) {
  const medal = getRankMedal(entry.rank)

  return (
    <tr
      className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
        isCurrentUser ? 'bg-cyan-500/10' : ''
      }`}
    >
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          {medal ? (
            <span className="text-xl">{medal}</span>
          ) : (
            <span className="text-gray-400 font-mono w-6">#{entry.rank}</span>
          )}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              entry.rank === 1
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                : entry.rank === 2
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                  : entry.rank === 3
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                    : 'bg-gradient-to-br from-slate-500 to-slate-600'
            }`}
          >
            {entry.username[0].toUpperCase()}
          </div>
          <span className={`font-medium ${isCurrentUser ? 'text-cyan-400' : 'text-white'}`}>
            {entry.username}
            {isCurrentUser && (
              <span className="ml-2 text-xs text-cyan-400">(you)</span>
            )}
          </span>
        </div>
      </td>
      <td className="py-4 px-6 text-right">
        <span className="text-cyan-400 font-bold font-mono">{entry.bestWpm}</span>
      </td>
      <td className="py-4 px-6 text-right hidden md:table-cell">
        <span className="text-gray-300 font-mono">{entry.averageWpm}</span>
      </td>
      <td className="py-4 px-6 text-right hidden md:table-cell">
        <span
          className={`font-mono ${
            entry.averageAccuracy >= 95
              ? 'text-green-400'
              : entry.averageAccuracy >= 80
                ? 'text-yellow-400'
                : 'text-red-400'
          }`}
        >
          {entry.averageAccuracy}%
        </span>
      </td>
      <td className="py-4 px-6 text-right hidden sm:table-cell">
        <span className="text-gray-400 font-mono">{entry.testsCompleted}</span>
      </td>
    </tr>
  )
}
