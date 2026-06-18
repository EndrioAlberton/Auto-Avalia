import React from 'react';
import { DataTable } from '../../src/components/ui/data-display/DataTable';

interface Row {
  id: number;
  nome: string;
  status: string;
}

const columns = [
  { key: 'id',     header: 'ID' },
  { key: 'nome',   header: 'Nome' },
  { key: 'status', header: 'Status' },
];

const rows: Row[] = [
  { id: 1, nome: 'Ana Silva',   status: 'Ativo' },
  { id: 2, nome: 'Bruno Lima',  status: 'Inativo' },
  { id: 3, nome: 'Carla Melo',  status: 'Ativo' },
];

describe('DataTable', () => {
  it('renderiza cabeçalhos de colunas', () => {
    cy.mount(<DataTable columns={columns} rows={rows} />);
    cy.contains('ID').should('be.visible');
    cy.contains('Nome').should('be.visible');
    cy.contains('Status').should('be.visible');
  });

  it('renderiza dados das linhas', () => {
    cy.mount(<DataTable columns={columns} rows={rows} />);
    cy.contains('Ana Silva').should('be.visible');
    cy.contains('Bruno Lima').should('be.visible');
    cy.contains('Carla Melo').should('be.visible');
  });

  it('exibe estado vazio padrão quando rows = []', () => {
    cy.mount(<DataTable columns={columns} rows={[]} />);
    cy.contains(/nenhum registro|não há dados/i).should('be.visible');
  });

  it('exibe estado vazio customizado quando fornecido', () => {
    cy.mount(
      <DataTable
        columns={columns}
        rows={[]}
        emptyState={<div>Nenhum professor cadastrado ainda.</div>}
      />,
    );
    cy.contains('Nenhum professor cadastrado ainda.').should('be.visible');
  });

  it('exibe skeletons de loading quando loading=true', () => {
    cy.mount(<DataTable columns={columns} rows={[]} loading />);
    cy.get('[class*="MuiSkeleton"]').should('have.length.gte', 1);
  });

  it('não exibe estado vazio durante loading', () => {
    cy.mount(<DataTable columns={columns} rows={[]} loading />);
    cy.contains(/nenhum registro/i).should('not.exist');
  });

  it('usa render customizado para células', () => {
    const colsWithRender = [
      { key: 'nome', header: 'Nome', render: (r: Row) => `Prof. ${r.nome}` },
    ];
    cy.mount(<DataTable columns={colsWithRender} rows={rows} />);
    cy.contains('Prof. Ana Silva').should('be.visible');
  });

  it('exibe paginação quando rows > rowsPerPage', () => {
    const manyRows: Row[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      nome: `Usuário ${i + 1}`,
      status: 'Ativo',
    }));
    cy.mount(<DataTable columns={columns} rows={manyRows} rowsPerPage={10} />);
    cy.contains('Usuário 1').should('be.visible');
    // Usuário 11 não deve estar visível na primeira página
    cy.contains('Usuário 11').should('not.exist');
    // Controles de paginação devem existir
    cy.contains('Por página:').should('be.visible');
  });

  it('não exibe paginação quando rows <= rowsPerPage', () => {
    cy.mount(<DataTable columns={columns} rows={rows} rowsPerPage={10} />);
    cy.contains('Por página:').should('not.exist');
  });
});
