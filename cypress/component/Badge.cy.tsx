import React from 'react';
import { Badge } from '../../src/components/ui/primitives/Badge';

describe('Badge', () => {
  it('renderiza o texto do label', () => {
    cy.mount(<Badge label="Respondido" variant="success" />);
    cy.contains('Respondido').should('be.visible');
  });

  it('variante success aplica cor verde', () => {
    cy.mount(<Badge label="Aprovado" variant="success" />);
    cy.contains('Aprovado')
      .should('have.css', 'color')
      .and('match', /rgb/);
  });

  it('variante warning renderiza o label', () => {
    cy.mount(<Badge label="Atenção" variant="warning" />);
    cy.contains('Atenção').should('be.visible');
  });

  it('variante error renderiza o label', () => {
    cy.mount(<Badge label="Erro" variant="error" />);
    cy.contains('Erro').should('be.visible');
  });

  it('variante neutral renderiza o label', () => {
    cy.mount(<Badge label="Pendente" variant="neutral" />);
    cy.contains('Pendente').should('be.visible');
  });

  it('variante accent renderiza o label', () => {
    cy.mount(<Badge label="Novo" variant="accent" />);
    cy.contains('Novo').should('be.visible');
  });

  it('aceita labels longos sem quebrar layout', () => {
    cy.mount(<Badge label="Conhecimento Pedagógico do Conteúdo" variant="neutral" />);
    cy.contains('Conhecimento Pedagógico do Conteúdo').should('be.visible');
  });

  it('label vazio renderiza sem erros', () => {
    cy.mount(<Badge label="" variant="neutral" />);
    cy.get('[class*="MuiBox"]').should('exist');
  });
});
