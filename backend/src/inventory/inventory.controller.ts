import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateMovementDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MANAGER')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Crear artículo de inventario' })
  createItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createItem(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar artículos de inventario' })
  findAllItems(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumber = page ? parseInt(page, 10) : undefined;
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    return this.inventoryService.findAllItems(pageNumber, limitNumber);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumen de inventario' })
  getSummary() {
    return this.inventoryService.getSummary();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Artículos con stock bajo' })
  findLowStock() {
    return this.inventoryService.findLowStock();
  }

  @Get('total-value')
  @ApiOperation({ summary: 'Valor total del inventario' })
  getTotalValue() {
    return this.inventoryService.getTotalValue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener artículo' })
  findOneItem(@Param('id') id: string) {
    return this.inventoryService.findOneItem(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar artículo' })
  updateItem(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.updateItem(id, dto);
  }

  @Post(':id/movements')
  @ApiOperation({ summary: 'Agregar movimiento de inventario' })
  addMovement(@Param('id') id: string, @Body() dto: CreateMovementDto) {
    return this.inventoryService.addMovement(id, dto);
  }

  @Get(':id/movements')
  @ApiOperation({ summary: 'Obtener movimientos del artículo' })
  getMovements(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.inventoryService.getMovements(id, limit ? parseInt(limit) : 50);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar artículo' })
  removeItem(@Param('id') id: string) {
    return this.inventoryService.removeItem(id);
  }
}
