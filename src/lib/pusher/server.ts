/**
 * Pusher Server Configuration
 * Server-side Pusher instance for triggering events
 */

import Pusher from 'pusher'

// Lazy initialization to avoid issues during build
let pusherInstance: Pusher | null = null

export function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER || 'us2',
      useTLS: true,
    })
  }
  return pusherInstance
}

// Re-export for convenience
export { Pusher }
