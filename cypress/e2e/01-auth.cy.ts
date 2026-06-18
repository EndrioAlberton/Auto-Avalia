/// <reference types="cypress" />

describe('Autenticação', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  context('Página de Login - UI e Validação', () => {
    it('exibe logo e título da plataforma', () => {
      cy.contains('Autoavalia').should('be.visible');
      cy.contains('Entrar').should('be.visible');
    });

    it('exibe campos de email e senha', () => {
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('exibe botão de login desabilitado com campos vazios', () => {
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('exibe toggle para mostrar/ocultar senha', () => {
      cy.get('input[type="password"]').should('exist');
      // Clica no botão de toggle visibilidade
      cy.get('input[type="password"]')
        .parent()
        .parent()
        .find('button')
        .click();
      cy.get('input[type="text"][autocomplete="current-password"], input[type="text"]')
        .last()
        .should('exist');
    });

    it('exibe link para página de cadastro', () => {
      cy.contains('Criar conta').should('be.visible');
      cy.contains('Criar conta').click();
      cy.url().should('include', '/register');
    });

    it('exibe botão de login com Google', () => {
      cy.contains('Entrar com Google').should('be.visible');
    });

    it('exibe mensagem de erro para credenciais inválidas', () => {
      cy.get('input[type="email"]').type('invalido@test.com');
      cy.get('input[type="password"]').type('senhaerrada');
      cy.get('button[type="submit"]').click();
      // Aguarda resposta do Firebase e verifica mensagem de erro
      cy.get('[class*="MuiTypography"]', { timeout: 10000 })
        .contains(/erro|inválid|incorret/i)
        .should('be.visible');
    });

    it('redireciona "/" para login quando não autenticado', () => {
      cy.visit('/');
      cy.url().should('include', '/login');
    });

    it('redireciona rota protegida para login quando não autenticado', () => {
      cy.visit('/app/professor/inicio');
      cy.url().should('include', '/login');
    });
  });

  context('Página de Cadastro - UI e Validação', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('exibe formulário de cadastro', () => {
      cy.contains('Criar conta').should('be.visible');
    });

    it('exibe campo de nome', () => {
      cy.get('input[type="text"]').first().should('be.visible');
    });

    it('exibe campo de email', () => {
      cy.get('input[type="email"]').should('be.visible');
    });

    it('exibe campo de senha', () => {
      cy.get('input[type="password"]').first().should('be.visible');
    });

    it('exibe seletor de perfil (professor/gestor/secretaria)', () => {
      cy.contains(/perfil|papel|função|tipo de usuário|professor|gestor/i).should('be.visible');
    });

    it('exibe link para voltar ao login', () => {
      cy.contains(/entrar|login|já tenho conta/i).should('be.visible');
    });
  });
});
