import type { InventoryItem } from '../../types/inventory'
import StatusBadge from './StatusBadge'

interface InventoryTableProps {
  items: InventoryItem[]
  onDelete: (id: string) => void
  onEdit: (item: InventoryItem) => void
}

export default function InventoryTable({ items, onDelete, onEdit }: InventoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#1e1e2e] bg-[#12121a]">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#1e1e2e] text-xs uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">SKU</th>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 font-medium text-right">Qty</th>
            <th className="px-5 py-3 font-medium text-right">Price</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                No items found. Try adjusting your search or add a new item.
              </td>
            </tr>
          ) : (
            items.map(item => (
              <tr
                key={item.id}
                className="border-b border-[#1e1e2e] transition-colors duration-150 last:border-b-0 hover:bg-[#1a1a2e]"
              >
                <td className="px-5 py-3 font-medium text-slate-200">{item.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-400">{item.sku}</td>
                <td className="px-5 py-3 text-slate-400">{item.category}</td>
                <td className="px-5 py-3 text-right text-slate-300">{item.quantity}</td>
                <td className="px-5 py-3 text-right text-slate-300">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      className="rounded-md px-2 py-1 text-xs text-cyan-400 transition-colors hover:bg-cyan-500/10"
                      aria-label={`Edit ${item.name}`}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.95l-3.536.707.707-3.536a4 4 0 01.95-1.414z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="rounded-md px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                      aria-label={`Delete ${item.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
