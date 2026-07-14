const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(jose)/)',
  ],
  // Les tests end-to-end sont exécutés par Playwright, pas par Jest
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  collectCoverage: true,
  // La couverture unitaire cible la couche logique (métier, API, sécurité).
  // La couche de présentation (pages/3D) est validée par les tests e2e Playwright.
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/app/api/**/*.ts',
    'src/middleware.ts',
    'src/components/ui/**/*.tsx',
    'src/components/layout/**/*.tsx',
    'src/app/(auth)/**/*.tsx',
    'src/app/page.tsx',
    'src/app/garage/**/*.ts',
    '!src/**/*.d.ts',
    // Singleton d'infrastructure sans logique métier (instanciation client Prisma)
    '!src/lib/prisma.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
