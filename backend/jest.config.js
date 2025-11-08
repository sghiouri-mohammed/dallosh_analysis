module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@api$': '<rootDir>/src/api/index.ts',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@configs/(.*)$': '<rootDir>/src/configs/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@scripts$': '<rootDir>/src/scripts/index.ts',
    '^@scripts/(.*)$': '<rootDir>/src/scripts/$1',
    '^@utils$': '<rootDir>/src/utils/index.ts',
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};

