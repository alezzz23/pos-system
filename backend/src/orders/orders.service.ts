import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private readonly allowedStatusTransitions: Record<string, string[]> = {
    PENDING: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['READY', 'CANCELLED'],
    READY: ['SERVED', 'CANCELLED'],
    SERVED: ['BILL_REQUESTED', 'COMPLETED', 'CANCELLED'],
    BILL_REQUESTED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  async create(dto: CreateOrderDto, waiterId: string) {
    const order = await this.prisma.order.create({
      data: {
        type: dto.type,
        tableId: dto.tableId,
        waiterId,
        notes: dto.notes,
      },
      include: { table: true, items: true },
    });

    if (dto.tableId) {
      await this.prisma.table.update({
        where: { id: dto.tableId },
        data: { status: 'OCCUPIED' },
      });
    }

    return order;
  }

  async findAll(
    status?: string | string[],
    tableId?: string,
    page?: number,
    limit?: number,
  ) {
    // Parse status - puede venir como string único, array, o string separado por comas
    let statusArray: string[] | undefined;
    if (status) {
      if (Array.isArray(status)) {
        statusArray = status;
      } else if (typeof status === 'string' && status.includes(',')) {
        statusArray = status.split(',').map((s) => s.trim());
      } else {
        statusArray = [status];
      }
    }

    // Solo filtrar por completedAt: null si NO estamos buscando pedidos completados
    const shouldFilterCompleted = !statusArray?.includes('COMPLETED');

    const safePage = page && page > 0 ? page : 1;
    const safeLimit = limit && limit > 0 ? Math.min(limit, 100) : 50;
    const skip = (safePage - 1) * safeLimit;

    return this.prisma.order.findMany({
      where: {
        status: statusArray ? { in: statusArray as any[] } : undefined,
        tableId,
        completedAt: shouldFilterCompleted ? null : undefined,
      },
      include: {
        table: true,
        waiter: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: { product: true, variant: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeLimit,
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        waiter: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: { product: true, variant: true },
        },
        payments: true,
        invoice: true,
      },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async addItem(orderId: string, dto: AddOrderItemDto) {
    const order = await this.findOne(orderId);
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      throw new BadRequestException(
        'No se puede agregar items a un pedido completado o cancelado',
      );
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    let unitPrice = product.price;
    if (dto.variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: dto.variantId },
      });
      if (variant) unitPrice = variant.price;
    }

    const item = await this.prisma.orderItem.create({
      data: {
        orderId,
        productId: dto.productId,
        variantId: dto.variantId,
        quantity: dto.quantity,
        unitPrice,
        totalPrice: unitPrice * dto.quantity,
        notes: dto.notes,
      },
      include: { product: true, variant: true },
    });

    await this.recalculateTotals(orderId);

    return item;
  }

  async removeItem(orderId: string, itemId: string) {
    await this.prisma.orderItem.delete({
      where: { id: itemId, orderId },
    });

    await this.recalculateTotals(orderId);

    return { message: 'Item eliminado' };
  }

  async updateStatus(id: string, status: string) {
    const current = await this.prisma.order.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Pedido no encontrado');

    if (current.status === status) return current;

    const allowed = this.allowedStatusTransitions[current.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Transición de estado inválida: ${current.status} -> ${status}`,
      );
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: { status: status as any },
    });

    if (status === 'BILL_REQUESTED' && order.tableId) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'BILL_REQUESTED' },
      });
    }

    return order;
  }

  async requestBill(id: string) {
    return this.updateStatus(id, 'BILL_REQUESTED');
  }

  async addPayment(orderId: string, dto: CreatePaymentDto) {
    const order = await this.findOne(orderId);

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount: dto.amount,
        method: dto.method as any,
        reference: dto.reference,
        notes: dto.notes,
        status: 'COMPLETED',
      },
    });

    const totalPaid =
      order.payments.reduce((sum, p) => sum + p.amount, 0) + dto.amount;

    if (totalPaid >= order.total) {
      await this.completeOrder(orderId);
    }

    return payment;
  }

  private async completeOrder(orderId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    if (order.tableId) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'CLEANING' },
      });
    }

    return order;
  }

  async createInvoice(
    orderId: string,
    customerData?: {
      name?: string;
      taxId?: string;
      address?: string;
    },
  ) {
    const order = await this.findOne(orderId);

    const taxRate = 0.16; // 16% IVA
    const taxAmount = order.subtotal * taxRate;

    const invoice = await this.prisma.invoice.create({
      data: {
        orderId,
        invoiceNumber: `INV-${Date.now()}`,
        taxRate,
        taxAmount,
        subtotal: order.subtotal,
        total: order.total,
        customerName: customerData?.name,
        customerTaxId: customerData?.taxId,
        customerAddress: customerData?.address,
      },
    });

    return invoice;
  }

  async cancel(id: string, reason?: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `CANCELADO: ${reason}` : undefined,
      },
    });

    if (order.tableId) {
      await this.prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'AVAILABLE' },
      });
    }

    return order;
  }

  private async recalculateTotals(orderId: string) {
    const items = await this.prisma.orderItem.findMany({
      where: { orderId },
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 0.16;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return this.prisma.order.update({
      where: { id: orderId },
      data: { subtotal, tax, total },
    });
  }

  async getDailySummary(date?: Date) {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        status: 'COMPLETED',
      },
      include: { items: true },
    });

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalItems = orders.reduce((sum, o) => sum + o.items.length, 0);

    return {
      date: targetDate,
      totalSales,
      totalOrders,
      totalItems,
      averageTicket: totalOrders > 0 ? totalSales / totalOrders : 0,
    };
  }

  async getWeeklySales() {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: weekAgo },
        status: 'COMPLETED',
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    // Agrupar por día
    const salesByDay: { [key: string]: number } = {};
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Inicializar últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayName = days[date.getDay()];
      salesByDay[dayName] = 0;
    }

    // Sumar ventas por día
    orders.forEach((order) => {
      const dayName = days[order.createdAt.getDay()];
      salesByDay[dayName] += order.total;
    });

    return Object.entries(salesByDay).map(([day, sales]) => ({
      day,
      sales,
    }));
  }

  async getTopProducts(limit = 10) {
    const orders = await this.prisma.order.findMany({
      where: { status: 'COMPLETED' },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000, // Últimas 1000 órdenes
    });

    // Agrupar productos
    const productStats: {
      [key: string]: {
        name: string;
        quantity: number;
        revenue: number;
      };
    } = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId;
        if (!productStats[productId]) {
          productStats[productId] = {
            name: item.product?.name || 'Desconocido',
            quantity: 0,
            revenue: 0,
          };
        }
        productStats[productId].quantity += item.quantity;
        productStats[productId].revenue += item.totalPrice;
      });
    });

    // Ordenar por cantidad y limitar
    const sortedProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
      .map((product, index) => ({
        ...product,
        trend: Math.random() > 0.5 ? 'up' : 'down', // Placeholder para tendencia
      }));

    return sortedProducts;
  }

  async getTopWaiters(limit = 10) {
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        waiterId: { not: null },
      },
      include: {
        waiter: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    // Agrupar por mesero
    const waiterStats: {
      [key: string]: {
        name: string;
        orders: number;
        revenue: number;
      };
    } = {};

    orders.forEach((order) => {
      if (order.waiter) {
        const waiterId = order.waiterId!;
        if (!waiterStats[waiterId]) {
          waiterStats[waiterId] = {
            name: `${order.waiter.firstName} ${order.waiter.lastName}`,
            orders: 0,
            revenue: 0,
          };
        }
        waiterStats[waiterId].orders += 1;
        waiterStats[waiterId].revenue += order.total;
      }
    });

    return Object.values(waiterStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getSummaryReport() {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: weekAgo },
        status: 'COMPLETED',
      },
      include: { items: true },
    });

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalItems = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0,
    );

    // Calcular clientes únicos (usando tableId como proxy)
    const uniqueTables = new Set(
      orders.filter((o) => o.tableId).map((o) => o.tableId),
    );

    return {
      totalSales,
      totalOrders,
      totalItems,
      totalCustomers: uniqueTables.size,
      averageTicket: totalOrders > 0 ? totalSales / totalOrders : 0,
      period: {
        from: weekAgo,
        to: today,
      },
    };
  }
}
