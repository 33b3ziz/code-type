/**
 * Player Card Component
 * Displays a single player's info in the race lobby or progress view
 */

import { X, Crown } from 'lucide-react'

import type { RacePlayer } from '@/lib/pusher/types'
import { cn } from '@/lib/utils'

export interface PlayerCardProps {
  player: RacePlayer
  isCurrentUser?: boolean
  isHost?: boolean
  showProgress?: boolean
  showPosition?: boolean
  canKick?: boolean
  onKick?: (playerId: string) => void
  onMakeHost?: (playerId: string) => void
  className?: string
}

export function PlayerCard({
  player,
  isCurrentUser = false,
  isHost = false,
  showProgress = false,
  showPosition = false,
  canKick = false,
  onKick,
  onMakeHost,
  className = '',
}: PlayerCardProps) {
  const positionColors: Record<number, string> = {
    1: 'text-yellow-400', // Gold
    2: 'text-gray-300', // Silver
    3: 'text-amber-600', // Bronze
  }

  const positionLabel = player.position
    ? `${player.position}${getOrdinalSuffix(player.position)}`
    : null

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-all',
        isCurrentUser
          ? 'bg-cyan-500/10 border border-cyan-500/30'
          : 'bg-slate-800/50 border border-slate-700',
        player.isFinished && 'opacity-75',
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
          isCurrentUser ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-white'
        )}
      >
        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt={player.username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          player.username[0].toUpperCase()
        )}
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-medium truncate',
              isCurrentUser ? 'text-cyan-400' : 'text-white'
            )}
          >
            {player.username}
          </span>
          {isHost && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
              Host
            </span>
          )}
          {isCurrentUser && !isHost && (
            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">
              You
            </span>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="mt-1.5">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300 ease-out',
                  player.isFinished
                    ? 'bg-green-500'
                    : isCurrentUser
                    ? 'bg-cyan-500'
                    : 'bg-blue-500'
                )}
                style={{ width: `${player.progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>{Math.round(player.progress)}%</span>
              <span className="flex gap-2">
                <span className="text-cyan-400">{Math.round(player.wpm)} WPM</span>
                <span className={cn(
                  player.accuracy >= 95 ? 'text-green-400' :
                  player.accuracy >= 80 ? 'text-yellow-400' : 'text-red-400'
                )}>
                  {Math.round(player.accuracy)}% acc
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats / Position */}
      <div className="text-right">
        {showPosition && player.isFinished && positionLabel && (
          <div
            className={cn(
              'text-2xl font-bold',
              positionColors[player.position!] || 'text-gray-400'
            )}
          >
            {positionLabel}
          </div>
        )}

        {!showProgress && !showPosition && (
          <div className="flex items-center gap-2">
            {/* Host controls */}
            {canKick && !isHost && onMakeHost && (
              <button
                onClick={() => onMakeHost(player.id)}
                className="p-1.5 rounded hover:bg-slate-700 text-gray-400 hover:text-yellow-400 transition-colors"
                title="Make host"
              >
                <Crown className="w-4 h-4" />
              </button>
            )}
            {canKick && !isHost && onKick && (
              <button
                onClick={() => onKick(player.id)}
                className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                title="Kick player"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {/* Ready/Racing status */}
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                player.isFinished
                  ? 'bg-green-500'
                  : player.isReady
                  ? 'bg-green-500'
                  : 'bg-yellow-500 animate-pulse'
              )}
              title={player.isFinished ? 'Finished' : player.isReady ? 'Ready' : 'Not Ready'}
            />
          </div>
        )}

        {showPosition && player.isFinished && (
          <div className="text-xs text-gray-400 mt-1">
            {Math.round(player.wpm)} WPM • {Math.round(player.accuracy)}%
          </div>
        )}
      </div>
    </div>
  )
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

export default PlayerCard
