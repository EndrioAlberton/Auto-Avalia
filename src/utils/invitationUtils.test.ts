import { describe, it, expect } from 'vitest';
import { invitationId } from './invitationUtils';

describe('invitationId', () => {
  it('monta escola + separador + email', () => {
    expect(invitationId('esc1', 'prof@escola.com')).toBe('esc1__prof@escola.com');
  });

  it('normaliza maiúsculas e espaços', () => {
    // firestore.rules usa request.auth.token.email.lower(); se as duas pontas
    // divergirem, todo aceite de convite quebra.
    expect(invitationId('esc1', ' A@B.COM ')).toBe('esc1__a@b.com');
  });

  it('é estável para o mesmo par escola/email', () => {
    expect(invitationId('esc1', 'Prof@Escola.com')).toBe(invitationId('esc1', 'prof@escola.com'));
  });

  it('distingue escolas diferentes para o mesmo email', () => {
    expect(invitationId('esc1', 'p@e.com')).not.toBe(invitationId('esc2', 'p@e.com'));
  });
});
