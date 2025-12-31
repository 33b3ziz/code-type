/**
 * Trend Indicator Component
 * Displays a metric with trend direction and change value
 */

import { cn } from '@/lib/utils'

export type Trend = 'up' | 'down' | 'stable'

export interface TrendIndicatorProps {
  label: string
  trend: Trend
  current: number
  change: number
  unit?: string
  className?: string
}

const TREND_ICONS: Record<Trend, string> = {
  up: '↑',
  down: '↓',
  stable: '→',
}

const TREND_COLORS: Record<Trend, string> = {
  up: 'text-green-400',
  down: 'text-red-400',
  stable: 'text-gray-400',
}

export function TrendIndicator({
  label,
  trend,
  current,
  change,
  unit = '',
  className,
}: TrendIndicatorProps) {
  const testId = `trend-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg bg-slate-800 p-4',
        className
      )}
      data-testid={testId}
    >
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-white">
          {current}
          {unit}
        </span>
        {change !== 0 && (
          <span className={cn('text-sm font-medium', TREND_COLORS[trend])}>
            {TREND_ICONS[trend]} {change > 0 ? '+' : ''}
            {change}
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

export default TrendIndicator
