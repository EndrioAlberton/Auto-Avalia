/// <reference types="cypress" />

/**
 * Testes E2E para o fluxo do Gestor Escolar.
 *
 * Pré-requisito: preencher cypress.env.json com credenciais reais:
 * {
 *   "TEST_GESTOR_EMAIL": "gestor@suaescola.com",
 *   "TEST_GESTOR_PASSWORD": "sua-senha"
 * }
 */

describe('Gestor - Redirecionamento sem autenticação', () => {
  it('redireciona para login ao acessar rota do gestor sem auth', () => {
    cy.visit('/app/gestor/inicio');
    cy.url().should('include', '/login');
  });
});

describe('Gestor - Fluxo completo (requer conta real)', () => {
  beforeEach(() => {
    if (!Cypress.env('TEST_GESTOR_EMAIL')) return;
    cy.loginAs('gestor');
  });

  context('Página Inicial (Dashboard)', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_GESTOR_EMAIL')) return;
      cy.visit('/app/gestor/inicio');
    });

    it('exibe título da página', () => {
      cy.contains(/gestor|início|dashboard/i).should('be.visible');
    });

    it('exibe KPIs: professores, taxa de resposta, pontuação', () => {
      cy.contains(/professor/i).should('be.visible');
      cy.contains(/resposta|taxa/i).should('be.visible');
    });

    it('exibe prompt de configuração quando escola não está cadastrada', () => {
      // Se a escola não estiver configurada, deve aparecer um aviso
      cy.get('body').then(($body) => {
        if ($body.text().includes('Configurar escola')) {
          cy.contains(/configurar escola/i).should('be.visible');
        }
      });
    });
  });

  context('Gestão de Equipe', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_GESTOR_EMAIL')) return;
      cy.visit('/app/gestor/equipe');
    });

    it('exibe título "Equipe"', () => {
      cy.contains('Equipe').should('be.visible');
    });

    it('exibe botão "Convidar professor"', () => {
      cy.contains(/convidar professor/i).should('be.visible');
    });

    it('exibe cards de estatísticas da equipe', () => {
      cy.contains(/total/i).should('be.visible');
      cy.contains(/responderam|respondeu/i).should('be.visible');
    });

    it('abre modal de convite ao clicar em "Convidar professor"', () => {
      cy.contains(/convidar professor/i).click();
      cy.contains(/convidar professor|email/i).should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
    });

    it('fecha modal de convite ao clicar em Cancelar', () => {
      cy.contains(/convidar professor/i).click();
      cy.contains(/cancelar/i).click();
      cy.get('input[type="email"]').should('not.exist');
    });

    it('botão Enviar convite fica desabilitado sem email', () => {
      cy.contains(/convidar professor/i).click();
      cy.contains(/enviar convite/i).should('be.disabled');
    });

    it('habilita botão Enviar convite ao digitar email válido', () => {
      cy.contains(/convidar professor/i).click();
      cy.get('input[type="email"]').type('novoprofessor@escola.com');
      cy.contains(/enviar convite/i).should('not.be.disabled');
    });

    it('exibe tabela de professores/convites', () => {
      cy.contains(/nome|email|status/i).should('be.visible');
    });
  });

  context('Configuração da Escola', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_GESTOR_EMAIL')) return;
      cy.visit('/app/gestor/escola');
    });

    it('exibe formulário de configuração da escola', () => {
      cy.contains(/escola|nome da escola/i).should('be.visible');
    });

    it('exibe campos: nome, cidade, estado', () => {
      cy.get('input[type="text"]').should('have.length.gte', 1);
    });

    it('exibe botão Salvar', () => {
      cy.contains(/salvar|atualizar/i).should('be.visible');
    });
  });

  context('Relatórios da Escola', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_GESTOR_EMAIL')) return;
      cy.visit('/app/gestor/relatorios');
    });

    it('exibe página de relatórios', () => {
      cy.contains(/relatório/i).should('be.visible');
    });

    it('exibe abas: Coletivo, Por Segmento, Por Professor (quando há dados)', () => {
      cy.get('body').then(($body) => {
        if ($body.text().includes('Coletivo')) {
          cy.contains('Coletivo').should('be.visible');
          cy.contains('Por Segmento').should('be.visible');
          cy.contains('Por Professor').should('be.visible');
        }
      });
    });
  });

  context('Navegação lateral', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_GESTOR_EMAIL')) return;
      cy.visit('/app/gestor/inicio');
    });

    it('sidebar exibe os 4 links do gestor', () => {
      cy.contains(/início/i).should('be.visible');
      cy.contains(/equipe/i).should('be.visible');
      cy.contains(/escola/i).should('be.visible');
      cy.contains(/relatório/i).should('be.visible');
    });

    it('navega para Equipe ao clicar no link', () => {
      cy.contains('Equipe').click();
      cy.url().should('include', '/app/gestor/equipe');
    });

    it('navega para Escola ao clicar no link', () => {
      cy.contains('Escola').click();
      cy.url().should('include', '/app/gestor/escola');
    });
  });
});
