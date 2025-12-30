import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DIFFICULTY_OPTIONS, DifficultySelector } from '@/components/DifficultySelector'

describe('DifficultySelector', () => {
  it('renders with label by default', () => {
    render(
      <DifficultySelector value="beginner" onValueChange={vi.fn()} />
    )
    expect(screen.getByText('Difficulty')).toBeInTheDocument()
  })

  it('renders without label when showLabel is false', () => {
    render(
      <DifficultySelector
        value="beginner"
        onValueChange={vi.fn()}
        showLabel={false}
      />
    )
    expect(screen.queryByText('Difficulty')).not.toBeInTheDocument()
  })

  it('displays the selected difficulty value', () => {
    render(
      <DifficultySelector value="intermediate" onValueChange={vi.fn()} />
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('Intermediate')
  })

  it('shows all difficulty options when opened', async () => {
    const user = userEvent.setup()
    render(
      <DifficultySelector value="beginner" onValueChange={vi.fn()} />
    )

    await user.click(screen.getByRole('combobox'))

    // Get the listbox (dropdown) and check options within it
    const listbox = screen.getByRole('listbox')
    const options = within(listbox).getAllByRole('option')
    expect(options).toHaveLength(4)
  })

  it('calls onValueChange when a new difficulty is selected', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(
      <DifficultySelector value="beginner" onValueChange={handleChange} />
    )

    await user.click(screen.getByRole('combobox'))

    // Find Advanced option in the listbox
    const listbox = screen.getByRole('listbox')
    const advancedOption = within(listbox).getByRole('option', { name: /Advanced/i })
    await user.click(advancedOption)

    expect(handleChange).toHaveBeenCalledWith('advanced')
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <DifficultySelector
        value="beginner"
        onValueChange={vi.fn()}
        disabled={true}
      />
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('has correct number of difficulty options', () => {
    expect(DIFFICULTY_OPTIONS).toHaveLength(4)
    expect(DIFFICULTY_OPTIONS.map((o) => o.value)).toEqual([
      'beginner',
      'intermediate',
      'advanced',
      'hardcore',
    ])
  })
})
