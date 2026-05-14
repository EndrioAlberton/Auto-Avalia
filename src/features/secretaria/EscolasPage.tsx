import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import { PageHeader } from '../../components/layout/PageHeader';
import { ContentCard } from '../../components/data-display/ContentCard';
import { DataTable, Column } from '../../components/data-display/DataTable';
import { EmptyState } from '../../components/data-display/EmptyState';
import { SchoolForm, SchoolFormValues } from '../school/SchoolForm';
import { useToast } from '../../components/feedback/ToastProvider';
import { createSchool, updateSchool, deleteSchool } from '../../services/firestoreService';
import { useSecretariaData } from './hooks/useSecretariaData';
import { School } from '../../types';
import { colors } from '../../components/tokens';

const EMPTY: SchoolFormValues = { name: '', state: '', city: '', address: '', phone: '', email: '' };

export function EscolasPage() {
  const toast = useToast();
  const { loading, schools, refreshData } = useSecretariaData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [values, setValues] = useState<SchoolFormValues>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<School | null>(null);

  const openCreate = () => {
    setEditingSchool(null);
    setValues(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (s: School) => {
    setEditingSchool(s);
    setValues({
      name: s.name ?? '',
      state: s.state ?? '',
      city: s.city ?? '',
      address: s.address ?? '',
      phone: s.phone ?? '',
      email: s.contact ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!values.name.trim()) { toast.error('O nome é obrigatório.'); return; }
    setSaving(true);
    try {
      const payload = { name: values.name, state: values.state, city: values.city, address: values.address, phone: values.phone, contact: values.email };
      if (editingSchool) {
        await updateSchool(editingSchool.id, payload);
        toast.success('Escola atualizada!');
      } else {
        await createSchool({ ...payload, segments: [] });
        toast.success('Escola criada!');
      }
      setDialogOpen(false);
      refreshData();
    } catch {
      toast.error('Erro ao salvar escola.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: School) => {
    try {
      await deleteSchool(s.id);
      toast.success(`Escola "${s.name}" removida.`);
      refreshData();
    } catch {
      toast.error('Erro ao remover escola.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns: Column<School>[] = [
    { key: 'name', header: 'Nome', render: (s) => s.name },
    { key: 'city', header: 'Cidade', render: (s) => (s as any).city || '—' },
    { key: 'state', header: 'Estado', render: (s) => (s as any).state || '—' },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <Box display="flex" gap={0.5} justifyContent="flex-end">
          <IconButton size="small" onClick={() => openEdit(s)} sx={{ color: colors.inkSubtle }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setConfirmDelete(s)} sx={{ color: colors.error }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        eyebrow="Secretaria"
        title="Escolas"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nova escola
          </Button>
        }
      />

      <ContentCard title="Lista de escolas" noPadding>
        <DataTable
          columns={columns}
          rows={schools}
          loading={loading}
          emptyState={
            <EmptyState
              icon={<SchoolIcon />}
              title="Nenhuma escola cadastrada"
              body="Clique em 'Nova escola' para adicionar a primeira escola."
              action={{ label: 'Nova escola', onClick: openCreate }}
            />
          }
        />
      </ContentCard>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { background: colors.surface2, border: `1px solid ${colors.hairline}` } }}
      >
        <DialogTitle sx={{ color: colors.ink }}>
          {editingSchool ? 'Editar escola' : 'Nova escola'}
        </DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <SchoolForm values={values} onChange={setValues} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: colors.inkMuted }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        PaperProps={{ sx: { background: colors.surface2, border: `1px solid ${colors.hairline}` } }}
      >
        <DialogTitle sx={{ color: colors.ink }}>Confirmar exclusão</DialogTitle>
        <DialogContent sx={{ color: colors.inkMuted, fontSize: 14 }}>
          Tem certeza que deseja remover a escola <strong>{confirmDelete?.name}</strong>? Esta ação não pode ser desfeita.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(null)} sx={{ color: colors.inkMuted }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={() => confirmDelete && handleDelete(confirmDelete)}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
