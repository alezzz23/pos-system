import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class AddOrderItemDto {
  @ApiProperty({ example: 'uuid-product' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ example: 'uuid-variant' })
  @IsUUID()
  @IsOptional()
  variantId?: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Sin cebolla' })
  @IsString()
  @IsOptional()
  notes?: string;
}
