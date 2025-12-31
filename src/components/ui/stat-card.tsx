/**
 * Stat Card Component
 * Displays a single statistic with an icon, value, and optional subtext
 */

import { cn } from '@/lib/utils'

export type StatIcon = 'tests' | 'speed' | 'trophy' | 'accuracy' | 'star' | 'clock' | 'fire' | 'target'

export interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: StatIcon
  className?: string
}

const ICON_MAP: Record<StatIcon, string> = {
  tests: '📝',
  speed: '⚡',
  trophy: '🏆',
  accuracy: '🎯',
  star: '⭐',
  clock: '⏱️',
  fire: '🔥',
  target: '🎯',
}

export function StatCard({
  label,
  value,
  subtext,
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg bg-slate-800 p-4',
        className
      )}
      data-testid={icon ? `stat-card-${icon}` : 'stat-card'}
    >
      {icon && (
        <span className="text-2xl" aria-hidden="true">
          {ICON_MAP[icon]}
        </span>
      )}
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-white">{value}</span>
        {subtext && (
          <span className="text-sm text-green-400">{subtext}</span>
        )}
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    </div>
  )
}

export default StatCard
