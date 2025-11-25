/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  // Ensure global setup runs before tests (sets up temp directories for mongodb-memory-server)
  globalSetup: '<rootDir>/jest.global-setup.js',
  // Global teardown to ensure spawned mongod processes are terminated (useful on Windows)
  globalTeardown: '<rootDir>/jest.global-teardown.js',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
