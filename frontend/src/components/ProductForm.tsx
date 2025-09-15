import { useEffect, useMemo, useState } from 'react'
import type { Category, Product } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export type ProductFormValues = {
  name: string
  description?: string
  price: string
  stockQuantity: string
  imageUrl?: string
  categoryIds: number[]
}

type Props = {
  categories: Category[]
  initial?: Product | null
  onSubmit: (values: ProductFormValues) => Promise<void> | void
  onCancel: () => void
}

export default function ProductForm({ categories, initial, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name || '',
    description: initial?.description || '',
    price: initial ? String(initial.price) : '',
    stockQuantity: initial ? String(initial.stockQuantity) : '',
    imageUrl: initial?.imageUrl || '',
    categoryIds: initial?.categories?.map((c) => c.category.id) || [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = useMemo(() => !submitting, [submitting])

  useEffect(() => {
    setValues({
      name: initial?.name || '',
      description: initial?.description || '',
      price: initial ? String(initial.price) : '',
      stockQuantity: initial ? String(initial.stockQuantity) : '',
      imageUrl: initial?.imageUrl || '',
      categoryIds: initial?.categories?.map((c) => c.category.id) || [],
    })
  }, [initial])

  function validate(v: ProductFormValues) {
    const e: Record<string, string> = {}
    // Name validation
    if (!v.name || v.name.trim().length === 0) e.name = 'Name is required'
    else if (v.name.length > 100) e.name = 'Name must be less than 100 characters'
    
    // Price validation
    const priceNum = Number(v.price)
    if (isNaN(priceNum) || priceNum <= 0) e.price = 'Price must be a positive number'
    
    // Stock validation
    const stockNum = Number(v.stockQuantity)
    if (!Number.isInteger(stockNum) || stockNum < 0) e.stockQuantity = 'Stock must be a non-negative integer'
    
    // Description validation
    if (v.description && v.description.length > 500) e.description = 'Description must be less than 500 characters'
    
    // Image URL validation
    if (v.imageUrl && v.imageUrl.length > 34255) e.imageUrl = 'Image URL must be less than 255 characters'
    
    return e
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate(values)
    setErrors(e)
    if (Object.keys(e).length > 0) return
    try {
      setSubmitting(true)
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  function toggleCategory(id: number) {
    setValues((prev) => {
      const has = prev.categoryIds.includes(id)
      return { ...prev, categoryIds: has ? prev.categoryIds.filter((x) => x !== id) : [...prev.categoryIds, id] }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Name</label>
          <Input 
            value={values.name} 
            onChange={(e) => setValues({ ...values, name: e.target.value })} 
            maxLength={100} 
          />
          <div className="mt-1 text-xs text-gray-500">Max 100 characters</div>
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Price</label>
          <Input value={values.price} onChange={(e) => setValues({ ...values, price: e.target.value })} />
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Stock</label>
          <Input value={values.stockQuantity} onChange={(e) => setValues({ ...values, stockQuantity: e.target.value })} />
          {errors.stockQuantity && <p className="mt-1 text-xs text-red-600">{errors.stockQuantity}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Image URL</label>
          <Input 
            value={values.imageUrl} 
            onChange={(e) => setValues({ ...values, imageUrl: e.target.value })} 
            maxLength={255}
          />
          <div className="mt-1 text-xs text-gray-500">Max 255 characters</div>
          {errors.imageUrl && <p className="mt-1 text-xs text-red-600">{errors.imageUrl}</p>}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea 
          className="input min-h-28" 
          value={values.description} 
          onChange={(e) => setValues({ ...values, description: e.target.value })} 
          maxLength={500} 
        />
        <div className="mt-1 flex justify-between">
          <p className="text-xs text-gray-500">Max 500 characters</p>
          <p className="text-xs text-gray-500">
            {(values.description?.length || 0)}/500
          </p>
        </div>
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Categories</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = values.categoryIds.includes(c.id)
            return (
              <Button
                type="button"
                key={c.id}
                variant={active ? 'default' : 'outline'}
                onClick={() => toggleCategory(c.id)}
              >
                {c.name}
              </Button>
            )
          })}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" disabled={!canSubmit}>{initial ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  )
}
