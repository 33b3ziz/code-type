/**
 * Room Store
 * In-memory storage for race rooms (for serverless environment)
 * Note: In production, you'd want to use Redis or a database
 */

import type { RacePlayer, RaceRoom, RaceSettings } from './types'

// In-memory store (resets on server restart)
// For production, use Redis, Upstash, or database
const rooms = new Map<string, RaceRoom>()

// Room cleanup interval (5 minutes)
const ROOM_EXPIRY_MS = 30 * 60 * 1000 // 30 minutes

// Generate a random 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return rooms.has(code) ? generateRoomCode() : code
}

// Generate a random username
function generateUsername(): string {
  const adjectives = ['Swift', 'Quick', 'Fast', 'Rapid', 'Speedy', 'Nimble', 'Agile', 'Sharp']
  const nouns = ['Coder', 'Typer', 'Hacker', 'Dev', 'Ninja', 'Wizard', 'Pro', 'Master']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adj}${noun}${Math.floor(Math.random() * 100)}`
}

// Generate a player ID
function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export const roomStore = {
  // Create a new room
  createRoom(settings: Partial<RaceSettings> = {}, username?: string): { room: RaceRoom; playerId: string } {
    const code = generateRoomCode()
    const playerId = generatePlayerId()
    const playerUsername = username || generateUsername()

    const player: RacePlayer = {
      id: playerId,
      username: playerUsername,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      isReady: false,
      isFinished: false,
    }

    const room: RaceRoom = {
      id: `room_${Date.now()}`,
      code,
      hostId: playerId,
      status: 'waiting',
      players: { [playerId]: player },
      maxPlayers: settings.maxPlayers || 4,
      settings: {
        maxPlayers: settings.maxPlayers || 4,
        countdownDuration: settings.countdownDuration || 3,
        language: settings.language,
        difficulty: settings.difficulty,
        isPrivate: settings.isPrivate || false,
      },
      createdAt: Date.now(),
    }

    rooms.set(code, room)
    return { room, playerId }
  },

  // Get a room by code
  getRoom(code: string): RaceRoom | undefined {
    return rooms.get(code.toUpperCase())
  },

  // Join a room
  joinRoom(code: string, username?: string): { room: RaceRoom; playerId: string } | { error: string } {
    const room = rooms.get(code.toUpperCase())

    if (!room) {
      return { error: 'Room not found' }
    }

    const playerCount = Object.keys(room.players).length
    if (playerCount >= room.maxPlayers) {
      return { error: 'Room is full' }
    }

    if (room.status !== 'waiting') {
      return { error: 'Race already in progress' }
    }

    const playerId = generatePlayerId()
    const playerUsername = username || generateUsername()

    const player: RacePlayer = {
      id: playerId,
      username: playerUsername,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      isReady: false,
      isFinished: false,
    }

    room.players[playerId] = player
    return { room, playerId }
  },

  // Leave a room
  leaveRoom(code: string, playerId: string): RaceRoom | null {
    const room = rooms.get(code.toUpperCase())
    if (!room) return null

    delete room.players[playerId]

    // If room is empty, delete it
    if (Object.keys(room.players).length === 0) {
      rooms.delete(code.toUpperCase())
      return null
    }

    // If host left, assign new host
    if (room.hostId === playerId) {
      room.hostId = Object.keys(room.players)[0]
    }

    return room
  },

  // Set player ready
  setPlayerReady(code: string, playerId: string, isReady: boolean): RaceRoom | null {
    const room = rooms.get(code.toUpperCase())
    if (!room || !room.players[playerId]) return null

    room.players[playerId].isReady = isReady
    return room
  },

  // Start race countdown
  startCountdown(code: string): RaceRoom | null {
    const room = rooms.get(code.toUpperCase())
    if (!room) return null

    room.status = 'countdown'
    return room
  },

  // Start the race
  startRace(code: string, snippetId: number): RaceRoom | null {
    const room = rooms.get(code.toUpperCase())
    if (!room) return null

    room.status = 'racing'
    room.snippetId = snippetId
    room.startTime = Date.now()

    // Reset all players
    Object.values(room.players).forEach((player) => {
      player.progress = 0
      player.wpm = 0
      player.isFinished = false
      player.finishTime = undefined
      player.position = undefined
    })

    return room
  },

  // Update player progress
  updateProgress(
    code: string,
    playerId: string,
    progress: number,
    wpm: number,
    accuracy: number
  ): RaceRoom | null {
    const room = rooms.get(code.toUpperCase())
    if (!room || !room.players[playerId]) return null

    room.players[playerId].progress = progress
    room.players[playerId].wpm = wpm
    room.players[playerId].accuracy = accuracy

    return room
  },

  // Player finished race
  finishRace(
    code: string,
    playerId: string,
    finalWpm: number,
    finalAccuracy: number
  ): { room: RaceRoom; position: number } | null {
    const room = rooms.get(code.toUpperCase())
    if (!room || !room.players[playerId]) return null

    const finishedCount = Object.values(room.players).filter((p) => p.isFinished).length
    const position = finishedCount + 1

    room.players[playerId].isFinished = true
    room.players[playerId].finishTime = Date.now() - (room.startTime || Date.now())
    room.players[playerId].position = position
    room.players[playerId].wpm = finalWpm
    room.players[playerId].accuracy = finalAccuracy
    room.players[playerId].progress = 100

    // Check if all players finished
    const allFinished = Object.values(room.players).every((p) => p.isFinished)
    if (allFinished) {
      room.status = 'finished'
    }

    return { room, position }
  },

  // Get race results
  getResults(code: string): Array<{ playerId: string; username: string; position: number; wpm: number; accuracy: number; finishTime: number }> {
    const room = rooms.get(code.toUpperCase())
    if (!room) return []

    return Object.values(room.players)
      .filter((p) => p.position !== undefined)
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((p) => ({
        playerId: p.id,
        username: p.username,
        position: p.position!,
        wpm: p.wpm,
        accuracy: p.accuracy,
        finishTime: p.finishTime || 0,
      }))
  },

  // Reset room for new race
  resetRoom(code: string): RaceRoom | null {
    const room = rooms.get(code.toUpperCase())
    if (!room) return null

    room.status = 'waiting'
    room.snippetId = undefined
    room.startTime = undefined

    Object.values(room.players).forEach((player) => {
      player.progress = 0
      player.wpm = 0
      player.accuracy = 100
      player.isReady = false
      player.isFinished = false
      player.finishTime = undefined
      player.position = undefined
    })

    return room
  },

  // Kick a player from the room (host only)
  kickPlayer(code: string, hostId: string, targetPlayerId: string): { room: RaceRoom; kicked: boolean } | { error: string } {
    const room = rooms.get(code.toUpperCase())
    if (!room) return { error: 'Room not found' }

    // Verify the requester is the host
    if (room.hostId !== hostId) {
      return { error: 'Only the host can kick players' }
    }

    // Cannot kick yourself (the host)
    if (targetPlayerId === hostId) {
      return { error: 'Cannot kick yourself' }
    }

    // Check if target player exists
    if (!room.players[targetPlayerId]) {
      return { error: 'Player not found in room' }
    }

    // Cannot kick during a race
    if (room.status === 'racing' || room.status === 'countdown') {
      return { error: 'Cannot kick players during a race' }
    }

    // Remove the player
    delete room.players[targetPlayerId]

    return { room, kicked: true }
  },

  // Update room settings (host only)
  updateSettings(code: string, hostId: string, settings: Partial<RaceSettings>): RaceRoom | { error: string } {
    const room = rooms.get(code.toUpperCase())
    if (!room) return { error: 'Room not found' }

    // Verify the requester is the host
    if (room.hostId !== hostId) {
      return { error: 'Only the host can update settings' }
    }

    // Cannot change settings during a race
    if (room.status === 'racing' || room.status === 'countdown') {
      return { error: 'Cannot change settings during a race' }
    }

    // Update settings
    if (settings.maxPlayers !== undefined) {
      // Don't allow reducing below current player count
      const currentPlayerCount = Object.keys(room.players).length
      if (settings.maxPlayers < currentPlayerCount) {
        return { error: `Cannot set max players below current player count (${currentPlayerCount})` }
      }
      room.maxPlayers = settings.maxPlayers
      room.settings.maxPlayers = settings.maxPlayers
    }

    if (settings.countdownDuration !== undefined) {
      room.settings.countdownDuration = settings.countdownDuration
    }

    if (settings.language !== undefined) {
      room.settings.language = settings.language
    }

    if (settings.difficulty !== undefined) {
      room.settings.difficulty = settings.difficulty
    }

    if (settings.isPrivate !== undefined) {
      room.settings.isPrivate = settings.isPrivate
    }

    return room
  },

  // Transfer host to another player
  transferHost(code: string, currentHostId: string, newHostId: string): RaceRoom | { error: string } {
    const room = rooms.get(code.toUpperCase())
    if (!room) return { error: 'Room not found' }

    // Verify the requester is the current host
    if (room.hostId !== currentHostId) {
      return { error: 'Only the host can transfer host privileges' }
    }

    // Check if new host exists in the room
    if (!room.players[newHostId]) {
      return { error: 'Target player not found in room' }
    }

    // Transfer host
    room.hostId = newHostId

    return room
  },

  // Cleanup old rooms
  cleanup(): void {
    const now = Date.now()
    for (const [code, room] of rooms.entries()) {
      if (now - room.createdAt > ROOM_EXPIRY_MS) {
        rooms.delete(code)
      }
    }
  },
}

// Run cleanup periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => roomStore.cleanup(), 60000)
}
