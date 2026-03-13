import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateMovementDto } from './dto/create-movement.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async createItem(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        quantity: dto.quantity ?? 0,
        unit: dto.unit ?? 'unit',
        minQuantity: dto.minQuantity ?? 0,
        cost: dto.cost ?? 0,
        location: dto.location,
        productId: dto.productId,
      },
    });
  }

  async findAllItems(page?: number, limit?: number) {
    const safePage = page && page > 0 ? page : 1;
    const safeLimit = limit && limit > 0 ? Math.min(limit, 100) : 50;
    const skip = (safePage - 1) * safeLimit;

    return this.prisma.inventoryItem.findMany({
      include: { product: true },
      orderBy: { name: 'asc' },
      skip,
      take: safeLimit,
    });
  }

  async findLowStock() {
    // Prisma no soporta comparación columna-a-columna en where
    // Traemos todos los items y filtramos en memoria
    const allItems = await this.prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' },
    });

    return allItems.filter((item) => item.quantity <= item.minQuantity);
  }

  async findOneItem(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        product: true,
        movements: { take: 20, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!item) throw new NotFoundException('Artículo no encontrado');
    return item;
  }

  async updateItem(id: string, dto: UpdateInventoryItemDto) {
    return this.prisma.inventoryItem.update({
      where: { id },
      data: dto,
    });
  }

  async removeItem(id: string) {
    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  async addMovement(itemId: string, dto: CreateMovementDto) {
    const item = await this.findOneItem(itemId);

    const movement = await this.prisma.inventoryMovement.create({
      data: {
        itemId,
        quantity: dto.quantity,
        type: dto.type,
        reason: dto.reason,
        reference: dto.reference,
      },
    });

    let newQuantity = item.quantity;
    if (dto.type === 'IN') {
      newQuantity += dto.quantity;
    } else if (dto.type === 'OUT' || dto.type === 'RETURN') {
      newQuantity -= dto.quantity;
    } else if (dto.type === 'ADJUSTMENT') {
      newQuantity = dto.quantity;
    }

    await this.prisma.inventoryItem.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
    });

    return movement;
  }

  async getMovements(itemId: string, limit = 50) {
    return this.prisma.inventoryMovement.findMany({
      where: { itemId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTotalValue() {
    const items = await this.prisma.inventoryItem.findMany();
    return items.reduce((sum, item) => sum + item.quantity * item.cost, 0);
  }

  async getSummary() {
    const items = await this.prisma.inventoryItem.findMany();
    const lowStock = items.filter((i) => i.quantity <= i.minQuantity);
    const totalValue = items.reduce((sum, i) => sum + i.quantity * i.cost, 0);

    return {
      totalItems: items.length,
      lowStockCount: lowStock.length,
      totalValue,
      lowStockItems: lowStock,
    };
  }
}
