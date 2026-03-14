import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, AddOrderItemDto, CreatePaymentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear pedido' })
  create(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.ordersService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos' })
  findAll(
    @Query('status') status?: string | string[],
    @Query('tableId') tableId?: string,
    @Query('waiterId') waiterId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : undefined;
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    return this.ordersService.findAll({
      status,
      tableId,
      waiterId,
      dateFrom,
      dateTo,
      page: pageNumber,
      limit: limitNumber,
    });
  }

  @Get('daily-summary')
  @ApiOperation({ summary: 'Resumen diario' })
  getDailySummary() {
    return this.ordersService.getDailySummary();
  }

  @Get('reports/weekly')
  @ApiOperation({ summary: 'Ventas semanales' })
  getWeeklySales() {
    return this.ordersService.getWeeklySales();
  }

  @Get('reports/top-products')
  @ApiOperation({ summary: 'Productos más vendidos' })
  getTopProducts(@Query('limit') limit?: string) {
    return this.ordersService.getTopProducts(limit ? parseInt(limit) : 10);
  }

  @Get('reports/top-waiters')
  @ApiOperation({ summary: 'Meseros con más ventas' })
  getTopWaiters(@Query('limit') limit?: string) {
    return this.ordersService.getTopWaiters(limit ? parseInt(limit) : 10);
  }

  @Get('reports/summary')
  @ApiOperation({ summary: 'Resumen general de ventas' })
  getSummaryReport() {
    return this.ordersService.getSummaryReport();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pedido' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Agregar item al pedido' })
  addItem(@Param('id') id: string, @Body() dto: AddOrderItemDto) {
    return this.ordersService.addItem(id, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Eliminar item del pedido' })
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.ordersService.removeItem(id, itemId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Post(':id/request-bill')
  @ApiOperation({ summary: 'Solicitar cuenta' })
  requestBill(@Param('id') id: string) {
    return this.ordersService.requestBill(id);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Agregar pago' })
  addPayment(@Param('id') id: string, @Body() dto: CreatePaymentDto) {
    return this.ordersService.addPayment(id, dto);
  }

  @Post(':id/invoice')
  @ApiOperation({ summary: 'Crear factura' })
  createInvoice(
    @Param('id') id: string,
    @Body() body: { name?: string; taxId?: string; address?: string },
  ) {
    return this.ordersService.createInvoice(id, body);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar pedido' })
  cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.ordersService.cancel(id, reason);
  }
}
