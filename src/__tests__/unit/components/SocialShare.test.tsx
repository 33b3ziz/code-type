import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ShareButton, SocialShare, generateShareImage } from '@/components/SocialShare'

// Mock window.open
const mockOpen = vi.fn()
vi.stubGlobal('open', mockOpen)

describe('SocialShare', () => {
  const defaultResult = {
    wpm: 75,
    accuracy: 95,
    language: 'JavaScript',
    difficulty: 'Medium',
    isPersonalBest: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders share component', () => {
    render(<SocialShare result={defaultResult} />)
    expect(screen.getByTestId('social-share')).toBeInTheDocument()
    expect(screen.getByText('Share Your Score')).toBeInTheDocument()
  })

  it('displays share preview with stats', () => {
    render(<SocialShare result={defaultResult} />)

    expect(screen.getByTestId('share-preview')).toBeInTheDocument()
    expect(screen.getByText('75')).toBeInTheDocument() // WPM
    expect(screen.getByText('95%')).toBeInTheDocument() // Accuracy
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('shows personal best badge when applicable', () => {
    render(<SocialShare result={{ ...defaultResult, isPersonalBest: true }} />)

    expect(screen.getByText('Personal Best!')).toBeInTheDocument()
  })

  it('shows streak badge when applicable', () => {
    render(
      <SocialShare
        result={{ ...defaultResult, isStreak: true, streakCount: 5 }}
      />
    )

    expect(screen.getByText('5 Day Streak')).toBeInTheDocument()
  })

  it('renders share buttons', () => {
    render(<SocialShare result={defaultResult} />)

    expect(screen.getByTestId('share-buttons')).toBeInTheDocument()
    expect(screen.getByTestId('share-twitter')).toBeInTheDocument()
    expect(screen.getByTestId('share-linkedin')).toBeInTheDocument()
    expect(screen.getByTestId('share-reddit')).toBeInTheDocument()
    expect(screen.getByTestId('share-copy')).toBeInTheDocument()
  })

  it('opens Twitter share window on click', async () => {
    render(<SocialShare result={defaultResult} />)

    const twitterBtn = screen.getByTestId('share-twitter')
    fireEvent.click(twitterBtn)

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      'share',
      expect.any(String)
    )
  })

  it('opens LinkedIn share window on click', async () => {
    render(<SocialShare result={defaultResult} />)

    const linkedinBtn = screen.getByTestId('share-linkedin')
    fireEvent.click(linkedinBtn)

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('linkedin.com'),
      'share',
      expect.any(String)
    )
  })

  it('opens Reddit share window on click', async () => {
    render(<SocialShare result={defaultResult} />)

    const redditBtn = screen.getByTestId('share-reddit')
    fireEvent.click(redditBtn)

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('reddit.com/submit'),
      'share',
      expect.any(String)
    )
  })

  it('renders copy button', () => {
    render(<SocialShare result={defaultResult} />)

    const copyBtn = screen.getByTestId('share-copy')
    expect(copyBtn).toBeInTheDocument()
    expect(copyBtn).toHaveTextContent('Copy')
  })

  it('applies custom className', () => {
    render(<SocialShare result={defaultResult} className="custom-class" />)

    const share = screen.getByTestId('social-share')
    expect(share).toHaveClass('custom-class')
  })

  it('includes shareable text preview', () => {
    render(<SocialShare result={defaultResult} />)

    // Open the details
    const details = screen.getByText('View shareable text')
    fireEvent.click(details)

    // Should show the share text
    expect(screen.getByText(/WPM: 75/)).toBeInTheDocument()
    expect(screen.getByText(/Accuracy: 95%/)).toBeInTheDocument()
  })
})

describe('ShareButton', () => {
  const defaultResult = {
    wpm: 75,
    accuracy: 95,
    language: 'JavaScript',
    difficulty: 'Medium',
  }

  it('renders share button', () => {
    render(<ShareButton result={defaultResult} />)
    expect(screen.getByTestId('share-button')).toBeInTheDocument()
  })

  it('renders icon variant', () => {
    render(<ShareButton result={defaultResult} variant="icon" />)
    const button = screen.getByTestId('share-button')
    expect(button).toHaveClass('share-button-icon')
  })

  it('renders text variant', () => {
    render(<ShareButton result={defaultResult} variant="text" />)
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('renders full variant', () => {
    render(<ShareButton result={defaultResult} variant="full" />)
    expect(screen.getByText(/Share Result/)).toBeInTheDocument()
  })
})

describe('generateShareImage', () => {
  it('generates image URL with parameters', () => {
    const result = {
      wpm: 75,
      accuracy: 95,
      language: 'JavaScript',
      difficulty: 'Medium',
      isPersonalBest: true,
    }

    const url = generateShareImage(result)

    expect(url).toContain('/api/share-image')
    expect(url).toContain('wpm=75')
    expect(url).toContain('accuracy=95')
    expect(url).toContain('language=JavaScript')
    expect(url).toContain('difficulty=Medium')
    expect(url).toContain('pb=1')
  })

  it('generates URL with personal best false', () => {
    const result = {
      wpm: 50,
      accuracy: 80,
      language: 'Python',
      difficulty: 'Easy',
      isPersonalBest: false,
    }

    const url = generateShareImage(result)

    expect(url).toContain('pb=0')
    expect(url).toContain('language=Python')
  })
})
