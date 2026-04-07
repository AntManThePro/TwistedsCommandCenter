import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import CategoriesPage from '../components/Categories/CategoriesPage'
import { mockInventoryItems } from '../data/mockData'
import { allCategories } from '../data/mockData'

describe('CategoriesPage', () => {
  it('renders the page heading', () => {
    render(<CategoriesPage items={mockInventoryItems} onNavigate={vi.fn()} />)
    expect(screen.getByText('CATEGORIES')).toBeInTheDocument()
    expect(screen.getByText('OVERVIEW')).toBeInTheDocument()
  })

  it('renders a card for every category', () => {
    render(<CategoriesPage items={mockInventoryItems} onNavigate={vi.fn()} />)
    for (const category of allCategories) {
      expect(screen.getByText(category)).toBeInTheDocument()
    }
  })

  it('shows the summary strip with Total Categories', () => {
    render(<CategoriesPage items={mockInventoryItems} onNavigate={vi.fn()} />)
    expect(screen.getByText('Total Categories')).toBeInTheDocument()
    expect(screen.getByText('Active Categories')).toBeInTheDocument()
    expect(screen.getByText('Total SKUs')).toBeInTheDocument()
    expect(screen.getByText('Total Value')).toBeInTheDocument()
  })

  it('shows "No items" for categories with no inventory', () => {
    render(<CategoriesPage items={mockInventoryItems} onNavigate={vi.fn()} />)
    // 'Software' has no items in mockInventoryItems
    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  it('shows "Live Data" badge', () => {
    render(<CategoriesPage items={mockInventoryItems} onNavigate={vi.fn()} />)
    expect(screen.getByText('Live Data')).toBeInTheDocument()
  })

  it('calls onNavigate("inventory") when a category card is clicked', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<CategoriesPage items={mockInventoryItems} onNavigate={onNavigate} />)

    const electronicBtn = screen.getByRole('button', { name: /electronics/i })
    await user.click(electronicBtn)

    expect(onNavigate).toHaveBeenCalledWith('inventory')
  })

  it('renders with empty items without crashing', () => {
    render(<CategoriesPage items={[]} onNavigate={vi.fn()} />)
    // All categories should show "No items"
    const noItemEls = screen.getAllByText('No items')
    expect(noItemEls.length).toBe(allCategories.length)
  })
})
