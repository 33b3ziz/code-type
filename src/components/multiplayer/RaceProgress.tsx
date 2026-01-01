/**
 * Race Progress Component
 * Displays real-time progress of all players during a race
 */

import { useMemo } from 'react'

import { PlayerCard } from './PlayerCard'

import type { RacePlayer, RaceRoom } from '@/lib/pusher/types'
import { cn } from '@/lib/utils'

export interface RaceProgressProps {
  room: RaceRoom
  players: Array<RacePlayer>
  currentPlayerId: string | null
  countdown?: number
  className?: string
}

export function RaceProgress({
  room,
  players,
  currentPlayerId,
  countdown,
  className = '',
}: RaceProgressProps) {
  // Sort players by progress (highest first)
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      // Finished players come first, sorted by position
      if (a.isFinished && b.isFinished) {
        return (a.position ?? 0) - (b.position ?? 0)
      }
      if (a.isFinished) return -1
      if (b.isFinished) return 1

      // Then by progress
      return b.progress - a.progress
    })
  }, [players])

  const finishedCount = players.filter((p) => p.isFinished).length
  const currentPlayer = players.find((p) => p.id === currentPlayerId)

  return (
    <div className={cn('race-progress', className)}>
      {/* Countdown Overlay */}
      {room.status === 'countdown' && countdown !== undefined && (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4 text-lg">Race starting in...</p>
            <div className="text-9xl font-bold text-cyan-400 animate-pulse">
              {countdown}
            </div>
            <p className="text-gray-500 mt-4">Get ready to type!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Race in Progress</h2>
          <p className="text-gray-400 text-sm">
            {finishedCount}/{players.length} finished
          </p>
        </div>
        <div className="text-right">
          {currentPlayer && (
            <div className="text-sm">
              <span className="text-gray-400">Your stats: </span>
              <span className="text-cyan-400 font-mono">
                {Math.round(currentPlayer.wpm)} WPM
              </span>
              <span className="text-gray-500 mx-2">•</span>
              <span className="text-green-400 font-mono">
                {Math.round(currentPlayer.accuracy)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Race Track */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 mb-4">
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <RaceTrackRow
              key={player.id}
              player={player}
              position={index + 1}
              isCurrentUser={player.id === currentPlayerId}
            />
          ))}
        </div>
      </div>

      {/* Detailed Player Cards */}
      <div className="space-y-2">
        {sortedPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isCurrentUser={player.id === currentPlayerId}
            isHost={player.id === room.hostId}
            showProgress
          />
        ))}
      </div>
    </div>
  )
}

interface RaceTrackRowProps {
  player: RacePlayer
  position: number
  isCurrentUser: boolean
}

function RaceTrackRow({
  player,
  position,
  isCurrentUser,
}: RaceTrackRowProps) {
  // Calculate color based on position
  const getPlayerColor = () => {
    if (isCurrentUser) return 'bg-cyan-500'
    const colors = ['bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500']
    return colors[(position - 1) % colors.length]
  }

  const getTrackColor = () => {
    if (isCurrentUser) return 'bg-cyan-500/20'
    return 'bg-slate-700/50'
  }

  return (
    <div className="flex items-center gap-3">
      {/* Position indicator */}
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
          player.isFinished
            ? 'bg-green-500/20 text-green-400'
            : 'bg-slate-700 text-gray-400'
        )}
      >
        {player.isFinished ? player.position : position}
      </div>

      {/* Player name */}
      <div
        className={cn(
          'w-24 truncate text-sm font-medium',
          isCurrentUser ? 'text-cyan-400' : 'text-white'
        )}
      >
        {player.username}
      </div>

      {/* Race track */}
      <div className="flex-1 relative h-6">
        {/* Track background */}
        <div className={cn('absolute inset-0 rounded-full', getTrackColor())} />

        {/* Start flag */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 rounded-l-full" />

        {/* Finish flag */}
        <div className="absolute right-0 top-0 bottom-0 w-2 flex">
          <div className="w-1 h-full bg-white/40" />
          <div className="w-1 h-full bg-slate-900" />
        </div>

        {/* Player marker */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300 ease-out flex items-center justify-center',
            getPlayerColor()
          )}
          style={{ left: `calc(${player.progress}% - 8px)` }}
        >
          {player.isFinished && (
            <span className="text-[10px]">🏁</span>
          )}
        </div>
      </div>

      {/* WPM */}
      <div className="w-16 text-right text-sm">
        <span className="font-mono text-gray-300">{Math.round(player.wpm)}</span>
        <span className="text-gray-500 text-xs ml-1">WPM</span>
      </div>
    </div>
  )
}

export default RaceProgress
