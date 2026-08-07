import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
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
import { createInvitation, deleteInvitation } from '../../services/firestoreService';
import { formatSegment } from '../../services/analyticsService';
import { useGestorData } from './hooks/useGestorData';
import type { User } from '../../types';
import { UserRole } from '../../types';
import { colors } from '../../components/ui/tokens';

interface TeacherRow extends User {
  isInvite?: boolean;
  /** Só em linhas de convite: indica que o convidado já abriu o app e viu o convite. */
  inviteViewed?: boolean;
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
  const [menuTarget, setMenuTarget] = useState<TeacherRow | null>(null);
  const [acting, setActing] = useState(false);

  const respondedSet = new Set(schoolResponses.map((r: any) => r.userId));

  const teacherRows: TeacherRow[] = teachers.map((t) => ({ ...t }));

  const inviteRows: TeacherRow[] = invitations.map((inv) => ({
    uid: inv.id,
    email: inv.email,
    displayName: inv.email,
    role: UserRole.PROFESSOR,
    createdAt: inv.createdAt,
    updatedAt: inv.createdAt,
    isInvite: true,
    inviteViewed: Boolean(inv.viewedAt),
  }));

  const allRows = [...teacherRows, ...inviteRows];

  const columns: Column<TeacherRow>[] = [
    { key: 'name', header: 'Nome', render: (r) => r.displayName || r.email },
    { key: 'segment', header: 'Segmento', render: (r) => (r as any).segment?.map(formatSegment).join(', ') || '—' },
    {
      key: 'invite',
      header: 'Status',
      render: (r) => {
        if (!r.isInvite) return '—';
        // O gestor não consegue ler o documento de quem ainda não é da escola dele,
        // então "já tem conta?" vem do próprio convite, via viewedAt.
        return r.inviteViewed
          ? <Badge label="Convite visto" variant="warning" />
          : <Badge label="Aguardando cadastro" variant="neutral" />;
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <IconButton
          size="small"
          onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuTarget(r); }}
          sx={{ color: colors.inkSubtle }}
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const closeMenu = () => { setMenuAnchor(null); setMenuTarget(null); };

  const sendInvite = async (email: string, message: string) => {
    if (!currentUser?.schoolId) return;
    await createInvitation({
      email,
      role: UserRole.PROFESSOR,
      schoolId: currentUser.schoolId,
      invitedBy: currentUser.uid,
      message,
    });
  };

  const handleInvite = async () => {
    if (!currentUser?.schoolId || !inviteEmail.trim()) return;
    setSending(true);
    try {
      await sendInvite(inviteEmail.trim(), inviteMsg);
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

  const handleResend = async () => {
    if (!menuTarget?.isInvite) return;
    setActing(true);
    try {
      // O convite tem ID determinístico (escola + e-mail), então reenviar
      // sobrescreve o mesmo documento, renovando token e validade.
      await sendInvite(menuTarget.email, '');
      toast.success(`Convite reenviado para ${menuTarget.email}`);
      closeMenu();
      refreshData();
    } catch {
      toast.error('Erro ao reenviar o convite.');
    } finally {
      setActing(false);
    }
  };

  const handleRemoveInvite = async () => {
    if (!menuTarget?.isInvite) return;
    setActing(true);
    try {
      await deleteInvitation(menuTarget.uid);
      toast.success('Convite removido.');
      closeMenu();
      refreshData();
    } catch {
      toast.error('Erro ao remover o convite.');
    } finally {
      setActing(false);
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

      {/* Menu único, fora do renderer da coluna — evita montar um portal por linha */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && menuTarget)}
        onClose={closeMenu}
        PaperProps={{ sx: { background: colors.surface2, border: `1px solid ${colors.hairline}` } }}
      >
        {menuTarget?.isInvite ? (
          [
            <MenuItem key="resend" onClick={handleResend} disabled={acting} sx={{ fontSize: 13, color: colors.ink }}>
              Reenviar convite
            </MenuItem>,
            <MenuItem key="remove" onClick={handleRemoveInvite} disabled={acting} sx={{ fontSize: 13, color: colors.error }}>
              Remover convite
            </MenuItem>,
          ]
        ) : (
          <MenuItem disabled sx={{ fontSize: 13, color: colors.inkSubtle }}>
            Nenhuma ação disponível
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        PaperProps={{ sx: { background: colors.surface2, border: `1px solid ${colors.hairline}`, minWidth: 400 } }}
      >
        <DialogTitle sx={{ color: colors.ink }}>Convidar professor</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Typography sx={{ fontSize: 13, color: colors.inkMuted, lineHeight: 1.5 }}>
              O professor precisa criar uma conta com este mesmo e-mail para receber o convite.
              Enquanto isso não acontecer, a linha ficará como "Aguardando cadastro".
            </Typography>
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
