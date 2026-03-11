import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Logout exitoso' })
  async logout(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    await this.authService.logout(token);
    return { message: 'Sesión cerrada exitosamente' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener usuario actual' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  async getCurrentUser(@Req() req: any) {
    return req.user;
  }

  @Post('init')
  @ApiOperation({ summary: 'Inicializar usuario admin' })
  @ApiResponse({ status: 200, description: 'Admin creado o existente' })
  async initAdmin() {
    return this.authService.createAdminUser();
  }
}
