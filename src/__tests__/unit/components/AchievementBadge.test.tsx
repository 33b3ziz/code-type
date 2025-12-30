import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AchievementBadge, AchievementGrid } from '@/components/AchievementBadge'

describe('AchievementBadge', () => {
  describe('rendering', () => {
    it('renders unlocked achievement', () => {
      render(
        <AchievementBadge
          achievementSlug="speed-demon-40"
          unlockedAt={new Date()}
          showName
        />
      )

      expect(screen.getByText('Speed Demon')).toBeInTheDocument()
    })

    it('renders locked achievement with reduced opacity', () => {
      render(
        <AchievementBadge achievementSlug="speed-demon-40" showName />
      )

      const badge = screen.getByRole('img', {
        name: /speed demon achievement \(locked\)/i,
      })
      expect(badge).toHaveClass('opacity-50', 'grayscale')
    })

    it('returns null for invalid achievement slug', () => {
      const { container } = render(
        <AchievementBadge achievementSlug="non-existent" />
      )

      expect(container.firstChild).toBeNull()
    })

    it('shows description when showDescription is true', () => {
      render(
        <AchievementBadge
          achievementSlug="speed-demon-40"
          showDescription
        />
      )

      expect(
        screen.getByText(/achieve 40 wpm or higher/i)
      ).toBeInTheDocument()
    })

    it('hides description by default', () => {
      render(<AchievementBadge achievementSlug="speed-demon-40" />)

      expect(
        screen.queryByText(/achieve 40 wpm or higher/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('sizes', () => {
    it('renders small size', () => {
      render(
        <AchievementBadge achievementSlug="speed-demon-40" size="sm" />
      )

      const badge = screen.getByRole('img')
      expect(badge).toHaveClass('w-10', 'h-10')
    })

    it('renders medium size (default)', () => {
      render(<AchievementBadge achievementSlug="speed-demon-40" />)

      const badge = screen.getByRole('img')
      expect(badge).toHaveClass('w-14', 'h-14')
    })

    it('renders large size', () => {
      render(
        <AchievementBadge achievementSlug="speed-demon-40" size="lg" />
      )

      const badge = screen.getByRole('img')
      expect(badge).toHaveClass('w-20', 'h-20')
    })
  })

  describe('tiers', () => {
    it('renders bronze tier for low point achievements', () => {
      // speed-demon-40 has 10 points = bronze
      render(
        <AchievementBadge
          achievementSlug="speed-demon-40"
          unlockedAt={new Date()}
        />
      )

      const badge = screen.getByRole('img')
      expect(badge).toHaveClass('border-amber-700/50')
    })

    it('renders silver tier for medium point achievements', () => {
      // lightning-fast-60 has 25 points = silver
      render(
        <AchievementBadge
          achievementSlug="lightning-fast-60"
          unlockedAt={new Date()}
        />
      )

      const badge = screen.getByRole('img')
      expect(badge).toHaveClass('border-slate-400/50')
    })

    it('renders gold tier for high point achievements', () => {
      // supersonic-80 has 50 points = gold
      render(
        <AchievementBadge
          achievementSlug="supersonic-80"
          unlockedAt={new Date()}
        />
      )

      const badge = screen.getByRole('img')
      expect(badge).toHaveClass('border-yellow-500/50')
    })

    it('renders platinum tier for top point achievements', () => {
      // code-wizard-100 has 100 points = platinum
      render(
        <AchievementBadge
          achievementSlug="code-wizard-100"
          unlockedAt={new Date()}
        />
      )

      const badge = screen.getByRole('img')
      expect(badge).toHaveClass('border-cyan-400/50')
    })
  })

  describe('accessibility', () => {
    it('has correct aria-label for locked achievement', () => {
      render(<AchievementBadge achievementSlug="speed-demon-40" />)

      expect(
        screen.getByRole('img', {
          name: /speed demon achievement \(locked\)/i,
        })
      ).toBeInTheDocument()
    })

    it('has correct aria-label for unlocked achievement', () => {
      render(
        <AchievementBadge
          achievementSlug="speed-demon-40"
          unlockedAt={new Date()}
        />
      )

      expect(
        screen.getByRole('img', { name: /speed demon achievement$/i })
      ).toBeInTheDocument()
    })
  })

  describe('unlock date formatting', () => {
    it('shows "today" for achievements unlocked today', () => {
      render(
        <AchievementBadge
          achievementSlug="speed-demon-40"
          unlockedAt={new Date()}
        />
      )

      expect(screen.getByText(/unlocked today/i)).toBeInTheDocument()
    })

    it('shows "yesterday" for achievements unlocked yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      render(
        <AchievementBadge
          achievementSlug="speed-demon-40"
          unlockedAt={yesterday}
        />
      )

      expect(screen.getByText(/unlocked yesterday/i)).toBeInTheDocument()
    })
  })
})

describe('AchievementGrid', () => {
  it('renders all achievements when showLocked is true', () => {
    render(<AchievementGrid unlockedAchievements={[]} showLocked />)

    // Should show all 20 achievements
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBe(20)
  })

  it('renders only unlocked achievements when showLocked is false', () => {
    render(
      <AchievementGrid
        unlockedAchievements={[
          { slug: 'speed-demon-40', unlockedAt: new Date() },
        ]}
        showLocked={false}
      />
    )

    const items = screen.getAllByRole('listitem')
    expect(items.length).toBe(1)
  })

  it('marks unlocked achievements correctly', () => {
    render(
      <AchievementGrid
        unlockedAchievements={[
          { slug: 'speed-demon-40', unlockedAt: new Date() },
        ]}
        showLocked
      />
    )

    // Speed Demon should be unlocked (not have locked class)
    const speedDemonBadge = screen.getByRole('img', {
      name: /speed demon achievement$/i,
    })
    expect(speedDemonBadge).not.toHaveClass('opacity-50')
  })

  it('has accessible list role', () => {
    render(<AchievementGrid unlockedAchievements={[]} />)

    expect(
      screen.getByRole('list', { name: /achievements/i })
    ).toBeInTheDocument()
  })

  it('respects size prop', () => {
    render(
      <AchievementGrid unlockedAchievements={[]} showLocked size="sm" />
    )

    const badges = screen.getAllByRole('img')
    badges.forEach((badge) => {
      expect(badge).toHaveClass('w-10', 'h-10')
    })
  })
})
