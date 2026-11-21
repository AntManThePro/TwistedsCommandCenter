import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import PortfolioPage from '../components/Portfolio/PortfolioPage'

/* ── PortfolioPage component tests ───────────────────── */

describe('PortfolioPage', () => {
  it('renders the page heading', () => {
    render(<PortfolioPage />)
    expect(screen.getByText('PORTFOLIO')).toBeInTheDocument()
    expect(screen.getByText('SHOWCASE')).toBeInTheDocument()
  })

  it('shows the hero section with author identity', () => {
    render(<PortfolioPage />)
    // The hero card has the h3 heading with the author name
    expect(screen.getAllByText('AntManThePro').length).toBeGreaterThan(0)
  })

  it('renders three tab buttons', () => {
    render(<PortfolioPage />)
    expect(screen.getByRole('tab', { name: /projects/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /skills/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /about/i })).toBeInTheDocument()
  })

  it('shows projects tab content by default', () => {
    render(<PortfolioPage />)
    expect(screen.getByText("Twisted's Command Center")).toBeInTheDocument()
    expect(screen.getByText('Algorithm Race Visualizer')).toBeInTheDocument()
  })

  it('switching to Skills tab reveals skill entries', async () => {
    const user = userEvent.setup()
    render(<PortfolioPage />)

    await user.click(screen.getByRole('tab', { name: /skills/i }))

    // Skills section category headings are unique to this tab
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
    expect(screen.getByText('Testing')).toBeInTheDocument()
  })

  it('switching to About tab reveals bio text', async () => {
    const user = userEvent.setup()
    render(<PortfolioPage />)

    await user.click(screen.getByRole('tab', { name: /about/i }))

    // Bio section text (only present in About tab content)
    expect(screen.getByText(/NEXUS aesthetic/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /github\.com\/AntManThePro/i })).toBeInTheDocument()
  })

  it('clicking a project card toggles its detail', async () => {
    const user = userEvent.setup()
    render(<PortfolioPage />)

    // Detail should not be visible initially
    expect(screen.queryByText(/React 19, TypeScript, Vite 8/)).not.toBeInTheDocument()

    // Click the first project card
    const card = screen.getByRole('button', { name: /twisted's command center/i })
    await user.click(card)

    expect(screen.getByText(/React 19, TypeScript, Vite 8/)).toBeInTheDocument()

    // Click again to collapse
    await user.click(card)
    expect(screen.queryByText(/React 19, TypeScript, Vite 8/)).not.toBeInTheDocument()
  })
})
