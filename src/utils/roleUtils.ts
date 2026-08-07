import type { User } from '../types';
import { UserRole } from '../types';

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.PROFESSOR]: 'Professor',
  [UserRole.GESTOR]: 'Gestor',
  [UserRole.SECRETARIA]: 'Secretaria',
  [UserRole.ADMIN]: 'Admin',
};

export const ROLE_BADGE_VARIANTS: Record<UserRole, 'accent' | 'success' | 'neutral' | 'warning'> = {
  [UserRole.PROFESSOR]: 'accent',
  [UserRole.GESTOR]: 'success',
  [UserRole.SECRETARIA]: 'warning',
  [UserRole.ADMIN]: 'warning',
};

/** Rótulo do cargo; devolve o valor cru para documentos legados sem cargo conhecido. */
export function roleLabel(role: string): string {
  return ROLE_LABELS[role as UserRole] ?? role;
}

/**
 * Cargos que `actor` pode atribuir a `target`. Lista vazia = nenhuma ação disponível.
 *
 * Espelha o bloco `/users/` de firestore.rules — se as duas pontas divergirem, a
 * interface oferece ações que o servidor nega. A hierarquia é estritamente
 * descendente: gestor não atribui cargo (só convida), e a secretaria para no
 * gestor, então não há caminho de um papel de escola até admin.
 */
export function assignableRoles(
  actorRole: UserRole,
  actorUid: string,
  target: Pick<User, 'uid' | 'role'>,
): UserRole[] {
  // Ninguém altera o próprio cargo.
  if (actorUid === target.uid) return [];

  if (actorRole === UserRole.ADMIN) {
    return [UserRole.PROFESSOR, UserRole.GESTOR, UserRole.SECRETARIA, UserRole.ADMIN];
  }

  if (actorRole === UserRole.SECRETARIA) {
    // Não mexe em admin nem em outra secretaria.
    if (target.role !== UserRole.PROFESSOR && target.role !== UserRole.GESTOR) return [];
    return [UserRole.PROFESSOR, UserRole.GESTOR];
  }

  return [];
}
