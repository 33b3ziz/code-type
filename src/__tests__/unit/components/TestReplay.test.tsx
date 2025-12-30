import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ReplayComparison, TestReplay } from '@/components/TestReplay'

// Mock formatDate
vi.mock('@/lib/results-api', () => ({
  formatDuration: vi.fn((s) => `${s}s`),
  formatDate: vi.fn(() => 'Jan 15, 2024'),
}))

describe('TestReplay', () => {
  const defaultTest = {
    id: 1,
    snippetId: 123,
    snippetTitle: 'Array Methods',
    language: 'javascript' as const,
    difficulty: 'intermediate' as const,
    previousWpm: 65,
    previousAccuracy: 94,
    completedAt: new Date('2024-01-15'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders test replay component', () => {
    render(<TestReplay test={defaultTest} onStartReplay={() => {}} />)

    expect(screen.getByTestId('test-replay')).toBeInTheDocument()
    expect(screen.getByText('Replay Test')).toBeInTheDocument()
  })

  it('displays test info', () => {
    render(<TestReplay test={defaultTest} onStartReplay={() => {}} />)

    expect(screen.getByTestId('replay-info')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Intermediate')).toBeInTheDocument()
    expect(screen.getByText('Array Methods')).toBeInTheDocument()
  })

  it('displays previous performance', () => {
    render(<TestReplay test={defaultTest} onStartReplay={() => {}} />)

    expect(screen.getByTestId('replay-previous')).toBeInTheDocument()
    expect(screen.getByText('65')).toBeInTheDocument()
    expect(screen.getByText('94%')).toBeInTheDocument()
  })

  it('shows challenge targets', () => {
    render(<TestReplay test={defaultTest} onStartReplay={() => {}} />)

    expect(screen.getByTestId('replay-challenge')).toBeInTheDocument()
    expect(screen.getByText(/66\+ WPM/)).toBeInTheDocument() // Beat by 1
  })

  it('calls onStartReplay when button clicked', () => {
    const onStartReplay = vi.fn()
    render(<TestReplay test={defaultTest} onStartReplay={onStartReplay} />)

    const startBtn = screen.getByTestId('start-replay-btn')
    fireEvent.click(startBtn)

    expect(onStartReplay).toHaveBeenCalledWith(123)
  })

  it('shows close button when onClose provided', () => {
    const onClose = vi.fn()
    render(<TestReplay test={defaultTest} onStartReplay={() => {}} onClose={onClose} />)

    const closeBtn = screen.getByLabelText('Close replay')
    fireEvent.click(closeBtn)

    expect(onClose).toHaveBeenCalled()
  })

  it('shows code preview when available', () => {
    const testWithCode = {
      ...defaultTest,
      snippetCode: 'const arr = [1, 2, 3];',
    }
    render(<TestReplay test={testWithCode} onStartReplay={() => {}} />)

    expect(screen.getByTestId('replay-code-preview')).toBeInTheDocument()
    expect(screen.getByText('Preview Code')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <TestReplay
        test={defaultTest}
        onStartReplay={() => {}}
        className="custom-class"
      />
    )

    expect(screen.getByTestId('test-replay')).toHaveClass('custom-class')
  })
})

describe('ReplayComparison', () => {
  const defaultPrevious = { wpm: 65, accuracy: 94 }

  it('renders comparison component', () => {
    const newResult = { wpm: 70, accuracy: 96 }
    render(
      <ReplayComparison
        previousResult={defaultPrevious}
        newResult={newResult}
        onPlayAgain={() => {}}
        onNewTest={() => {}}
      />
    )

    expect(screen.getByTestId('replay-comparison')).toBeInTheDocument()
  })

  it('shows improvement message when better', () => {
    const newResult = { wpm: 75, accuracy: 98 }
    render(
      <ReplayComparison
        previousResult={defaultPrevious}
        newResult={newResult}
        onPlayAgain={() => {}}
        onNewTest={() => {}}
      />
    )

    expect(screen.getByText(/Beat Your Previous Score/)).toBeInTheDocument()
  })

  it('shows encouragement when not improved', () => {
    const newResult = { wpm: 60, accuracy: 90 }
    render(
      <ReplayComparison
        previousResult={defaultPrevious}
        newResult={newResult}
        onPlayAgain={() => {}}
        onNewTest={() => {}}
      />
    )

    expect(screen.getByText(/Good Effort/)).toBeInTheDocument()
  })

  it('displays both results for comparison', () => {
    const newResult = { wpm: 70, accuracy: 96 }
    render(
      <ReplayComparison
        previousResult={defaultPrevious}
        newResult={newResult}
        onPlayAgain={() => {}}
        onNewTest={() => {}}
      />
    )

    // Previous values
    expect(screen.getByText('65')).toBeInTheDocument()
    expect(screen.getByText('94%')).toBeInTheDocument()
    // New values
    expect(screen.getByText('70')).toBeInTheDocument()
    expect(screen.getByText('96%')).toBeInTheDocument()
  })

  it('calls onPlayAgain when button clicked', () => {
    const onPlayAgain = vi.fn()
    render(
      <ReplayComparison
        previousResult={defaultPrevious}
        newResult={{ wpm: 70, accuracy: 96 }}
        onPlayAgain={onPlayAgain}
        onNewTest={() => {}}
      />
    )

    const playAgainBtn = screen.getByTestId('play-again-btn')
    fireEvent.click(playAgainBtn)

    expect(onPlayAgain).toHaveBeenCalled()
  })

  it('shows positive diff for improvement', () => {
    const newResult = { wpm: 75, accuracy: 98 }
    render(
      <ReplayComparison
        previousResult={defaultPrevious}
        newResult={newResult}
        onPlayAgain={() => {}}
        onNewTest={() => {}}
      />
    )

    expect(screen.getByText('+10')).toBeInTheDocument() // WPM diff
  })
})
