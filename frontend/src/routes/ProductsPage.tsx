import { useEffect, useMemo, useState } from 'react'
import Modal from '../components/Modal'
import ProductForm, { type ProductFormValues } from '../components/ProductForm'
import { api, type Category } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

type Product = {
  id: number
  name: string
  description?: string | null
  price: number
  stockQuantity: number
  imageUrl?: string | null
  categories: { category: Category }[]
}

type ProductsResponse = { products: Product[]; total: number }

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  async function fetchCategories() {
    try {
      const data = await api.listCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      setCategories([])
    }
  }

  async function fetchProducts() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      if (search) params.set('search', search)
      if (categoryId !== '') params.set('categoryId', String(categoryId))
      const res = await fetch(`${API_BASE}/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load products')
      const data: ProductsResponse = await res.json()
      setProducts(data.products)
      setTotal(data.total)
    } catch (e: any) {
      setError(e.message || 'Error fetching products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])
  useEffect(() => { fetchProducts() }, [page, pageSize, search, categoryId])

  function resetFilters() {
    setSearch('')
    setCategoryId('')
    setPage(1)
  }

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setModalOpen(true)
  }

  async function handleSubmit(values: ProductFormValues) {
    const payload = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      stockQuantity: Number(values.stockQuantity),
      imageUrl: values.imageUrl,
      categoryIds: values.categoryIds,
    }
    if (editing) await api.updateProduct(editing.id, payload)
    else await api.createProduct(payload)
    setModalOpen(false)
    await fetchProducts()
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this product?')) return
    await api.deleteProduct(id)
    await fetchProducts()
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-brand-500/10 via-white to-brand-600/10 p-6 shadow-card dark:from-brand-700/20 dark:via-gray-900 dark:to-brand-900/10">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
        <h1 className="text-2xl font-bold tracking-tight">Manage Products</h1>
        <p className="mt-1 max-w-prose text-sm text-gray-600 dark:text-gray-300">Search, filter, and manage your product catalog with a clean, responsive interface.</p>
        <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
            <Input
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value) }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <Select value={categoryId === '' ? 'all' : String(categoryId)} onValueChange={(val) => { setPage(1); setCategoryId(val === 'all' ? '' : Number(val)) }}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Page size</label>
            <Select value={String(pageSize)} onValueChange={(val) => { setPage(1); setPageSize(Number(val)) }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[8, 12, 24].map((s) => (
                  <SelectItem value={String(s)} key={s}>{s} / page</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetFilters}>Reset</Button>
          <Button onClick={() => fetchProducts()}>Apply</Button>
          <Button onClick={openCreate}>Add Product</Button>
        </div>
      </section>

      <section>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        {(!loading && products.length === 0) ? (
          <div className="card flex flex-col items-center justify-center p-10 text-center text-gray-600 dark:text-gray-300">
            <div className="mb-3 text-5xl">📦</div>
            <p className="font-medium">No products found</p>
            <p className="mt-1 text-sm">Try adjusting filters or add a new product.</p>
            <button className="btn mt-4" onClick={openCreate}>Add your first product</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => (
                  <Card key={i} className="h-64 overflow-hidden">
                    <div className="h-36 w-full animate-pulse bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800" />
                    <CardContent className="space-y-2 p-4">
                      <div className="h-5 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-gray-700" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-gray-700" />
                      <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-gray-700" />
                    </CardContent>
                  </Card>
                ))
              : products.map((p) => (
                  <Card key={p.id} className="group flex h-full flex-col overflow-hidden ring-1 ring-black/5 transition hover:shadow-lg">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="h-44 w-full object-cover transition group-hover:scale-[1.02]" />
                    ) : (
                      <div className="h-44 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800" />
                    )}
                    <CardContent className="flex flex-1 flex-col gap-2 p-4">
                      <h3 className="line-clamp-1 text-base font-semibold">{p.name}</h3>
                      {p.description && (
                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{p.description}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-bold">${Number(p.price).toFixed(2)}</span>
                        <span className="text-xs text-gray-500">Stock: {p.stockQuantity}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.categories.map((pc) => (
                          <span key={pc.category.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-gray-700 dark:text-gray-200">{pc.category.name}</span>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                        <Button onClick={() => handleDelete(p.id)}>Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-gray-600 dark:text-gray-300">Page {page} of {totalPages} • {total} items</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <Button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      </section>

      <Modal open={modalOpen} title={editing ? 'Edit Product' : 'Add Product'} onClose={() => setModalOpen(false)}>
        <ProductForm
          categories={categories}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
