import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { LANGUAGE_OPTIONS, LanguageSelector } from '@/components/LanguageSelector'

describe('LanguageSelector', () => {
  describe('rendering', () => {
    it('renders with label by default', () => {
      render(<LanguageSelector value="javascript" onValueChange={() => {}} />)

      expect(screen.getByText('Language')).toBeInTheDocument()
    })

    it('hides label when showLabel is false', () => {
      render(
        <LanguageSelector
          value="javascript"
          onValueChange={() => {}}
          showLabel={false}
        />
      )

      expect(screen.queryByText('Language')).not.toBeInTheDocument()
    })

    it('shows current value', () => {
      render(<LanguageSelector value="typescript" onValueChange={() => {}} />)

      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })

    it('shows all option by default', () => {
      render(<LanguageSelector value="all" onValueChange={() => {}} />)

      expect(screen.getByText('All Languages')).toBeInTheDocument()
    })
  })

  describe('options', () => {
    it('has correct number of options including all', () => {
      expect(LANGUAGE_OPTIONS).toHaveLength(4) // all + 3 languages
    })

    it('includes all expected languages', () => {
      const languages = LANGUAGE_OPTIONS.map((o) => o.value)
      expect(languages).toContain('javascript')
      expect(languages).toContain('typescript')
      expect(languages).toContain('python')
      expect(languages).toContain('all')
    })

    it('each option has label, description, and icon', () => {
      LANGUAGE_OPTIONS.forEach((option) => {
        expect(option.label).toBeTruthy()
        expect(option.description).toBeTruthy()
        expect(option.icon).toBeTruthy()
      })
    })
  })

  describe('interaction', () => {
    it('calls onValueChange when selection changes', async () => {
      const onValueChange = vi.fn()

      render(
        <LanguageSelector value="javascript" onValueChange={onValueChange} />
      )

      // Open the select
      const trigger = screen.getByRole('combobox')
      fireEvent.click(trigger)

      // Select TypeScript
      const option = screen.getByRole('option', { name: /typescript/i })
      fireEvent.click(option)

      expect(onValueChange).toHaveBeenCalledWith('typescript')
    })

    it('is disabled when disabled prop is true', () => {
      render(
        <LanguageSelector
          value="javascript"
          onValueChange={() => {}}
          disabled
        />
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })
  })

  describe('showAllOption', () => {
    it('excludes all option when showAllOption is false', () => {
      render(
        <LanguageSelector
          value="javascript"
          onValueChange={() => {}}
          showAllOption={false}
        />
      )

      // Open the select
      const trigger = screen.getByRole('combobox')
      fireEvent.click(trigger)

      // All Languages option should not exist
      expect(
        screen.queryByRole('option', { name: /all languages/i })
      ).not.toBeInTheDocument()

      // But other languages should exist (TypeScript to avoid matching the selected value twice)
      expect(
        screen.getByRole('option', { name: /typescript/i })
      ).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper label association', () => {
      render(<LanguageSelector value="javascript" onValueChange={() => {}} />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('id', 'language-select')
    })

    it('has proper aria attributes', () => {
      render(<LanguageSelector value="javascript" onValueChange={() => {}} />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })
})
