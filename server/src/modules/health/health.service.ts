import { appConfig } from '@common/config/app.config';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicHealth() {
    const memory = process.memoryUsage();
    const database = await this.getDatabaseHealth();

    return {
      status: 'ok',
      service: appConfig.appName,
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())} seconds`,
      version: appConfig.version,
      environment: appConfig.nodeEnv,
      services: {
        database,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
      memory: {
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
        rssMb: Math.round(memory.rss / 1024 / 1024),
      },
    };
  }

  private async getDatabaseHealth() {
    if (!appConfig.databaseUrl) {
      return 'missing';
    }

    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      return 'connected';
    } catch {
      return 'unreachable';
    }
  }
}
