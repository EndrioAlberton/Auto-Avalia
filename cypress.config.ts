import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.tsx',
    viewportWidth: 800,
    viewportHeight: 600,
  },
  env: {
    // Preencher em cypress.env.json (não versionar)
    FIREBASE_API_KEY: '',
    TEST_PROFESSOR_EMAIL: 'professor@autoavalia.test',
    TEST_PROFESSOR_PASSWORD: 'Teste@123',
    TEST_GESTOR_EMAIL: 'gestor@autoavalia.test',
    TEST_GESTOR_PASSWORD: 'Teste@123',
    TEST_SECRETARIA_EMAIL: 'secretaria@autoavalia.test',
    TEST_SECRETARIA_PASSWORD: 'Teste@123',
  },
});
