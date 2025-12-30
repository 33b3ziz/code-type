import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { TrendPoint } from '@/lib/analytics-api'
import {
  LanguageComparisonChart,
  PerformanceChart,
  Sparkline,
  StatChange,
} from '@/components/PerformanceChart'

describe('PerformanceChart', () => {
  const sampleData: Array<TrendPoint> = [
    { date: '2024-01-01', value: 50, count: 3 },
    { date: '2024-01-02', value: 55, count: 2 },
    { date: '2024-01-03', value: 52, count: 4 },
    { date: '2024-01-04', value: 60, count: 3 },
    { date: '2024-01-05', value: 58, count: 2 },
  ]

  it('renders chart with data', () => {
    render(<PerformanceChart data={sampleData} />)

    expect(screen.getByTestId('performance-chart')).toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    render(<PerformanceChart data={[]} />)

    expect(screen.getByTestId('performance-chart-empty')).toBeInTheDocument()
    expect(screen.getByText('No data to display')).toBeInTheDocument()
  })

  it('renders bar chart by default', () => {
    render(<PerformanceChart data={sampleData} type="bar" />)

    expect(screen.getByTestId('chart-bars')).toBeInTheDocument()
  })

  it('renders line chart when specified', () => {
    render(<PerformanceChart data={sampleData} type="line" />)

    expect(screen.getByTestId('chart-line')).toBeInTheDocument()
  })

  it('shows Y-axis labels when enabled', () => {
    render(<PerformanceChart data={sampleData} showLabels={true} />)

    expect(screen.getByTestId('chart-y-axis')).toBeInTheDocument()
  })

  it('shows X-axis labels when enabled', () => {
    render(<PerformanceChart data={sampleData} showLabels={true} />)

    expect(screen.getByTestId('chart-x-axis')).toBeInTheDocument()
  })

  it('renders correct number of bars', () => {
    render(<PerformanceChart data={sampleData} type="bar" />)

    // Each data point should have a bar
    for (let i = 0; i < sampleData.length; i++) {
      expect(screen.getByTestId(`bar-${i}`)).toBeInTheDocument()
    }
  })

  it('applies custom height', () => {
    render(<PerformanceChart data={sampleData} height={200} />)

    const chart = screen.getByTestId('performance-chart')
    expect(chart).toHaveStyle({ height: '200px' })
  })

  it('applies custom className', () => {
    render(<PerformanceChart data={sampleData} className="custom-chart" />)

    expect(screen.getByTestId('performance-chart')).toHaveClass('custom-chart')
  })
})

describe('Sparkline', () => {
  it('renders sparkline with data', () => {
    render(<Sparkline data={[10, 15, 12, 18, 20]} />)

    expect(screen.getByTestId('sparkline')).toBeInTheDocument()
  })

  it('shows empty state for insufficient data', () => {
    render(<Sparkline data={[10]} />)

    expect(screen.getByText('--')).toBeInTheDocument()
  })

  it('indicates upward trend', () => {
    render(<Sparkline data={[10, 15, 20, 25, 30]} />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('data-trend', 'up')
  })

  it('indicates downward trend', () => {
    render(<Sparkline data={[30, 25, 20, 15, 10]} />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('data-trend', 'down')
  })

  it('indicates stable trend', () => {
    render(<Sparkline data={[20, 22, 18, 21, 20]} />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('data-trend', 'stable')
  })

  it('applies custom dimensions', () => {
    render(<Sparkline data={[10, 20, 15]} width={100} height={30} />)

    const sparkline = screen.getByTestId('sparkline')
    expect(sparkline).toHaveAttribute('width', '100')
    expect(sparkline).toHaveAttribute('height', '30')
  })
})

describe('LanguageComparisonChart', () => {
  const sampleData = [
    { language: 'JavaScript', value: 65, color: '#f7df1e' },
    { language: 'TypeScript', value: 55, color: '#3178c6' },
    { language: 'Python', value: 70, color: '#3776ab' },
  ]

  it('renders comparison chart', () => {
    render(<LanguageComparisonChart data={sampleData} />)

    expect(screen.getByTestId('language-comparison-chart')).toBeInTheDocument()
  })

  it('renders all languages', () => {
    render(<LanguageComparisonChart data={sampleData} />)

    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('renders comparison bars', () => {
    render(<LanguageComparisonChart data={sampleData} />)

    expect(screen.getByTestId('comparison-bar-javascript')).toBeInTheDocument()
    expect(screen.getByTestId('comparison-bar-typescript')).toBeInTheDocument()
    expect(screen.getByTestId('comparison-bar-python')).toBeInTheDocument()
  })

  it('displays values with label', () => {
    render(<LanguageComparisonChart data={sampleData} valueLabel=" WPM" />)

    expect(screen.getByText('65 WPM')).toBeInTheDocument()
    expect(screen.getByText('55 WPM')).toBeInTheDocument()
    expect(screen.getByText('70 WPM')).toBeInTheDocument()
  })
})

describe('StatChange', () => {
  it('shows positive change', () => {
    render(<StatChange current={75} previous={65} />)

    const change = screen.getByTestId('stat-change')
    expect(change).toHaveClass('positive')
    expect(change).toHaveTextContent('+10')
  })

  it('shows negative change', () => {
    render(<StatChange current={60} previous={70} />)

    const change = screen.getByTestId('stat-change')
    expect(change).toHaveClass('negative')
    expect(change).toHaveTextContent('-10')
  })

  it('shows neutral for no change', () => {
    render(<StatChange current={65} previous={65} />)

    const change = screen.getByTestId('stat-change')
    expect(change).toHaveClass('neutral')
    expect(change).toHaveTextContent('=')
  })

  it('shows arrow by default', () => {
    render(<StatChange current={75} previous={65} />)

    expect(screen.getByTestId('stat-change')).toHaveTextContent('↑')
  })

  it('hides arrow when disabled', () => {
    render(<StatChange current={75} previous={65} showArrow={false} />)

    expect(screen.getByTestId('stat-change')).not.toHaveTextContent('↑')
  })

  it('displays unit when provided', () => {
    render(<StatChange current={95} previous={90} unit="%" />)

    expect(screen.getByTestId('stat-change')).toHaveTextContent('+5%')
  })
})
