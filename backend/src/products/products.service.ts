import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Categories
  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      include: { products: true, children: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true, children: true },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async removeCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  // Products
  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        image: dto.image,
        preparationTime: dto.preparationTime,
        categoryId: dto.categoryId,
      },
    });
  }

  async findAll(params?: {
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { categoryId, search, page, limit } = params ?? {};

    const safePage = page && page > 0 ? page : 1;
    const safeLimit = limit && limit > 0 ? Math.min(limit, 100) : 50;
    const skip = (safePage - 1) * safeLimit;

    return this.prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              name: {
                contains: search,
              },
            }
          : {}),
      },
      include: { category: true, variants: true },
      orderBy: { sortOrder: 'asc' },
      skip,
      take: safeLimit,
    });
  }

  async findAvailable() {
    return this.prisma.product.findMany({
      where: { active: true, available: true },
      include: { category: true, variants: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true, modifiers: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async setAvailability(id: string, available: boolean) {
    return this.prisma.product.update({
      where: { id },
      data: { available },
    });
  }
}
