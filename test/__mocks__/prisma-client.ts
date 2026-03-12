// Jest mock for the generated Prisma client.
// Unit tests should never hit a real database — PrismaService is mocked at the module level.

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

export class PrismaClient {
  $connect = jest.fn();
  $disconnect = jest.fn();
  user = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

export const Prisma = {};
