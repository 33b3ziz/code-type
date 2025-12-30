import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/ThemeProvider'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: () => {
      store = {}
    },
  }
})()

// Mock matchMedia
const createMatchMedia = (matches: boolean) =>
  vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

describe('ThemeProvider', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    localStorageMock.clear()
    vi.clearAllMocks()
    // Default to dark mode system preference
    Object.defineProperty(window, 'matchMedia', {
      value: createMatchMedia(true),
      writable: true,
    })
    // Reset document classes
    document.documentElement.classList.remove('light', 'dark')
  })

  afterEach(() => {
    document.documentElement.classList.remove('light', 'dark')
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  )

  describe('initialization', () => {
    it('uses default theme when no stored value', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.theme).toBe('dark')
      expect(result.current.resolvedTheme).toBe('dark')
    })

    it('reads theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('light')

      const lightWrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper: lightWrapper })

      expect(result.current.theme).toBe('light')
    })

    it('uses custom default theme', () => {
      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper: customWrapper })

      expect(result.current.theme).toBe('light')
    })
  })

  describe('setTheme', () => {
    it('updates theme state', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('light')
      })

      expect(result.current.theme).toBe('light')
      expect(result.current.resolvedTheme).toBe('light')
    })

    it('persists theme to localStorage', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('light')
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'codetype-theme',
        'light'
      )
    })

    it('applies dark class to document', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('dark')
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })

    it('applies light class to document', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('light')
      })

      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('system theme', () => {
    it('resolves to dark when system prefers dark', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: createMatchMedia(true),
        writable: true,
      })

      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('system')
      })

      expect(result.current.theme).toBe('system')
      expect(result.current.resolvedTheme).toBe('dark')
    })

    it('resolves to light when system prefers light', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: createMatchMedia(false),
        writable: true,
      })

      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('system')
      })

      expect(result.current.theme).toBe('system')
      expect(result.current.resolvedTheme).toBe('light')
    })
  })

  describe('useTheme hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useTheme())
      }).toThrow('useTheme must be used within a ThemeProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('custom storage key', () => {
    it('uses custom storage key for persistence', () => {
      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider storageKey="my-theme">{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper: customWrapper })

      act(() => {
        result.current.setTheme('light')
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('my-theme', 'light')
    })
  })
})
