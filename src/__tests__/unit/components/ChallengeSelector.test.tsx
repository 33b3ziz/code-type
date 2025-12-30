import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  ChallengeSelector,
  CHALLENGE_OPTIONS,
  getChallengeDuration,
  formatDuration,
} from '@/components/ChallengeSelector'

describe('ChallengeSelector', () => {
  describe('rendering', () => {
    it('renders with label by default', () => {
      render(<ChallengeSelector value="60s" onValueChange={() => {}} />)

      expect(screen.getByText('Challenge')).toBeInTheDocument()
    })

    it('hides label when showLabel is false', () => {
      render(
        <ChallengeSelector
          value="60s"
          onValueChange={() => {}}
          showLabel={false}
        />
      )

      expect(screen.queryByText('Challenge')).not.toBeInTheDocument()
    })

    it('shows current value', () => {
      render(<ChallengeSelector value="30s" onValueChange={() => {}} />)

      expect(screen.getByText('30 Seconds')).toBeInTheDocument()
    })

    it('shows endless option', () => {
      render(<ChallengeSelector value="endless" onValueChange={() => {}} />)

      expect(screen.getByText('Endless')).toBeInTheDocument()
    })
  })

  describe('options', () => {
    it('has correct number of options', () => {
      expect(CHALLENGE_OPTIONS).toHaveLength(5)
    })

    it('includes all expected challenge types', () => {
      const types = CHALLENGE_OPTIONS.map((o) => o.value)
      expect(types).toContain('30s')
      expect(types).toContain('60s')
      expect(types).toContain('120s')
      expect(types).toContain('endless')
      expect(types).toContain('custom')
    })

    it('each option has label, description, icon, and duration', () => {
      CHALLENGE_OPTIONS.forEach((option) => {
        expect(option.label).toBeTruthy()
        expect(option.description).toBeTruthy()
        expect(option.icon).toBeTruthy()
        // duration can be null for endless/custom
        expect(option.duration === null || typeof option.duration === 'number').toBe(true)
      })
    })

    it('has correct durations for timed challenges', () => {
      const durations = CHALLENGE_OPTIONS.reduce((acc, o) => {
        acc[o.value] = o.duration
        return acc
      }, {} as Record<string, number | null>)

      expect(durations['30s']).toBe(30)
      expect(durations['60s']).toBe(60)
      expect(durations['120s']).toBe(120)
      expect(durations['endless']).toBeNull()
      expect(durations['custom']).toBeNull()
    })
  })

  describe('interaction', () => {
    it('calls onValueChange when selection changes', () => {
      const onValueChange = vi.fn()

      render(<ChallengeSelector value="60s" onValueChange={onValueChange} />)

      // Open the select
      const trigger = screen.getByRole('combobox')
      fireEvent.click(trigger)

      // Select 30 Seconds
      const option = screen.getByRole('option', { name: /30 seconds/i })
      fireEvent.click(option)

      expect(onValueChange).toHaveBeenCalledWith('30s')
    })

    it('is disabled when disabled prop is true', () => {
      render(
        <ChallengeSelector
          value="60s"
          onValueChange={() => {}}
          disabled
        />
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })
  })

  describe('custom duration', () => {
    it('shows custom duration input when custom is selected', () => {
      render(
        <ChallengeSelector
          value="custom"
          onValueChange={() => {}}
          customDuration={90}
          onCustomDurationChange={() => {}}
        />
      )

      const input = screen.getByRole('spinbutton', { name: /custom duration/i })
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue(90)
    })

    it('hides custom duration input for non-custom values', () => {
      render(
        <ChallengeSelector
          value="60s"
          onValueChange={() => {}}
          customDuration={90}
          onCustomDurationChange={() => {}}
        />
      )

      expect(
        screen.queryByRole('spinbutton', { name: /custom duration/i })
      ).not.toBeInTheDocument()
    })

    it('calls onCustomDurationChange when custom duration changes', () => {
      const onCustomDurationChange = vi.fn()

      render(
        <ChallengeSelector
          value="custom"
          onValueChange={() => {}}
          customDuration={60}
          onCustomDurationChange={onCustomDurationChange}
        />
      )

      const input = screen.getByRole('spinbutton', { name: /custom duration/i })
      fireEvent.change(input, { target: { value: '120' } })

      expect(onCustomDurationChange).toHaveBeenCalledWith(120)
    })
  })

  describe('accessibility', () => {
    it('has proper label association', () => {
      render(<ChallengeSelector value="60s" onValueChange={() => {}} />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('id', 'challenge-select')
    })

    it('custom input has aria-label', () => {
      render(
        <ChallengeSelector
          value="custom"
          onValueChange={() => {}}
          onCustomDurationChange={() => {}}
        />
      )

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('aria-label', 'Custom duration in seconds')
    })
  })
})

describe('getChallengeDuration', () => {
  it('returns correct duration for 30s', () => {
    expect(getChallengeDuration('30s')).toBe(30)
  })

  it('returns correct duration for 60s', () => {
    expect(getChallengeDuration('60s')).toBe(60)
  })

  it('returns correct duration for 120s', () => {
    expect(getChallengeDuration('120s')).toBe(120)
  })

  it('returns null for endless', () => {
    expect(getChallengeDuration('endless')).toBeNull()
  })

  it('returns custom duration for custom type', () => {
    expect(getChallengeDuration('custom', 90)).toBe(90)
  })

  it('returns default 60 for custom without duration', () => {
    expect(getChallengeDuration('custom')).toBe(60)
  })
})

describe('formatDuration', () => {
  it('returns Endless for null', () => {
    expect(formatDuration(null)).toBe('Endless')
  })

  it('formats seconds for values under 60', () => {
    expect(formatDuration(30)).toBe('30s')
    expect(formatDuration(45)).toBe('45s')
  })

  it('formats minutes for exact minute values', () => {
    expect(formatDuration(60)).toBe('1m')
    expect(formatDuration(120)).toBe('2m')
  })

  it('formats minutes and seconds for mixed values', () => {
    expect(formatDuration(90)).toBe('1m 30s')
    expect(formatDuration(150)).toBe('2m 30s')
  })
})
