/**
 * Pusher Auth Server Function
 * Authenticates users for presence channels
 */

import { createServerFn } from '@tanstack/react-start'

import { getPusher } from './server'

interface AuthData {
  socketId: string
  channelName: string
}

export const authorizePusherChannelFn = createServerFn({ method: 'POST' })
  .inputValidator((data: AuthData) => data)
  .handler(async ({ data }) => {
    const { socketId, channelName } = data

    if (!socketId || !channelName) {
      throw new Error('Missing socket_id or channel_name')
    }

    const pusher = getPusher()

    // For presence channels, we need to provide user data
    if (channelName.startsWith('presence-')) {
      // Generate a unique user ID for this connection
      const odId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

      const authResponse = pusher.authorizeChannel(socketId, channelName, {
        user_id: odId,
        user_info: {
          name: 'Player',
        },
      })

      return authResponse
    }

    // For private channels
    const authResponse = pusher.authorizeChannel(socketId, channelName)
    return authResponse
  })
