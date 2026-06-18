import './commands';

// Ignora erros de Firebase não críticos em testes
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('Firebase') ||
    err.message.includes('firestore') ||
    err.message.includes('ResizeObserver')
  ) {
    return false;
  }
});
