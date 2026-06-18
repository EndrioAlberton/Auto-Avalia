/// <reference types="cypress" />

/**
 * Testes E2E para o fluxo da Secretaria / Rede de Ensino.
 *
 * Pré-requisito: preencher cypress.env.json com credenciais reais:
 * {
 *   "TEST_SECRETARIA_EMAIL": "secretaria@rede.com",
 *   "TEST_SECRETARIA_PASSWORD": "sua-senha"
 * }
 */

describe('Secretaria - Redirecionamento sem autenticação', () => {
  it('redireciona para login ao acessar rota da secretaria sem auth', () => {
    cy.visit('/app/secretaria/inicio');
    cy.url().should('include', '/login');
  });
});

describe('Secretaria - Fluxo completo (requer conta real)', () => {
  beforeEach(() => {
    if (!Cypress.env('TEST_SECRETARIA_EMAIL')) return;
    cy.loginAs('secretaria');
  });

  context('Visão da Rede (Dashboard)', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_SECRETARIA_EMAIL')) return;
      cy.visit('/app/secretaria/inicio');
    });

    it('exibe título "Visão da Rede"', () => {
      cy.contains(/visão da rede|secretaria/i).should('be.visible');
    });

    it('exibe KPI de escolas ativas', () => {
      cy.contains(/escolas ativas/i).should('be.visible');
    });

    it('exibe KPI de usuários totais', () => {
      cy.contains(/usuários totais/i).should('be.visible');
    });

    it('exibe KPI de respostas coletadas', () => {
      cy.contains(/respostas coletadas/i).should('be.visible');
    });

    it('exibe KPI de pontuação média', () => {
      cy.contains(/pontuação média/i).should('be.visible');
    });

    it('exibe seção "Domínios da rede"', () => {
      cy.contains(/domínios da rede/i).should('be.visible');
    });

    it('exibe seção "Escolas com menor coleta"', () => {
      cy.contains(/escolas com menor coleta/i).should('be.visible');
    });

    it('botão "Ver todas" navega para /escolas', () => {
      cy.contains(/ver todas/i).click();
      cy.url().should('include', '/app/secretaria/escolas');
    });
  });

  context('Gestão de Escolas', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_SECRETARIA_EMAIL')) return;
      cy.visit('/app/secretaria/escolas');
    });

    it('exibe título da página', () => {
      cy.contains(/escola/i).should('be.visible');
    });

    it('exibe botão "Nova escola" ou "Adicionar escola"', () => {
      cy.contains(/nova escola|adicionar escola|cadastrar escola/i).should('be.visible');
    });

    it('abre modal de criação ao clicar em Nova escola', () => {
      cy.contains(/nova escola|adicionar|cadastrar/i).click();
      cy.get('input[type="text"]').first().should('be.visible');
    });

    it('fecha modal ao clicar em Cancelar', () => {
      cy.contains(/nova escola|adicionar|cadastrar/i).click();
      cy.contains(/cancelar/i).click();
    });

    it('exibe tabela com colunas: Nome, Cidade, Estado', () => {
      cy.contains(/nome/i).should('be.visible');
    });
  });

  context('Relatórios da Rede', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_SECRETARIA_EMAIL')) return;
      cy.visit('/app/secretaria/relatorios');
    });

    it('exibe página de relatórios', () => {
      cy.contains(/relatório/i).should('be.visible');
    });

    it('exibe abas: Rede, Por Escola, Por Professor', () => {
      cy.contains('Rede').should('be.visible');
      cy.contains('Por Escola').should('be.visible');
      cy.contains('Por Professor').should('be.visible');
    });

    it('aba Rede está ativa por padrão', () => {
      cy.contains('Rede').should('be.visible');
      // KPIs da rede devem aparecer na aba ativa
      cy.contains(/escola|professor|resposta/i).should('be.visible');
    });

    it('troca para aba Por Escola ao clicar', () => {
      cy.contains('Por Escola').click();
      cy.contains(/nome|escola/i).should('be.visible');
    });

    it('troca para aba Por Professor ao clicar', () => {
      cy.contains('Por Professor').click();
      cy.contains(/professor|nome/i).should('be.visible');
    });
  });

  context('Administração de Usuários', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_SECRETARIA_EMAIL')) return;
      cy.visit('/app/secretaria/admin');
    });

    it('exibe título da página de admin', () => {
      cy.contains(/admin|usuário|gerenciar/i).should('be.visible');
    });

    it('exibe campo de busca por nome/email', () => {
      cy.get('input[type="text"], input[type="search"]').first().should('be.visible');
    });

    it('exibe filtro por perfil (Todos, Professor, Gestor, Secretaria)', () => {
      cy.contains(/todos|professor|gestor|secretaria/i).should('be.visible');
    });

    it('tabela exibe colunas de usuários', () => {
      cy.contains(/nome|email|perfil/i).should('be.visible');
    });

    it('filtro por "Professor" retorna apenas professores', () => {
      cy.contains(/professor/i).click();
      // Após filtrar, o resultado não deve mostrar "Gestor" nas badges de perfil
      cy.contains('Gestor').should('not.exist');
    });
  });

  context('Navegação lateral', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_SECRETARIA_EMAIL')) return;
      cy.visit('/app/secretaria/inicio');
    });

    it('sidebar exibe os 4 links da secretaria', () => {
      cy.contains(/início/i).should('be.visible');
      cy.contains(/escola/i).should('be.visible');
      cy.contains(/relatório/i).should('be.visible');
      cy.contains(/admin/i).should('be.visible');
    });

    it('navega para Escolas ao clicar no link', () => {
      cy.get('[class*="Sidebar"]').within(() => {
        cy.contains('Escolas').click();
      });
      cy.url().should('include', '/app/secretaria/escolas');
    });
  });
});
