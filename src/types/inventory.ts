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

export type PageId = 'dashboard' | 'inventory' | 'categories' | 'algorithm' | 'settings' | 'portfolio'

export interface StatsData {
  /** Sum of all item quantities in inventory. */
  totalItems: number
  /** Count of distinct SKUs (individual item records). */
  itemCount: number
  /** Number of items whose status is Low Stock or Out of Stock. */
  lowStockAlerts: number
  /** Number of distinct categories represented. */
  categories: number
  /** Combined monetary value of all inventory (price × quantity). */
  totalValue: number
}
