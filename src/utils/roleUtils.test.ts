import { describe, it, expect } from 'vitest';
import { UserRole } from '../types';
import { assignableRoles, roleLabel, ROLE_LABELS, ROLE_BADGE_VARIANTS } from './roleUtils';

const target = (uid: string, role: UserRole) => ({ uid, role });

const ALL_ROLES = Object.values(UserRole);

describe('assignableRoles', () => {
  it('não permite alterar o próprio cargo, qualquer que seja o ator', () => {
    for (const role of ALL_ROLES) {
      expect(assignableRoles(role, 'me', target('me', role))).toEqual([]);
    }
  });

  it('admin pode atribuir qualquer cargo, inclusive admin', () => {
    const options = assignableRoles(UserRole.ADMIN, 'admin-1', target('u1', UserRole.PROFESSOR));
    expect(options).toContain(UserRole.PROFESSOR);
    expect(options).toContain(UserRole.GESTOR);
    expect(options).toContain(UserRole.SECRETARIA);
    expect(options).toContain(UserRole.ADMIN);
  });

  it('secretaria atribui professor e gestor, mas nunca admin nem secretaria', () => {
    for (const alvo of [UserRole.PROFESSOR, UserRole.GESTOR]) {
      const options = assignableRoles(UserRole.SECRETARIA, 'sec-1', target('u1', alvo));
      expect(options).toEqual([UserRole.PROFESSOR, UserRole.GESTOR]);
      expect(options).not.toContain(UserRole.ADMIN);
      expect(options).not.toContain(UserRole.SECRETARIA);
    }
  });

  it('secretaria não mexe em admin nem em outra secretaria', () => {
    expect(assignableRoles(UserRole.SECRETARIA, 'sec-1', target('u1', UserRole.ADMIN))).toEqual([]);
    expect(assignableRoles(UserRole.SECRETARIA, 'sec-1', target('u1', UserRole.SECRETARIA))).toEqual([]);
  });

  it('gestor não atribui cargo nenhum — ele apenas convida professores', () => {
    for (const alvo of ALL_ROLES) {
      expect(assignableRoles(UserRole.GESTOR, 'gestor-1', target('u1', alvo))).toEqual([]);
    }
  });

  it('professor não atribui cargo nenhum', () => {
    for (const alvo of ALL_ROLES) {
      expect(assignableRoles(UserRole.PROFESSOR, 'prof-1', target('u1', alvo))).toEqual([]);
    }
  });

  it('não existe caminho de escalada: nenhum ator abaixo de admin cria admin', () => {
    for (const ator of [UserRole.PROFESSOR, UserRole.GESTOR, UserRole.SECRETARIA]) {
      for (const alvo of ALL_ROLES) {
        expect(assignableRoles(ator, 'a', target('b', alvo))).not.toContain(UserRole.ADMIN);
      }
    }
  });
});

describe('rótulos e variantes', () => {
  it('cobre todos os cargos do enum', () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_LABELS[role]).toBeTruthy();
      expect(ROLE_BADGE_VARIANTS[role]).toBeTruthy();
    }
  });

  it('roleLabel devolve o valor cru para cargos desconhecidos', () => {
    expect(roleLabel('estudante')).toBe('estudante');
    expect(roleLabel(UserRole.PROFESSOR)).toBe('Professor');
  });
});
