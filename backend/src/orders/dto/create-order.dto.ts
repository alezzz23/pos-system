import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';

export class CreateOrderDto {
  @ApiPropertyOptional({ enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'] })
  @IsEnum(['DINE_IN', 'TAKEAWAY', 'DELIVERY'])
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: 'uuid-table' })
  @IsUUID()
  @IsOptional()
  tableId?: string;

  @ApiPropertyOptional({ example: 'Sin cebolla' })
  @IsString()
  @IsOptional()
  notes?: string;
}
