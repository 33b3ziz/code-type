import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type {TestConfig} from '@/components/TestSetup';
import { QuickStart,  TestSetup } from '@/components/TestSetup'

describe('TestSetup', () => {
  describe('rendering', () => {
    it('renders step indicators', () => {
      render(<TestSetup onStart={() => {}} />)

      // Should show 4 steps
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('starts on language selection', () => {
      render(<TestSetup onStart={() => {}} />)

      expect(screen.getByText('Select Language')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('navigates to difficulty step', () => {
      render(<TestSetup onStart={() => {}} />)

      fireEvent.click(screen.getByText('Next'))

      expect(screen.getByText('Select Difficulty')).toBeInTheDocument()
    })

    it('navigates to challenge step', () => {
      render(<TestSetup onStart={() => {}} />)

      // Go to difficulty
      fireEvent.click(screen.getByText('Next'))
      // Go to challenge
      fireEvent.click(screen.getByText('Next'))

      expect(screen.getByText('Select Challenge')).toBeInTheDocument()
    })

    it('navigates to options step', () => {
      render(<TestSetup onStart={() => {}} />)

      // Go through all steps
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))

      expect(screen.getByText('Test Options')).toBeInTheDocument()
    })

    it('can go back to previous steps', () => {
      render(<TestSetup onStart={() => {}} />)

      // Go forward
      fireEvent.click(screen.getByText('Next'))
      expect(screen.getByText('Select Difficulty')).toBeInTheDocument()

      // Go back
      fireEvent.click(screen.getByText('Back'))
      expect(screen.getByText('Select Language')).toBeInTheDocument()
    })

    it('can jump to steps via indicators', () => {
      render(<TestSetup onStart={() => {}} />)

      // Click on step 3 indicator
      fireEvent.click(screen.getByText('3'))

      expect(screen.getByText('Select Challenge')).toBeInTheDocument()
    })
  })

  describe('options step', () => {
    it('shows strict mode toggle', () => {
      render(<TestSetup onStart={() => {}} />)

      // Navigate to options
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))

      expect(screen.getByText('Strict Mode')).toBeInTheDocument()
    })

    it('shows allow backspace toggle', () => {
      render(<TestSetup onStart={() => {}} />)

      // Navigate to options
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))

      expect(screen.getByText('Allow Backspace')).toBeInTheDocument()
    })

    it('shows test summary', () => {
      render(<TestSetup onStart={() => {}} />)

      // Navigate to options
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))

      expect(screen.getByText('Test Summary')).toBeInTheDocument()
    })
  })

  describe('starting test', () => {
    it('calls onStart with config on start', () => {
      const onStart = vi.fn()
      render(<TestSetup onStart={onStart} />)

      // Navigate to options
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))

      // Start test
      fireEvent.click(screen.getByText('Start Test'))

      expect(onStart).toHaveBeenCalledTimes(1)
      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({
          language: expect.any(String),
          difficulty: expect.any(String),
          challengeType: expect.any(String),
          strictMode: expect.any(Boolean),
          allowBackspace: expect.any(Boolean),
        })
      )
    })

    it('includes correct default values', () => {
      const onStart = vi.fn()
      render(<TestSetup onStart={onStart} />)

      // Navigate to options and start
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Next'))
      fireEvent.click(screen.getByText('Start Test'))

      const config = onStart.mock.calls[0][0] as TestConfig
      expect(config.language).toBe('all')
      expect(config.difficulty).toBe('intermediate')
      expect(config.challengeType).toBe('60s')
      expect(config.duration).toBe(60)
      expect(config.strictMode).toBe(false)
      expect(config.allowBackspace).toBe(true)
    })
  })
})

describe('QuickStart', () => {
  it('renders quick start options', () => {
    render(<QuickStart onStart={() => {}} />)

    expect(screen.getByText('60s JavaScript')).toBeInTheDocument()
    expect(screen.getByText('2min TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Quick Python')).toBeInTheDocument()
    expect(screen.getByText('Endless Random')).toBeInTheDocument()
  })

  it('calls onStart with preset config', () => {
    const onStart = vi.fn()
    render(<QuickStart onStart={onStart} />)

    fireEvent.click(screen.getByText('60s JavaScript'))

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'javascript',
        difficulty: 'intermediate',
        challengeType: '60s',
        duration: 60,
      })
    )
  })

  it('endless option has null duration', () => {
    const onStart = vi.fn()
    render(<QuickStart onStart={onStart} />)

    fireEvent.click(screen.getByText('Endless Random'))

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        challengeType: 'endless',
        duration: null,
      })
    )
  })
})
