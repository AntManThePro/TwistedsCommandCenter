import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import type { InventoryItem, ItemCategory } from '../../types/inventory'
import { allCategories } from '../../data/mockData'

type NewItemData = Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: NewItemData) => void
}

const initialForm: NewItemData = {
  name: '',
  sku: '',
  category: 'Electronics',
  quantity: 0,
  price: 0,
}

export default function AddItemModal({ isOpen, onClose, onAdd }: AddItemModalProps) {
  const [form, setForm] = useState<NewItemData>(initialForm)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.sku.trim()) return

    const normalizedForm: NewItemData = {
      ...form,
      quantity: Number.isFinite(form.quantity) ? form.quantity : 0,
      price: Number.isFinite(form.price) ? form.price : 0,
    }

    onAdd(normalizedForm)
    setForm(initialForm)
    onClose()
  }

  const updateField = <K extends keyof NewItemData>(field: K, value: NewItemData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="animate-fade-in relative w-full max-w-md rounded-xl border border-[#1e1e2e] bg-[#12121a] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-item-modal-title"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="add-item-modal-title" className="text-lg font-semibold text-white">Add New Item</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-[#1e1e2e] hover:text-white"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="item-name" className="mb-1.5 block text-sm text-slate-400">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              id="item-name"
              type="text"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Enter item name"
              required
              className="w-full rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-cyan-500/50"
            />
          </div>

          {/* SKU */}
          <div>
            <label htmlFor="item-sku" className="mb-1.5 block text-sm text-slate-400">
              SKU <span className="text-red-400">*</span>
            </label>
            <input
              id="item-sku"
              type="text"
              value={form.sku}
              onChange={e => updateField('sku', e.target.value)}
              placeholder="e.g., KB-MEC-001"
              required
              className="w-full rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-cyan-500/50"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="item-category" className="mb-1.5 block text-sm text-slate-400">
              Category
            </label>
            <select
              id="item-category"
              value={form.category}
              onChange={e => updateField('category', e.target.value as ItemCategory)}
              className="w-full rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2 text-sm text-slate-200 outline-none transition-colors focus:border-cyan-500/50"
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity + Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="item-quantity" className="mb-1.5 block text-sm text-slate-400">
                Quantity
              </label>
              <input
                id="item-quantity"
                type="number"
                min={0}
                value={form.quantity}
                onChange={e => updateField('quantity', parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2 text-sm text-slate-200 outline-none transition-colors focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label htmlFor="item-price" className="mb-1.5 block text-sm text-slate-400">
                Price ($)
              </label>
              <input
                id="item-price"
                type="number"
                min={0}
                step={0.01}
                value={Number.isNaN(form.price) ? '' : form.price}
                onChange={e =>
                  updateField(
                    'price',
                    e.currentTarget.value === '' ? Number.NaN : e.currentTarget.valueAsNumber
                  )
                }
                className="w-full rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] px-3 py-2 text-sm text-slate-200 outline-none transition-colors focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#1e1e2e] px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-[#1e1e2e] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
