import { PrismaPg } from '@prisma/adapter-pg';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { loadEnvironment } from '@common/config/env.loader';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    loadEnvironment();

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({ adapter });
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
