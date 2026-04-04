import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useInventory } from '../hooks/useInventory'

describe('useInventory', () => {
  it('initializes with mock data', () => {
    const { result } = renderHook(() => useInventory())
    expect(result.current.items.length).toBeGreaterThan(0)
    expect(result.current.activities.length).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const { result } = renderHook(() => useInventory())
    const { stats } = result.current
    expect(stats.totalItems).toBeGreaterThan(0)
    expect(stats.categories).toBeGreaterThan(0)
    expect(stats.totalValue).toBeGreaterThan(0)
    expect(typeof stats.lowStockAlerts).toBe('number')
  })

  it('adds a new item', () => {
    const { result } = renderHook(() => useInventory())
    const initialLength = result.current.items.length

    act(() => {
      result.current.addItem({
        name: 'Test Widget',
        sku: 'TW-001',
        category: 'Electronics',
        quantity: 10,
        price: 29.99,
      })
    })

    expect(result.current.items.length).toBe(initialLength + 1)
    expect(result.current.items[0].name).toBe('Test Widget')
    expect(result.current.items[0].status).toBe('In Stock')
  })

  it('derives Low Stock status for quantity <= 5', () => {
    const { result } = renderHook(() => useInventory())

    act(() => {
      result.current.addItem({
        name: 'Low Stock Widget',
        sku: 'LS-001',
        category: 'Accessories',
        quantity: 3,
        price: 9.99,
      })
    })

    expect(result.current.items[0].status).toBe('Low Stock')
  })

  it('derives Out of Stock status for quantity 0', () => {
    const { result } = renderHook(() => useInventory())

    act(() => {
      result.current.addItem({
        name: 'Empty Widget',
        sku: 'EW-001',
        category: 'Accessories',
        quantity: 0,
        price: 5.99,
      })
    })

    expect(result.current.items[0].status).toBe('Out of Stock')
  })

  it('deletes an item', () => {
    const { result } = renderHook(() => useInventory())
    const initialLength = result.current.items.length
    const idToDelete = result.current.items[0].id

    act(() => {
      result.current.deleteItem(idToDelete)
    })

    expect(result.current.items.length).toBe(initialLength - 1)
    expect(result.current.items.find(i => i.id === idToDelete)).toBeUndefined()
  })

  it('updates an item', () => {
    const { result } = renderHook(() => useInventory())
    const targetId = result.current.items[0].id

    act(() => {
      result.current.updateItem(targetId, { quantity: 100 })
    })

    const updated = result.current.items.find(i => i.id === targetId)
    expect(updated?.quantity).toBe(100)
    expect(updated?.status).toBe('In Stock')
  })

  it('adds activity when adding an item', () => {
    const { result } = renderHook(() => useInventory())
    const initialActivities = result.current.activities.length

    act(() => {
      result.current.addItem({
        name: 'Activity Test',
        sku: 'AT-001',
        category: 'Software',
        quantity: 5,
        price: 19.99,
      })
    })

    expect(result.current.activities.length).toBe(initialActivities + 1)
    expect(result.current.activities[0].action).toBe('added')
    expect(result.current.activities[0].itemName).toBe('Activity Test')
  })

  it('adds activity when deleting an item', () => {
    const { result } = renderHook(() => useInventory())
    const initialActivities = result.current.activities.length
    const itemToDelete = result.current.items[0]

    act(() => {
      result.current.deleteItem(itemToDelete.id)
    })

    expect(result.current.activities.length).toBe(initialActivities + 1)
    expect(result.current.activities[0].action).toBe('removed')
    expect(result.current.activities[0].itemName).toBe(itemToDelete.name)
  })
})
