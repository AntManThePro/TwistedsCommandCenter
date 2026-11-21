import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { InventoryItem, ActivityEntry, StatsData, ItemStatus } from '../types/inventory'
import { mockInventoryItems, mockActivityEntries } from '../data/mockData'
import { logger } from '../lib/logger'

function deriveStatus(quantity: number): ItemStatus {
  if (quantity === 0) return 'Out of Stock'
  if (quantity <= 5) return 'Low Stock'
  return 'In Stock'
}

function localDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function localTimestampString(): string {
  const d = new Date()
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${localDateString()} ${time}`
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
      lastUpdated: localDateString(),
    }

    setItems(prev => [newItem, ...prev])

    const activity: ActivityEntry = {
      id: crypto.randomUUID(),
      action: 'added',
      itemName: item.name,
      details: `Added ${item.quantity} units to inventory`,
      timestamp: localTimestampString(),
    }
    setActivities(prev => [activity, ...prev])

    logger.info('inventory:add', { id: newItem.id, name: newItem.name, quantity: newItem.quantity })

    return newItem
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>>) => {
    const existingItem = itemsRef.current.find(item => item.id === id)

    if (!existingItem) return

    const nextQuantity = updates.quantity ?? existingItem.quantity
    const nextStatus = updates.quantity !== undefined ? deriveStatus(updates.quantity) : existingItem.status

    const updated: InventoryItem = {
      ...existingItem,
      ...updates,
      status: nextStatus,
      lastUpdated: localDateString(),
    }

    const isRestock =
      updates.quantity !== undefined &&
      (existingItem.status === 'Out of Stock' || existingItem.status === 'Low Stock') &&
      nextStatus === 'In Stock'
    const action: ActivityEntry['action'] = isRestock ? 'restocked' : 'updated'
    const details = isRestock
      ? `Restocked quantity ${existingItem.quantity} → ${nextQuantity} units`
      : updates.quantity !== undefined
        ? `Updated item; quantity is now ${nextQuantity}`
        : `Updated item details`

    const activity: ActivityEntry = {
      id: crypto.randomUUID(),
      action,
      itemName: updated.name,
      details,
      timestamp: localTimestampString(),
    }

    setItems(prev => prev.map(item => (item.id === id ? updated : item)))
    setActivities(prev => [activity, ...prev])
    logger.info(`inventory:${action}`, { id, name: updated.name, quantity: nextQuantity })
  }, [])

  const deleteItem = useCallback((id: string) => {
    const item = itemsRef.current.find(i => i.id === id)

    if (item) {
      const activity: ActivityEntry = {
        id: crypto.randomUUID(),
        action: 'removed',
        itemName: item.name,
        details: `Removed from inventory`,
        timestamp: localTimestampString(),
      }
      setActivities(prevAct => [activity, ...prevAct])
      logger.info('inventory:remove', { id, name: item.name })
    }

    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const stats: StatsData = useMemo(() => {
    const uniqueCategories = new Set(items.map(i => i.category))
    return {
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      itemCount: items.length,
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
