import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { UserProfile } from '@/components/UserProfile'

// Mock the API functions
vi.mock('@/lib/results-api', () => ({
  getUserStats: vi.fn().mockResolvedValue({
    totalTests: 25,
    averageWpm: 55,
    averageAccuracy: 92,
    bestWpm: 78,
    bestAccuracy: 100,
    totalTimeSpent: 3600,
    testsThisWeek: 8,
    improvement: 5,
  }),
}))

vi.mock('@/lib/analytics-api', () => ({
  getLanguageStats: vi.fn().mockResolvedValue({
    languages: [
      {
        language: 'javascript',
        totalTests: 12,
        averageWpm: 58,
        averageAccuracy: 93,
        bestWpm: 78,
        bestAccuracy: 100,
        totalTimeSpent: 1800,
        lastPlayed: new Date(),
        trend: 'up',
        recentImprovement: 3,
      },
      {
        language: 'typescript',
        totalTests: 8,
        averageWpm: 52,
        averageAccuracy: 91,
        bestWpm: 70,
        bestAccuracy: 98,
        totalTimeSpent: 1200,
        lastPlayed: new Date(),
        trend: 'stable',
        recentImprovement: 0,
      },
      {
        language: 'python',
        totalTests: 5,
        averageWpm: 48,
        averageAccuracy: 88,
        bestWpm: 60,
        bestAccuracy: 95,
        totalTimeSpent: 600,
        lastPlayed: new Date(),
        trend: 'down',
        recentImprovement: -2,
      },
    ],
    strongest: 'javascript',
    needsWork: 'python',
    mostPracticed: 'javascript',
  }),
  getAccuracyTrend: vi.fn().mockResolvedValue({
    daily: [],
    weekly: [],
    monthly: [],
    overall: { current: 92, previous: 88, change: 4, trend: 'up' },
  }),
  getWPMTrend: vi.fn().mockResolvedValue({
    daily: [],
    weekly: [],
    monthly: [],
    overall: { current: 55, previous: 50, change: 5, trend: 'up' },
  }),
  identifyWeaknesses: vi.fn().mockResolvedValue([
    {
      type: 'symbols',
      description: 'Symbol accuracy needs improvement',
      severity: 'medium',
      suggestion: 'Practice tests with more symbols',
    },
  ]),
  getLanguageDisplayName: vi.fn((lang) => {
    const names: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
    }
    return names[lang] || lang
  }),
}))

vi.mock('@/lib/leaderboard-api', () => ({
  getUserRank: vi.fn().mockResolvedValue(42),
}))

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<UserProfile userId="user_1" username="TestUser" />)
    expect(screen.getByTestId('user-profile-loading')).toBeInTheDocument()
  })

  it('renders profile header with username', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByText('TestUser')).toBeInTheDocument()
    })
  })

  it('displays user avatar with initial', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument()
    })
  })

  it('shows global rank', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByText(/Global Rank: #42/)).toBeInTheDocument()
    })
  })

  it('renders stats grid with all stats', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByTestId('stats-grid')).toBeInTheDocument()
      expect(screen.getByTestId('stat-card-tests')).toBeInTheDocument()
      expect(screen.getByTestId('stat-card-speed')).toBeInTheDocument()
      expect(screen.getByTestId('stat-card-trophy')).toBeInTheDocument()
      expect(screen.getByTestId('stat-card-accuracy')).toBeInTheDocument()
    })
  })

  it('renders trends container', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByTestId('trends-container')).toBeInTheDocument()
    })
  })

  it('renders language performance section', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByTestId('language-grid')).toBeInTheDocument()
      expect(screen.getByTestId('language-card-javascript')).toBeInTheDocument()
      expect(screen.getByTestId('language-card-typescript')).toBeInTheDocument()
      expect(screen.getByTestId('language-card-python')).toBeInTheDocument()
    })
  })

  it('shows strongest language badge', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByText('Strongest')).toBeInTheDocument()
    })
  })

  it('shows needs work badge', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByText('Needs Work')).toBeInTheDocument()
    })
  })

  it('renders weaknesses section', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByTestId('weaknesses-list')).toBeInTheDocument()
      expect(screen.getByText('Symbol accuracy needs improvement')).toBeInTheDocument()
    })
  })

  it('renders activity summary', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByTestId('activity-summary')).toBeInTheDocument()
      expect(screen.getByText(/tests completed this week/)).toBeInTheDocument()
    })
  })

  it('shows improvement stat when positive', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByText(/\+5 WPM improvement/)).toBeInTheDocument()
    })
  })

  it('applies custom className', async () => {
    render(<UserProfile userId="user_1" username="TestUser" className="custom-class" />)

    await waitFor(() => {
      const profile = screen.getByTestId('user-profile')
      expect(profile).toHaveClass('custom-class')
    })
  })

  it('renders section headings for accessibility', async () => {
    render(<UserProfile userId="user_1" username="TestUser" />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Performance Trends' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Language Performance' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Areas for Improvement' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Recent Activity' })).toBeInTheDocument()
    })
  })
})
