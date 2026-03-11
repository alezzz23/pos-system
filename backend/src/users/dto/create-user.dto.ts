import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'nuevo@pos.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: ['ADMIN', 'MANAGER', 'WAITER', 'KITCHEN', 'CASHIER'] })
  @IsEnum(['ADMIN', 'MANAGER', 'WAITER', 'KITCHEN', 'CASHIER'])
  role: string;

  @ApiPropertyOptional({ example: '+52 555 123 4567' })
  @IsString()
  @IsOptional()
  phone?: string;
}
