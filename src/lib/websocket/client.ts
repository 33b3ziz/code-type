/**
 * WebSocket Client for Multiplayer Racing
 * Handles connection management and message passing
 */

import type {
  ClientMessage,
  ConnectionStatus,
  RaceSettings,
  ServerMessage,
  WebSocketClientOptions,
} from './types'

const DEFAULT_RECONNECT_INTERVAL = 3000
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5

export class WebSocketClient {
  private ws: WebSocket | null = null
  private options: Required<WebSocketClientOptions>
  private status: ConnectionStatus = 'disconnected'
  private reconnectAttempts = 0
  private reconnectTimer: number | null = null
  private messageQueue: Array<ClientMessage> = []

  constructor(options: WebSocketClientOptions) {
    this.options = {
      url: options.url,
      reconnect: options.reconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? DEFAULT_RECONNECT_INTERVAL,
      maxReconnectAttempts: options.maxReconnectAttempts ?? DEFAULT_MAX_RECONNECT_ATTEMPTS,
      onOpen: options.onOpen ?? (() => {}),
      onClose: options.onClose ?? (() => {}),
      onError: options.onError ?? (() => {}),
      onMessage: options.onMessage ?? (() => {}),
    }
  }

  get connectionStatus(): ConnectionStatus {
    return this.status
  }

  get isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN
  }

  connect(): void {
    if (this.ws) {
      this.ws.close()
    }

    this.status = 'connecting'

    try {
      this.ws = new WebSocket(this.options.url)
      this.setupEventListeners()
    } catch (error) {
      this.status = 'error'
      this.handleReconnect()
    }
  }

  disconnect(): void {
    this.status = 'disconnected'
    this.clearReconnectTimer()
    this.reconnectAttempts = 0

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(message: ClientMessage): void {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message))
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message)
    }
  }

  // Convenience methods for common actions
  createRoom(settings: Partial<RaceSettings> = {}): void {
    this.send({ type: 'create_room', settings })
  }

  joinRoom(code: string): void {
    this.send({ type: 'join_room', code })
  }

  leaveRoom(): void {
    this.send({ type: 'leave_room' })
  }

  setReady(): void {
    this.send({ type: 'ready' })
  }

  setUnready(): void {
    this.send({ type: 'unready' })
  }

  startRace(): void {
    this.send({ type: 'start_race' })
  }

  updateProgress(progress: number, wpm: number, accuracy: number): void {
    this.send({ type: 'progress_update', progress, wpm, accuracy })
  }

  finishRace(finalWpm: number, finalAccuracy: number): void {
    this.send({ type: 'finish_race', finalWpm, finalAccuracy })
  }

  sendChat(message: string): void {
    this.send({ type: 'chat', message })
  }

  private setupEventListeners(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      this.status = 'connected'
      this.reconnectAttempts = 0
      this.options.onOpen()
      this.flushMessageQueue()
    }

    this.ws.onclose = () => {
      if (this.status !== 'disconnected') {
        this.handleReconnect()
      }
      this.options.onClose()
    }

    this.ws.onerror = (error) => {
      this.status = 'error'
      this.options.onError(error)
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as ServerMessage
        this.options.onMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
  }

  private handleReconnect(): void {
    if (!this.options.reconnect) {
      this.status = 'disconnected'
      return
    }

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.status = 'error'
      return
    }

    this.status = 'reconnecting'
    this.reconnectAttempts++

    this.clearReconnectTimer()
    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, this.options.reconnectInterval)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.send(message)
      }
    }
  }
}

// Singleton instance for global access
let globalClient: WebSocketClient | null = null

export function getWebSocketClient(options?: WebSocketClientOptions): WebSocketClient {
  if (!globalClient && options) {
    globalClient = new WebSocketClient(options)
  }
  if (!globalClient) {
    throw new Error('WebSocket client not initialized. Call with options first.')
  }
  return globalClient
}

export function initWebSocketClient(options: WebSocketClientOptions): WebSocketClient {
  if (globalClient) {
    globalClient.disconnect()
  }
  globalClient = new WebSocketClient(options)
  return globalClient
}
