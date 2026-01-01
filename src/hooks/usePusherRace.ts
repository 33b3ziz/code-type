/**
 * Pusher Race Hook
 * React hook for multiplayer racing with Pusher
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Channel } from 'pusher-js'

import type { RacePlayer, RaceResult, RaceRoom, RaceSettings } from '@/lib/pusher/types'
import { getPusherClient } from '@/lib/pusher/client'
import {
  createRoomFn,
  finishRaceFn,
  joinRoomFn,
  leaveRoomFn,
  sendChatFn,
  setReadyFn,
  startRaceFn,
  updateProgressFn,
} from '@/lib/pusher/race-api'

export interface RaceEvents {
  onRoomCreated?: (room: RaceRoom) => void
  onRoomJoined?: (room: RaceRoom, playerId: string) => void
  onRoomUpdated?: (room: RaceRoom) => void
  onPlayerJoined?: (player: RacePlayer) => void
  onPlayerLeft?: (playerId: string) => void
  onCountdownStart?: (seconds: number) => void
  onCountdownTick?: (seconds: number) => void
  onRaceStart?: (snippetId: number, startTime: number) => void
  onPlayerProgress?: (playerId: string, progress: number, wpm: number, accuracy: number) => void
  onPlayerFinished?: (playerId: string, position: number, wpm: number, accuracy: number) => void
  onRaceFinished?: (results: Array<RaceResult>) => void
  onChatMessage?: (playerId: string, username: string, message: string) => void
  onError?: (code: string, message: string) => void
}

export interface UsePusherRaceOptions {
  events?: RaceEvents
}

export interface UsePusherRaceReturn {
  // Connection
  isConnected: boolean
  isLoading: boolean
  error: string | null

  // Room state
  room: RaceRoom | null
  playerId: string | null
  players: Array<RacePlayer>

  // Room actions
  createRoom: (settings?: Partial<RaceSettings>, username?: string) => Promise<void>
  joinRoom: (code: string, username?: string) => Promise<void>
  leaveRoom: () => Promise<void>

  // Player actions
  setReady: () => Promise<void>
  setUnready: () => Promise<void>
  startRace: () => Promise<void>
  updateProgress: (progress: number, wpm: number, accuracy: number) => Promise<void>
  finishRace: (finalWpm: number, finalAccuracy: number) => Promise<void>
  sendChat: (message: string) => Promise<void>
}

export function usePusherRace(options: UsePusherRaceOptions = {}): UsePusherRaceReturn {
  const { events = {} } = options

  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [room, setRoom] = useState<RaceRoom | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)

  const channelRef = useRef<Channel | null>(null)
  const eventsRef = useRef(events)

  // Keep events ref updated
  useEffect(() => {
    eventsRef.current = events
  }, [events])

  // Get channel name for current room
  const getChannelName = useCallback((code: string) => {
    return `presence-race-${code.toUpperCase()}`
  }, [])

  // Subscribe to room channel
  const subscribeToRoom = useCallback((roomCode: string) => {
    const pusher = getPusherClient()
    const channelName = getChannelName(roomCode)

    // Unsubscribe from previous channel if any
    if (channelRef.current) {
      channelRef.current.unbind_all()
      pusher.unsubscribe(channelRef.current.name)
    }

    const channel = pusher.subscribe(channelName)
    channelRef.current = channel

    // Connection events
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true)
      setIsLoading(false)
    })

    channel.bind('pusher:subscription_error', () => {
      setIsConnected(false)
      setIsLoading(false)
      setError('Failed to connect to room')
    })

    // Room events
    channel.bind('room-updated', (data: { room: RaceRoom }) => {
      setRoom(data.room)
      eventsRef.current.onRoomUpdated?.(data.room)
    })

    channel.bind('player-joined', (data: { player: RacePlayer }) => {
      eventsRef.current.onPlayerJoined?.(data.player)
    })

    channel.bind('player-left', (data: { playerId: string }) => {
      eventsRef.current.onPlayerLeft?.(data.playerId)
    })

    channel.bind('player-ready', (data: { playerId: string }) => {
      setRoom((prev) => {
        if (!prev) return prev
        const updated = { ...prev }
        if (updated.players[data.playerId]) {
          updated.players[data.playerId].isReady = true
        }
        return updated
      })
    })

    channel.bind('player-unready', (data: { playerId: string }) => {
      setRoom((prev) => {
        if (!prev) return prev
        const updated = { ...prev }
        if (updated.players[data.playerId]) {
          updated.players[data.playerId].isReady = false
        }
        return updated
      })
    })

    channel.bind('countdown-start', (data: { seconds: number }) => {
      eventsRef.current.onCountdownStart?.(data.seconds)
    })

    channel.bind('countdown-tick', (data: { seconds: number }) => {
      eventsRef.current.onCountdownTick?.(data.seconds)
    })

    channel.bind('race-start', (data: { snippetId: number; startTime: number }) => {
      eventsRef.current.onRaceStart?.(data.snippetId, data.startTime)
    })

    channel.bind('player-progress', (data: { playerId: string; progress: number; wpm: number; accuracy: number }) => {
      setRoom((prev) => {
        if (!prev) return prev
        const updated = { ...prev }
        if (updated.players[data.playerId]) {
          updated.players[data.playerId].progress = data.progress
          updated.players[data.playerId].wpm = data.wpm
          updated.players[data.playerId].accuracy = data.accuracy
        }
        return updated
      })
      eventsRef.current.onPlayerProgress?.(data.playerId, data.progress, data.wpm, data.accuracy)
    })

    channel.bind('player-finished', (data: { playerId: string; position: number; wpm: number; accuracy: number }) => {
      eventsRef.current.onPlayerFinished?.(data.playerId, data.position, data.wpm, data.accuracy)
    })

    channel.bind('race-finished', (data: { results: Array<RaceResult> }) => {
      eventsRef.current.onRaceFinished?.(data.results)
    })

    channel.bind('chat-message', (data: { playerId: string; username: string; message: string }) => {
      eventsRef.current.onChatMessage?.(data.playerId, data.username, data.message)
    })

    return channel
  }, [getChannelName])

  // Unsubscribe from room
  const unsubscribeFromRoom = useCallback(() => {
    if (channelRef.current) {
      const pusher = getPusherClient()
      channelRef.current.unbind_all()
      pusher.unsubscribe(channelRef.current.name)
      channelRef.current = null
    }
    setIsConnected(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromRoom()
    }
  }, [unsubscribeFromRoom])

  // Create a new room
  const createRoom = useCallback(async (settings?: Partial<RaceSettings>, username?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await createRoomFn({ data: { settings, username } })
      setRoom(result.room)
      setPlayerId(result.playerId)
      subscribeToRoom(result.room.code)
      eventsRef.current.onRoomCreated?.(result.room)
      eventsRef.current.onRoomJoined?.(result.room, result.playerId)
    } catch (err) {
      setError('Failed to create room')
      setIsLoading(false)
      eventsRef.current.onError?.('CREATE_FAILED', 'Failed to create room')
    }
  }, [subscribeToRoom])

  // Join an existing room
  const joinRoom = useCallback(async (code: string, username?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await joinRoomFn({ data: { code, username } })

      if ('error' in result) {
        setError(result.error)
        setIsLoading(false)
        eventsRef.current.onError?.('JOIN_FAILED', result.error)
        return
      }

      setRoom(result.room)
      setPlayerId(result.playerId)
      subscribeToRoom(result.room.code)
      eventsRef.current.onRoomJoined?.(result.room, result.playerId)
    } catch (err) {
      setError('Failed to join room')
      setIsLoading(false)
      eventsRef.current.onError?.('JOIN_FAILED', 'Failed to join room')
    }
  }, [subscribeToRoom])

  // Leave the room
  const leaveRoom = useCallback(async () => {
    if (!room || !playerId) return

    try {
      await leaveRoomFn({ data: { roomCode: room.code, playerId } })
    } catch {
      // Ignore errors when leaving
    }

    unsubscribeFromRoom()
    setRoom(null)
    setPlayerId(null)
  }, [room, playerId, unsubscribeFromRoom])

  // Set player ready
  const setReady = useCallback(async () => {
    if (!room || !playerId) return

    try {
      await setReadyFn({ data: { roomCode: room.code, playerId, isReady: true } })
    } catch {
      eventsRef.current.onError?.('READY_FAILED', 'Failed to set ready')
    }
  }, [room, playerId])

  // Set player unready
  const setUnready = useCallback(async () => {
    if (!room || !playerId) return

    try {
      await setReadyFn({ data: { roomCode: room.code, playerId, isReady: false } })
    } catch {
      eventsRef.current.onError?.('UNREADY_FAILED', 'Failed to set unready')
    }
  }, [room, playerId])

  // Start the race
  const startRace = useCallback(async () => {
    if (!room || !playerId) return

    try {
      const result = await startRaceFn({ data: { roomCode: room.code, playerId } })
      if (!result.success && result.error) {
        eventsRef.current.onError?.('START_FAILED', result.error)
      }
    } catch {
      eventsRef.current.onError?.('START_FAILED', 'Failed to start race')
    }
  }, [room, playerId])

  // Update progress
  const updateProgress = useCallback(async (progress: number, wpm: number, accuracy: number) => {
    if (!room || !playerId) return

    try {
      await updateProgressFn({
        data: { roomCode: room.code, playerId, progress, wpm, accuracy },
      })
    } catch {
      // Ignore progress update errors
    }
  }, [room, playerId])

  // Finish the race
  const finishRace = useCallback(async (finalWpm: number, finalAccuracy: number) => {
    if (!room || !playerId) return

    try {
      await finishRaceFn({
        data: { roomCode: room.code, playerId, finalWpm, finalAccuracy },
      })
    } catch {
      eventsRef.current.onError?.('FINISH_FAILED', 'Failed to finish race')
    }
  }, [room, playerId])

  // Send chat message
  const sendChat = useCallback(async (message: string) => {
    if (!room || !playerId || !message.trim()) return

    try {
      await sendChatFn({
        data: { roomCode: room.code, playerId, message: message.trim() },
      })
    } catch {
      // Ignore chat errors
    }
  }, [room, playerId])

  // Get players array from room
  const players = room ? Object.values(room.players) : []

  return {
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
    updateProgress,
    finishRace,
    sendChat,
  }
}

export default usePusherRace
