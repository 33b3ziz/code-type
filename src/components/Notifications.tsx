import { createContext, useCallback, useContext, useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Info, Trophy, X, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AchievementBadge } from './AchievementBadge'
import { getAchievementBySlug, type AchievementDefinition } from '@/lib/achievements'

export type NotificationType = 'success' | 'error' | 'info' | 'achievement'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  // Achievement-specific fields
  achievementSlug?: string
  achievementPoints?: number
  totalPoints?: number
}

export interface AchievementNotificationData {
  achievementSlug: string
  totalPoints?: number
}

interface NotificationContextValue {
  notifications: Array<Notification>
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
  // Achievement-specific methods
  showAchievementUnlock: (data: AchievementNotificationData) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
)

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState<Array<Notification>>([])

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newNotification = { ...notification, id }

      setNotifications((prev) => [...prev, newNotification])

      // Auto-remove after duration (default 5s, achievements get 8s)
      const defaultDuration = notification.type === 'achievement' ? 8000 : 5000
      const duration = notification.duration ?? defaultDuration
      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }, duration)
      }
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const showAchievementUnlock = useCallback(
    (data: AchievementNotificationData) => {
      const achievement = getAchievementBySlug(data.achievementSlug)
      if (!achievement) return

      addNotification({
        type: 'achievement',
        title: achievement.name,
        message: achievement.description,
        achievementSlug: data.achievementSlug,
        achievementPoints: achievement.points,
        totalPoints: data.totalPoints,
        duration: 8000, // Achievements stay longer
      })
    },
    [addNotification]
  )

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAll, showAchievementUnlock }}
    >
      {children}
      <NotificationContainer
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    )
  }
  return context
}

interface NotificationContainerProps {
  notifications: Array<Notification>
  onDismiss: (id: string) => void
}

function NotificationContainer({
  notifications,
  onDismiss,
}: NotificationContainerProps) {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onDismiss: () => void
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onDismiss(), 300)
  }, [onDismiss])

  // For achievement notifications, render enhanced version
  if (notification.type === 'achievement' && notification.achievementSlug) {
    return (
      <AchievementNotificationItem
        notification={notification}
        onDismiss={handleDismiss}
        isVisible={isVisible}
        isExiting={isExiting}
      />
    )
  }

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    achievement: <Trophy className="w-5 h-5 text-yellow-400" />,
  }

  const backgrounds = {
    success: 'bg-green-500/10 border-green-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
    achievement: 'bg-yellow-500/10 border-yellow-500/30',
  }

  return (
    <div
      className={cn(
        'pointer-events-auto rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all duration-300',
        backgrounds[notification.type],
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
      role="alert"
      data-testid="notification-item"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icons[notification.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{notification.title}</p>
          {notification.message && (
            <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Enhanced achievement notification component
interface AchievementNotificationItemProps {
  notification: Notification
  onDismiss: () => void
  isVisible: boolean
  isExiting: boolean
}

function getTierGlow(points: number): string {
  if (points >= 100) return 'shadow-[0_0_30px_rgba(34,211,238,0.6)]' // cyan/platinum
  if (points >= 50) return 'shadow-[0_0_30px_rgba(234,179,8,0.6)]' // yellow/gold
  if (points >= 25) return 'shadow-[0_0_30px_rgba(148,163,184,0.6)]' // slate/silver
  return 'shadow-[0_0_30px_rgba(217,119,6,0.5)]' // amber/bronze
}

function AchievementNotificationItem({
  notification,
  onDismiss,
  isVisible,
  isExiting,
}: AchievementNotificationItemProps) {
  const achievement = notification.achievementSlug
    ? getAchievementBySlug(notification.achievementSlug)
    : null

  if (!achievement) return null

  const tierGlow = getTierGlow(achievement.points)

  return (
    <div
      className={cn(
        'pointer-events-auto relative overflow-hidden rounded-xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 p-4 backdrop-blur-md transition-all duration-300',
        tierGlow,
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      )}
      role="alert"
      aria-live="assertive"
      data-testid="achievement-notification"
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'absolute w-3 h-3 text-yellow-400/60 animate-[float_3s_ease-in-out_infinite]',
              i % 2 === 0 ? 'text-yellow-300' : 'text-amber-400'
            )}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-start gap-4">
        {/* Animated Achievement Badge */}
        <div className="relative flex-shrink-0">
          <div className="animate-[achievement-badge-pop_0.5s_ease-out_forwards] origin-center">
            <div className="animate-[achievement-glow-pulse_2s_ease-in-out_infinite]">
              <AchievementBadge
                achievementSlug={notification.achievementSlug!}
                unlockedAt={new Date()}
                size="lg"
              />
            </div>
          </div>
          {/* Ring animation around badge */}
          <div className="absolute inset-0 -m-2 animate-[achievement-ring_1.5s_ease-out_forwards] rounded-full border-2 border-yellow-400/0" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400 animate-pulse">
              Achievement Unlocked!
            </span>
          </div>
          <h3 className="text-lg font-bold text-white truncate animate-[slide-up_0.4s_ease-out_forwards]">
            {notification.title}
          </h3>
          {notification.message && (
            <p className="text-sm text-gray-300 mt-1 line-clamp-2 animate-[slide-up_0.4s_ease-out_0.1s_forwards] opacity-0">
              {notification.message}
            </p>
          )}

          {/* Points display */}
          <div className="flex items-center gap-3 mt-3 animate-[slide-up_0.4s_ease-out_0.2s_forwards] opacity-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">
                +{notification.achievementPoints ?? achievement.points} pts
              </span>
            </div>
            {notification.totalPoints !== undefined && (
              <span className="text-xs text-gray-400">
                Total: {notification.totalPoints} pts
              </span>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Dismiss achievement notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
