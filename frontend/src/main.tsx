import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import './App.css'
import Layout from './routes/Layout'
import ProductsPage from './routes/ProductsPage'
import CategoriesPage from './routes/CategoriesPage'
import NotFound from './routes/NotFound'
import { initTheme } from './lib/theme'

initTheme()

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ProductsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
