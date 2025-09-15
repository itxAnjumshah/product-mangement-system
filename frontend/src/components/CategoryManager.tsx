import { useEffect, useState } from 'react'
import { api, type Category } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      setError(null)
      const list = await api.listCategories()
      setCategories(Array.isArray(list) ? list : [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load categories')
      setCategories([])
    }
  }

  useEffect(() => { load() }, [])

  async function add() {
    if (!name.trim()) return
    setLoading(true)
    try {
      await api.createCategory(name.trim())
      setName('')
      await load()
    } finally {
      setLoading(false)
    }
  }

  async function rename(id: number) {
    const curr = categories.find((c) => c.id === id)
    const newName = window.prompt('New name', curr?.name || '')
    if (!newName || !newName.trim()) return
    await api.updateCategory(id, newName.trim())
    await load()
  }

  async function remove(id: number) {
    if (!window.confirm('Delete this category?')) return
    await api.deleteCategory(id)
    await load()
  }

  return (
    <div id="categories" className="card p-4 sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Categories</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Organize products into groups.</p>
        </div>
        <div className="flex w-full max-w-lg items-center gap-2">
          <Input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={add} disabled={loading}>Add</Button>
        </div>
      </div>
      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}
      <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-3">
            <span>{c.name}</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => rename(c.id)}>Rename</Button>
              <Button onClick={() => remove(c.id)}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
