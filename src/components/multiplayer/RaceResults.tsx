/**
 * Race Results Component
 * Displays the final standings and statistics after a race
 */

import { useMemo } from 'react'

import { Button } from '../ui/button'

import type { RaceResult, RaceRoom } from '@/lib/pusher/types'
import { cn } from '@/lib/utils'

export interface RaceResultsProps {
  room: RaceRoom
  results: Array<RaceResult>
  currentPlayerId: string | null
  onPlayAgain: () => void
  onLeaveRoom: () => void
  className?: string
}

export function RaceResults({
  room,
  results,
  currentPlayerId,
  onPlayAgain,
  onLeaveRoom,
  className = '',
}: RaceResultsProps) {
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => a.position - b.position)
  }, [results])

  const currentResult = results.find((r) => r.playerId === currentPlayerId)
  const isHost = room.hostId === currentPlayerId
  const hasWinner = sortedResults.length > 0
  const winner = hasWinner ? sortedResults[0] : null

  // Medal colors - only top 3 get special colors
  const medalColors = new Map([
    [1, { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' }],
    [2, { bg: 'bg-gray-300/20', text: 'text-gray-300', border: 'border-gray-400/50' }],
    [3, { bg: 'bg-amber-600/20', text: 'text-amber-500', border: 'border-amber-600/50' }],
  ])

  const getMedalStyle = (position: number) => medalColors.get(position)

  return (
    <div className={cn('race-results', className)}>
      {/* Winner Announcement */}
      {winner && (
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-2">Race Complete!</h2>
          <p className="text-gray-400">
            {winner.playerId === currentPlayerId ? (
              <span className="text-yellow-400 font-bold">You won!</span>
            ) : (
              <>
                Winner: <span className="text-cyan-400">{winner.username}</span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Your Result Highlight */}
      {currentResult && (
        <div
          className={cn(
            'mb-6 p-6 rounded-xl border-2',
            currentResult.position === 1
              ? 'bg-yellow-500/10 border-yellow-500/50'
              : 'bg-cyan-500/10 border-cyan-500/30'
          )}
        >
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Your Position</p>
            <div
              className={cn(
                'text-5xl font-bold mb-2',
                getMedalStyle(currentResult.position)?.text ?? 'text-gray-400'
              )}
            >
              {getOrdinalPosition(currentResult.position)}
            </div>
            <div className="flex justify-center gap-8 mt-4">
              <div>
                <p className="text-gray-500 text-xs">WPM</p>
                <p className="text-2xl font-mono font-bold text-cyan-400">
                  {Math.round(currentResult.wpm)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Accuracy</p>
                <p
                  className={cn(
                    'text-2xl font-mono font-bold',
                    currentResult.accuracy >= 95
                      ? 'text-green-400'
                      : currentResult.accuracy >= 85
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  )}
                >
                  {Math.round(currentResult.accuracy)}%
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Time</p>
                <p className="text-2xl font-mono font-bold text-gray-300">
                  {formatFinishTime(currentResult.finishTime)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Results */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Final Standings</h3>
        <div className="space-y-2">
          {sortedResults.map((result) => (
            <ResultRow
              key={result.playerId}
              result={result}
              isCurrentUser={result.playerId === currentPlayerId}
              medalStyle={getMedalStyle(result.position)}
            />
          ))}
        </div>
      </div>

      {/* Statistics Comparison */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Race Statistics</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-500 text-xs">Best WPM</p>
            <p className="text-lg font-mono font-bold text-cyan-400">
              {Math.round(Math.max(...results.map((res) => res.wpm)))}
            </p>
            <p className="text-xs text-gray-500">
              {results.find(
                (res) => res.wpm === Math.max(...results.map((item) => item.wpm))
              )?.username}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Best Accuracy</p>
            <p className="text-lg font-mono font-bold text-green-400">
              {Math.round(Math.max(...results.map((res) => res.accuracy)))}%
            </p>
            <p className="text-xs text-gray-500">
              {results.find(
                (res) => res.accuracy === Math.max(...results.map((item) => item.accuracy))
              )?.username}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Fastest Time</p>
            <p className="text-lg font-mono font-bold text-gray-300">
              {formatFinishTime(Math.min(...results.map((res) => res.finishTime)))}
            </p>
            <p className="text-xs text-gray-500">
              {results.find(
                (res) => res.finishTime === Math.min(...results.map((item) => item.finishTime))
              )?.username}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {isHost ? (
          <Button className="flex-1" onClick={onPlayAgain}>
            Start New Race
          </Button>
        ) : (
          <Button variant="outline" className="flex-1" disabled>
            Waiting for host...
          </Button>
        )}
        <Button variant="outline" onClick={onLeaveRoom}>
          Leave Room
        </Button>
      </div>
    </div>
  )
}

interface ResultRowProps {
  result: RaceResult
  isCurrentUser: boolean
  medalStyle?: { bg: string; text: string; border: string }
}

function ResultRow({ result, isCurrentUser, medalStyle }: ResultRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg border',
        isCurrentUser
          ? 'bg-cyan-500/10 border-cyan-500/30'
          : medalStyle
          ? `${medalStyle.bg} ${medalStyle.border}`
          : 'bg-slate-800/50 border-slate-700'
      )}
    >
      {/* Position */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center font-bold',
          medalStyle?.bg || 'bg-slate-700',
          medalStyle?.text || 'text-gray-400'
        )}
      >
        {result.position}
      </div>

      {/* Player Info */}
      <div className="flex-1">
        <span
          className={cn(
            'font-medium',
            isCurrentUser ? 'text-cyan-400' : 'text-white'
          )}
        >
          {result.username}
          {isCurrentUser && (
            <span className="text-xs text-cyan-400 ml-2">(You)</span>
          )}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-gray-500">WPM: </span>
          <span className="font-mono text-cyan-400 font-medium">
            {Math.round(result.wpm)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Acc: </span>
          <span
            className={cn(
              'font-mono font-medium',
              result.accuracy >= 95
                ? 'text-green-400'
                : result.accuracy >= 85
                ? 'text-yellow-400'
                : 'text-red-400'
            )}
          >
            {Math.round(result.accuracy)}%
          </span>
        </div>
        <div>
          <span className="text-gray-500">Time: </span>
          <span className="font-mono text-gray-300">
            {formatFinishTime(result.finishTime)}
          </span>
        </div>
      </div>
    </div>
  )
}

function getOrdinalPosition(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

function formatFinishTime(ms: number): string {
  const seconds = ms / 1000
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(1)
  return mins > 0 ? `${mins}:${secs.padStart(4, '0')}` : `${secs}s`
}

export default RaceResults
