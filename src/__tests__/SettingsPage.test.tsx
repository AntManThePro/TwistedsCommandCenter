import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import SettingsPage from '../components/Settings/SettingsPage'

describe('SettingsPage', () => {
  it('renders the page heading', () => {
    render(<SettingsPage />)
    expect(screen.getByText('SETTINGS')).toBeInTheDocument()
    expect(screen.getByText('CONFIG')).toBeInTheDocument()
  })

  it('shows the Local Only badge', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Local Only')).toBeInTheDocument()
  })

  it('renders all three settings sections', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Data Management')).toBeInTheDocument()
  })

  it('shows all setting rows', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Accent Theme')).toBeInTheDocument()
    expect(screen.getByText('Animations')).toBeInTheDocument()
    expect(screen.getByText('Compact Mode')).toBeInTheDocument()
    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument()
    expect(screen.getByText('Activity Feed')).toBeInTheDocument()
    expect(screen.getByText('System Metrics')).toBeInTheDocument()
  })

  it('toggles Animations switch on click', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const toggles = screen.getAllByRole('switch')
    // Animations is the first toggle; it starts ON (aria-checked="true")
    const animationsToggle = toggles[0]
    expect(animationsToggle).toHaveAttribute('aria-checked', 'true')

    await user.click(animationsToggle)
    expect(animationsToggle).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles Compact Mode switch off by default', () => {
    render(<SettingsPage />)
    const toggles = screen.getAllByRole('switch')
    // Compact Mode is the second toggle; starts OFF
    expect(toggles[1]).toHaveAttribute('aria-checked', 'false')
  })

  it('accent swatches are rendered with aria-pressed state', () => {
    render(<SettingsPage />)
    // Cyan is the default selected accent
    const cyanBtn = screen.getByRole('button', { name: /cyan accent/i })
    expect(cyanBtn).toHaveAttribute('aria-pressed', 'true')

    const greenBtn = screen.getByRole('button', { name: /green accent/i })
    expect(greenBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking an accent swatch selects it', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const greenBtn = screen.getByRole('button', { name: /green accent/i })
    await user.click(greenBtn)

    expect(greenBtn).toHaveAttribute('aria-pressed', 'true')
    // Previous default (cyan) should now be unselected
    expect(screen.getByRole('button', { name: /cyan accent/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows confirmation message after Reset to Defaults', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    const resetBtn = screen.getByRole('button', { name: /reset to defaults/i })
    await user.click(resetBtn)

    expect(screen.getByText('Settings reset to defaults.')).toBeInTheDocument()
  })

  it('Reset to Defaults restores Animations to on', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)

    // Turn off animations first
    const toggles = screen.getAllByRole('switch')
    await user.click(toggles[0])
    expect(toggles[0]).toHaveAttribute('aria-checked', 'false')

    // Reset
    await user.click(screen.getByRole('button', { name: /reset to defaults/i }))
    expect(toggles[0]).toHaveAttribute('aria-checked', 'true')
  })
})
