import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto, UpdateCategoryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Categories endpoints
  @Post('categories')
  @ApiOperation({ summary: 'Crear categoría' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.productsService.createCategory(dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorías' })
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Obtener categoría' })
  findCategory(@Param('id') id: string) {
    return this.productsService.findCategory(id);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.productsService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Eliminar categoría' })
  removeCategory(@Param('id') id: string) {
    return this.productsService.removeCategory(id);
  }

  // Products endpoints
  @Post()
  @ApiOperation({ summary: 'Crear producto' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos' })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : undefined;
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    return this.productsService.findAll({ categoryId, search, page: pageNumber, limit: limitNumber });
  }

  @Get('available')
  @ApiOperation({ summary: 'Listar productos disponibles' })
  findAvailable() {
    return this.productsService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar producto' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/availability')
  @ApiOperation({ summary: 'Cambiar disponibilidad' })
  setAvailability(@Param('id') id: string, @Body('available') available: boolean) {
    return this.productsService.setAvailability(id, available);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
