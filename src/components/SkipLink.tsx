import { cn } from '@/lib/utils'

export interface SkipLinkProps {
  href?: string
  children?: React.ReactNode
  className?: string
}

export function SkipLink({
  href = '#main-content',
  children = 'Skip to main content',
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:z-50',
        'focus:top-4 focus:left-4 focus:px-4 focus:py-2',
        'focus:bg-cyan-500 focus:text-white focus:rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  )
}

export interface LiveRegionProps {
  message: string
  assertive?: boolean
  className?: string
}

export function LiveRegion({
  message,
  assertive = false,
  className,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  )
}

export interface VisuallyHiddenProps {
  children: React.ReactNode
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function VisuallyHidden({
  children,
  as: Component = 'span',
}: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>
}
