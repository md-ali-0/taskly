import { PrismaPg } from '@prisma/adapter-pg';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { loadEnvironment } from '@common/config/env.loader';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    loadEnvironment();
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }

    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication) {
    process.once('beforeExit', () => {
      void app.close();
    });
  }
}
