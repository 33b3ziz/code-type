/**
 * Pusher Client Configuration
 * Client-side Pusher instance for subscribing to channels
 */

import PusherClient from 'pusher-js'

import { authorizePusherChannelFn } from './auth'

// Lazy initialization
let pusherClient: PusherClient | null = null

export function getPusherClient(): PusherClient {
  if (!pusherClient) {
    pusherClient = new PusherClient(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'us2',
      authorizer: (channel) => ({
        authorize: async (socketId, callback) => {
          try {
            const authResponse = await authorizePusherChannelFn({
              data: { socketId, channelName: channel.name },
            })
            callback(null, authResponse)
          } catch (error) {
            callback(error as Error, null)
          }
        },
      }),
    })
  }
  return pusherClient
}

// Re-export types
export { PusherClient }
export type { Channel, PresenceChannel } from 'pusher-js'
