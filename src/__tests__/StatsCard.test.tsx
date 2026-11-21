import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatsCard from '../components/Dashboard/StatsCard'

describe('StatsCard', () => {
  const icon = (
    <svg data-testid="test-icon" className="h-5 w-5">
      <circle cx="10" cy="10" r="5" />
    </svg>
  )

  it('renders title and value', () => {
    render(<StatsCard title="Total Items" value={150} icon={icon} accent="blue" />)
    expect(screen.getByText('Total Items')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('renders string values', () => {
    render(<StatsCard title="Total Value" value="$12,500.00" icon={icon} accent="green" />)
    expect(screen.getByText('$12,500.00')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(
      <StatsCard title="Categories" value={8} icon={icon} accent="purple" subtitle="Active categories" />,
    )
    expect(screen.getByText('Active categories')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    render(<StatsCard title="Items" value={42} icon={icon} accent="yellow" />)
    expect(screen.queryByText('Active categories')).not.toBeInTheDocument()
  })

  it('renders the icon', () => {
    render(<StatsCard title="Items" value={42} icon={icon} accent="blue" />)
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('applies correct accent colors for blue', () => {
    render(<StatsCard title="Items" value={42} icon={icon} accent="blue" />)
    const card = screen.getByTestId('stats-card')
    expect(card.className).toContain('border-cyan-500/30')
  })
})
