/**
 * Formatters Utility
 * Consolidated formatting functions for dates, times, numbers, etc.
 */

/**
 * Format duration in seconds to human-readable string
 * Examples: "45s", "2m 30s", "1h 15m"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s'

  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    if (remainingSeconds === 0) return `${minutes}m`
    return `${minutes}m ${remainingSeconds}s`
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

/**
 * Format time in seconds to short display (for stats)
 * Examples: "45s", "15m", "2h 30m"
 */
export function formatTime(seconds: number): string {
  return formatDuration(seconds)
}

/**
 * Format timer countdown/count-up display
 * Examples: "0:45", "1:30", "10:00"
 */
export function formatTimer(seconds: number): string {
  if (seconds < 0) return '0:00'

  const minutes = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format date relative to now
 * Examples: "Today", "Yesterday", "3 days ago", "Jan 15"
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Format date for display
 * Alias for formatRelativeDate for backwards compatibility
 */
export function formatDate(date: Date): string {
  return formatRelativeDate(date)
}

/**
 * Format date to absolute format
 * Examples: "Jan 15, 2024", "Mar 3"
 */
export function formatAbsoluteDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const now = new Date()
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    ...options,
  }
  return date.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format date and time
 * Examples: "Jan 15 at 2:30 PM"
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Format a number with commas for thousands
 * Examples: "1,234", "1,234,567"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Format a number as percentage
 * Examples: "95%", "99.5%"
 */
export function formatPercent(
  value: number,
  decimals = 0
): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format WPM value
 * Examples: "65", "120"
 */
export function formatWPM(wpm: number): string {
  return Math.round(wpm).toString()
}

/**
 * Format accuracy value
 * Examples: "95%", "99.5%"
 */
export function formatAccuracy(accuracy: number): string {
  if (accuracy >= 100) return '100%'
  if (accuracy >= 99) return `${accuracy.toFixed(1)}%`
  return `${Math.round(accuracy)}%`
}

/**
 * Format date label for charts
 * Adapts detail level based on data density
 */
export function formatChartDateLabel(
  dateStr: string,
  totalPoints: number
): string {
  const date = new Date(dateStr)

  if (totalPoints <= 7) {
    // Show full date for small datasets
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (totalPoints <= 14) {
    // Abbreviated for medium datasets
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  // Just day for large datasets
  return date.getDate().toString()
}

/**
 * Format challenge duration for display
 * Examples: "30 seconds", "1 minute", "Endless"
 */
export function formatChallengeDuration(seconds: number | null): string {
  if (seconds === null) return 'Endless'
  if (seconds < 60) return `${seconds} seconds`
  const minutes = Math.floor(seconds / 60)
  return minutes === 1 ? '1 minute' : `${minutes} minutes`
}
