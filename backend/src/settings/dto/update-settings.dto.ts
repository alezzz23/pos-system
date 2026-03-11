import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingItemDto {
  @ApiProperty({ example: 'business.name' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'Restaurante Ejemplo' })
  @IsString()
  value: string;
}

export class UpdateSettingsDto {
  @ApiProperty({ type: [UpdateSettingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSettingItemDto)
  items: UpdateSettingItemDto[];
}
