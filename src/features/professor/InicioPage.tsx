import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import { PageHeader } from '../../components/ui/layout/PageHeader';
import { StatCard } from '../../components/ui/data-display/StatCard';
import { ContentCard } from '../../components/ui/data-display/ContentCard';
import { ActionCard } from '../../components/ui/data-display/ActionCard';
import { DomainRadarChart } from '../analytics/charts/DomainRadarChart';
import { useProfessorData } from './hooks/useProfessorData';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/feedback/ToastProvider';
import { acceptInvitation, updateUserProfile } from '../../services/firestoreService';
import { colors } from '../../components/ui/tokens';

export function InicioPage() {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useAuth();
  const toast = useToast();
  const { loading, pendingInvitations, schoolNames, hasResponded, myScores, overallScore, myResponses, strengths, improvements, refreshData } =
    useProfessorData();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  const handleAccept = async (inviteId: string, schoolId: string) => {
    if (!currentUser) return;
    try {
      await acceptInvitation(inviteId);
      await updateUserProfile(currentUser.uid, { schoolId } as any);
      await refreshUser();
      refreshData();
      toast.success(`Convite aceito! Você foi vinculado à ${schoolNames[schoolId] ?? 'escola'}.`);
    } catch {
      toast.error('Erro ao aceitar convite.');
    }
  };

  const handleDismiss = (_inviteId: string) => {
    refreshData();
  };

  return (
    <Box>
      <PageHeader eyebrow="Professor" title="Início" />

      {pendingInvitations.map((inv) => (
        <Box key={inv.id} mb={2}>
          <ActionCard
            eyebrow="Convite de escola"
            title={schoolNames[inv.schoolId] ?? 'Uma escola'}
            body="Você foi convidado para participar desta escola."
            action={{ label: 'Aceitar', onClick: () => handleAccept(inv.id, inv.schoolId) }}
            onDismiss={() => handleDismiss(inv.id)}
          />
        </Box>
      ))}

      {!hasResponded && (
        <Box mb={3}>
          <ActionCard
            eyebrow="Autoavaliação pendente"
            title="Você ainda não respondeu o questionário"
            body="Leva cerca de 10 minutos. Seus resultados ficam disponíveis imediatamente."
            action={{ label: 'Começar agora', onClick: () => navigate('/app/professor/questionario') }}
          />
        </Box>
      )}

      {hasResponded && (
        <>
          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Pontuação Geral" value={overallScore.toFixed(1)} sub="de 5.0" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Avaliações Realizadas" value={myResponses.length} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Ponto Mais Forte" value={strengths[0]?.split(' (')[0] ?? '—'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="A Desenvolver" value={improvements[0]?.split(' (')[0] ?? '—'} />
            </Grid>
          </Grid>

          <ContentCard title="Meu Perfil por Domínio">
            <DomainRadarChart myData={myScores} />
          </ContentCard>
        </>
      )}
    </Box>
  );
}
