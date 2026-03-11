import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Hamburguesa Clásica' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Carne de res, lechuga, tomate, cebolla' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @IsOptional()
  preparationTime?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ example: 'uuid-category' })
  @IsUUID()
  categoryId: string;
}
