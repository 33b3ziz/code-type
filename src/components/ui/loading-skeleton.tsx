/**
 * Loading Skeleton Component
 * Displays animated placeholder content while loading
 */

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * Basic skeleton element with shimmer animation
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-700',
        className
      )}
      aria-hidden="true"
    />
  )
}

/**
 * Skeleton for a stat card
 */
export function StatCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg bg-slate-800 p-4',
        className
      )}
    >
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

/**
 * Skeleton for a text line
 */
export function TextSkeleton({
  width = 'w-full',
  className,
}: SkeletonProps & { width?: string }) {
  return <Skeleton className={cn('h-4', width, className)} />
}

/**
 * Skeleton for a table row
 */
export function TableRowSkeleton({
  columns = 5,
  className,
}: SkeletonProps & { columns?: number }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Skeleton for a leaderboard entry
 */
export function LeaderboardEntrySkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg bg-slate-800 p-4',
        className
      )}
    >
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

/**
 * Skeleton for a profile section
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default Skeleton
