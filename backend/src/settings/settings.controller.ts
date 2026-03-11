import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MANAGER')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar settings' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Put()
  @ApiOperation({ summary: 'Actualizar settings (upsert por key)' })
  upsertMany(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.upsertMany(dto);
  }
}
