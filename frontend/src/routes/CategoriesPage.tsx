import CategoryManager from '../components/CategoryManager'

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="card p-4 sm:p-6">
        <h1 className="text-xl font-semibold">Categories</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Create, rename, and delete categories used to organize products.</p>
      </div>
      <CategoryManager />
    </div>
  )
}

