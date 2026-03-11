import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateTableDto {
  @ApiProperty({ example: '1' })
  @IsString()
  number: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  @Max(20)
  capacity: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  positionX?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  positionY?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({ example: 'rectangle' })
  @IsString()
  @IsOptional()
  shape?: string;
}
