/**
 * Race Route
 * Multiplayer typing race page
 */

import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react'

import type { RaceResult, RaceSettings } from '@/lib/websocket/types'
import { RaceLobby } from '@/components/multiplayer/RaceLobby'
import { RaceProgress } from '@/components/multiplayer/RaceProgress'
import { RaceResults } from '@/components/multiplayer/RaceResults'
import { Button } from '@/components/ui/button'
import { useWebSocket } from '@/hooks/useWebSocket'
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
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [pendingAction, setPendingAction] = useState<'create' | 'join' | null>(null)
  const [createSettings, setCreateSettings] = useState<Partial<RaceSettings>>({
    maxPlayers: 4,
    countdownDuration: 3,
    isPrivate: false,
  })

  // WebSocket URL - would typically come from environment config
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

  const {
    status,
    isConnected,
    connect,
    disconnect,
    room,
    playerId,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    setUnready,
    startRace,
    updateProgress,
    finishRace,
    sendChat,
  } = useWebSocket({
    url: wsUrl,
    autoConnect: false,
    events: {
      onRoomCreated: () => {
        setConnectionError(null)
        setIsConnecting(false)
        setView('lobby')
      },
      onRoomJoined: () => {
        setConnectionError(null)
        setIsConnecting(false)
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
        setConnectionError(message)
        setIsConnecting(false)
      },
    },
  })

  // Handle connection status changes
  useEffect(() => {
    if (status === 'error') {
      setConnectionError('Failed to connect to game server. Make sure the WebSocket server is running (pnpm ws:server).')
      setIsConnecting(false)
      setPendingAction(null)
    } else if (status === 'connected' && pendingAction) {
      // Execute pending action when connected
      if (pendingAction === 'create') {
        createRoom(createSettings)
      } else if (pendingAction === 'join') {
        joinRoom(joinCode.trim().toUpperCase())
      }
      setPendingAction(null)
    }
  }, [status, pendingAction, createRoom, joinRoom, createSettings, joinCode])

  // Update view based on room status
  useEffect(() => {
    if (room) {
      switch (room.status) {
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
    }
  }, [room?.status])

  const handleCreateRoom = useCallback(() => {
    setConnectionError(null)
    setIsConnecting(true)

    if (isConnected) {
      createRoom(createSettings)
    } else {
      setPendingAction('create')
      connect()
    }
  }, [isConnected, connect, createRoom, createSettings])

  const handleJoinRoom = useCallback(() => {
    if (!joinCode.trim()) return

    setConnectionError(null)
    setIsConnecting(true)

    if (isConnected) {
      joinRoom(joinCode.trim().toUpperCase())
    } else {
      setPendingAction('join')
      connect()
    }
  }, [isConnected, connect, joinRoom, joinCode])

  const handleLeaveRoom = useCallback(() => {
    leaveRoom()
    setView('menu')
    setResults([])
    setCountdown(undefined)
  }, [leaveRoom])

  const handlePlayAgain = useCallback(() => {
    // Host starts a new race with the same players
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
          {status === 'connecting' || status === 'reconnecting' ? (
            <>
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-sm text-cyan-400">Connecting...</span>
            </>
          ) : isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-400">Connected to server</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Not connected</span>
            </>
          )}
        </div>

        {/* Error Message */}
        {connectionError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 text-sm">{connectionError}</p>
              <p className="text-gray-500 text-xs mt-1">
                Run <code className="bg-slate-700 px-1 rounded">pnpm ws:server</code> in a separate terminal to start the game server.
              </p>
            </div>
            <button
              onClick={() => setConnectionError(null)}
              className="text-gray-500 hover:text-gray-400"
            >
              &times;
            </button>
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

            <Button onClick={handleCreateRoom} className="w-full" disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
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
              disabled={joinCode.length !== 6 || isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
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
            <li>Start the WebSocket server: <code className="bg-slate-700 px-1 rounded text-cyan-400">pnpm ws:server</code></li>
            <li>Create a room or join with a room code</li>
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
