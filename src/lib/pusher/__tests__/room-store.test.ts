import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { roomStore } from '../room-store'

// Helper to clear the internal rooms map between tests
// We'll use the cleanup method and also reset directly
const clearRooms = () => {
  // First reset to real timers, then set fake timers again for cleanup
  vi.useRealTimers()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2099-01-01T00:00:00.000Z'))
  roomStore.cleanup()
}

describe('roomStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    clearRooms()
  })

  describe('createRoom', () => {
    it('should create a new room with default settings', () => {
      const { room, playerId } = roomStore.createRoom()

      expect(room).toBeDefined()
      expect(room.code).toHaveLength(6)
      expect(room.status).toBe('waiting')
      expect(room.maxPlayers).toBe(4)
      expect(room.hostId).toBe(playerId)
      expect(Object.keys(room.players)).toHaveLength(1)
      expect(room.players[playerId]).toBeDefined()
      expect(room.players[playerId].isReady).toBe(false)
      expect(room.players[playerId].progress).toBe(0)
    })

    it('should create room with custom settings', () => {
      const { room } = roomStore.createRoom({
        maxPlayers: 8,
        countdownDuration: 5,
        language: 'typescript',
        difficulty: 'advanced',
        isPrivate: true,
      })

      expect(room.maxPlayers).toBe(8)
      expect(room.settings.maxPlayers).toBe(8)
      expect(room.settings.countdownDuration).toBe(5)
      expect(room.settings.language).toBe('typescript')
      expect(room.settings.difficulty).toBe('advanced')
      expect(room.settings.isPrivate).toBe(true)
    })

    it('should use provided username', () => {
      const { room, playerId } = roomStore.createRoom({}, 'TestPlayer')

      expect(room.players[playerId].username).toBe('TestPlayer')
    })

    it('should generate username if not provided', () => {
      const { room, playerId } = roomStore.createRoom()

      expect(room.players[playerId].username).toBeTruthy()
      expect(room.players[playerId].username.length).toBeGreaterThan(0)
    })

    it('should create room with unique code', () => {
      const codes = new Set<string>()

      // Create multiple rooms and check uniqueness
      for (let i = 0; i < 10; i++) {
        const { room } = roomStore.createRoom()
        expect(codes.has(room.code)).toBe(false)
        codes.add(room.code)
      }
    })

    it('should set createdAt timestamp', () => {
      vi.setSystemTime(new Date('2024-06-15T12:30:00.000Z'))
      const { room } = roomStore.createRoom()

      expect(room.createdAt).toBe(new Date('2024-06-15T12:30:00.000Z').getTime())
    })

    it('should initialize player with correct defaults', () => {
      const { room, playerId } = roomStore.createRoom()
      const player = room.players[playerId]

      expect(player.progress).toBe(0)
      expect(player.wpm).toBe(0)
      expect(player.accuracy).toBe(100)
      expect(player.isReady).toBe(false)
      expect(player.isFinished).toBe(false)
      expect(player.finishTime).toBeUndefined()
      expect(player.position).toBeUndefined()
    })
  })

  describe('getRoom', () => {
    it('should return existing room', () => {
      const { room: createdRoom } = roomStore.createRoom()
      const room = roomStore.getRoom(createdRoom.code)

      expect(room).toBeDefined()
      expect(room?.code).toBe(createdRoom.code)
    })

    it('should return undefined for non-existent room', () => {
      const room = roomStore.getRoom('NOTFOUND')

      expect(room).toBeUndefined()
    })

    it('should be case-insensitive', () => {
      const { room: createdRoom } = roomStore.createRoom()
      const lowerCase = roomStore.getRoom(createdRoom.code.toLowerCase())
      const upperCase = roomStore.getRoom(createdRoom.code.toUpperCase())

      expect(lowerCase).toBeDefined()
      expect(upperCase).toBeDefined()
    })
  })

  describe('joinRoom', () => {
    it('should allow player to join existing room', () => {
      const { room: createdRoom } = roomStore.createRoom()
      const result = roomStore.joinRoom(createdRoom.code, 'Player2')

      expect('error' in result).toBe(false)
      if (!('error' in result)) {
        expect(Object.keys(result.room.players)).toHaveLength(2)
        expect(result.room.players[result.playerId].username).toBe('Player2')
      }
    })

    it('should generate username if not provided', () => {
      const { room: createdRoom } = roomStore.createRoom()
      const result = roomStore.joinRoom(createdRoom.code)

      expect('error' in result).toBe(false)
      if (!('error' in result)) {
        expect(result.room.players[result.playerId].username).toBeTruthy()
      }
    })

    it('should return error for non-existent room', () => {
      const result = roomStore.joinRoom('NOTFOUND')

      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error).toBe('Room not found')
      }
    })

    it('should return error when room is full', () => {
      const { room: createdRoom } = roomStore.createRoom({ maxPlayers: 2 })

      // Room starts with 1 player, join 1 more
      roomStore.joinRoom(createdRoom.code, 'Player2')

      // Try to join when full
      const result = roomStore.joinRoom(createdRoom.code, 'Player3')

      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error).toBe('Room is full')
      }
    })

    it('should return error when race is in progress', () => {
      const { room: createdRoom } = roomStore.createRoom()

      // Start the race
      roomStore.startCountdown(createdRoom.code)

      const result = roomStore.joinRoom(createdRoom.code, 'LatePlayer')

      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error).toBe('Race already in progress')
      }
    })

    it('should be case-insensitive', () => {
      const { room: createdRoom } = roomStore.createRoom()
      const result = roomStore.joinRoom(createdRoom.code.toLowerCase())

      expect('error' in result).toBe(false)
    })

    it('should initialize new player correctly', () => {
      const { room: createdRoom } = roomStore.createRoom()
      const result = roomStore.joinRoom(createdRoom.code)

      expect('error' in result).toBe(false)
      if (!('error' in result)) {
        const player = result.room.players[result.playerId]
        expect(player.progress).toBe(0)
        expect(player.wpm).toBe(0)
        expect(player.accuracy).toBe(100)
        expect(player.isReady).toBe(false)
        expect(player.isFinished).toBe(false)
      }
    })
  })

  describe('leaveRoom', () => {
    it('should remove player from room', () => {
      const { room: createdRoom, playerId: hostId } = roomStore.createRoom()
      const joinResult = roomStore.joinRoom(createdRoom.code, 'Player2')

      if (!('error' in joinResult)) {
        const updatedRoom = roomStore.leaveRoom(createdRoom.code, joinResult.playerId)

        expect(updatedRoom).not.toBeNull()
        expect(Object.keys(updatedRoom!.players)).toHaveLength(1)
        expect(updatedRoom!.players[joinResult.playerId]).toBeUndefined()
      }
    })

    it('should delete room when last player leaves', () => {
      const { room: createdRoom, playerId } = roomStore.createRoom()

      const result = roomStore.leaveRoom(createdRoom.code, playerId)

      expect(result).toBeNull()
      expect(roomStore.getRoom(createdRoom.code)).toBeUndefined()
    })

    it('should reassign host when host leaves', () => {
      const { room: createdRoom, playerId: hostId } = roomStore.createRoom()
      const joinResult = roomStore.joinRoom(createdRoom.code, 'Player2')

      if (!('error' in joinResult)) {
        const updatedRoom = roomStore.leaveRoom(createdRoom.code, hostId)

        expect(updatedRoom).not.toBeNull()
        expect(updatedRoom!.hostId).toBe(joinResult.playerId)
      }
    })

    it('should return null for non-existent room', () => {
      const result = roomStore.leaveRoom('NOTFOUND', 'player1')

      expect(result).toBeNull()
    })
  })

  describe('setPlayerReady', () => {
    it('should set player ready state to true', () => {
      const { room: createdRoom, playerId } = roomStore.createRoom()

      const updatedRoom = roomStore.setPlayerReady(createdRoom.code, playerId, true)

      expect(updatedRoom).not.toBeNull()
      expect(updatedRoom!.players[playerId].isReady).toBe(true)
    })

    it('should set player ready state to false', () => {
      const { room: createdRoom, playerId } = roomStore.createRoom()

      roomStore.setPlayerReady(createdRoom.code, playerId, true)
      const updatedRoom = roomStore.setPlayerReady(createdRoom.code, playerId, false)

      expect(updatedRoom).not.toBeNull()
      expect(updatedRoom!.players[playerId].isReady).toBe(false)
    })

    it('should return null for non-existent room', () => {
      const result = roomStore.setPlayerReady('NOTFOUND', 'player1', true)

      expect(result).toBeNull()
    })

    it('should return null for non-existent player', () => {
      const { room: createdRoom } = roomStore.createRoom()

      const result = roomStore.setPlayerReady(createdRoom.code, 'nonexistent', true)

      expect(result).toBeNull()
    })
  })

  describe('startCountdown', () => {
    it('should set room status to countdown', () => {
      const { room: createdRoom } = roomStore.createRoom()

      const updatedRoom = roomStore.startCountdown(createdRoom.code)

      expect(updatedRoom).not.toBeNull()
      expect(updatedRoom!.status).toBe('countdown')
    })

    it('should return null for non-existent room', () => {
      const result = roomStore.startCountdown('NOTFOUND')

      expect(result).toBeNull()
    })
  })

  describe('startRace', () => {
    it('should set room status to racing', () => {
      const { room: createdRoom } = roomStore.createRoom()

      const updatedRoom = roomStore.startRace(createdRoom.code, 123)

      expect(updatedRoom).not.toBeNull()
      expect(updatedRoom!.status).toBe('racing')
      expect(updatedRoom!.snippetId).toBe(123)
      expect(updatedRoom!.startTime).toBeDefined()
    })

    it('should reset all player stats', () => {
      const { room: createdRoom, playerId } = roomStore.createRoom()

      // Manually set some progress (simulating previous race)
      const room = roomStore.getRoom(createdRoom.code)
      if (room) {
        room.players[playerId].progress = 50
        room.players[playerId].wpm = 80
        room.players[playerId].isFinished = true
      }

      const updatedRoom = roomStore.startRace(createdRoom.code, 123)

      expect(updatedRoom!.players[playerId].progress).toBe(0)
      expect(updatedRoom!.players[playerId].wpm).toBe(0)
      expect(updatedRoom!.players[playerId].isFinished).toBe(false)
      expect(updatedRoom!.players[playerId].finishTime).toBeUndefined()
      expect(updatedRoom!.players[playerId].position).toBeUndefined()
    })

    it('should return null for non-existent room', () => {
      const result = roomStore.startRace('NOTFOUND', 123)

      expect(result).toBeNull()
    })
  })

  describe('updateProgress', () => {
    it('should update player progress', () => {
      const { room: createdRoom, playerId } = roomStore.createRoom()
      roomStore.startRace(createdRoom.code, 123)

      const updatedRoom = roomStore.updateProgress(
        createdRoom.code,
        playerId,
        50, // progress
        75, // wpm
        98  // accuracy
      )

      expect(updatedRoom).not.toBeNull()
      expect(updatedRoom!.players[playerId].progress).toBe(50)
      expect(updatedRoom!.players[playerId].wpm).toBe(75)
      expect(updatedRoom!.players[playerId].accuracy).toBe(98)
    })

    it('should return null for non-existent room', () => {
      const result = roomStore.updateProgress('NOTFOUND', 'player1', 50, 75, 98)

      expect(result).toBeNull()
    })

    it('should return null for non-existent player', () => {
      const { room: createdRoom } = roomStore.createRoom()

      const result = roomStore.updateProgress(createdRoom.code, 'nonexistent', 50, 75, 98)

      expect(result).toBeNull()
    })
  })

  describe('finishRace', () => {
    it('should mark player as finished with position', () => {
      const { room: createdRoom, playerId } = roomStore.createRoom()
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
      roomStore.startRace(createdRoom.code, 123)

      vi.setSystemTime(new Date('2024-01-01T00:00:30.000Z'))
      const result = roomStore.finishRace(createdRoom.code, playerId, 100, 99)

      expect(result).not.toBeNull()
      expect(result!.position).toBe(1)
      expect(result!.room.players[playerId].isFinished).toBe(true)
      expect(result!.room.players[playerId].position).toBe(1)
      expect(result!.room.players[playerId].wpm).toBe(100)
      expect(result!.room.players[playerId].accuracy).toBe(99)
      expect(result!.room.players[playerId].progress).toBe(100)
      expect(result!.room.players[playerId].finishTime).toBeDefined()
    })

    it('should calculate positions correctly for multiple finishers', () => {
      const { room: createdRoom, playerId: player1 } = roomStore.createRoom()
      const joinResult = roomStore.joinRoom(createdRoom.code)

      if (!('error' in joinResult)) {
        const player2 = joinResult.playerId
        roomStore.startRace(createdRoom.code, 123)

        // First player finishes
        const result1 = roomStore.finishRace(createdRoom.code, player1, 100, 99)
        expect(result1!.position).toBe(1)

        // Second player finishes
        const result2 = roomStore.finishRace(createdRoom.code, player2, 90, 98)
        expect(result2!.position).toBe(2)
      }
    })

    it('should set room status to finished when all players finish', () => {
      const { room: createdRoom, playerId } = roomStore.createRoom()
      roomStore.startRace(createdRoom.code, 123)

      const result = roomStore.finishRace(createdRoom.code, playerId, 100, 99)

      expect(result!.room.status).toBe('finished')
    })

    it('should not set finished until all players complete', () => {
      const { room: createdRoom, playerId: player1 } = roomStore.createRoom()
      const joinResult = roomStore.joinRoom(createdRoom.code)

      if (!('error' in joinResult)) {
        roomStore.startRace(createdRoom.code, 123)

        const result = roomStore.finishRace(createdRoom.code, player1, 100, 99)

        expect(result!.room.status).toBe('racing')
      }
    })

    it('should return null for non-existent room', () => {
      const result = roomStore.finishRace('NOTFOUND', 'player1', 100, 99)

      expect(result).toBeNull()
    })

    it('should return null for non-existent player', () => {
      const { room: createdRoom } = roomStore.createRoom()

      const result = roomStore.finishRace(createdRoom.code, 'nonexistent', 100, 99)

      expect(result).toBeNull()
    })
  })

  describe('getResults', () => {
    it('should return sorted results', () => {
      const { room: createdRoom, playerId: player1 } = roomStore.createRoom({}, 'Player1')
      const joinResult = roomStore.joinRoom(createdRoom.code, 'Player2')

      if (!('error' in joinResult)) {
        const player2 = joinResult.playerId
        roomStore.startRace(createdRoom.code, 123)

        // Second player finishes first
        roomStore.finishRace(createdRoom.code, player2, 90, 98)
        // First player finishes second
        roomStore.finishRace(createdRoom.code, player1, 100, 99)

        const results = roomStore.getResults(createdRoom.code)

        expect(results).toHaveLength(2)
        expect(results[0].position).toBe(1)
        expect(results[0].username).toBe('Player2')
        expect(results[1].position).toBe(2)
        expect(results[1].username).toBe('Player1')
      }
    })

    it('should return empty array for non-existent room', () => {
      const results = roomStore.getResults('NOTFOUND')

      expect(results).toEqual([])
    })

    it('should only include finished players', () => {
      const { room: createdRoom, playerId: player1 } = roomStore.createRoom({}, 'Player1')
      const joinResult = roomStore.joinRoom(createdRoom.code, 'Player2')

      if (!('error' in joinResult)) {
        roomStore.startRace(createdRoom.code, 123)

        // Only first player finishes
        roomStore.finishRace(createdRoom.code, player1, 100, 99)

        const results = roomStore.getResults(createdRoom.code)

        expect(results).toHaveLength(1)
        expect(results[0].username).toBe('Player1')
      }
    })

    it('should include correct result data', () => {
      const { room: createdRoom, playerId } = roomStore.createRoom({}, 'TestPlayer')
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
      roomStore.startRace(createdRoom.code, 123)

      vi.setSystemTime(new Date('2024-01-01T00:00:45.000Z'))
      roomStore.finishRace(createdRoom.code, playerId, 120, 97)

      const results = roomStore.getResults(createdRoom.code)

      expect(results[0]).toEqual({
        playerId,
        username: 'TestPlayer',
        position: 1,
        wpm: 120,
        accuracy: 97,
        finishTime: 45000,
      })
    })
  })

  describe('resetRoom', () => {
    it('should reset room to waiting status', () => {
      const { room: createdRoom, playerId } = roomStore.createRoom()
      roomStore.startRace(createdRoom.code, 123)
      roomStore.finishRace(createdRoom.code, playerId, 100, 99)

      const updatedRoom = roomStore.resetRoom(createdRoom.code)

      expect(updatedRoom).not.toBeNull()
      expect(updatedRoom!.status).toBe('waiting')
      expect(updatedRoom!.snippetId).toBeUndefined()
      expect(updatedRoom!.startTime).toBeUndefined()
    })

    it('should reset all player states', () => {
      const { room: createdRoom, playerId } = roomStore.createRoom()
      roomStore.startRace(createdRoom.code, 123)
      roomStore.finishRace(createdRoom.code, playerId, 100, 99)

      const updatedRoom = roomStore.resetRoom(createdRoom.code)

      expect(updatedRoom!.players[playerId].progress).toBe(0)
      expect(updatedRoom!.players[playerId].wpm).toBe(0)
      expect(updatedRoom!.players[playerId].accuracy).toBe(100)
      expect(updatedRoom!.players[playerId].isReady).toBe(false)
      expect(updatedRoom!.players[playerId].isFinished).toBe(false)
      expect(updatedRoom!.players[playerId].finishTime).toBeUndefined()
      expect(updatedRoom!.players[playerId].position).toBeUndefined()
    })

    it('should return null for non-existent room', () => {
      const result = roomStore.resetRoom('NOTFOUND')

      expect(result).toBeNull()
    })
  })

  describe('cleanup', () => {
    it('should remove expired rooms', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
      const { room: createdRoom } = roomStore.createRoom()

      // Move time forward past expiry (30 minutes)
      vi.setSystemTime(new Date('2024-01-01T00:31:00.000Z'))
      roomStore.cleanup()

      expect(roomStore.getRoom(createdRoom.code)).toBeUndefined()
    })

    it('should keep non-expired rooms', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
      const { room: createdRoom } = roomStore.createRoom()

      // Move time forward but not past expiry
      vi.setSystemTime(new Date('2024-01-01T00:15:00.000Z'))
      roomStore.cleanup()

      expect(roomStore.getRoom(createdRoom.code)).toBeDefined()
    })
  })

  describe('player ID generation', () => {
    it('should generate unique player IDs', () => {
      const { room: createdRoom, playerId: player1 } = roomStore.createRoom()
      const joinResult = roomStore.joinRoom(createdRoom.code)

      if (!('error' in joinResult)) {
        expect(player1).not.toBe(joinResult.playerId)
        expect(player1).toMatch(/^player_/)
        expect(joinResult.playerId).toMatch(/^player_/)
      }
    })
  })

  describe('room code format', () => {
    it('should generate 6-character alphanumeric codes', () => {
      const { room } = roomStore.createRoom()

      expect(room.code).toHaveLength(6)
      expect(room.code).toMatch(/^[A-Z0-9]{6}$/)
    })
  })
})
