import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    if (process.env.NODE_ENV === 'test') {
      super();
      return;
    }

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is required to initialize PrismaClient');
    }

    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleInit() {
    // Skip automatic connection in test environment
    if (process.env.NODE_ENV !== 'test') {
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    // Skip automatic disconnection in test environment
    if (process.env.NODE_ENV !== 'test') {
      await this.$disconnect();
    }
  }
}
