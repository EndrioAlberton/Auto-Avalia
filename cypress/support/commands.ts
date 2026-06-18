/// <reference types="cypress" />

// ── Fixture types ────────────────────────────────────────────────────────────

interface AuthFixture {
  email: string;
  password: string;
  uid: string;
  displayName: string;
  role: string;
  schoolId?: string;
  networkId?: string;
}

// ── Custom commands ───────────────────────────────────────────────────────────

/**
 * Realiza login via formulário da aplicação e armazena sessão.
 * Usa cy.session para reutilizar entre testes do mesmo papel.
 */
Cypress.Commands.add('loginAs', (role: 'professor' | 'gestor' | 'secretaria') => {
  const emails: Record<string, string> = {
    professor: Cypress.env('TEST_PROFESSOR_EMAIL'),
    gestor: Cypress.env('TEST_GESTOR_EMAIL'),
    secretaria: Cypress.env('TEST_SECRETARIA_EMAIL'),
  };
  const passwords: Record<string, string> = {
    professor: Cypress.env('TEST_PROFESSOR_PASSWORD'),
    gestor: Cypress.env('TEST_GESTOR_PASSWORD'),
    secretaria: Cypress.env('TEST_SECRETARIA_PASSWORD'),
  };

  cy.session(
    [`auth-${role}`],
    () => {
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(emails[role]);
      cy.get('[data-testid="password-input"]').type(passwords[role]);
      cy.get('[data-testid="login-submit"]').click();
      cy.url().should('include', `/app/${role}/inicio`);
    },
    {
      validate() {
        cy.url().should('not.include', '/login');
      },
    },
  );
});

/**
 * Intercepta chamadas de autenticação Firebase com fixture fornecida.
 * Usar em testes que não dependem de conta real.
 */
Cypress.Commands.add('stubFirebaseAuth', (fixture: AuthFixture) => {
  // Firebase Auth REST endpoint
  cy.intercept('POST', '**/accounts:signInWithPassword**', {
    statusCode: 200,
    body: {
      kind: 'identitytoolkit#VerifyPasswordResponse',
      localId: fixture.uid,
      email: fixture.email,
      displayName: fixture.displayName,
      idToken: 'mock-id-token-' + fixture.role,
      registered: true,
      refreshToken: 'mock-refresh-token',
      expiresIn: '3600',
    },
  }).as('firebaseLogin');
});

// ── Helpers de UI ─────────────────────────────────────────────────────────────

/** Espera a página carregar (sem spinner de loading) */
Cypress.Commands.add('waitForPage', () => {
  cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should('not.exist');
});

// ── Type declarations ─────────────────────────────────────────────────────────

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: 'professor' | 'gestor' | 'secretaria'): Chainable<void>;
      stubFirebaseAuth(fixture: AuthFixture): Chainable<void>;
      waitForPage(): Chainable<void>;
    }
  }
}
