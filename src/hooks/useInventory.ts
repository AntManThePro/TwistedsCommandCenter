import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { InventoryItem, ActivityEntry, StatsData, ItemStatus } from '../types/inventory'
import { mockInventoryItems, mockActivityEntries } from '../data/mockData'

function deriveStatus(quantity: number): ItemStatus {
  if (quantity === 0) return 'Out of Stock'
  if (quantity <= 5) return 'Low Stock'
  return 'In Stock'
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>(mockInventoryItems)
  const [activities, setActivities] = useState<ActivityEntry[]>(mockActivityEntries)
  const itemsRef = useRef<InventoryItem[]>(mockInventoryItems)
  useEffect(() => {
    itemsRef.current = items
  })

  const addItem = useCallback((item: Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      status: deriveStatus(item.quantity),
      lastUpdated: new Date().toISOString().split('T')[0],
    }

    setItems(prev => [newItem, ...prev])

    const activity: ActivityEntry = {
      id: crypto.randomUUID(),
      action: 'added',
      itemName: item.name,
      details: `Added ${item.quantity} units to inventory`,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
    setActivities(prev => [activity, ...prev])

    return newItem
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>>) => {
    let updatedItem: InventoryItem | null = null

    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        const updated = { ...item, ...updates }
        if (updates.quantity !== undefined) {
          updated.status = deriveStatus(updates.quantity)
        }
        updated.lastUpdated = new Date().toISOString().split('T')[0]
        updatedItem = updated
        return updated
      }),
    )

    if (updatedItem) {
      const activity: ActivityEntry = {
        id: crypto.randomUUID(),
        action: 'updated',
        itemName: updatedItem.name,
        details: `Updated item details`,
        timestamp: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setActivities(prev => [activity, ...prev])
    }
  }, [])

  const deleteItem = useCallback((id: string) => {
    const item = itemsRef.current.find(i => i.id === id)

    if (item) {
      const activity: ActivityEntry = {
        id: crypto.randomUUID(),
        action: 'removed',
        itemName: item.name,
        details: `Removed from inventory`,
        timestamp: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setActivities(prevAct => [activity, ...prevAct])
    }

    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const stats: StatsData = useMemo(() => {
    const uniqueCategories = new Set(items.map(i => i.category))
    return {
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      lowStockAlerts: items.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length,
      categories: uniqueCategories.size,
      totalValue: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }
  }, [items])

  return {
    items,
    activities,
    stats,
    addItem,
    updateItem,
    deleteItem,
  }
}
