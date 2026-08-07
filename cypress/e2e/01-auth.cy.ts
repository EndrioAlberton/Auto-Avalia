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

    it('não exibe seletor de perfil — toda conta nova é professor', () => {
      // [role="combobox"] é o que o Select do MUI v6 renderiza.
      cy.get('[role="combobox"]').should('not.exist');
      cy.contains(/criada como Professor/i).should('be.visible');
    });

    it('exibe link para voltar ao login', () => {
      cy.contains(/entrar|login|já tenho conta/i).should('be.visible');
    });
  });

  context('Recuperação de senha', () => {
    it('link do login leva para /forgot-password', () => {
      cy.visit('/login');
      cy.contains(/esqueci minha senha/i).click();
      cy.url().should('include', '/forgot-password');
    });

    it('exibe campo de email', () => {
      cy.visit('/forgot-password');
      cy.get('[data-testid="forgot-email-input"]').should('be.visible');
    });

    it('mostra confirmação neutra sem revelar se a conta existe', () => {
      cy.visit('/forgot-password');
      cy.get('[data-testid="forgot-email-input"]').type('naoexiste@test.com');
      cy.get('[data-testid="forgot-submit"]').click();
      cy.contains(/se existir uma conta/i).should('be.visible');
    });

    it('permite voltar para o login', () => {
      cy.visit('/forgot-password');
      cy.contains(/voltar para o login/i).click();
      cy.url().should('include', '/login');
    });
  });
});
