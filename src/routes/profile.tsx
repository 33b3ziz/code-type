import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  User,
  Trophy,
  TrendingUp,
  Clock,
  Target,
  Zap,
  LogOut,
  Settings,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentUserFn, logoutFn } from '@/lib/auth'
import { getUserStatsFn, getRecentResultsFn } from '@/lib/profile-api'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
  loader: async () => {
    const user = await getCurrentUserFn()
    if (!user) {
      return { user: null, stats: null, recentResults: [] }
    }
    const [stats, recentResults] = await Promise.all([
      getUserStatsFn({ data: user.id }),
      getRecentResultsFn({ data: { userId: user.id, limit: 5 } }),
    ])
    return { user, stats, recentResults }
  },
})

function ProfilePage() {
  const { user, stats, recentResults } = Route.useLoaderData()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutFn()
    } catch {
      // Redirect happens in logoutFn
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Not Logged In</h1>
          <p className="text-gray-400 mb-6">
            Sign in to track your progress, view statistics, and compete on leaderboards.
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
      </div>
    )
  }

  const statCards = [
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Best WPM',
      value: stats?.bestWpm ?? 0,
      color: 'text-yellow-400',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Average WPM',
      value: stats?.averageWpm ?? 0,
      color: 'text-cyan-400',
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Average Accuracy',
      value: `${stats?.averageAccuracy ?? 0}%`,
      color: 'text-green-400',
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: 'Tests Completed',
      value: stats?.totalTests ?? 0,
      color: 'text-purple-400',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.username}</h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/settings">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-1" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
            >
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Time Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Time Typing</span>
                <span className="text-white font-mono">
                  {formatTime(stats?.totalTimeSpent ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tests This Week</span>
                <span className="text-white font-mono">{stats?.testsThisWeek ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Best Accuracy</span>
                <span className="text-white font-mono">{stats?.bestAccuracy ?? 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Progress
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Recent Improvement</span>
                <span
                  className={`font-mono ${
                    (stats?.improvement ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {(stats?.improvement ?? 0) >= 0 ? '+' : ''}
                  {stats?.improvement ?? 0} WPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Characters Typed</span>
                <span className="text-white font-mono">
                  {(stats?.totalCharacters ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Tests</h3>
            <Link to="/test">
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                New Test
              </Button>
            </Link>
          </div>

          {recentResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No tests completed yet</p>
              <Link to="/test">
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  Start Your First Test
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">
                      {result.snippetTitle ?? 'Typing Test'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(result.completedAt).toLocaleDateString()} at{' '}
                      {new Date(result.completedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-cyan-400 font-bold">{result.wpm}</div>
                      <div className="text-gray-500">WPM</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`font-bold ${
                          result.accuracy >= 95
                            ? 'text-green-400'
                            : result.accuracy >= 80
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}
                      >
                        {result.accuracy}%
                      </div>
                      <div className="text-gray-500">Accuracy</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}
