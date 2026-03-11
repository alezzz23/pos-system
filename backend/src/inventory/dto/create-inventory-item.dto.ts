import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'Carne de Res' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'CARN-001' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ example: 'kg' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  minQuantity?: number;

  @ApiPropertyOptional({ example: 180 })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({ example: 'Refrigerador A' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'uuid-product' })
  @IsUUID()
  @IsOptional()
  productId?: string;
}
