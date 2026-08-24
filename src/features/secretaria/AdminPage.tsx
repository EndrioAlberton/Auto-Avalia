import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { PageHeader } from '../../components/ui/layout/PageHeader';
import { ContentCard } from '../../components/ui/data-display/ContentCard';
import type { Column } from '../../components/ui/data-display/DataTable';
import { DataTable } from '../../components/ui/data-display/DataTable';
import { Badge } from '../../components/ui/primitives/Badge';
import { EmptyState } from '../../components/ui/data-display/EmptyState';
import { useToast } from '../../components/ui/feedback/ToastProvider';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserRole } from '../../services/firestoreService';
import { useSecretariaData } from './hooks/useSecretariaData';
import type { User} from '../../types';
import { UserRole } from '../../types';
import { assignableRoles, roleLabel, ROLE_BADGE_VARIANTS } from '../../utils/roleUtils';
import { colors, radius } from '../../components/ui/tokens';
import Typography from '@mui/material/Typography';

type RoleFilter = 'all' | UserRole.PROFESSOR | UserRole.GESTOR | UserRole.SECRETARIA;

export function AdminPage() {
  const { loading, allUsers, schools, refreshData } = useSecretariaData();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [soSemEscola, setSoSemEscola] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<User | null>(null);
  const [confirm, setConfirm] = useState<{ user: User; role: UserRole } | null>(null);
  const [saving, setSaving] = useState(false);

  // Quem digitou a escola à mão no cadastro: não está vinculado a escola nenhuma
  // e por isso fica fora dos agregados da rede até alguém cadastrar a escola.
  const semEscolaCadastrada = (u: User) => !u.schoolId && !!u.schoolNameOther;

  const totalSemEscolaCadastrada = useMemo(
    () => allUsers.filter(semEscolaCadastrada).length,
    [allUsers],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allUsers.filter((u) => {
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchSearch = !q ||
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.schoolNameOther?.toLowerCase().includes(q);
      const matchEscola = !soSemEscola || semEscolaCadastrada(u);
      return matchRole && matchSearch && matchEscola;
    });
  }, [allUsers, search, roleFilter, soSemEscola]);

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (u) => (
        <Box>
          <Typography sx={{ fontSize: 14, color: colors.ink }}>{u.displayName}</Typography>
          <Typography sx={{ fontSize: 12, color: colors.inkSubtle }}>{u.email}</Typography>
        </Box>
      ),
    },
    {
      key: 'role',
      header: 'Perfil',
      render: (u) => (
        <Badge
          label={roleLabel(u.role)}
          variant={ROLE_BADGE_VARIANTS[u.role] ?? 'neutral'}
        />
      ),
    },
    {
      key: 'school',
      header: 'Escola',
      render: (u) => {
        if (u.schoolId) {
          const school = schools.find((s) => s.id === u.schoolId);
          return <Typography sx={{ fontSize: 13, color: colors.inkMuted }}>{school?.name ?? u.schoolId}</Typography>;
        }
        // Escola digitada à mão: mostra o texto para a secretaria conseguir
        // cadastrar a escola e refazer o vínculo depois.
        if (u.schoolNameOther) {
          return (
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography sx={{ fontSize: 13, color: colors.inkMuted }}>{u.schoolNameOther}</Typography>
              <Badge label="Não cadastrada" variant="warning" />
            </Box>
          );
        }
        return '—';
      },
    },
    {
      key: 'date',
      header: 'Data cadastro',
      render: (u) => {
        const ts = u.createdAt as any;
        if (!ts) return '—';
        const d = ts instanceof Date ? ts : new Date(ts.seconds * 1000);
        return d.toLocaleDateString('pt-BR');
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => {
        if (!currentUser) return null;
        // Vazio na própria linha (ninguém altera o próprio cargo) e quando o
        // ator não tem permissão sobre este alvo — mesmo predicado das regras.
        if (assignableRoles(currentUser.role, currentUser.uid, u).length === 0) return null;
        return (
          <IconButton
            size="small"
            onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuTarget(u); }}
            sx={{ color: colors.inkSubtle }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        );
      },
    },
  ];

  const menuOptions = currentUser && menuTarget
    ? assignableRoles(currentUser.role, currentUser.uid, menuTarget).filter((r) => r !== menuTarget.role)
    : [];

  const closeMenu = () => { setMenuAnchor(null); setMenuTarget(null); };

  const handleChangeRole = async () => {
    if (!confirm) return;
    const { user, role } = confirm;
    setSaving(true);
    try {
      await updateUserRole(user.uid, role);
      toast.success(`${user.displayName} agora é ${roleLabel(role)}.`);
      setConfirm(null);
      refreshData();
    } catch {
      toast.error('Erro ao alterar o perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const FILTERS: { label: string; value: RoleFilter }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Professor', value: UserRole.PROFESSOR },
    { label: 'Gestor', value: UserRole.GESTOR },
    { label: 'Secretaria', value: UserRole.SECRETARIA },
  ];

  return (
    <Box>
      <PageHeader eyebrow="Secretaria" title="Administração" />

      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <TextField
          placeholder="Buscar por nome, email ou escola..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.inkSubtle, fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
        <Box display="flex" gap={1}>
          {FILTERS.map((f) => (
            <Box
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: `${radius.pill}px`,
                border: `1px solid ${roleFilter === f.value ? colors.accent : colors.hairline}`,
                background: roleFilter === f.value ? colors.accentDim : 'transparent',
                color: roleFilter === f.value ? colors.accentHover : colors.inkMuted,
                fontSize: 13,
                fontWeight: roleFilter === f.value ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {f.label}
            </Box>
          ))}
        </Box>

        {totalSemEscolaCadastrada > 0 && (
          <Box
            onClick={() => setSoSemEscola((v) => !v)}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: `${radius.pill}px`,
              border: `1px solid ${soSemEscola ? colors.warning : colors.hairline}`,
              background: soSemEscola ? 'rgba(217,119,6,0.12)' : 'transparent',
              color: soSemEscola ? colors.warning : colors.inkMuted,
              fontSize: 13,
              fontWeight: soSemEscola ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            Escola não cadastrada ({totalSemEscolaCadastrada})
          </Box>
        )}
      </Box>

      <ContentCard title="Usuários" noPadding>
        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          emptyState={
            <EmptyState
              icon={<PeopleIcon />}
              title="Nenhum usuário encontrado"
              body="Tente ajustar os filtros de busca."
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
        <ListSubheader sx={{ background: 'transparent', color: colors.inkSubtle, fontSize: 12, lineHeight: 2.2 }}>
          Alterar perfil para…
        </ListSubheader>
        {menuOptions.map((r) => (
          <MenuItem
            key={r}
            onClick={() => { if (menuTarget) setConfirm({ user: menuTarget, role: r }); closeMenu(); }}
            sx={{ fontSize: 13, color: colors.ink }}
          >
            {roleLabel(r)}
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={Boolean(confirm)}
        onClose={() => !saving && setConfirm(null)}
        PaperProps={{ sx: { background: colors.surface2, border: `1px solid ${colors.hairline}`, minWidth: 420 } }}
      >
        <DialogTitle sx={{ color: colors.ink }}>Alterar perfil</DialogTitle>
        <DialogContent>
          {confirm && (
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Typography sx={{ fontSize: 14, color: colors.ink }}>
                <strong>{confirm.user.displayName}</strong> deixará de ser{' '}
                {roleLabel(confirm.user.role)} e passará a ser{' '}
                <strong>{roleLabel(confirm.role)}</strong>.
              </Typography>
              {(confirm.role === UserRole.SECRETARIA || confirm.role === UserRole.ADMIN) && (
                <Typography sx={{ fontSize: 13, color: colors.warning }}>
                  Atenção: esse perfil terá acesso aos dados de <strong>todas as escolas da rede</strong>.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirm(null)} disabled={saving} sx={{ color: colors.inkMuted }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleChangeRole}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
