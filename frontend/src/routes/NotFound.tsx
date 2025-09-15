import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="text-6xl font-black text-brand-600">404</div>
      <p className="mt-2 text-lg font-semibold">Page not found</p>
      <p className="mt-1 max-w-prose text-sm text-gray-600 dark:text-gray-300">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn mt-6">Go back home</Link>
    </div>
  )
}

