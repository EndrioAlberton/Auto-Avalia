import React from 'react';
import { ProgressBar } from '../../src/components/ui/data-display/ProgressBar';

describe('ProgressBar', () => {
  it('renderiza sem erros com valor 0', () => {
    cy.mount(<ProgressBar value={0} />);
    cy.get('[class*="MuiBox"]').should('exist');
  });

  it('renderiza sem erros com valor 100', () => {
    cy.mount(<ProgressBar value={100} />);
    cy.get('[class*="MuiBox"]').should('exist');
  });

  it('renderiza com valor intermediário (50)', () => {
    cy.mount(<ProgressBar value={50} />);
    cy.get('[class*="MuiBox"]').should('exist');
  });

  it('clampeia valor acima de 100 sem erros', () => {
    cy.mount(<ProgressBar value={150} />);
    cy.get('[class*="MuiBox"]').should('exist');
  });

  it('clampeia valor negativo sem erros', () => {
    cy.mount(<ProgressBar value={-10} />);
    cy.get('[class*="MuiBox"]').should('exist');
  });

  it('exibe label quando fornecido', () => {
    cy.mount(<ProgressBar value={75} label="Taxa de resposta" />);
    cy.contains('Taxa de resposta').should('be.visible');
  });

  it('exibe percentual quando showValue=true', () => {
    cy.mount(<ProgressBar value={75} showValue />);
    cy.contains('75%').should('be.visible');
  });

  it('não exibe percentual quando showValue=false (padrão)', () => {
    cy.mount(<ProgressBar value={75} />);
    cy.contains('75%').should('not.exist');
  });

  it('exibe label e percentual juntos', () => {
    cy.mount(<ProgressBar value={60} label="Progresso" showValue />);
    cy.contains('Progresso').should('be.visible');
    cy.contains('60%').should('be.visible');
  });
});
