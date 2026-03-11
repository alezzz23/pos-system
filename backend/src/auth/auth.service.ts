import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.active) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user,
      token,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const session = await this.prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      return session.user;
    } catch {
      return null;
    }
  }

  async logout(token: string) {
    await this.prisma.session.deleteMany({ where: { token } });
  }

  async createAdminUser() {
    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: 'admin@pos.com' },
    });

    if (existingAdmin) {
      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    return this.prisma.user.create({
      data: {
        email: 'admin@pos.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Sistema',
        role: 'ADMIN',
      },
    });
  }
}
