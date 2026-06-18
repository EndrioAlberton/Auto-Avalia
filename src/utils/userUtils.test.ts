import { describe, it, expect } from 'vitest';
import { initials } from './userUtils';

describe('initials', () => {
  it('retorna as iniciais de nome e sobrenome', () => {
    expect(initials('João Silva')).toBe('JS');
  });

  it('retorna apenas a inicial quando há um único nome', () => {
    expect(initials('Ana')).toBe('A');
  });

  it('usa apenas as duas primeiras palavras mesmo com nome composto', () => {
    expect(initials('João Carlos Silva')).toBe('JC');
  });

  it('converte para maiúsculas', () => {
    expect(initials('ana souza')).toBe('AS');
  });

  it('ignora espaços extras', () => {
    expect(initials('  Maria  José  ')).toBe('MJ');
  });

  it('retorna string vazia para entrada vazia', () => {
    expect(initials('')).toBe('');
  });
});
