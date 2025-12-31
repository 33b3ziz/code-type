/**
 * WebSocket Types for Multiplayer Racing
 * Defines message formats and game state types
 */

// Player state during a race
export interface RacePlayer {
  id: string
  username: string
  avatarUrl?: string
  progress: number // 0-100
  wpm: number
  accuracy: number
  isFinished: boolean
  finishTime?: number // ms since race start
  position?: number // 1st, 2nd, etc.
}

// Race states
export type RaceStatus = 'waiting' | 'countdown' | 'racing' | 'finished'

// Race room state
export interface RaceRoom {
  id: string
  code: string // 6-char join code
  hostId: string
  status: RaceStatus
  players: Array<RacePlayer>
  maxPlayers: number
  snippetId?: number
  countdownSeconds?: number
  startTime?: number
  settings: RaceSettings
}

export interface RaceSettings {
  maxPlayers: number
  countdownDuration: number // seconds
  language?: 'javascript' | 'typescript' | 'python'
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'hardcore'
  isPrivate: boolean
}

// Client -> Server messages
export type ClientMessage =
  | { type: 'create_room'; settings: Partial<RaceSettings> }
  | { type: 'join_room'; code: string }
  | { type: 'leave_room' }
  | { type: 'ready' }
  | { type: 'unready' }
  | { type: 'start_race' }
  | { type: 'progress_update'; progress: number; wpm: number; accuracy: number }
  | { type: 'finish_race'; finalWpm: number; finalAccuracy: number }
  | { type: 'chat'; message: string }

// Server -> Client messages
export type ServerMessage =
  | { type: 'room_created'; room: RaceRoom }
  | { type: 'room_joined'; room: RaceRoom; playerId: string }
  | { type: 'room_updated'; room: RaceRoom }
  | { type: 'player_joined'; player: RacePlayer }
  | { type: 'player_left'; playerId: string }
  | { type: 'player_ready'; playerId: string }
  | { type: 'player_unready'; playerId: string }
  | { type: 'countdown_start'; seconds: number }
  | { type: 'countdown_tick'; seconds: number }
  | { type: 'race_start'; snippetId: number; startTime: number }
  | { type: 'player_progress'; playerId: string; progress: number; wpm: number; accuracy: number }
  | { type: 'player_finished'; playerId: string; position: number; wpm: number; accuracy: number }
  | { type: 'race_finished'; results: Array<RaceResult> }
  | { type: 'chat_message'; playerId: string; username: string; message: string }
  | { type: 'error'; code: string; message: string }

// Race result
export interface RaceResult {
  playerId: string
  username: string
  position: number
  wpm: number
  accuracy: number
  finishTime: number
}

// Connection states
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

// WebSocket client options
export interface WebSocketClientOptions {
  url: string
  reconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  onMessage?: (message: ServerMessage) => void
}

// Event types for hooks
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
