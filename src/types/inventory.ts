export type ItemStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export type ItemCategory =
  | 'Electronics'
  | 'Peripherals'
  | 'Networking'
  | 'Storage'
  | 'Audio'
  | 'Components'
  | 'Accessories'
  | 'Software'

export interface InventoryItem {
  id: string
  name: string
  sku: string
  category: ItemCategory
  quantity: number
  price: number
  status: ItemStatus
  lastUpdated: string
}

export interface ActivityEntry {
  id: string
  action: 'added' | 'updated' | 'removed' | 'restocked'
  itemName: string
  details: string
  timestamp: string
}

export type PageId = 'dashboard' | 'inventory' | 'categories' | 'algorithm' | 'settings'

export interface StatsData {
  totalItems: number
  lowStockAlerts: number
  categories: number
  totalValue: number
}
