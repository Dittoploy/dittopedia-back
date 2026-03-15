import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  // Vérifie que NestJS est up
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  // Vérifie les dépendances critiques: DB, etc.
  @Get('ready')
  @HealthCheck()
  async ready() {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`;
        return { database: { status: 'up' } };
      },
    ]);
  }
}
