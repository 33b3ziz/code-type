/**
 * Profile Charts Component
 * Displays visual performance trend charts using CSS/SVG
 */

import type { AccuracyTrend, TrendPoint, WPMTrend } from '@/lib/analytics-api'

export interface ProfileChartsProps {
  wpmTrend: WPMTrend | null
  accuracyTrend: AccuracyTrend | null
}

interface LineChartProps {
  data: Array<TrendPoint>
  label: string
  color: string
  unit: string
  maxValue?: number
}

interface BarChartProps {
  data: Array<{ label: string; value: number; count: number }>
  color: string
  unit: string
}

function LineChart({ data, label, color, unit, maxValue }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-empty" data-testid={`chart-${label.toLowerCase().replace(' ', '-')}-empty`}>
        <span className="chart-empty-text">No data yet</span>
      </div>
    )
  }

  // Calculate chart dimensions
  const width = 100
  const height = 60
  const padding = 5

  // Find min/max values
  const values = data.map(d => d.value)
  const minVal = Math.min(...values)
  const calculatedMax = maxValue || Math.max(...values)
  const range = calculatedMax - minVal || 1

  // Generate path points
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - 2 * padding)
    const y = height - padding - ((point.value - minVal) / range) * (height - 2 * padding)
    return { x, y, ...point }
  })

  // Create SVG path
  const pathD = points.length > 1
    ? points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`
        return `${acc} L ${point.x} ${point.y}`
      }, '')
    : ''

  // Create area path (filled below the line)
  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : ''

  const latestValue = data[data.length - 1]?.value || 0
  const firstValue = data[0]?.value || 0
  const change = latestValue - firstValue
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable'

  return (
    <div className="line-chart" data-testid={`chart-${label.toLowerCase().replace(' ', '-')}`}>
      <div className="chart-header">
        <span className="chart-label">{label}</span>
        <span className={`chart-trend trend-${trend}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          {change > 0 ? '+' : ''}{change.toFixed(1)}{unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" preserveAspectRatio="none">
        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="chart-grid-line" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="chart-grid-line" />

        {/* Area fill */}
        {areaD && (
          <path
            d={areaD}
            fill={`url(#gradient-${label.replace(' ', '-')})`}
            className="chart-area"
          />
        )}

        {/* Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="chart-line"
          />
        )}

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i} className="chart-point-group">
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill={color}
              className="chart-point"
            />
            <title>{`${point.date}: ${point.value}${unit} (${point.count} tests)`}</title>
          </g>
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${label.replace(' ', '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
      <div className="chart-footer">
        <span className="chart-min">{minVal.toFixed(0)}{unit}</span>
        <span className="chart-current">Current: {latestValue.toFixed(0)}{unit}</span>
        <span className="chart-max">{calculatedMax.toFixed(0)}{unit}</span>
      </div>
    </div>
  )
}

function BarChart({ data, color, unit }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <span className="chart-empty-text">No data yet</span>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="bar-chart" data-testid="bar-chart">
      {data.map((item, index) => {
        const heightPercent = (item.value / maxValue) * 100

        return (
          <div key={index} className="bar-chart-item">
            <div className="bar-chart-bar-container">
              <div
                className="bar-chart-bar"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: color,
                }}
                title={`${item.label}: ${item.value}${unit} (${item.count} tests)`}
              />
            </div>
            <span className="bar-chart-label">{item.label}</span>
            <span className="bar-chart-value">{item.value}{unit}</span>
          </div>
        )
      })}
    </div>
  )
}

interface TimeRangeTabsProps {
  activeRange: 'daily' | 'weekly' | 'monthly'
  onRangeChange: (range: 'daily' | 'weekly' | 'monthly') => void
}

function TimeRangeTabs({ activeRange, onRangeChange }: TimeRangeTabsProps) {
  return (
    <div className="time-range-tabs" data-testid="time-range-tabs">
      {(['daily', 'weekly', 'monthly'] as const).map(range => (
        <button
          key={range}
          className={`time-range-tab ${activeRange === range ? 'active' : ''}`}
          onClick={() => onRangeChange(range)}
          aria-pressed={activeRange === range}
        >
          {range.charAt(0).toUpperCase() + range.slice(1)}
        </button>
      ))}
    </div>
  )
}

export function ProfileCharts({ wpmTrend, accuracyTrend }: ProfileChartsProps) {
  const [timeRange, setTimeRange] = React.useState<'daily' | 'weekly' | 'monthly'>('weekly')

  if (!wpmTrend && !accuracyTrend) {
    return null
  }

  const wpmData = wpmTrend?.[timeRange] || []
  const accuracyData = accuracyTrend?.[timeRange] || []

  // Prepare bar chart data for comparison
  const comparisonData = wpmData.slice(-7).map(point => ({
    label: new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: point.value,
    count: point.count,
  }))

  return (
    <section className="profile-section" aria-labelledby="charts-heading">
      <h2 id="charts-heading" className="section-title">
        Performance Charts
      </h2>

      <TimeRangeTabs activeRange={timeRange} onRangeChange={setTimeRange} />

      <div className="charts-container" data-testid="charts-container">
        <div className="chart-card">
          <h3 className="chart-title">WPM Trend</h3>
          <LineChart
            data={wpmData}
            label="WPM"
            color="var(--brand-blue)"
            unit=""
          />
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Accuracy Trend</h3>
          <LineChart
            data={accuracyData}
            label="Accuracy"
            color="var(--brand-orange)"
            unit="%"
            maxValue={100}
          />
        </div>

        {comparisonData.length > 0 && (
          <div className="chart-card chart-card-wide">
            <h3 className="chart-title">Recent WPM by Day</h3>
            <BarChart
              data={comparisonData}
              color="var(--brand-blue)"
              unit=" WPM"
            />
          </div>
        )}
      </div>
    </section>
  )
}

// Need to import React for useState
import * as React from 'react'

export default ProfileCharts
