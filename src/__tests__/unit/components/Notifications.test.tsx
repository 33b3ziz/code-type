import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import {
  NotificationProvider,
  useNotifications,
} from '@/components/Notifications'

// Test component to use the hook
function TestComponent() {
  const { notifications, addNotification, removeNotification, clearAll } =
    useNotifications()

  return (
    <div>
      <button
        onClick={() =>
          addNotification({
            type: 'success',
            title: 'Success!',
            message: 'Test message',
          })
        }
      >
        Add Success
      </button>
      <button
        onClick={() =>
          addNotification({
            type: 'achievement',
            title: 'Achievement Unlocked!',
            duration: 0, // Never auto-dismiss
          })
        }
      >
        Add Achievement
      </button>
      <button onClick={clearAll}>Clear All</button>
      <div data-testid="count">{notifications.length}</div>
    </div>
  )
}

describe('NotificationProvider', () => {
  it('provides notification context', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('adds notifications', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    fireEvent.click(screen.getByText('Add Success'))

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })
    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('displays notification with correct type', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    fireEvent.click(screen.getByText('Add Achievement'))

    await waitFor(() => {
      expect(screen.getByText('Achievement Unlocked!')).toBeInTheDocument()
    })
  })

  it('auto-removes notifications after duration', async () => {
    vi.useFakeTimers()

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    act(() => {
      fireEvent.click(screen.getByText('Add Success'))
    })

    expect(screen.getByTestId('count')).toHaveTextContent('1')

    // Advance time past default duration (5000ms)
    act(() => {
      vi.advanceTimersByTime(5100)
    })

    expect(screen.getByTestId('count')).toHaveTextContent('0')

    vi.useRealTimers()
  })

  it('keeps notifications with duration 0', async () => {
    vi.useFakeTimers()

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    act(() => {
      fireEvent.click(screen.getByText('Add Achievement'))
    })

    expect(screen.getByTestId('count')).toHaveTextContent('1')

    // Advance time significantly
    act(() => {
      vi.advanceTimersByTime(60000)
    })

    // Should still be there
    expect(screen.getByTestId('count')).toHaveTextContent('1')

    vi.useRealTimers()
  })

  it('clears all notifications', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    fireEvent.click(screen.getByText('Add Success'))
    fireEvent.click(screen.getByText('Add Achievement'))

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('2')
    })

    fireEvent.click(screen.getByText('Clear All'))

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('0')
    })
  })

  it('dismisses notification on click', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    fireEvent.click(screen.getByText('Add Achievement'))

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })

    // Click the dismiss button
    const dismissButton = screen.getByLabelText('Dismiss notification')
    fireEvent.click(dismissButton)

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('0')
    })
  })

  it('has accessible notification region', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    fireEvent.click(screen.getByText('Add Success'))

    await waitFor(() => {
      const region = screen.getByRole('region', { name: /notifications/i })
      expect(region).toHaveAttribute('aria-live', 'polite')
    })
  })
})

describe('useNotifications', () => {
  it('throws error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useNotifications must be used within a NotificationProvider')

    consoleSpy.mockRestore()
  })
})
