import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './contexts/AuthContext';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import ProfessorDashboard from './pages/Professor/Dashboard';
import GestorDashboard from './pages/Gestor/Dashboard';
import EstudanteDashboard from './pages/Estudante/Dashboard';
import SecretariaDashboard from './pages/Secretaria/Dashboard';

// Componente de rota protegida
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rotas protegidas - Professor */}
      <Route
        path="/professor/*"
        element={
          <ProtectedRoute allowedRoles={['professor']}>
            <ProfessorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas - Gestor */}
      <Route
        path="/gestor/*"
        element={
          <ProtectedRoute allowedRoles={['gestor']}>
            <GestorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas - Estudante */}
      <Route
        path="/estudante/*"
        element={
          <ProtectedRoute allowedRoles={['estudante']}>
            <EstudanteDashboard />
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas - Secretaria */}
      <Route
        path="/secretaria/*"
        element={
          <ProtectedRoute allowedRoles={['secretaria', 'admin']}>
            <SecretariaDashboard />
          </ProtectedRoute>
        }
      />

      {/* Rota raiz - redireciona baseado no role */}
      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate
              to={`/${currentUser.role}`}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
