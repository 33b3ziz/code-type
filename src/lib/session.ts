import { useSession } from '@tanstack/react-start/server'

export interface SessionData {
  userId?: string
  email?: string
  username?: string
}

export function useAppSession() {
  return useSession<SessionData>({
    name: 'codetype-session',
    password: process.env.SESSION_SECRET!,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  })
}
