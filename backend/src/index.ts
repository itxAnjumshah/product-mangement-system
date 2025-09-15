import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma/index.js';

dotenv.config();
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Product CRUD endpoints
app.get('/products', async (req: Request, res: Response) => {
  // Pagination & filtering logic implemented
  const { page = 1, pageSize = 10, categoryId, search } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);
  const where: any = {};
  if (categoryId) {
    where.categories = {
      some: { categoryId: Number(categoryId) }
    };
  }
  if (search) {
    where.name = { contains: String(search), mode: 'insensitive' };
  }
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      include: { categories: { include: { category: true } } },
    }),
    prisma.product.count({ where })
  ]);
  res.json({ products, total });
});

app.post('/products', async (req: Request, res: Response) => {
  // Input validation
  const { name, description, price, stockQuantity, imageUrl, categoryIds } = req.body;
  if (!name || typeof name !== 'string' || name.length > 255) {
    return res.status(400).json({ error: 'Invalid product name' });
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }
  if (stockQuantity === undefined || isNaN(stockQuantity) || Number(stockQuantity) < 0) {
    return res.status(400).json({ error: 'Invalid stock quantity' });
  }
  if (imageUrl && typeof imageUrl !== 'string') {
    return res.status(400).json({ error: 'Invalid imageUrl' });
  }
  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stockQuantity,
        imageUrl,
        categories: {
          create: Array.isArray(categoryIds) ? categoryIds.map((id: number) => ({ categoryId: id })) : []
        }
      },
      include: { categories: { include: { category: true } } },
    });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stockQuantity, imageUrl, categoryIds } = req.body;
  if (!name || typeof name !== 'string' || name.length > 255) {
    return res.status(400).json({ error: 'Invalid product name' });
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }
  if (stockQuantity === undefined || isNaN(stockQuantity) || Number(stockQuantity) < 0) {
    return res.status(400).json({ error: 'Invalid stock quantity' });
  }
  if (imageUrl && typeof imageUrl !== 'string') {
    return res.status(400).json({ error: 'Invalid imageUrl' });
  }
  try {
    // Update product fields
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price,
        stockQuantity,
        imageUrl,
        categories: {
          deleteMany: {},
          create: Array.isArray(categoryIds) ? categoryIds.map((catId: number) => ({ categoryId: catId })) : []
        }
      },
      include: { categories: { include: { category: true } } },
    });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const productId = Number(id);
  try {
    // Remove join rows first to satisfy FK constraints
    await prisma.productCategory.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    // If record does not exist, return 404
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Category CRUD endpoints
app.get('/categories', async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

app.post('/categories', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.length > 255) {
    return res.status(400).json({ error: 'Invalid category name' });
  }
  try {
    const category = await prisma.category.create({ data: { name } });
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.length > 255) {
    return res.status(400).json({ error: 'Invalid category name' });
  }
  try {
    const category = await prisma.category.update({ where: { id: Number(id) }, data: { name } });
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const categoryId = Number(id);
  try {
    // Remove join rows first to satisfy FK constraints
    await prisma.productCategory.deleteMany({ where: { categoryId } });
    await prisma.category.delete({ where: { id: categoryId } });
    res.json({ message: 'Category deleted' });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
