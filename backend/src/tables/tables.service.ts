import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTableDto) {
    return this.prisma.table.create({
      data: {
        number: dto.number,
        capacity: dto.capacity,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        width: dto.width ?? 100,
        height: dto.height ?? 100,
        shape: dto.shape ?? 'rectangle',
      },
    });
  }

  async findAll() {
    return this.prisma.table.findMany({
      include: {
        orders: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          take: 1,
        },
      },
      orderBy: { number: 'asc' },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          include: { items: { include: { product: true } } },
        },
      },
    });
    if (!table) throw new NotFoundException('Mesa no encontrada');
    return table;
  }

  async findByNumber(number: string) {
    return this.prisma.table.findUnique({ where: { number } });
  }

  async update(id: string, dto: UpdateTableDto) {
    return this.prisma.table.update({
      where: { id },
      data: dto,
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.table.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async remove(id: string) {
    return this.prisma.table.delete({ where: { id } });
  }

  async getAvailable() {
    return this.prisma.table.findMany({
      where: { status: 'AVAILABLE', active: true },
      orderBy: { number: 'asc' },
    });
  }

  async getOccupied() {
    return this.prisma.table.findMany({
      where: { status: 'OCCUPIED', active: true },
      include: {
        orders: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          take: 1,
        },
      },
      orderBy: { number: 'asc' },
    });
  }

  async setCleaning(id: string) {
    return this.updateStatus(id, 'CLEANING');
  }

  async setAvailable(id: string) {
    return this.updateStatus(id, 'AVAILABLE');
  }

  async reserve(id: string) {
    return this.updateStatus(id, 'RESERVED');
  }
}
