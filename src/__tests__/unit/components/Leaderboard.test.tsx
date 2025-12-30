import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Leaderboard, MiniLeaderboard } from '@/components/Leaderboard'

// Mock the leaderboard-api
vi.mock('@/lib/leaderboard-api', () => ({
  getLeaderboard: vi.fn().mockResolvedValue({
    entries: [
      {
        rank: 1,
        userId: 'user_1',
        username: 'TypeMaster',
        wpm: 95,
        accuracy: 98,
        testsCompleted: 50,
        bestWpm: 95,
        averageWpm: 85,
        lastActive: new Date(),
      },
      {
        rank: 2,
        userId: 'user_2',
        username: 'CodeNinja',
        wpm: 88,
        accuracy: 96,
        testsCompleted: 45,
        bestWpm: 88,
        averageWpm: 78,
        lastActive: new Date(),
      },
      {
        rank: 3,
        userId: 'user_3',
        username: 'SpeedyDev',
        wpm: 82,
        accuracy: 95,
        testsCompleted: 30,
        bestWpm: 82,
        averageWpm: 72,
        lastActive: new Date(),
      },
    ],
    total: 3,
    filters: { timeFrame: 'weekly', limit: 10 },
  }),
  formatRank: vi.fn((rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }),
  getRankSuffix: vi.fn((rank) => `${rank}st`),
}))

describe('Leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<Leaderboard />)
    expect(screen.getByTestId('leaderboard-loading')).toBeInTheDocument()
  })

  it('renders leaderboard after loading', async () => {
    render(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByTestId('leaderboard')).toBeInTheDocument()
    })

    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
  })

  it('displays timeframe tabs when showFilters is true', async () => {
    render(<Leaderboard showFilters={true} />)

    await waitFor(() => {
      expect(screen.getByTestId('timeframe-tabs')).toBeInTheDocument()
    })

    expect(screen.getByTestId('tab-daily')).toBeInTheDocument()
    expect(screen.getByTestId('tab-weekly')).toBeInTheDocument()
    expect(screen.getByTestId('tab-monthly')).toBeInTheDocument()
    expect(screen.getByTestId('tab-alltime')).toBeInTheDocument()
  })

  it('hides filters when showFilters is false', async () => {
    render(<Leaderboard showFilters={false} />)

    await waitFor(() => {
      expect(screen.getByTestId('leaderboard')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('leaderboard-filters')).not.toBeInTheDocument()
  })

  it('displays leaderboard entries', async () => {
    render(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByTestId('leaderboard-list')).toBeInTheDocument()
    })

    expect(screen.getByText('TypeMaster')).toBeInTheDocument()
    expect(screen.getByText('CodeNinja')).toBeInTheDocument()
    expect(screen.getByText('SpeedyDev')).toBeInTheDocument()
  })

  it('displays rank badges', async () => {
    render(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByTestId('leaderboard-row-1')).toBeInTheDocument()
    })

    expect(screen.getByTestId('leaderboard-row-2')).toBeInTheDocument()
    expect(screen.getByTestId('leaderboard-row-3')).toBeInTheDocument()
  })

  it('highlights current user', async () => {
    render(<Leaderboard currentUserId="user_2" />)

    await waitFor(() => {
      expect(screen.getByText('CodeNinja')).toBeInTheDocument()
    })

    const row = screen.getByTestId('leaderboard-row-2')
    expect(row).toHaveClass('current-user')
    expect(screen.getByText('(You)')).toBeInTheDocument()
  })

  it('shows user rank when current user is provided', async () => {
    render(<Leaderboard currentUserId="user_2" />)

    await waitFor(() => {
      expect(screen.getByTestId('user-rank')).toBeInTheDocument()
    })
  })

  it('changes timeframe on tab click', async () => {
    const user = userEvent.setup()
    const { getLeaderboard } = await import('@/lib/leaderboard-api')

    render(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByTestId('timeframe-tabs')).toBeInTheDocument()
    })

    const dailyTab = screen.getByTestId('tab-daily')
    await user.click(dailyTab)

    // getLeaderboard should be called again with new timeFrame
    expect(getLeaderboard).toHaveBeenCalledWith(
      expect.objectContaining({ timeFrame: 'daily' })
    )
  })

  it('shows empty state when no entries', async () => {
    const { getLeaderboard } = await import('@/lib/leaderboard-api')
    vi.mocked(getLeaderboard).mockResolvedValueOnce({
      entries: [],
      total: 0,
      filters: { timeFrame: 'weekly' },
    })

    render(<Leaderboard />)

    await waitFor(() => {
      expect(screen.getByTestId('leaderboard-empty')).toBeInTheDocument()
    })

    expect(screen.getByText(/No entries yet/)).toBeInTheDocument()
  })

  it('applies custom className', async () => {
    render(<Leaderboard className="custom-class" />)

    await waitFor(() => {
      const leaderboard = screen.getByTestId('leaderboard')
      expect(leaderboard).toHaveClass('custom-class')
    })
  })
})

describe('MiniLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders mini leaderboard', async () => {
    render(<MiniLeaderboard />)

    await waitFor(() => {
      expect(screen.getByTestId('mini-leaderboard')).toBeInTheDocument()
    })
  })

  it('displays title based on timeframe', async () => {
    render(<MiniLeaderboard timeFrame="weekly" />)

    await waitFor(() => {
      expect(screen.getByText('Top This Week')).toBeInTheDocument()
    })
  })

  it('displays entries in compact format', async () => {
    render(<MiniLeaderboard />)

    await waitFor(() => {
      expect(screen.getByText('TypeMaster')).toBeInTheDocument()
      expect(screen.getByText('95 WPM')).toBeInTheDocument()
    })
  })

  it('respects limit prop', async () => {
    const { getLeaderboard } = await import('@/lib/leaderboard-api')

    render(<MiniLeaderboard limit={3} />)

    await waitFor(() => {
      expect(getLeaderboard).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 3 })
      )
    })
  })
})
