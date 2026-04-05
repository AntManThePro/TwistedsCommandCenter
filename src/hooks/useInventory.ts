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
  }, [items])

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
    let activity: ActivityEntry | null = null

    setItems(prev => {
      const item = prev.find(i => i.id === id)

      if (!item) return prev

      const nextQuantity = updates.quantity ?? item.quantity
      const nextStatus = updates.quantity !== undefined ? deriveStatus(updates.quantity) : item.status
      const updated: InventoryItem = {
        ...item,
        ...updates,
        status: nextStatus,
        lastUpdated: new Date().toISOString().split('T')[0],
      }

      const action: ActivityEntry['action'] =
        updates.quantity !== undefined &&
        (item.status === 'Out of Stock' || item.status === 'Low Stock') &&
        nextStatus === 'In Stock'
          ? 'restocked'
          : 'updated'

      const details =
        action === 'restocked'
          ? `Restocked to ${nextQuantity} units`
          : updates.quantity !== undefined
            ? `Updated item details; quantity is now ${nextQuantity}`
            : `Updated item details`

      activity = {
        id: crypto.randomUUID(),
        action,
        itemName: updated.name,
        details,
        timestamp: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      return prev.map(currentItem => (currentItem.id === id ? updated : currentItem))
    })

    if (activity) {
      setActivities(prev => [activity!, ...prev])
    }

    setActivities(prev => [activity, ...prev])

    if (capturedItemName) {
      const changedFields = Object.keys(updates)
      const detail = changedFields.length === 1 && changedFields[0] === 'quantity'
        ? `Updated quantity to ${updates.quantity}`
        : `Updated ${changedFields.join(', ')}`
      const activity: ActivityEntry = {
        id: crypto.randomUUID(),
        action: 'updated',
        itemName: capturedItemName,
        details: detail,
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
