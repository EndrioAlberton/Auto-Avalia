import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './app/ProtectedRoute';
import { RoleRouter } from './app/RoleRouter';
import { AppShell } from './components/layout/AppShell';
import { professorNavConfig, gestorNavConfig, secretariaNavConfig } from './components/layout/navConfigs';
import { colors } from './components/tokens';

// Public pages (Phase 9)
const LoginPage    = lazy(() => import('./features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));

// Estudante (Phase 8)
const EstudanteSchoolSelect = lazy(() => import('./features/questionnaire/student/SchoolSelectPage').then((m) => ({ default: m.SchoolSelectPage })));
const EstudanteQuiz         = lazy(() => import('./features/questionnaire/student/QuizPage').then((m) => ({ default: m.QuizPage })));
const EstudanteCompletion   = lazy(() => import('./features/questionnaire/student/CompletionPage').then((m) => ({ default: m.CompletionPage })));

// Professor pages (Phase 5)
const ProfessorInicioPage      = lazy(() => import('./features/professor/InicioPage').then((m) => ({ default: m.InicioPage })));
const ProfessorQuestionarioPage = lazy(() => import('./features/professor/QuestionarioPage').then((m) => ({ default: m.QuestionarioPage })));
const ProfessorRelatoriosPage  = lazy(() => import('./features/professor/RelatoriosPage').then((m) => ({ default: m.RelatoriosPage })));
const ProfessorPerfilPage      = lazy(() => import('./features/professor/PerfilPage').then((m) => ({ default: m.PerfilPage })));

// Gestor pages (Phase 6)
const GestorInicioPage     = lazy(() => import('./features/gestor/InicioPage').then((m) => ({ default: m.InicioPage })));
const GestorEscolaPage     = lazy(() => import('./features/gestor/EscolaPage').then((m) => ({ default: m.EscolaPage })));
const GestorEquipePage     = lazy(() => import('./features/gestor/EquipePage').then((m) => ({ default: m.EquipePage })));
const GestorRelatoriosPage = lazy(() => import('./features/gestor/RelatoriosPage').then((m) => ({ default: m.RelatoriosPage })));

// Secretaria pages (Phase 7)
const SecretariaInicioPage     = lazy(() => import('./features/secretaria/InicioPage').then((m) => ({ default: m.InicioPage })));
const SecretariaEscolasPage    = lazy(() => import('./features/secretaria/EscolasPage').then((m) => ({ default: m.EscolasPage })));
const SecretariaRelatoriosPage = lazy(() => import('./features/secretaria/RelatoriosPage').then((m) => ({ default: m.RelatoriosPage })));
const SecretariaAdminPage      = lazy(() => import('./features/secretaria/AdminPage').then((m) => ({ default: m.AdminPage })));

function LoadingFallback() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={colors.canvas}>
      <CircularProgress sx={{ color: colors.accent }} />
    </Box>
  );
}

const App: React.FC = () => {
  const { loading } = useAuth();

  if (loading) return <LoadingFallback />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Estudante (sem sidebar) */}
        <Route path="/estudante"          element={<Navigate to="/estudante/escola" replace />} />
        <Route path="/estudante/escola"   element={<EstudanteSchoolSelect />} />
        <Route path="/estudante/quiz"     element={<EstudanteQuiz />} />
        <Route path="/estudante/concluido" element={<EstudanteCompletion />} />

        {/* Professor */}
        <Route
          path="/app/professor"
          element={
            <ProtectedRoute>
              <AppShell navConfig={professorNavConfig}>
                <Navigate to="/app/professor/inicio" replace />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/professor/inicio"
          element={
            <ProtectedRoute>
              <AppShell navConfig={professorNavConfig}>
                <ProfessorInicioPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/professor/questionario"
          element={
            <ProtectedRoute>
              <AppShell navConfig={professorNavConfig} hideSidebar>
                <ProfessorQuestionarioPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/professor/relatorios"
          element={
            <ProtectedRoute>
              <AppShell navConfig={professorNavConfig}>
                <ProfessorRelatoriosPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/professor/perfil"
          element={
            <ProtectedRoute>
              <AppShell navConfig={professorNavConfig}>
                <ProfessorPerfilPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Gestor */}
        <Route path="/app/gestor" element={<ProtectedRoute><AppShell navConfig={gestorNavConfig}><Navigate to="/app/gestor/inicio" replace /></AppShell></ProtectedRoute>} />
        <Route path="/app/gestor/inicio"     element={<ProtectedRoute><AppShell navConfig={gestorNavConfig}><GestorInicioPage /></AppShell></ProtectedRoute>} />
        <Route path="/app/gestor/escola"     element={<ProtectedRoute><AppShell navConfig={gestorNavConfig}><GestorEscolaPage /></AppShell></ProtectedRoute>} />
        <Route path="/app/gestor/equipe"     element={<ProtectedRoute><AppShell navConfig={gestorNavConfig}><GestorEquipePage /></AppShell></ProtectedRoute>} />
        <Route path="/app/gestor/relatorios" element={<ProtectedRoute><AppShell navConfig={gestorNavConfig}><GestorRelatoriosPage /></AppShell></ProtectedRoute>} />

        {/* Secretaria */}
        <Route path="/app/secretaria" element={<ProtectedRoute><AppShell navConfig={secretariaNavConfig}><Navigate to="/app/secretaria/inicio" replace /></AppShell></ProtectedRoute>} />
        <Route path="/app/secretaria/inicio"     element={<ProtectedRoute><AppShell navConfig={secretariaNavConfig}><SecretariaInicioPage /></AppShell></ProtectedRoute>} />
        <Route path="/app/secretaria/escolas"    element={<ProtectedRoute><AppShell navConfig={secretariaNavConfig}><SecretariaEscolasPage /></AppShell></ProtectedRoute>} />
        <Route path="/app/secretaria/relatorios" element={<ProtectedRoute><AppShell navConfig={secretariaNavConfig}><SecretariaRelatoriosPage /></AppShell></ProtectedRoute>} />
        <Route path="/app/secretaria/admin"      element={<ProtectedRoute><AppShell navConfig={secretariaNavConfig}><SecretariaAdminPage /></AppShell></ProtectedRoute>} />

        {/* Legacy redirects */}
        <Route path="/professor/*"  element={<Navigate to="/app/professor/inicio" replace />} />
        <Route path="/gestor/*"     element={<Navigate to="/app/gestor/inicio" replace />} />
        <Route path="/secretaria/*" element={<Navigate to="/app/secretaria/inicio" replace />} />

        {/* Root → redirect by role */}
        <Route path="/" element={<RoleRouter />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
