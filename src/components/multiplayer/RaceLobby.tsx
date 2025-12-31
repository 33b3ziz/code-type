/**
 * Race Lobby Component
 * Displays the waiting room before a race starts
 */

import { useState } from 'react'

import { Button } from '../ui/button'
import { PlayerCard } from './PlayerCard'

import type { RaceRoom, RaceSettings } from '@/lib/websocket/types'
import { cn } from '@/lib/utils'

export interface RaceLobbyProps {
  room: RaceRoom
  currentPlayerId: string | null
  isConnected: boolean
  onReady: () => void
  onUnready: () => void
  onStartRace: () => void
  onLeaveRoom: () => void
  onSendChat: (message: string) => void
  className?: string
}

export function RaceLobby({
  room,
  currentPlayerId,
  isConnected,
  onReady,
  onUnready,
  onStartRace,
  onLeaveRoom,
  onSendChat,
  className = '',
}: RaceLobbyProps) {
  const [chatMessage, setChatMessage] = useState('')

  const isHost = room.hostId === currentPlayerId
  const currentPlayer = room.players.find((p) => p.id === currentPlayerId)
  const isReady = currentPlayer?.isFinished ?? false // Using isFinished as ready state temporarily
  const canStart = isHost && room.players.length >= 2

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatMessage.trim()) {
      onSendChat(chatMessage.trim())
      setChatMessage('')
    }
  }

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
        <h3 className="text-sm font-medium text-gray-300 mb-3">Race Settings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Players</span>
            <p className="text-white font-medium">
              {room.players.length}/{room.maxPlayers}
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
            <span className="text-gray-500">Visibility</span>
            <p className="text-white font-medium">
              {room.settings.isPrivate ? 'Private' : 'Public'}
            </p>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-3">
          Players ({room.players.length}/{room.maxPlayers})
        </h3>
        <div className="space-y-2">
          {room.players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentUser={player.id === currentPlayerId}
              isHost={player.id === room.hostId}
            />
          ))}

          {/* Empty slots */}
          {Array.from({ length: room.maxPlayers - room.players.length }).map(
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
            {room.players.length < 2
              ? 'Need at least 2 players'
              : 'Start Race'}
          </Button>
        )}
      </div>

      {/* Chat (simplified) */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Chat</h3>
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <Button type="submit" disabled={!chatMessage.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}

export default RaceLobby
