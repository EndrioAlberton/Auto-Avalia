import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { PageHeader } from '../../components/ui/layout/PageHeader';
import { ContentCard } from '../../components/ui/data-display/ContentCard';
import { DataTable, Column } from '../../components/ui/data-display/DataTable';
import { Badge } from '../../components/ui/primitives/Badge';
import { EmptyState } from '../../components/ui/data-display/EmptyState';
import { useSecretariaData } from './hooks/useSecretariaData';
import { User, UserRole } from '../../types';
import { colors, radius } from '../../components/ui/tokens';
import Typography from '@mui/material/Typography';

type RoleFilter = 'all' | UserRole.PROFESSOR | UserRole.GESTOR | UserRole.SECRETARIA;

const ROLE_LABELS: Record<string, string> = {
  professor: 'Professor',
  gestor: 'Gestor',
  secretaria: 'Secretaria',
  admin: 'Admin',
  estudante: 'Estudante',
};

const ROLE_VARIANTS: Record<string, 'accent' | 'success' | 'neutral' | 'warning'> = {
  professor: 'accent',
  gestor: 'success',
  secretaria: 'warning',
  admin: 'warning',
  estudante: 'neutral',
};

export function AdminPage() {
  const { loading, allUsers } = useSecretariaData();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allUsers.filter((u) => {
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchSearch = !q || u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [allUsers, search, roleFilter]);

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
          label={ROLE_LABELS[u.role] ?? u.role}
          variant={ROLE_VARIANTS[u.role] ?? 'neutral'}
        />
      ),
    },
    {
      key: 'school',
      header: 'Escola',
      render: (u) => u.schoolId ? <Typography sx={{ fontSize: 13, color: colors.inkMuted }}>{u.schoolId}</Typography> : '—',
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
  ];

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
          placeholder="Buscar por nome ou email..."
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
    </Box>
  );
}
