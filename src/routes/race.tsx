/**
 * Race Route
 * Multiplayer typing race page with Pusher
 */

import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react'

import type { RaceResult, RaceSettings } from '@/lib/pusher/types'
import { RaceLobby } from '@/components/multiplayer/RaceLobby'
import { RaceProgress } from '@/components/multiplayer/RaceProgress'
import { RaceResults } from '@/components/multiplayer/RaceResults'
import { Button } from '@/components/ui/button'
import { usePusherRace } from '@/hooks/usePusherRace'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/race')({
  component: RacePage,
})

type RaceView = 'menu' | 'lobby' | 'racing' | 'results'

function RacePage() {
  const [view, setView] = useState<RaceView>('menu')
  const [countdown, setCountdown] = useState<number | undefined>(undefined)
  const [results, setResults] = useState<Array<RaceResult>>([])
  const [joinCode, setJoinCode] = useState('')
  const [createSettings, setCreateSettings] = useState<Partial<RaceSettings>>({
    maxPlayers: 4,
    countdownDuration: 3,
    isPrivate: false,
  })

  const {
    isConnected,
    isLoading,
    error,
    room,
    playerId,
    players,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    setUnready,
    startRace,
    updateProgress: _updateProgress,
    finishRace: _finishRace,
    sendChat,
  } = usePusherRace({
    events: {
      onRoomCreated: () => {
        setView('lobby')
      },
      onRoomJoined: () => {
        setView('lobby')
      },
      onCountdownStart: (seconds) => {
        setCountdown(seconds)
      },
      onCountdownTick: (seconds) => {
        setCountdown(seconds)
      },
      onRaceStart: () => {
        setView('racing')
        setCountdown(undefined)
      },
      onRaceFinished: (raceResults) => {
        setResults(raceResults)
        setView('results')
      },
      onError: (code, message) => {
        console.error(`Race error [${code}]: ${message}`)
      },
      onRoomUpdated: (updatedRoom) => {
        // Update view based on room status
        switch (updatedRoom.status) {
          case 'waiting':
            setView('lobby')
            break
          case 'countdown':
            setView('lobby') // Show countdown overlay on lobby
            break
          case 'racing':
            setView('racing')
            break
          case 'finished':
            setView('results')
            break
        }
      },
    },
  })

  const handleCreateRoom = useCallback(async () => {
    await createRoom(createSettings)
  }, [createRoom, createSettings])

  const handleJoinRoom = useCallback(async () => {
    if (!joinCode.trim()) return
    await joinRoom(joinCode.trim().toUpperCase())
  }, [joinRoom, joinCode])

  const handleLeaveRoom = useCallback(async () => {
    await leaveRoom()
    setView('menu')
    setResults([])
    setCountdown(undefined)
  }, [leaveRoom])

  const handlePlayAgain = useCallback(() => {
    // Reset to lobby for new race with the same players
    setView('lobby')
    setResults([])
  }, [])

  // Menu view - create or join a room
  if (view === 'menu') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Multiplayer Race
          </h1>
          <p className="text-gray-400">
            Compete against other programmers in real-time typing races
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-sm text-cyan-400">Connecting...</span>
            </>
          ) : isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-400">Connected to room</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Ready to connect</span>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 text-sm">{error}</p>
              <p className="text-gray-500 text-xs mt-1">
                Make sure you have configured Pusher environment variables.
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Room */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Create a Room
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Max Players
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() =>
                        setCreateSettings((s) => ({ ...s, maxPlayers: num }))
                      }
                      className={cn(
                        'flex-1 py-2 rounded-lg border transition-colors',
                        createSettings.maxPlayers === num
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                          : 'border-slate-600 text-gray-400 hover:border-slate-500',
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  Language
                </label>
                <div className="flex gap-2">
                  {['Any', 'JavaScript', 'TypeScript', 'Python'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() =>
                        setCreateSettings((s) => ({
                          ...s,
                          language:
                            lang === 'Any'
                              ? undefined
                              : (lang.toLowerCase() as
                                  | 'javascript'
                                  | 'typescript'
                                  | 'python'),
                        }))
                      }
                      className={cn(
                        'flex-1 py-2 px-2 rounded-lg border transition-colors text-sm',
                        (lang === 'Any' && !createSettings.language) ||
                          createSettings.language === lang.toLowerCase()
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                          : 'border-slate-600 text-gray-400 hover:border-slate-500',
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Private Room</span>
                <button
                  onClick={() =>
                    setCreateSettings((s) => ({
                      ...s,
                      isPrivate: !s.isPrivate,
                    }))
                  }
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors',
                    createSettings.isPrivate ? 'bg-cyan-500' : 'bg-slate-600',
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-white transition-transform',
                      createSettings.isPrivate
                        ? 'translate-x-6'
                        : 'translate-x-0.5',
                    )}
                  />
                </button>
              </div>
            </div>

            <Button onClick={handleCreateRoom} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Room'
              )}
            </Button>
          </div>

          {/* Join Room */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Join a Room
            </h2>

            <p className="text-gray-400 text-sm mb-4">
              Enter the 6-character room code to join an existing race.
            </p>

            <div className="mb-6">
              <label className="text-sm text-gray-400 block mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                }
                placeholder="ABCDEF"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-center font-mono text-2xl tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-cyan-500"
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleJoinRoom}
              className="w-full"
              disabled={joinCode.length !== 6 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Room'
              )}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="text-sm font-medium text-gray-300 mb-2">How to play multiplayer:</h3>
          <ol className="text-sm text-gray-500 space-y-1 list-decimal list-inside">
            <li>Create a room or join with a room code</li>
            <li>Share the room code with friends</li>
            <li>Wait for other players to join</li>
            <li>When everyone is ready, the host starts the race</li>
          </ol>
        </div>
      </div>
    )
  }

  // Lobby view
  if (view === 'lobby' && room) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <RaceLobby
          room={room}
          players={players}
          currentPlayerId={playerId}
          isConnected={isConnected}
          onReady={setReady}
          onUnready={setUnready}
          onStartRace={startRace}
          onLeaveRoom={handleLeaveRoom}
          onSendChat={sendChat}
        />
      </div>
    )
  }

  // Racing view
  if (view === 'racing' && room) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <RaceProgress
          room={room}
          players={players}
          currentPlayerId={playerId}
          countdown={countdown}
        />

        {/* Typing Test would go here - integrated with updateProgress and finishRace */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-gray-400 text-center">
            Typing test component would be integrated here. Progress updates
            would be sent via updateProgress() and race completion via
            finishRace().
          </p>
        </div>
      </div>
    )
  }

  // Results view
  if (view === 'results' && room) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <RaceResults
          room={room}
          results={results}
          currentPlayerId={playerId}
          onPlayAgain={handlePlayAgain}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>
    )
  }

  // Fallback
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )
}
