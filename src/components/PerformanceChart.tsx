/**
 * Performance Chart Component
 * CSS-based mini charts for displaying performance trends
 * (Lightweight alternative to heavy charting libraries)
 */

import { useMemo } from 'react'
import type { TrendPoint } from '@/lib/analytics-api'

export interface PerformanceChartProps {
  data: TrendPoint[]
  type?: 'line' | 'bar'
  height?: number
  color?: string
  showLabels?: boolean
  showGrid?: boolean
  valueLabel?: string
  className?: string
}

export function PerformanceChart({
  data,
  type = 'bar',
  height = 120,
  color = 'var(--color-primary, #3b82f6)',
  showLabels = true,
  showGrid = true,
  valueLabel = '',
  className = '',
}: PerformanceChartProps) {
  // Calculate chart dimensions
  const { min, max, range, normalizedData } = useMemo(() => {
    if (data.length === 0) {
      return { min: 0, max: 100, range: 100, normalizedData: [] }
    }

    const values = data.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1 // Prevent division by zero

    // Add 10% padding
    const paddedMin = Math.floor(min - range * 0.1)
    const paddedMax = Math.ceil(max + range * 0.1)
    const paddedRange = paddedMax - paddedMin || 1

    const normalizedData = data.map((d) => ({
      ...d,
      normalized: ((d.value - paddedMin) / paddedRange) * 100,
    }))

    return { min: paddedMin, max: paddedMax, range: paddedRange, normalizedData }
  }, [data])

  if (data.length === 0) {
    return (
      <div className={`performance-chart empty ${className}`} data-testid="performance-chart-empty">
        <p>No data to display</p>
      </div>
    )
  }

  return (
    <div
      className={`performance-chart ${className}`}
      style={{ height: `${height}px` }}
      data-testid="performance-chart"
    >
      {/* Y-axis labels */}
      {showLabels && (
        <div className="chart-y-axis" data-testid="chart-y-axis">
          <span className="y-label y-max">{max}{valueLabel}</span>
          <span className="y-label y-mid">{Math.round((max + min) / 2)}{valueLabel}</span>
          <span className="y-label y-min">{min}{valueLabel}</span>
        </div>
      )}

      {/* Chart area */}
      <div className="chart-area">
        {/* Grid lines */}
        {showGrid && (
          <div className="chart-grid" aria-hidden="true">
            <div className="grid-line grid-line-top" />
            <div className="grid-line grid-line-mid" />
            <div className="grid-line grid-line-bottom" />
          </div>
        )}

        {/* Data visualization */}
        {type === 'bar' ? (
          <div className="chart-bars" data-testid="chart-bars">
            {normalizedData.map((point, index) => (
              <div
                key={point.date}
                className="chart-bar-container"
                style={{ width: `${100 / normalizedData.length}%` }}
              >
                <div
                  className="chart-bar"
                  style={{
                    height: `${point.normalized}%`,
                    backgroundColor: color,
                  }}
                  title={`${point.date}: ${point.value}${valueLabel}`}
                  data-testid={`bar-${index}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <svg
            className="chart-line"
            viewBox={`0 0 ${normalizedData.length * 20} 100`}
            preserveAspectRatio="none"
            data-testid="chart-line"
          >
            {/* Line path */}
            <polyline
              points={normalizedData
                .map((d, i) => `${i * 20 + 10},${100 - d.normalized}`)
                .join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
            {/* Data points */}
            {normalizedData.map((point, index) => (
              <circle
                key={point.date}
                cx={index * 20 + 10}
                cy={100 - point.normalized}
                r="3"
                fill={color}
              >
                <title>{`${point.date}: ${point.value}${valueLabel}`}</title>
              </circle>
            ))}
          </svg>
        )}
      </div>

      {/* X-axis labels */}
      {showLabels && (
        <div className="chart-x-axis" data-testid="chart-x-axis">
          {normalizedData.map((point, index) => (
            <span
              key={point.date}
              className="x-label"
              style={{ width: `${100 / normalizedData.length}%` }}
            >
              {formatDateLabel(point.date, normalizedData.length)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Sparkline - Minimal inline chart
 */
export interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = 'currentColor',
  className = '',
}: SparklineProps) {
  const { points, trend } = useMemo(() => {
    if (data.length < 2) return { points: '', trend: 'stable' }

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const normalizedPoints = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })

    const trend =
      data[data.length - 1] > data[0]
        ? 'up'
        : data[data.length - 1] < data[0]
          ? 'down'
          : 'stable'

    return { points: normalizedPoints.join(' '), trend }
  }, [data, width, height])

  if (data.length < 2) {
    return <span className={`sparkline empty ${className}`}>--</span>
  }

  return (
    <svg
      className={`sparkline ${className}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      data-testid="sparkline"
      data-trend={trend}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Language comparison bar chart
 */
export interface LanguageComparisonChartProps {
  data: { language: string; value: number; color?: string }[]
  maxValue?: number
  valueLabel?: string
  className?: string
}

export function LanguageComparisonChart({
  data,
  maxValue,
  valueLabel = '',
  className = '',
}: LanguageComparisonChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1)

  return (
    <div className={`language-comparison-chart ${className}`} data-testid="language-comparison-chart">
      {data.map((item) => (
        <div key={item.language} className="comparison-row">
          <span className="comparison-label">{item.language}</span>
          <div className="comparison-bar-container">
            <div
              className="comparison-bar"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || 'var(--color-primary)',
              }}
              data-testid={`comparison-bar-${item.language.toLowerCase()}`}
            />
          </div>
          <span className="comparison-value">
            {item.value}{valueLabel}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Stat change indicator
 */
export interface StatChangeProps {
  current: number
  previous: number
  unit?: string
  showArrow?: boolean
  className?: string
}

export function StatChange({
  current,
  previous,
  unit = '',
  showArrow = true,
  className = '',
}: StatChangeProps) {
  const diff = current - previous
  const isPositive = diff > 0
  const isNegative = diff < 0

  return (
    <span
      className={`stat-change ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'} ${className}`}
      data-testid="stat-change"
    >
      {showArrow && (isPositive ? '↑' : isNegative ? '↓' : '')}
      {isPositive ? '+' : ''}
      {diff !== 0 ? diff : '='}{unit}
    </span>
  )
}

// Helper function to format date labels
function formatDateLabel(dateStr: string, totalPoints: number): string {
  // For many data points, show abbreviated labels
  if (totalPoints > 10) {
    return '' // Hide labels when too many
  }

  // Parse the date string
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    // YYYY-MM-DD format
    return `${parts[1]}/${parts[2]}`
  }
  if (parts.length === 2 && parts[0].includes('W')) {
    // YYYY-WXX format
    return parts[1]
  }
  return dateStr.slice(-5) // Last 5 chars
}

export default PerformanceChart
