import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Setup environment for e2e tests
 * Loads .env.test before any test files are executed
 */
dotenv.config({
  path: path.resolve(__dirname, '../.env.test'),
});

// Ensure NODE_ENV is set to test
process.env.NODE_ENV = 'test';
