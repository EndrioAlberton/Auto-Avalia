import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { PageHeader } from '../../components/layout/PageHeader';
import { ContentCard } from '../../components/data-display/ContentCard';
import { SchoolForm, SchoolFormValues } from '../school/SchoolForm';
import { useToast } from '../../components/feedback/ToastProvider';
import { useAuth } from '../../contexts/AuthContext';
import { createSchool, getSchool, updateSchool } from '../../services/firestoreService';
import { updateUserProfile } from '../../services/firestoreService';
import { colors } from '../../components/tokens';

const EMPTY: SchoolFormValues = { name: '', state: '', city: '', address: '', phone: '', email: '' };

export function EscolaPage() {
  const { currentUser, refreshUser } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<SchoolFormValues>(EMPTY);
  const [schoolId, setSchoolId] = useState<string | undefined>(currentUser?.schoolId);

  useEffect(() => {
    if (!currentUser?.schoolId) { setLoading(false); return; }
    getSchool(currentUser.schoolId)
      .then((s) => {
        setSchoolId(s.id);
        setValues({
          name: s.name ?? '',
          state: s.state ?? '',
          city: s.city ?? '',
          address: s.address ?? '',
          phone: s.phone ?? '',
          email: s.contact ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser?.schoolId]);

  const handleSave = async () => {
    if (!currentUser) return;
    if (!values.name.trim()) { toast.error('O nome da escola é obrigatório.'); return; }
    setSaving(true);
    try {
      const payload = {
        name: values.name,
        state: values.state,
        city: values.city,
        address: values.address,
        phone: values.phone,
        contact: values.email,
      };
      if (schoolId) {
        await updateSchool(schoolId, payload);
        toast.success('Escola atualizada com sucesso!');
      } else {
        const newId = await createSchool({ ...payload, segments: [], gestorId: currentUser.uid });
        await updateUserProfile(currentUser.uid, { schoolId: newId } as any);
        await refreshUser();
        setSchoolId(newId);
        toast.success('Escola criada com sucesso!');
      }
    } catch {
      toast.error('Erro ao salvar escola. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: colors.accent }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Gestor"
        title="Minha Escola"
        action={
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={16} color="inherit" /> : 'Salvar'}
          </Button>
        }
      />
      <ContentCard title="Informações da escola">
        <SchoolForm values={values} onChange={setValues} />
      </ContentCard>
    </Box>
  );
}
