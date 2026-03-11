import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Platos Principales' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Platos fuertes del menú' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: 'uuid-parent' })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
