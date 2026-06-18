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
    // Credenciais definidas em cypress.env.json (não versionado).
    // Execute `npm run seed` antes para garantir que os usuários existam.
    TEST_PROFESSOR_EMAIL: '',
    TEST_PROFESSOR_PASSWORD: '',
    TEST_GESTOR_EMAIL: '',
    TEST_GESTOR_PASSWORD: '',
    TEST_SECRETARIA_EMAIL: '',
    TEST_SECRETARIA_PASSWORD: '',
  },
});
