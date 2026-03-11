import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsString, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: ['CASH', 'CARD', 'TRANSFER', 'MIXED'] })
  @IsEnum(['CASH', 'CARD', 'TRANSFER', 'MIXED'])
  method: string;

  @ApiPropertyOptional({ example: 'TXN-12345' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ example: 'Pago parcial' })
  @IsString()
  @IsOptional()
  notes?: string;
}
