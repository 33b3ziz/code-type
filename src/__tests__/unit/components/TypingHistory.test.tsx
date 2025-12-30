import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TypingHistory } from '@/components/TypingHistory'

// Mock the results-api
vi.mock('@/lib/results-api', () => ({
  getRecentResults: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 'user_1',
      snippetId: 1,
      wpm: 65,
      rawWpm: 70,
      accuracy: 95,
      duration: 60,
      completedAt: new Date('2024-01-15'),
      snippet: {
        title: 'Test Snippet',
        language: 'javascript',
        difficulty: 'intermediate',
      },
    },
    {
      id: 2,
      userId: 'user_1',
      snippetId: 2,
      wpm: 55,
      rawWpm: 60,
      accuracy: 92,
      duration: 45,
      completedAt: new Date('2024-01-14'),
      snippet: {
        title: 'Another Snippet',
        language: 'typescript',
        difficulty: 'advanced',
      },
    },
    {
      id: 3,
      userId: 'user_1',
      snippetId: 3,
      wpm: 45,
      rawWpm: 50,
      accuracy: 88,
      duration: 30,
      completedAt: new Date('2024-01-13'),
      snippet: {
        title: 'Python Snippet',
        language: 'python',
        difficulty: 'beginner',
      },
    },
  ]),
  formatDuration: vi.fn((seconds) => `${seconds}s`),
  formatDate: vi.fn(() => 'Jan 15'),
}))

describe('TypingHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<TypingHistory userId="user_1" />)
    expect(screen.getByTestId('typing-history-loading')).toBeInTheDocument()
  })

  it('renders history list after loading', async () => {
    render(<TypingHistory userId="user_1" />)

    await waitFor(() => {
      expect(screen.getByTestId('typing-history')).toBeInTheDocument()
    })

    expect(screen.getByTestId('history-list')).toBeInTheDocument()
  })

  it('displays filter controls', async () => {
    render(<TypingHistory userId="user_1" />)

    await waitFor(() => {
      expect(screen.getByTestId('history-filters')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Language:')).toBeInTheDocument()
    expect(screen.getByLabelText('Difficulty:')).toBeInTheDocument()
  })

  it('shows test results with correct data', async () => {
    render(<TypingHistory userId="user_1" />)

    await waitFor(() => {
      expect(screen.getByTestId('history-list')).toBeInTheDocument()
    })

    expect(screen.getByText('65')).toBeInTheDocument() // WPM
    expect(screen.getByText('95%')).toBeInTheDocument() // Accuracy
  })

  it('filters by language', async () => {
    const user = userEvent.setup()
    render(<TypingHistory userId="user_1" />)

    await waitFor(() => {
      expect(screen.getByTestId('history-filters')).toBeInTheDocument()
    })

    const languageSelect = screen.getByLabelText('Language:')
    await user.selectOptions(languageSelect, 'javascript')

    // The filter should now only show JavaScript results
    await waitFor(() => {
      const summary = screen.getByTestId('history-summary')
      expect(summary.textContent).toContain('1')
    })
  })

  it('filters by difficulty', async () => {
    const user = userEvent.setup()
    render(<TypingHistory userId="user_1" />)

    await waitFor(() => {
      expect(screen.getByTestId('history-filters')).toBeInTheDocument()
    })

    const difficultySelect = screen.getByLabelText('Difficulty:')
    await user.selectOptions(difficultySelect, 'advanced')

    await waitFor(() => {
      const summary = screen.getByTestId('history-summary')
      expect(summary.textContent).toContain('1')
    })
  })

  it('displays history summary', async () => {
    render(<TypingHistory userId="user_1" />)

    await waitFor(() => {
      expect(screen.getByTestId('history-summary')).toBeInTheDocument()
    })

    expect(screen.getByText(/Showing \d+ of \d+ tests/)).toBeInTheDocument()
  })

  it('calls onViewDetails when button clicked', async () => {
    const onViewDetails = vi.fn()
    const user = userEvent.setup()
    render(<TypingHistory userId="user_1" onViewDetails={onViewDetails} />)

    await waitFor(() => {
      expect(screen.getByTestId('history-list')).toBeInTheDocument()
    })

    const viewButtons = screen.getAllByText('View Details')
    await user.click(viewButtons[0])

    expect(onViewDetails).toHaveBeenCalledWith(1)
  })

  it('applies custom className', async () => {
    render(<TypingHistory userId="user_1" className="custom-class" />)

    await waitFor(() => {
      const history = screen.getByTestId('typing-history')
      expect(history).toHaveClass('custom-class')
    })
  })

  it('shows empty state when no results', async () => {
    const { getRecentResults } = await import('@/lib/results-api')
    vi.mocked(getRecentResults).mockResolvedValueOnce([])

    render(<TypingHistory userId="user_1" />)

    await waitFor(() => {
      expect(screen.getByTestId('history-empty')).toBeInTheDocument()
    })

    expect(screen.getByText(/No tests found/)).toBeInTheDocument()
  })

  it('handles pagination', async () => {
    const { getRecentResults } = await import('@/lib/results-api')
    const manyResults = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      userId: 'user_1',
      snippetId: i,
      wpm: 50 + i,
      rawWpm: 55 + i,
      accuracy: 90,
      symbolAccuracy: 92,
      keywordAccuracy: 88,
      charactersTyped: 200,
      correctCharacters: 180,
      incorrectCharacters: 20,
      backspaceCount: 5,
      duration: 60,
      completedAt: new Date(),
      isStrictMode: false,
      snippet: { title: `Snippet ${i}`, language: 'javascript' as const, difficulty: 'beginner' as const },
    }))
    vi.mocked(getRecentResults).mockResolvedValueOnce(manyResults)

    const user = userEvent.setup()
    render(<TypingHistory userId="user_1" pageSize={10} />)

    await waitFor(() => {
      expect(screen.getByTestId('history-pagination')).toBeInTheDocument()
    })

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()

    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
  })
})
