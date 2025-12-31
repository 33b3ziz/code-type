/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  className?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          className={this.props.className}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  onRetry?: () => void
  className?: string
}

export function ErrorFallback({
  error,
  onRetry,
  className,
}: ErrorFallbackProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg bg-slate-800 p-8 text-center',
        className
      )}
      role="alert"
      data-testid="error-fallback"
    >
      <span className="mb-4 text-4xl" aria-hidden="true">
        ⚠️
      </span>
      <h2 className="mb-2 text-xl font-bold text-white">
        Something went wrong
      </h2>
      <p className="mb-4 text-gray-400">
        {error?.message || 'An unexpected error occurred'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition-colors hover:bg-cyan-700"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

/**
 * Higher-order component to wrap a component with an error boundary
 */
export function withErrorBoundary<TProps extends object>(
  WrappedComponent: React.ComponentType<TProps>,
  fallback?: ReactNode
): React.FC<TProps> {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component'

  const WithErrorBoundary: React.FC<TProps> = (props) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`

  return WithErrorBoundary
}

export default ErrorBoundary
