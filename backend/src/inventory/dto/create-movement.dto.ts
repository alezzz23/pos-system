import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsString, IsOptional, Min } from 'class-validator';

export class CreateMovementDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ enum: ['IN', 'OUT', 'ADJUSTMENT', 'RETURN'] })
  @IsEnum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN'])
  type: string;

  @ApiPropertyOptional({ example: 'Compra a proveedor' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ example: 'PO-001' })
  @IsString()
  @IsOptional()
  reference?: string;
}
