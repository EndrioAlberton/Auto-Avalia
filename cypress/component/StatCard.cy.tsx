import React from 'react';
import { StatCard } from '../../src/components/ui/data-display/StatCard';

describe('StatCard', () => {
  it('renderiza label e value', () => {
    cy.mount(<StatCard label="Total de escolas" value={42} />);
    cy.contains('Total de escolas').should('be.visible');
    cy.contains('42').should('be.visible');
  });

  it('renderiza value string', () => {
    cy.mount(<StatCard label="Pontuação média" value="3.8" />);
    cy.contains('3.8').should('be.visible');
  });

  it('exibe texto "sub" quando fornecido', () => {
    cy.mount(<StatCard label="Respostas" value={15} sub="+3 esta semana" />);
    cy.contains('+3 esta semana').should('be.visible');
  });

  it('não exibe sub quando loading=true', () => {
    cy.mount(<StatCard label="Respostas" value={15} sub="subtexto" loading />);
    cy.contains('subtexto').should('not.exist');
  });

  it('exibe skeleton quando loading=true', () => {
    cy.mount(<StatCard label="Carregando" value={0} loading />);
    // MUI Skeleton usa role="progressbar" ou a classe
    cy.get('[class*="MuiSkeleton"]').should('exist');
  });

  it('não exibe skeleton quando loading=false', () => {
    cy.mount(<StatCard label="Estável" value={5} loading={false} />);
    cy.get('[class*="MuiSkeleton"]').should('not.exist');
  });

  it('value "—" (placeholder) renderiza sem erros', () => {
    cy.mount(<StatCard label="Pontuação" value="—" />);
    cy.contains('—').should('be.visible');
  });
});
