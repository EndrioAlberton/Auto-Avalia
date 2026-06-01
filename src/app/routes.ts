import { UserRole } from '../types';

export const roleHomePaths: Record<string, string> = {
  [UserRole.PROFESSOR]:  '/app/professor/inicio',
  [UserRole.GESTOR]:     '/app/gestor/inicio',
  [UserRole.SECRETARIA]: '/app/secretaria/inicio',
  [UserRole.ADMIN]:      '/app/secretaria/inicio',

};
