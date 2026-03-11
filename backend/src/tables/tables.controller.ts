import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear mesa' })
  create(@Body() dto: CreateTableDto) {
    return this.tablesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las mesas' })
  findAll() {
    return this.tablesService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Listar mesas disponibles' })
  getAvailable() {
    return this.tablesService.getAvailable();
  }

  @Get('occupied')
  @ApiOperation({ summary: 'Listar mesas ocupadas' })
  getOccupied() {
    return this.tablesService.getOccupied();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mesa' })
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar mesa' })
  update(@Param('id') id: string, @Body() dto: UpdateTableDto) {
    return this.tablesService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de mesa' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.tablesService.updateStatus(id, status);
  }

  @Patch(':id/cleaning')
  @ApiOperation({ summary: 'Marcar mesa en limpieza' })
  setCleaning(@Param('id') id: string) {
    return this.tablesService.setCleaning(id);
  }

  @Patch(':id/available')
  @ApiOperation({ summary: 'Marcar mesa disponible' })
  setAvailable(@Param('id') id: string) {
    return this.tablesService.setAvailable(id);
  }

  @Patch(':id/reserve')
  @ApiOperation({ summary: 'Reservar mesa' })
  reserve(@Param('id') id: string) {
    return this.tablesService.reserve(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar mesa' })
  remove(@Param('id') id: string) {
    return this.tablesService.remove(id);
  }
}
