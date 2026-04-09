import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ErrorBoundary from '../components/shared/ErrorBoundary'

/** A component that throws during render when `shouldThrow` is true. */
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test render crash')
  return <div>Safe content</div>
}

describe('ErrorBoundary', () => {
  // Silence console.error output produced by React's error boundary machinery
  // and the logger during these tests.
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Safe content')).toBeInTheDocument()
  })

  it('renders the NEXUS error screen when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('SYSTEM ERROR')).toBeInTheDocument()
    expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument()
  })

  it('displays the error message in the error screen', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Test render crash')).toBeInTheDocument()
  })

  it('renders a Reload button when an error is caught', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument()
  })

  it('renders a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    expect(screen.queryByText('SYSTEM ERROR')).not.toBeInTheDocument()
  })

  it('calls console.error (via logger) when catching an error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )
    // The logger routes error-level calls through console.error
    expect(errorSpy).toHaveBeenCalled()
  })

  it('Reload button triggers window.location.reload', async () => {
    const user = userEvent.setup()
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )

    await user.click(screen.getByRole('button', { name: /reload/i }))
    expect(reloadSpy).toHaveBeenCalledOnce()
  })
})
