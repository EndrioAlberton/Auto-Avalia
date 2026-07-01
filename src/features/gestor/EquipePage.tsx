import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { PageHeader } from '../../components/ui/layout/PageHeader';
import { ContentCard } from '../../components/ui/data-display/ContentCard';
import { StatCard } from '../../components/ui/data-display/StatCard';
import type { Column } from '../../components/ui/data-display/DataTable';
import { DataTable } from '../../components/ui/data-display/DataTable';
import { Badge } from '../../components/ui/primitives/Badge';
import { EmptyState } from '../../components/ui/data-display/EmptyState';
import { useToast } from '../../components/ui/feedback/ToastProvider';
import { useAuth } from '../../contexts/AuthContext';
import { createInvitation } from '../../services/firestoreService';
import { formatSegment } from '../../services/analyticsService';
import { useGestorData } from './hooks/useGestorData';
import type { User } from '../../types';
import { colors } from '../../components/ui/tokens';

interface TeacherRow extends User {
  isInvite?: boolean;
}

export function EquipePage() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const { loading, teachers, invitations, schoolResponses, refreshData } = useGestorData();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<string | null>(null);

  const respondedSet = new Set(schoolResponses.map((r: any) => r.userId));

  const teacherRows: TeacherRow[] = teachers.map((t) => ({ ...t }));

  const inviteRows: TeacherRow[] = invitations.map((inv) => ({
    uid: inv.id,
    email: inv.email,
    displayName: inv.email,
    role: 'professor' as any,
    createdAt: inv.createdAt,
    updatedAt: inv.createdAt,
    isInvite: true,
  }));

  const allRows = [...teacherRows, ...inviteRows];

  const columns: Column<TeacherRow>[] = [
    { key: 'name', header: 'Nome', render: (r) => r.displayName || r.email },
    { key: 'segment', header: 'Etapa de Ensino', render: (r) => (r as any).segment?.map(formatSegment).join(', ') || '—' },
    {
      key: 'invite',
      header: 'Status',
      render: (r) => r.isInvite ? <Badge label="Convidado" variant="accent" /> : '—',
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <>
          <IconButton
            size="small"
            onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuTarget(r.uid); }}
            sx={{ color: colors.inkSubtle }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuTarget === r.uid ? menuAnchor : null}
            open={menuTarget === r.uid && Boolean(menuAnchor)}
            onClose={() => { setMenuAnchor(null); setMenuTarget(null); }}
            PaperProps={{ sx: { background: colors.surface2, border: `1px solid ${colors.hairline}` } }}
          >
            <MenuItem sx={{ fontSize: 13, color: colors.ink }}>Reenviar convite</MenuItem>
            <MenuItem sx={{ fontSize: 13, color: colors.error }}>Remover</MenuItem>
          </Menu>
        </>
      ),
    },
  ];

  const handleInvite = async () => {
    if (!currentUser?.schoolId || !inviteEmail.trim()) return;
    setSending(true);
    try {
      await createInvitation({
        email: inviteEmail.trim(),
        schoolId: currentUser.schoolId,
        invitedBy: currentUser.uid,
        message: inviteMsg,
      } as any);
      toast.success(`Convite enviado para ${inviteEmail}`);
      setInviteEmail('');
      setInviteMsg('');
      setInviteOpen(false);
      refreshData();
    } catch {
      toast.error('Erro ao enviar convite. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const respondedCount = teachers.filter((t) => respondedSet.has(t.uid)).length;
  const pendingCount = teachers.filter((t) => !respondedSet.has(t.uid)).length;

  return (
    <Box>
      <PageHeader
        eyebrow="Gestor"
        title="Equipe"
        action={
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setInviteOpen(true)}>
            Convidar professor
          </Button>
        }
      />

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Total" value={teachers.length} loading={loading} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Responderam" value={respondedCount} loading={loading} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Pendentes" value={pendingCount} loading={loading} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Convites ativos" value={invitations.length} loading={loading} />
        </Grid>
      </Grid>

      <ContentCard title="Professores" noPadding>
        <DataTable
          columns={columns}
          rows={allRows}
          loading={loading}
          emptyState={
            <EmptyState
              icon={<PersonAddIcon />}
              title="Nenhum professor ainda"
              body="Convide professores para começar a coletar avaliações."
              action={{ label: 'Convidar professor', onClick: () => setInviteOpen(true) }}
            />
          }
        />
      </ContentCard>

      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        PaperProps={{ sx: { background: colors.surface2, border: `1px solid ${colors.hairline}`, minWidth: 400 } }}
      >
        <DialogTitle sx={{ color: colors.ink }}>Convidar professor</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="professor@escola.edu.br"
            />
            <TextField
              fullWidth
              label="Mensagem (opcional)"
              multiline
              rows={3}
              value={inviteMsg}
              onChange={(e) => setInviteMsg(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInviteOpen(false)} sx={{ color: colors.inkMuted }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleInvite}
            disabled={sending || !inviteEmail.trim()}
            startIcon={sending ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Enviar convite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
