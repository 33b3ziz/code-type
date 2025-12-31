/**
 * LiveAnnouncer Component
 * Provides screen reader announcements for dynamic content updates
 */

import { createContext, useCallback, useContext, useState } from 'react'

type Politeness = 'polite' | 'assertive'

interface Announcement {
  message: string
  politeness: Politeness
  id: number
}

interface LiveAnnouncerContextValue {
  announce: (message: string, politeness?: Politeness) => void
}

const LiveAnnouncerContext = createContext<LiveAnnouncerContextValue | null>(null)

let announcementId = 0

export function LiveAnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [announcements, setAnnouncements] = useState<Array<Announcement>>([])

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    const id = ++announcementId

    setAnnouncements((prev) => [...prev, { message, politeness, id }])

    // Clear after announcement is read (typically 1 second is enough)
    setTimeout(() => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    }, 1000)
  }, [])

  const politeAnnouncements = announcements.filter((a) => a.politeness === 'polite')
  const assertiveAnnouncements = announcements.filter((a) => a.politeness === 'assertive')

  return (
    <LiveAnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Polite announcements - used for non-urgent updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeAnnouncements.map((a) => (
          <span key={a.id}>{a.message}</span>
        ))}
      </div>
      {/* Assertive announcements - used for important/urgent updates */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveAnnouncements.map((a) => (
          <span key={a.id}>{a.message}</span>
        ))}
      </div>
    </LiveAnnouncerContext.Provider>
  )
}

export function useLiveAnnouncer() {
  const context = useContext(LiveAnnouncerContext)
  if (!context) {
    throw new Error('useLiveAnnouncer must be used within a LiveAnnouncerProvider')
  }
  return context
}

/**
 * Standalone component for simple announcements
 * Use this when you don't need the full provider/hook pattern
 */
export interface LiveRegionProps {
  message: string
  politeness?: Politeness
  className?: string
}

export function LiveRegion({ message, politeness = 'polite', className = '' }: LiveRegionProps) {
  return (
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {message}
    </div>
  )
}

export default LiveAnnouncerProvider
