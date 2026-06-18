import { mount } from 'cypress/react18';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './commands';

const theme = createTheme();

// Sobrescreve cy.mount para incluir providers obrigatórios (MUI + Router)
Cypress.Commands.overwrite('mount', (originalMount, component: React.ReactElement, options = {}) => {
  const wrapped = React.createElement(
    MemoryRouter,
    {},
    React.createElement(
      ThemeProvider,
      { theme },
      React.createElement(CssBaseline, {}),
      component,
    ),
  );
  return (originalMount as Function)(wrapped, options);
});

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}
