import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
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
