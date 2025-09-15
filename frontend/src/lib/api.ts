export type Category = { id: number; name: string }
export type Product = {
  id: number
  name: string
  description?: string | null
  price: number
  stockQuantity: number
  imageUrl?: string | null
  categoryIds?: number[]
  categories?: { category: Category }[]
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = typeof init?.body !== 'undefined'
  const headers = hasBody
    ? { 'Content-Type': 'application/json', ...(init?.headers || {}) }
    : { ...(init?.headers || {}) }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    try {
      // Try to parse the error as JSON to provide a better error message
      const errorData = JSON.parse(text)
      // Extract Prisma error message if available
      if (errorData.error && errorData.error.includes('Invalid `prisma')) {
        const match = errorData.error.match(/Column: \(([^)]+)\)/)
        const fieldName = match ? match[1] : 'unknown field'
        throw new Error(`Database error: Value too long for ${fieldName}`)
      }
      throw new Error(errorData.message || errorData.error || `Request failed: ${res.status}`)
    } catch (e) {
      // If parsing fails, use the raw text or a generic error message
      if (e instanceof Error && e.message.includes('Database error:')) {
        throw e
      }
      throw new Error(text || `Request failed: ${res.status}`)
    }
  }
  return res.json()
}

export const api = {
  // Products
  listProducts(params: { page?: number; pageSize?: number; search?: string; categoryId?: number | '' }) {
    const sp = new URLSearchParams()
    if (params.page) sp.set('page', String(params.page))
    if (params.pageSize) sp.set('pageSize', String(params.pageSize))
    if (params.search) sp.set('search', params.search)
    if (params.categoryId !== undefined && params.categoryId !== '') sp.set('categoryId', String(params.categoryId))
    return http<{ products: Product[]; total: number }>(`/products?${sp.toString()}`)
  },
  createProduct(payload: Omit<Product, 'id' | 'categories'>) {
    return http<Product>('/products', { method: 'POST', body: JSON.stringify(payload) })
  },
  updateProduct(id: number, payload: Omit<Product, 'id' | 'categories'>) {
    return http<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  },
  deleteProduct(id: number) {
    return http<{ message: string }>(`/products/${id}`, { method: 'DELETE' })
  },
  // Categories
  listCategories() {
    return http<Category[]>('/categories')
  },
  createCategory(name: string) {
    return http<Category>('/categories', { method: 'POST', body: JSON.stringify({ name }) })
  },
  updateCategory(id: number, name: string) {
    return http<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) })
  },
  deleteCategory(id: number) {
    return http<{ message: string }>(`/categories/${id}`, { method: 'DELETE' })
  },
}

