import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { PageHeader } from '../../components/ui/layout/PageHeader';
import { ContentCard } from '../../components/ui/data-display/ContentCard';
import { useToast } from '../../components/ui/feedback/ToastProvider';
import { useAuth } from '../../contexts/AuthContext';
import { getSchool, updateUserProfile } from '../../services/firestoreService';
import { SUBJECT_OPTIONS } from '../../data/questionnaireData';
import { colors } from '../../components/ui/tokens';
import { initials } from '../../utils/userUtils';

const SEGMENT_OPTIONS = [
  { value: 'educacao_infantil', label: 'Educação Infantil' },
  { value: 'anos_iniciais', label: 'Anos Iniciais' },
  { value: 'anos_finais', label: 'Anos Finais' },
  { value: 'ensino_medio', label: 'Ensino Médio' },
  { value: 'eja', label: 'EJA' },
  { value: 'educacao_especial', label: 'Educação Especial' },
];

export function PerfilPage() {
  const { currentUser, refreshUser } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayName: currentUser?.displayName ?? '',
    segment: (currentUser as any)?.segment ?? [] as string[],
    subjects: (currentUser as any)?.subjects ?? [] as string[],
    classes: ((currentUser as any)?.classes ?? []).join(', '),
  });
  const [dirty, setDirty] = useState(false);

  // A escola é definida pelo convite do gestor, não pelo professor — aqui é só leitura.
  useEffect(() => {
    if (!currentUser?.schoolId) {
      setSchoolName(null);
      return;
    }
    getSchool(currentUser.schoolId)
      .then((s) => setSchoolName(s.name))
      .catch(() => setSchoolName(currentUser.schoolId ?? null));
  }, [currentUser?.schoolId]);

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      // `schoolId` fica fora de propósito: só o aceite de convite pode gravá-lo.
      await updateUserProfile(currentUser.uid, {
        displayName: form.displayName,
        subjects: form.subjects,
        segment: form.segment,
        classes: form.classes ? form.classes.split(',').map((s: string) => s.trim()) : [],
      } as any);
      await refreshUser();
      toast.success('Perfil atualizado com sucesso!');
      setDirty(false);
    } catch {
      toast.error('Erro ao salvar o perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader
        eyebrow="Professor"
        title="Meu Perfil"
        action={
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!dirty || saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 12 }}>
          <ContentCard title="Informações Pessoais">
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ width: 64, height: 64, fontSize: 22, bgcolor: colors.accentDim, color: colors.accentHover }}>
                {initials(form.displayName || (currentUser?.displayName ?? ''))}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: colors.ink }}>
                  {currentUser?.displayName}
                </Typography>
                <Typography sx={{ fontSize: 14, color: colors.inkSubtle }}>
                  {currentUser?.email}
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nome completo"
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange as any}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={currentUser?.email ?? ''}
                  disabled
                />
              </Grid>
            </Grid>
          </ContentCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ContentCard title="Dados Profissionais">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Escola"
                  value={schoolName ?? ''}
                  disabled
                  placeholder="Nenhuma escola vinculada"
                  helperText={
                    schoolName
                      ? 'Definida pelo convite do gestor'
                      : 'Peça um convite ao gestor da sua escola'
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Turmas"
                  name="classes"
                  value={form.classes}
                  onChange={handleChange as any}
                  helperText="Separe por vírgula (ex: 8º A, 9º B)"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Segmento(s) de atuação</InputLabel>
                  <Select
                    multiple
                    name="segment"
                    value={form.segment}
                    onChange={handleChange as any}
                    input={<OutlinedInput label="Segmento(s) de atuação" />}
                    renderValue={(selected: string[]) => (
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {selected.map((v) => (
                          <Chip key={v} label={SEGMENT_OPTIONS.find((o) => o.value === v)?.label ?? v} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {SEGMENT_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Áreas / Disciplinas</InputLabel>
                  <Select
                    multiple
                    name="subjects"
                    value={form.subjects}
                    onChange={handleChange as any}
                    input={<OutlinedInput label="Áreas / Disciplinas" />}
                    renderValue={(selected: string[]) => (
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {selected.map((v) => (
                          <Chip key={v} label={SUBJECT_OPTIONS.find((o) => o.value === v)?.label ?? v} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {SUBJECT_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </ContentCard>
        </Grid>
      </Grid>
    </Box>
  );
}
