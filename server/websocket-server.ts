/**
 * WebSocket Server for Multiplayer Racing
 * Run with: pnpm ws:server
 */

import { WebSocketServer, type WebSocket } from 'ws'

import type {
  ClientMessage,
  RacePlayer,
  RaceResult,
  RaceRoom,
  RaceSettings,
  ServerMessage,
} from '../src/lib/websocket/types'

const PORT = parseInt(process.env.WS_PORT || '3001', 10)

// In-memory storage
const rooms = new Map<string, RaceRoom>()
const playerToRoom = new Map<string, string>()
const playerToSocket = new Map<string, WebSocket>()
const socketToPlayer = new Map<WebSocket, string>()

// Generate a random 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return rooms.has(code) ? generateRoomCode() : code
}

// Generate a player ID
function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// Generate a username
function generateUsername(): string {
  const adjectives = ['Swift', 'Quick', 'Fast', 'Rapid', 'Speedy', 'Nimble', 'Agile']
  const nouns = ['Coder', 'Typer', 'Hacker', 'Dev', 'Ninja', 'Wizard', 'Pro']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adj}${noun}${Math.floor(Math.random() * 100)}`
}

// Send message to a specific player
function sendToPlayer(playerId: string, message: ServerMessage): void {
  const socket = playerToSocket.get(playerId)
  if (socket && socket.readyState === 1) {
    socket.send(JSON.stringify(message))
  }
}

// Broadcast to all players in a room
function broadcastToRoom(roomCode: string, message: ServerMessage, excludePlayer?: string): void {
  const room = rooms.get(roomCode)
  if (!room) return

  room.players.forEach((player) => {
    if (player.id !== excludePlayer) {
      sendToPlayer(player.id, message)
    }
  })
}

// Create a new room
function handleCreateRoom(
  socket: WebSocket,
  playerId: string,
  settings: Partial<RaceSettings>
): void {
  const code = generateRoomCode()
  const username = generateUsername()

  const player: RacePlayer = {
    id: playerId,
    username,
    progress: 0,
    wpm: 0,
    accuracy: 100,
    isFinished: false,
  }

  const room: RaceRoom = {
    id: `room_${Date.now()}`,
    code,
    hostId: playerId,
    status: 'waiting',
    players: [player],
    maxPlayers: settings.maxPlayers || 4,
    settings: {
      maxPlayers: settings.maxPlayers || 4,
      countdownDuration: settings.countdownDuration || 3,
      language: settings.language,
      difficulty: settings.difficulty,
      isPrivate: settings.isPrivate || false,
    },
  }

  rooms.set(code, room)
  playerToRoom.set(playerId, code)

  sendToPlayer(playerId, { type: 'room_created', room })
  sendToPlayer(playerId, { type: 'room_joined', room, playerId })

  console.log(`Room ${code} created by ${username}`)
}

// Join an existing room
function handleJoinRoom(socket: WebSocket, playerId: string, code: string): void {
  const room = rooms.get(code.toUpperCase())

  if (!room) {
    sendToPlayer(playerId, {
      type: 'error',
      code: 'ROOM_NOT_FOUND',
      message: 'Room not found',
    })
    return
  }

  if (room.players.length >= room.maxPlayers) {
    sendToPlayer(playerId, {
      type: 'error',
      code: 'ROOM_FULL',
      message: 'Room is full',
    })
    return
  }

  if (room.status !== 'waiting') {
    sendToPlayer(playerId, {
      type: 'error',
      code: 'RACE_IN_PROGRESS',
      message: 'Race already in progress',
    })
    return
  }

  const username = generateUsername()
  const player: RacePlayer = {
    id: playerId,
    username,
    progress: 0,
    wpm: 0,
    accuracy: 100,
    isFinished: false,
  }

  room.players.push(player)
  playerToRoom.set(playerId, code)

  // Notify the new player
  sendToPlayer(playerId, { type: 'room_joined', room, playerId })

  // Notify other players
  broadcastToRoom(code, { type: 'player_joined', player }, playerId)

  console.log(`${username} joined room ${code}`)
}

// Leave a room
function handleLeaveRoom(playerId: string): void {
  const roomCode = playerToRoom.get(playerId)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  room.players = room.players.filter((p) => p.id !== playerId)
  playerToRoom.delete(playerId)

  // If room is empty, delete it
  if (room.players.length === 0) {
    rooms.delete(roomCode)
    console.log(`Room ${roomCode} deleted (empty)`)
    return
  }

  // If host left, assign new host
  if (room.hostId === playerId) {
    room.hostId = room.players[0].id
  }

  broadcastToRoom(roomCode, { type: 'player_left', playerId })
  broadcastToRoom(roomCode, { type: 'room_updated', room })

  console.log(`Player ${playerId} left room ${roomCode}`)
}

// Set player ready
function handleReady(playerId: string): void {
  const roomCode = playerToRoom.get(playerId)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  broadcastToRoom(roomCode, { type: 'player_ready', playerId })
  broadcastToRoom(roomCode, { type: 'room_updated', room })
}

// Set player unready
function handleUnready(playerId: string): void {
  const roomCode = playerToRoom.get(playerId)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  broadcastToRoom(roomCode, { type: 'player_unready', playerId })
  broadcastToRoom(roomCode, { type: 'room_updated', room })
}

// Start race (host only)
function handleStartRace(playerId: string): void {
  const roomCode = playerToRoom.get(playerId)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room || room.hostId !== playerId) return

  // Start countdown
  room.status = 'countdown'
  room.countdownSeconds = room.settings.countdownDuration

  broadcastToRoom(roomCode, { type: 'countdown_start', seconds: room.countdownSeconds })
  broadcastToRoom(roomCode, { type: 'room_updated', room })

  // Countdown ticks
  let remaining = room.countdownSeconds
  const interval = setInterval(() => {
    remaining--
    if (remaining > 0) {
      broadcastToRoom(roomCode, { type: 'countdown_tick', seconds: remaining })
    } else {
      clearInterval(interval)
      // Start the race
      room.status = 'racing'
      room.startTime = Date.now()
      room.snippetId = Math.floor(Math.random() * 45) + 1 // Random snippet 1-45

      broadcastToRoom(roomCode, {
        type: 'race_start',
        snippetId: room.snippetId,
        startTime: room.startTime,
      })
      broadcastToRoom(roomCode, { type: 'room_updated', room })
    }
  }, 1000)

  console.log(`Race starting in room ${roomCode}`)
}

// Update player progress
function handleProgressUpdate(
  playerId: string,
  progress: number,
  wpm: number,
  accuracy: number
): void {
  const roomCode = playerToRoom.get(playerId)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const player = room.players.find((p) => p.id === playerId)
  if (player) {
    player.progress = progress
    player.wpm = wpm
    player.accuracy = accuracy
  }

  broadcastToRoom(roomCode, {
    type: 'player_progress',
    playerId,
    progress,
    wpm,
    accuracy,
  })
}

// Finish race
function handleFinishRace(playerId: string, finalWpm: number, finalAccuracy: number): void {
  const roomCode = playerToRoom.get(playerId)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room || room.status !== 'racing') return

  const player = room.players.find((p) => p.id === playerId)
  if (!player || player.isFinished) return

  const finishTime = Date.now() - (room.startTime || Date.now())
  const finishedCount = room.players.filter((p) => p.isFinished).length
  const position = finishedCount + 1

  player.isFinished = true
  player.finishTime = finishTime
  player.position = position
  player.wpm = finalWpm
  player.accuracy = finalAccuracy
  player.progress = 100

  broadcastToRoom(roomCode, {
    type: 'player_finished',
    playerId,
    position,
    wpm: finalWpm,
    accuracy: finalAccuracy,
  })

  // Check if all players finished
  const allFinished = room.players.every((p) => p.isFinished)
  if (allFinished) {
    room.status = 'finished'

    const results: Array<RaceResult> = room.players
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

    broadcastToRoom(roomCode, { type: 'race_finished', results })
    broadcastToRoom(roomCode, { type: 'room_updated', room })

    console.log(`Race finished in room ${roomCode}`)
  }
}

// Handle chat message
function handleChat(playerId: string, message: string): void {
  const roomCode = playerToRoom.get(playerId)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const player = room.players.find((p) => p.id === playerId)
  if (!player) return

  broadcastToRoom(roomCode, {
    type: 'chat_message',
    playerId,
    username: player.username,
    message,
  })
}

// Handle client disconnection
function handleDisconnect(socket: WebSocket): void {
  const playerId = socketToPlayer.get(socket)
  if (!playerId) return

  handleLeaveRoom(playerId)

  playerToSocket.delete(playerId)
  socketToPlayer.delete(socket)

  console.log(`Player ${playerId} disconnected`)
}

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT })

wss.on('connection', (socket) => {
  const playerId = generatePlayerId()
  playerToSocket.set(playerId, socket)
  socketToPlayer.set(socket, playerId)

  console.log(`Player ${playerId} connected`)

  socket.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString()) as ClientMessage

      switch (message.type) {
        case 'create_room':
          handleCreateRoom(socket, playerId, message.settings)
          break
        case 'join_room':
          handleJoinRoom(socket, playerId, message.code)
          break
        case 'leave_room':
          handleLeaveRoom(playerId)
          break
        case 'ready':
          handleReady(playerId)
          break
        case 'unready':
          handleUnready(playerId)
          break
        case 'start_race':
          handleStartRace(playerId)
          break
        case 'progress_update':
          handleProgressUpdate(playerId, message.progress, message.wpm, message.accuracy)
          break
        case 'finish_race':
          handleFinishRace(playerId, message.finalWpm, message.finalAccuracy)
          break
        case 'chat':
          handleChat(playerId, message.message)
          break
      }
    } catch (error) {
      console.error('Failed to process message:', error)
    }
  })

  socket.on('close', () => {
    handleDisconnect(socket)
  })

  socket.on('error', (error) => {
    console.error('WebSocket error:', error)
    handleDisconnect(socket)
  })
})

console.log(`WebSocket server running on ws://localhost:${PORT}`)
