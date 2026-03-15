// Mock PrismaClient for testing
export class PrismaClient {
  constructor(..._args: any[]) {
    // Accept and ignore PrismaClient constructor options in tests.
  }

  async $connect() {
    // No-op
  }

  async $disconnect() {
    // No-op
  }

  async $queryRaw(..._args: any[]) {
    return [{ result: 1 }];
  }

  // Add other commonly used methods as needed
}

export default new PrismaClient();
