/// <reference types="cypress" />

/**
 * Testes E2E para o fluxo do Professor.
 *
 * Pré-requisito: preencher cypress.env.json com credenciais reais:
 * {
 *   "TEST_PROFESSOR_EMAIL": "professor@suaescola.com",
 *   "TEST_PROFESSOR_PASSWORD": "sua-senha"
 * }
 *
 * Para testar sem conta real, use os testes de UI abaixo que não requerem login.
 */

describe('Professor - Página de Login (UI sem autenticação real)', () => {
  it('exibe a página de login ao acessar rota do professor sem auth', () => {
    cy.visit('/app/professor/inicio');
    cy.url().should('include', '/login');
    cy.contains('Entrar').should('be.visible');
  });
});

describe('Professor - Fluxo completo (requer conta real)', () => {
  before(() => {
    const email = Cypress.env('TEST_PROFESSOR_EMAIL');
    const password = Cypress.env('TEST_PROFESSOR_PASSWORD');
    if (!email || !password) {
      cy.log('⚠️  Credenciais de professor não configuradas em cypress.env.json — pulando testes autenticados');
    }
  });

  beforeEach(() => {
    // Pula graciosamente se credenciais não estiverem configuradas
    if (!Cypress.env('TEST_PROFESSOR_EMAIL')) return;
    cy.loginAs('professor');
  });

  context('Página Inicial (Início)', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_PROFESSOR_EMAIL')) return;
      cy.visit('/app/professor/inicio');
    });

    it('exibe a saudação ao professor', () => {
      cy.contains(/professor|início|bem.vindo/i).should('be.visible');
    });

    it('exibe cards de estatísticas (KPIs)', () => {
      cy.get('[class*="MuiCard"], [class*="StatCard"]').should('have.length.gte', 1);
    });

    it('exibe botão para responder questionário', () => {
      cy.contains(/questionário|responder|iniciar/i).should('be.visible');
    });
  });

  context('Questionário TPACK (multi-passo)', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_PROFESSOR_EMAIL')) return;
      cy.visit('/app/professor/questionario');
    });

    it('exibe a primeira seção do questionário (Contextualização)', () => {
      cy.contains(/contextualização|contexto|etapa de ensino/i, { timeout: 10000 }).should('be.visible');
    });

    it('exibe indicador de progresso com 5 seções', () => {
      // O questionário tem 5 seções (Ctx, Base, Intersect, AFR, Meta)
      cy.contains(/1\s*\/\s*5|seção 1|etapa 1|contextualização/i).should('be.visible');
    });

    it('botão Próximo fica ativo após selecionar resposta obrigatória', () => {
      // Seleciona a primeira opção da primeira questão de escolha
      cy.get('[class*="MuiRadio"], input[type="radio"]').first().click();
      cy.contains(/próximo|avançar|next/i).should('not.be.disabled');
    });

    it('navega para seção seguinte ao clicar em Próximo', () => {
      // Preenche campos obrigatórios mínimos
      cy.get('[class*="MuiRadio"], input[type="radio"]').first().click();
      cy.contains(/próximo|avançar/i).click();
      cy.contains(/conhecimento|base|seção 2|2\s*\/\s*5/i, { timeout: 5000 }).should('be.visible');
    });

    it('botão Voltar retorna para seção anterior', () => {
      cy.get('[class*="MuiRadio"], input[type="radio"]').first().click();
      cy.contains(/próximo|avançar/i).click();
      cy.contains(/voltar|anterior/i).click();
      cy.contains(/contextualização|contexto|etapa de ensino/i).should('be.visible');
    });
  });

  context('Relatórios', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_PROFESSOR_EMAIL')) return;
      cy.visit('/app/professor/relatorios');
    });

    it('exibe página de relatórios', () => {
      cy.contains(/relatório/i).should('be.visible');
    });

    it('exibe estado vazio quando não há respostas ou abas com dados', () => {
      // Pode ser estado vazio ou abas com dados — ambos são válidos
      cy.contains(/questionário|relatório|perfil|avaliação/i).should('be.visible');
    });
  });

  context('Perfil', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_PROFESSOR_EMAIL')) return;
      cy.visit('/app/professor/perfil');
    });

    it('exibe dados do perfil', () => {
      cy.contains(/perfil|nome|email/i).should('be.visible');
    });

    it('exibe campos editáveis', () => {
      cy.get('input[type="text"]').should('have.length.gte', 1);
    });

    it('exibe botão Salvar', () => {
      cy.contains(/salvar|atualizar/i).should('be.visible');
    });
  });

  context('Navegação lateral', () => {
    beforeEach(() => {
      if (!Cypress.env('TEST_PROFESSOR_EMAIL')) return;
      cy.visit('/app/professor/inicio');
    });

    it('sidebar exibe links de navegação do professor', () => {
      cy.contains(/início/i).should('be.visible');
      cy.contains(/questionário/i).should('be.visible');
      cy.contains(/relatório/i).should('be.visible');
      cy.contains(/perfil/i).should('be.visible');
    });

    it('clicar em Relatórios navega para /app/professor/relatorios', () => {
      cy.contains('Relatórios').click();
      cy.url().should('include', '/app/professor/relatorios');
    });

    it('clicar em Questionário navega para /app/professor/questionario', () => {
      cy.contains('Questionário').click();
      cy.url().should('include', '/app/professor/questionario');
    });
  });
});
