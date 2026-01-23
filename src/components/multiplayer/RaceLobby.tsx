/**
 * Race Lobby Component
 * Displays the waiting room before a race starts
 */

import { useState } from 'react'
import { Settings } from 'lucide-react'

import { Button } from '../ui/button'
import { PlayerCard } from './PlayerCard'
import { RaceChat } from './RaceChat'

import type { ChatMessage, RacePlayer, RaceRoom, RaceSettings } from '@/lib/pusher/types'
import { cn } from '@/lib/utils'

export interface RaceLobbyProps {
  room: RaceRoom
  players: Array<RacePlayer>
  currentPlayerId: string | null
  isConnected: boolean
  chatMessages: ChatMessage[]
  onReady: () => void
  onUnready: () => void
  onStartRace: () => void
  onLeaveRoom: () => void
  onSendChat: (message: string, mentions?: string[]) => void
  onDeleteMessage?: (messageId: string) => void
  onMutePlayer?: (playerId: string) => void
  onKickPlayer?: (playerId: string) => void
  onUpdateSettings?: (settings: Partial<RaceSettings>) => void
  onTransferHost?: (newHostId: string) => void
  className?: string
}

export function RaceLobby({
  room,
  players,
  currentPlayerId,
  isConnected,
  chatMessages,
  onReady,
  onUnready,
  onStartRace,
  onLeaveRoom,
  onSendChat,
  onDeleteMessage,
  onMutePlayer,
  onKickPlayer,
  onUpdateSettings,
  onTransferHost,
  className = '',
}: RaceLobbyProps) {
  const [showSettings, setShowSettings] = useState(false)

  const isHost = room.hostId === currentPlayerId
  const currentPlayer = players.find((p) => p.id === currentPlayerId)
  const isReady = currentPlayer?.isReady ?? false
  const canStart = isHost && players.length >= 2

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code)
  }

  return (
    <div className={cn('race-lobby', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Race Lobby</h2>
          <p className="text-gray-400">Waiting for players...</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onLeaveRoom}>
            Leave Room
          </Button>
        </div>
      </div>

      {/* Room Code */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Room Code</p>
            <p className="text-3xl font-mono font-bold text-cyan-400 tracking-wider">
              {room.code}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={copyRoomCode}>
            Copy Code
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Share this code with friends to invite them to the race
        </p>
      </div>

      {/* Room Settings */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-300">Race Settings</h3>
          {isHost && onUpdateSettings && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                'p-1.5 rounded transition-colors',
                showSettings ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-700 text-gray-400'
              )}
              title="Edit settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Display settings */}
        {!showSettings && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Players</span>
              <p className="text-white font-medium">
                {players.length}/{room.maxPlayers}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Language</span>
              <p className="text-white font-medium capitalize">
                {room.settings.language || 'Any'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Difficulty</span>
              <p className="text-white font-medium capitalize">
                {room.settings.difficulty || 'Any'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Countdown</span>
              <p className="text-white font-medium">
                {room.settings.countdownDuration}s
              </p>
            </div>
            <div>
              <span className="text-gray-500">Visibility</span>
              <p className="text-white font-medium">
                {room.settings.isPrivate ? 'Private' : 'Public'}
              </p>
            </div>
          </div>
        )}

        {/* Edit settings (host only) */}
        {showSettings && isHost && onUpdateSettings && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-2">Max Players</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => onUpdateSettings({ maxPlayers: num })}
                    disabled={num < players.length}
                    className={cn(
                      'flex-1 py-1.5 rounded border transition-colors text-sm',
                      room.settings.maxPlayers === num
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : num < players.length
                        ? 'border-slate-700 text-gray-600 cursor-not-allowed'
                        : 'border-slate-600 text-gray-400 hover:border-slate-500'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-2">Language</label>
              <div className="flex gap-2">
                {['Any', 'JavaScript', 'TypeScript', 'Python'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() =>
                      onUpdateSettings({
                        language:
                          lang === 'Any'
                            ? undefined
                            : (lang.toLowerCase() as 'javascript' | 'typescript' | 'python'),
                      })
                    }
                    className={cn(
                      'flex-1 py-1.5 px-2 rounded border transition-colors text-xs',
                      (lang === 'Any' && !room.settings.language) ||
                        room.settings.language === lang.toLowerCase()
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'border-slate-600 text-gray-400 hover:border-slate-500'
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-2">Difficulty</label>
              <div className="flex gap-2">
                {['Any', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() =>
                      onUpdateSettings({
                        difficulty:
                          diff === 'Any'
                            ? undefined
                            : (diff.toLowerCase() as 'beginner' | 'intermediate' | 'advanced' | 'expert'),
                      })
                    }
                    className={cn(
                      'flex-1 py-1.5 px-1 rounded border transition-colors text-xs',
                      (diff === 'Any' && !room.settings.difficulty) ||
                        room.settings.difficulty === diff.toLowerCase()
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'border-slate-600 text-gray-400 hover:border-slate-500'
                    )}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-2">Countdown Duration</label>
              <div className="flex gap-2">
                {[3, 5, 10].map((seconds) => (
                  <button
                    key={seconds}
                    onClick={() => onUpdateSettings({ countdownDuration: seconds })}
                    className={cn(
                      'flex-1 py-1.5 rounded border transition-colors text-sm',
                      room.settings.countdownDuration === seconds
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'border-slate-600 text-gray-400 hover:border-slate-500'
                    )}
                  >
                    {seconds}s
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500">Private Room</span>
              <button
                onClick={() => onUpdateSettings({ isPrivate: !room.settings.isPrivate })}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors',
                  room.settings.isPrivate ? 'bg-cyan-500' : 'bg-slate-600'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full bg-white transition-transform',
                    room.settings.isPrivate ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Players List */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3">
          Players ({players.length}/{room.maxPlayers})
        </h3>
        <div className="space-y-2">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentUser={player.id === currentPlayerId}
              isHost={player.id === room.hostId}
              canKick={isHost && player.id !== currentPlayerId}
              onKick={onKickPlayer}
              onMakeHost={onTransferHost}
            />
          ))}

          {/* Empty slots */}
          {Array.from({ length: room.maxPlayers - players.length }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center p-4 rounded-lg border border-dashed border-slate-700 text-gray-500"
              >
                Waiting for player...
              </div>
            )
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-6">
        {!isHost ? (
          <Button
            variant={isReady ? 'outline' : 'default'}
            className="flex-1"
            onClick={isReady ? onUnready : onReady}
          >
            {isReady ? 'Not Ready' : 'Ready'}
          </Button>
        ) : (
          <Button
            className="flex-1"
            onClick={onStartRace}
            disabled={!canStart}
          >
            {players.length < 2
              ? 'Need at least 2 players'
              : 'Start Race'}
          </Button>
        )}
      </div>

      {/* Chat - Using the new RaceChat component */}
      <RaceChat
        messages={chatMessages}
        players={players}
        currentPlayerId={currentPlayerId}
        onSendMessage={onSendChat}
        onDeleteMessage={onDeleteMessage}
        onMutePlayer={onMutePlayer}
        isHost={isHost}
      />
    </div>
  )
}

export default RaceLobby
