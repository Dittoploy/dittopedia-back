// Mock PrismaClient for testing
export class PrismaClient {
  async $connect() {
    // No-op
  }

  async $disconnect() {
    // No-op
  }

  // Add other commonly used methods as needed
}

export default new PrismaClient();
