/**
 * Pusher Race API
 * Server functions for multiplayer racing
 */

import { createServerFn } from '@tanstack/react-start'

import type {
  ChatRequest,
  CreateRoomRequest,
  FinishRaceRequest,
  JoinRoomRequest,
  ProgressUpdateRequest,
  RaceRoom,
  RoomActionRequest,
} from './types'
import { getPusher } from './server'
import { roomStore } from './room-store'

// Helper to get channel name for a room
function getRoomChannel(code: string): string {
  return `presence-race-${code.toUpperCase()}`
}

// Create a new room
export const createRoomFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateRoomRequest) => data)
  .handler(async ({ data }): Promise<{ room: RaceRoom; playerId: string }> => {
    const { room, playerId } = roomStore.createRoom(data.settings, data.username)

    // Trigger room created event
    const pusher = getPusher()
    await pusher.trigger(getRoomChannel(room.code), 'room-updated', { room })

    return { room, playerId }
  })

// Join an existing room
export const joinRoomFn = createServerFn({ method: 'POST' })
  .inputValidator((data: JoinRoomRequest) => data)
  .handler(async ({ data }): Promise<{ room: RaceRoom; playerId: string } | { error: string }> => {
    const result = roomStore.joinRoom(data.code, data.username)

    if ('error' in result) {
      return result
    }

    const { room, playerId } = result
    const pusher = getPusher()

    // Notify existing players
    await pusher.trigger(getRoomChannel(room.code), 'player-joined', {
      player: room.players[playerId],
    })

    // Send updated room state
    await pusher.trigger(getRoomChannel(room.code), 'room-updated', { room })

    return { room, playerId }
  })

// Leave a room
export const leaveRoomFn = createServerFn({ method: 'POST' })
  .inputValidator((data: RoomActionRequest) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const room = roomStore.leaveRoom(data.roomCode, data.playerId)

    if (room) {
      const pusher = getPusher()
      await pusher.trigger(getRoomChannel(data.roomCode), 'player-left', {
        playerId: data.playerId,
      })
      await pusher.trigger(getRoomChannel(data.roomCode), 'room-updated', { room })
    }

    return { success: true }
  })

// Set player ready
export const setReadyFn = createServerFn({ method: 'POST' })
  .inputValidator((data: RoomActionRequest & { isReady: boolean }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const room = roomStore.setPlayerReady(data.roomCode, data.playerId, data.isReady)

    if (room) {
      const pusher = getPusher()
      const eventType = data.isReady ? 'player-ready' : 'player-unready'
      await pusher.trigger(getRoomChannel(data.roomCode), eventType, {
        playerId: data.playerId,
      })
      await pusher.trigger(getRoomChannel(data.roomCode), 'room-updated', { room })
    }

    return { success: true }
  })

// Start the race (host only)
export const startRaceFn = createServerFn({ method: 'POST' })
  .inputValidator((data: RoomActionRequest) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const room = roomStore.getRoom(data.roomCode)

    if (!room) {
      return { success: false, error: 'Room not found' }
    }

    if (room.hostId !== data.playerId) {
      return { success: false, error: 'Only the host can start the race' }
    }

    const playerCount = Object.keys(room.players).length
    if (playerCount < 2) {
      return { success: false, error: 'Need at least 2 players' }
    }

    const pusher = getPusher()
    const countdownDuration = room.settings.countdownDuration

    // Start countdown
    roomStore.startCountdown(data.roomCode)
    await pusher.trigger(getRoomChannel(data.roomCode), 'countdown-start', {
      seconds: countdownDuration,
    })

    // Schedule countdown ticks and race start
    for (let i = countdownDuration - 1; i >= 0; i--) {
      setTimeout(async () => {
        if (i > 0) {
          await pusher.trigger(getRoomChannel(data.roomCode), 'countdown-tick', {
            seconds: i,
          })
        } else {
          // Start the race
          const snippetId = Math.floor(Math.random() * 45) + 1
          const updatedRoom = roomStore.startRace(data.roomCode, snippetId)

          if (updatedRoom) {
            await pusher.trigger(getRoomChannel(data.roomCode), 'race-start', {
              snippetId,
              startTime: updatedRoom.startTime,
            })
            await pusher.trigger(getRoomChannel(data.roomCode), 'room-updated', {
              room: updatedRoom,
            })
          }
        }
      }, (countdownDuration - i) * 1000)
    }

    return { success: true }
  })

// Update player progress
export const updateProgressFn = createServerFn({ method: 'POST' })
  .inputValidator((data: ProgressUpdateRequest) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const room = roomStore.updateProgress(
      data.roomCode,
      data.playerId,
      data.progress,
      data.wpm,
      data.accuracy
    )

    if (room) {
      const pusher = getPusher()
      await pusher.trigger(getRoomChannel(data.roomCode), 'player-progress', {
        playerId: data.playerId,
        progress: data.progress,
        wpm: data.wpm,
        accuracy: data.accuracy,
      })
    }

    return { success: true }
  })

// Player finished the race
export const finishRaceFn = createServerFn({ method: 'POST' })
  .inputValidator((data: FinishRaceRequest) => data)
  .handler(async ({ data }): Promise<{ success: boolean; position?: number }> => {
    const result = roomStore.finishRace(
      data.roomCode,
      data.playerId,
      data.finalWpm,
      data.finalAccuracy
    )

    if (!result) {
      return { success: false }
    }

    const { room, position } = result
    const pusher = getPusher()

    await pusher.trigger(getRoomChannel(data.roomCode), 'player-finished', {
      playerId: data.playerId,
      position,
      wpm: data.finalWpm,
      accuracy: data.finalAccuracy,
    })

    // Check if race is finished
    if (room.status === 'finished') {
      const results = roomStore.getResults(data.roomCode)
      await pusher.trigger(getRoomChannel(data.roomCode), 'race-finished', { results })
    }

    await pusher.trigger(getRoomChannel(data.roomCode), 'room-updated', { room })

    return { success: true, position }
  })

// Send chat message
export const sendChatFn = createServerFn({ method: 'POST' })
  .inputValidator((data: ChatRequest) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const room = roomStore.getRoom(data.roomCode)

    if (!room || !room.players[data.playerId]) {
      return { success: false }
    }

    const player = room.players[data.playerId]
    const pusher = getPusher()

    await pusher.trigger(getRoomChannel(data.roomCode), 'chat-message', {
      playerId: data.playerId,
      username: player.username,
      message: data.message,
    })

    return { success: true }
  })

// Get room state (for reconnection)
export const getRoomFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }): Promise<{ room: RaceRoom } | { error: string }> => {
    const room = roomStore.getRoom(data.code)

    if (!room) {
      return { error: 'Room not found' }
    }

    return { room }
  })
