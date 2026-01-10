/**
 * Theme Toggle Component
 * Cycles through light, dark, and system themes with smooth animations
 */

import { Monitor, Moon, Sun } from 'lucide-react'

import { useTheme } from './ThemeProvider'

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const

const THEME_LABELS = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
} as const

const THEME_CYCLE = {
  light: 'dark',
  dark: 'system',
  system: 'light',
} as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const Icon = THEME_ICONS[theme]

  const handleToggle = () => {
    setTheme(THEME_CYCLE[theme])
  }

  return (
    <button
      onClick={handleToggle}
      className="relative p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary border border-border hover:border-brand-blue/30 transition-all duration-200 group"
      aria-label={`Current theme: ${THEME_LABELS[theme]}. Click to switch.`}
      title={THEME_LABELS[theme]}
    >
      <Icon
        size={18}
        className="text-muted-foreground group-hover:text-brand-blue transition-colors"
      />
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none glow-blue-sm" />
    </button>
  )
}

export default ThemeToggle
