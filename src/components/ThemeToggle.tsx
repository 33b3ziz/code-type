/**
 * Theme Toggle Component
 * Cycles through light, dark, and system themes
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
      className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
      aria-label={`Current theme: ${THEME_LABELS[theme]}. Click to switch.`}
      title={THEME_LABELS[theme]}
    >
      <Icon size={20} />
    </button>
  )
}

export default ThemeToggle
