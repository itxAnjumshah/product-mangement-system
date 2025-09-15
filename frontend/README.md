# Product Management System – Frontend

Quick start

- Backend
  - Set `DATABASE_URL` in `backend/.env` to your Postgres connection string.
  - Optionally set `FRONTEND_ORIGIN` (default `http://localhost:5173`).
  - From `backend/`:
    - `npm i`
    - `npm run migrate`
    - `npm run dev`
- Frontend
  - From `frontend/`:
    - `npm i`
    - (Optional) create `frontend/.env` with `VITE_API_BASE=http://localhost:4000`
    - `npm run dev`

Features implemented

- Products: list, search, filter by category, pagination
- Product create/edit/delete with validation (modal form)
- Categories: list, create, rename, delete
- Fully responsive UI built with Tailwind CSS

API endpoints

- `GET /products` query: `page`, `pageSize`, `search`, `categoryId`
- `POST /products` body: `{ name, description?, price, stockQuantity, imageUrl?, categoryIds: number[] }`
- `PUT /products/:id` body: same as POST
- `DELETE /products/:id`
- `GET /categories`
- `POST /categories` body: `{ name }`
- `PUT /categories/:id` body: `{ name }`
- `DELETE /categories/:id`

Below is the original Vite template readme.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
