import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBadge from '../components/Inventory/StatusBadge'

describe('StatusBadge', () => {
  it('renders "In Stock" with green styling', () => {
    render(<StatusBadge status="In Stock" />)
    const badge = screen.getByText('In Stock')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('text-emerald-400')
  })

  it('renders "Low Stock" with yellow styling', () => {
    render(<StatusBadge status="Low Stock" />)
    const badge = screen.getByText('Low Stock')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('text-yellow-400')
  })

  it('renders "Out of Stock" with red styling', () => {
    render(<StatusBadge status="Out of Stock" />)
    const badge = screen.getByText('Out of Stock')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('text-red-400')
  })

  it('includes a status dot indicator', () => {
    const { container } = render(<StatusBadge status="In Stock" />)
    const dot = container.querySelector('.rounded-full')
    expect(dot).toBeInTheDocument()
  })
})
