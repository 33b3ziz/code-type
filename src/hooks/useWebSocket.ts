/**
 * WebSocket Hook for Multiplayer Racing
 * Provides React integration for the WebSocket client
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  ConnectionStatus,
  RaceEvents,
  RacePlayer,
  RaceRoom,
  RaceSettings,
  ServerMessage,
} from '@/lib/websocket/types'
import { WebSocketClient } from '@/lib/websocket/client'

export interface UseWebSocketOptions {
  url: string
  autoConnect?: boolean
  events?: RaceEvents
}

export interface UseWebSocketReturn {
  // Connection
  status: ConnectionStatus
  isConnected: boolean
  connect: () => void
  disconnect: () => void

  // Room state
  room: RaceRoom | null
  playerId: string | null
  players: Array<RacePlayer>

  // Room actions
  createRoom: (settings?: Partial<RaceSettings>) => void
  joinRoom: (code: string) => void
  leaveRoom: () => void

  // Player actions
  setReady: () => void
  setUnready: () => void
  startRace: () => void
  updateProgress: (progress: number, wpm: number, accuracy: number) => void
  finishRace: (finalWpm: number, finalAccuracy: number) => void
  sendChat: (message: string) => void
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const { url, autoConnect = false, events = {} } = options

  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [room, setRoom] = useState<RaceRoom | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)

  const clientRef = useRef<WebSocketClient | null>(null)
  const eventsRef = useRef(events)

  // Keep events ref updated
  useEffect(() => {
    eventsRef.current = events
  }, [events])

  // Handle incoming messages
  const handleMessage = useCallback((message: ServerMessage) => {
    const currentEvents = eventsRef.current

    switch (message.type) {
      case 'room_created': {
        setRoom(message.room)
        currentEvents.onRoomCreated?.(message.room)
        break
      }

      case 'room_joined': {
        setRoom(message.room)
        setPlayerId(message.playerId)
        currentEvents.onRoomJoined?.(message.room, message.playerId)
        break
      }

      case 'room_updated': {
        setRoom(message.room)
        currentEvents.onRoomUpdated?.(message.room)
        break
      }

      case 'player_joined': {
        setRoom((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            players: [...prev.players, message.player],
          }
        })
        currentEvents.onPlayerJoined?.(message.player)
        break
      }

      case 'player_left': {
        setRoom((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            players: prev.players.filter((p) => p.id !== message.playerId),
          }
        })
        currentEvents.onPlayerLeft?.(message.playerId)
        break
      }

      case 'player_ready': {
        // Player ready state is typically included in room_updated
        break
      }

      case 'player_unready': {
        // Player unready state is typically included in room_updated
        break
      }

      case 'countdown_start': {
        setRoom((prev) => prev ? { ...prev, status: 'countdown' } : prev)
        currentEvents.onCountdownStart?.(message.seconds)
        break
      }

      case 'countdown_tick': {
        currentEvents.onCountdownTick?.(message.seconds)
        break
      }

      case 'race_start': {
        setRoom((prev) =>
          prev
            ? {
                ...prev,
                status: 'racing',
                snippetId: message.snippetId,
                startTime: message.startTime,
              }
            : prev
        )
        currentEvents.onRaceStart?.(message.snippetId, message.startTime)
        break
      }

      case 'player_progress': {
        setRoom((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            players: prev.players.map((p) =>
              p.id === message.playerId
                ? {
                    ...p,
                    progress: message.progress,
                    wpm: message.wpm,
                    accuracy: message.accuracy,
                  }
                : p
            ),
          }
        })
        currentEvents.onPlayerProgress?.(
          message.playerId,
          message.progress,
          message.wpm,
          message.accuracy
        )
        break
      }

      case 'player_finished': {
        setRoom((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            players: prev.players.map((p) =>
              p.id === message.playerId
                ? {
                    ...p,
                    isFinished: true,
                    position: message.position,
                    wpm: message.wpm,
                    accuracy: message.accuracy,
                  }
                : p
            ),
          }
        })
        currentEvents.onPlayerFinished?.(
          message.playerId,
          message.position,
          message.wpm,
          message.accuracy
        )
        break
      }

      case 'race_finished': {
        setRoom((prev) => (prev ? { ...prev, status: 'finished' } : prev))
        currentEvents.onRaceFinished?.(message.results)
        break
      }

      case 'chat_message': {
        currentEvents.onChatMessage?.(
          message.playerId,
          message.username,
          message.message
        )
        break
      }

      case 'error': {
        currentEvents.onError?.(message.code, message.message)
        break
      }
    }
  }, [])

  // Initialize client
  useEffect(() => {
    clientRef.current = new WebSocketClient({
      url,
      onOpen: () => setStatus('connected'),
      onClose: () => setStatus('disconnected'),
      onError: () => setStatus('error'),
      onMessage: handleMessage,
    })

    if (autoConnect) {
      clientRef.current.connect()
    }

    return () => {
      clientRef.current?.disconnect()
      clientRef.current = null
    }
  }, [url, autoConnect, handleMessage])

  // Update status from client
  useEffect(() => {
    const interval = setInterval(() => {
      if (clientRef.current) {
        const newStatus = clientRef.current.connectionStatus
        if (newStatus !== status) {
          setStatus(newStatus)
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [status])

  // Connection actions
  const connect = useCallback(() => {
    clientRef.current?.connect()
  }, [])

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect()
    setRoom(null)
    setPlayerId(null)
  }, [])

  // Room actions
  const createRoom = useCallback((settings: Partial<RaceSettings> = {}) => {
    clientRef.current?.createRoom(settings)
  }, [])

  const joinRoom = useCallback((code: string) => {
    clientRef.current?.joinRoom(code)
  }, [])

  const leaveRoom = useCallback(() => {
    clientRef.current?.leaveRoom()
    setRoom(null)
    setPlayerId(null)
  }, [])

  // Player actions
  const setReady = useCallback(() => {
    clientRef.current?.setReady()
  }, [])

  const setUnready = useCallback(() => {
    clientRef.current?.setUnready()
  }, [])

  const startRace = useCallback(() => {
    clientRef.current?.startRace()
  }, [])

  const updateProgress = useCallback(
    (progress: number, wpm: number, accuracy: number) => {
      clientRef.current?.updateProgress(progress, wpm, accuracy)
    },
    []
  )

  const finishRace = useCallback((finalWpm: number, finalAccuracy: number) => {
    clientRef.current?.finishRace(finalWpm, finalAccuracy)
  }, [])

  const sendChat = useCallback((message: string) => {
    clientRef.current?.sendChat(message)
  }, [])

  return {
    // Connection
    status,
    isConnected: status === 'connected',
    connect,
    disconnect,

    // Room state
    room,
    playerId,
    players: room?.players ?? [],

    // Room actions
    createRoom,
    joinRoom,
    leaveRoom,

    // Player actions
    setReady,
    setUnready,
    startRace,
    updateProgress,
    finishRace,
    sendChat,
  }
}

export default useWebSocket
