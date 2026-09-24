import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { TermoConsentimentoDialog } from './TermoConsentimentoDialog';

const routePermissions: Record<string, UserRole[]> = {
  '/app/professor': [UserRole.PROFESSOR],
  '/app/gestor':    [UserRole.GESTOR],
  '/app/secretaria': [UserRole.SECRETARIA, UserRole.ADMIN],
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const matchedEntry = Object.entries(routePermissions).find(([prefix]) =>
    location.pathname.startsWith(prefix)
  );

  if (matchedEntry && !matchedEntry[1].includes(currentUser.role as UserRole)) {
    return <Navigate to="/" replace />;
  }
  if (currentUser.role === UserRole.PROFESSOR && !currentUser.tcleAceito) {
    return <TermoConsentimentoDialog />;
  }

  return <>{children}</>;
}
