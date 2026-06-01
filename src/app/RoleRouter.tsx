import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const roleHomePaths: Record<UserRole, string> = {
  [UserRole.PROFESSOR]:  '/app/professor/inicio',
  [UserRole.GESTOR]:     '/app/gestor/inicio',
  [UserRole.SECRETARIA]: '/app/secretaria/inicio',
  [UserRole.ADMIN]:      '/app/secretaria/inicio',

};

export function RoleRouter() {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;

  const path = roleHomePaths[currentUser.role as UserRole] ?? '/login';
  return <Navigate to={path} replace />;
}
