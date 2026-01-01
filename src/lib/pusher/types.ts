/**
 * Pusher Race Types
 * Types for multiplayer racing with Pusher
 */

export interface RacePlayer {
  id: string
  username: string
  avatarUrl?: string
  progress: number
  wpm: number
  accuracy: number
  isReady: boolean
  isFinished: boolean
  finishTime?: number
  position?: number
}

export interface RaceRoom {
  id: string
  code: string
  hostId: string
  status: 'waiting' | 'countdown' | 'racing' | 'finished'
  players: Record<string, RacePlayer>
  maxPlayers: number
  snippetId?: number
  startTime?: number
  settings: RaceSettings
  createdAt: number
}

export interface RaceSettings {
  maxPlayers: number
  countdownDuration: number
  language?: 'javascript' | 'typescript' | 'python'
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  isPrivate: boolean
}

export interface RaceResult {
  playerId: string
  username: string
  position: number
  wpm: number
  accuracy: number
  finishTime: number
}

// Pusher Events (server -> client)
export interface PusherRaceEvents {
  'room-updated': { room: RaceRoom }
  'player-joined': { player: RacePlayer }
  'player-left': { playerId: string }
  'player-ready': { playerId: string }
  'player-unready': { playerId: string }
  'countdown-start': { seconds: number }
  'countdown-tick': { seconds: number }
  'race-start': { snippetId: number; startTime: number }
  'player-progress': { playerId: string; progress: number; wpm: number; accuracy: number }
  'player-finished': { playerId: string; position: number; wpm: number; accuracy: number }
  'race-finished': { results: Array<RaceResult> }
  'chat-message': { playerId: string; username: string; message: string }
  'error': { code: string; message: string }
}

// API Request Types
export interface CreateRoomRequest {
  settings?: Partial<RaceSettings>
  username?: string
}

export interface JoinRoomRequest {
  code: string
  username?: string
}

export interface RoomActionRequest {
  roomCode: string
  playerId: string
}

export interface ProgressUpdateRequest extends RoomActionRequest {
  progress: number
  wpm: number
  accuracy: number
}

export interface FinishRaceRequest extends RoomActionRequest {
  finalWpm: number
  finalAccuracy: number
}

export interface ChatRequest extends RoomActionRequest {
  message: string
}
