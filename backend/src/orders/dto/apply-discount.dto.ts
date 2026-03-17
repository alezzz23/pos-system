import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsEnum, IsOptional, Min, Max } from 'class-validator';

export class ApplyDiscountDto {
    @ApiPropertyOptional({ enum: ['PERCENTAGE', 'FIXED'], example: 'PERCENTAGE' })
    @IsEnum(['PERCENTAGE', 'FIXED'])
    type: string;

    @ApiPropertyOptional({ example: 10 })
    @IsNumber()
    @Min(0)
    value: number;

    @ApiPropertyOptional({ example: 'Descuento por cliente frecuente' })
    @IsString()
    @IsOptional()
    reason?: string;
}
