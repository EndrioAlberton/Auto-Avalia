import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent, Button, Chip, Stack,
  LinearProgress, CircularProgress, FormControl, InputLabel,
  Select, MenuItem, Snackbar,
} from '@mui/material';
import {
  CheckCircle, ArrowForward, ArrowBack, Send, Celebration,
  LockOutlined, VisibilityOff,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { getAllSchools, saveStudentResponse } from '../../services/firestoreService';
import { STUDENT_QUESTIONS } from '../../data/questionnaireData';
import { School as SchoolType } from '../../types';

const EMOJI_SCALE = ['', '😢', '😕', '😐', '😊', '🤩'];
const SCALE_LABELS = ['', 'Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'];
const SCALE_COLORS = ['', '#ef5350', '#ff9800', '#ffee58', '#66bb6a', '#26a69a'];

// ── LANDING PAGE DO ESTUDANTE ─────────────────────────────────────────────────

const EstudanteLanding: React.FC<{ onStart: (schoolId: string) => void }> = ({ onStart }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSchools()
      .then(setSchools)
      .catch(() => setSchools([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box minHeight="100vh" sx={{ background: 'linear-gradient(135deg,#7c3aed 0%,#2563eb 100%)' }}>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" fontWeight={900} color="white" gutterBottom>Autoavalia</Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.85)">
            Sua voz importa! 🎓
          </Typography>
        </Box>

        <Card elevation={8} sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Olá, estudante! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Responda este questionário rápido sobre suas aulas. É anônimo — ninguém saberá que foi você!
            </Typography>

            <Stack spacing={1.5} mb={4}>
              {[
                { icon: <VisibilityOff color="success" />, text: '100% anônimo — suas respostas não te identificam' },
                { icon: <LockOutlined color="primary" />, text: 'Seguro e confidencial' },
                { icon: <CheckCircle color="action" />, text: '10 perguntas · menos de 5 minutos' },
              ].map(item => (
                <Box key={item.text} display="flex" alignItems="center" gap={2}>
                  {item.icon}
                  <Typography variant="body2">{item.text}</Typography>
                </Box>
              ))}
            </Stack>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Selecione sua escola</InputLabel>
              <Select
                value={selectedSchool}
                onChange={e => setSelectedSchool(e.target.value)}
                label="Selecione sua escola"
                disabled={loading}
              >
                {loading && <MenuItem disabled><CircularProgress size={18} sx={{ mr: 1 }} /> Carregando...</MenuItem>}
                {schools.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                {!loading && schools.length === 0 && (
                  <MenuItem disabled>Nenhuma escola cadastrada</MenuItem>
                )}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowForward />}
              onClick={() => onStart(selectedSchool)}
              disabled={!selectedSchool}
              sx={{ py: 1.5, fontSize: 16, fontWeight: 700, borderRadius: 3 }}
            >
              Começar agora!
            </Button>
          </CardContent>
        </Card>

        <Typography variant="caption" color="rgba(255,255,255,0.6)" display="block" textAlign="center" mt={2}>
          Plataforma Autoavalia · Secretaria de Educação
        </Typography>
      </Container>
    </Box>
  );
};

// ── QUESTIONÁRIO ──────────────────────────────────────────────────────────────

const Questionario: React.FC<{ schoolId: string; onComplete: () => void; onBack: () => void }> = ({
  schoolId,
  onComplete,
  onBack,
}) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const current = STUDENT_QUESTIONS[step];
  const total = STUDENT_QUESTIONS.length;
  const progress = ((step) / total) * 100;

  const handleSelect = (value: number) => {
    setAnswers(prev => ({ ...prev, [current.id]: value }));
  };

  const handleNext = async () => {
    if (step < total - 1) {
      setStep(s => s + 1);
    } else {
      // Última pergunta respondida → salvar
      try {
        setSaving(true);
        const finalAnswers = {
          ...answers,
          [current.id]: answers[current.id] ?? 0,
        };
        await saveStudentResponse({
          questionnaireId: 'estudante-padrao-2025',
          schoolId,
          answers: Object.entries(finalAnswers).map(([questionId, value]) => ({ questionId, value })),
        });
        onComplete();
      } catch (err: any) {
        setSnack('Erro ao salvar. Tente novamente.');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <Box minHeight="100vh" sx={{ background: 'linear-gradient(135deg,#7c3aed 0%,#2563eb 100%)' }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ color: 'white' }} size="small">
            Voltar
          </Button>
          <Chip label={`${step + 1} / ${total}`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 4, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }}
        />

        {/* Cartão da pergunta */}
        <Card elevation={8} sx={{ borderRadius: 4, mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography fontSize={48} textAlign="center" mb={2}>{current.emoji}</Typography>
            <Typography variant="h6" fontWeight={600} textAlign="center" mb={3}>
              {current.text}
            </Typography>

            {/* Escala visual */}
            <Stack spacing={1.5}>
              {[1, 2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  variant={answers[current.id] === val ? 'contained' : 'outlined'}
                  onClick={() => handleSelect(val)}
                  fullWidth
                  sx={{
                    py: 1.5,
                    justifyContent: 'flex-start',
                    pl: 2,
                    gap: 1.5,
                    borderRadius: 3,
                    bgcolor: answers[current.id] === val ? SCALE_COLORS[val] : undefined,
                    borderColor: SCALE_COLORS[val],
                    color: answers[current.id] === val ? '#fff' : SCALE_COLORS[val],
                    fontWeight: answers[current.id] === val ? 700 : 400,
                    '&:hover': { bgcolor: SCALE_COLORS[val] + '33' },
                    transition: 'all 0.15s',
                  }}
                >
                  <Typography fontSize={24}>{EMOJI_SCALE[val]}</Typography>
                  <Typography variant="body1">{SCALE_LABELS[val]}</Typography>
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="large"
          fullWidth
          endIcon={saving ? <CircularProgress size={20} color="inherit" /> : step < total - 1 ? <ArrowForward /> : <Send />}
          onClick={handleNext}
          disabled={answers[current.id] === undefined || saving}
          sx={{
            py: 1.5, fontWeight: 700, borderRadius: 3, fontSize: 16,
            bgcolor: 'white', color: '#7c3aed',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
            '&:disabled': { bgcolor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.7)' },
          }}
        >
          {saving ? 'Salvando...' : step < total - 1 ? 'Próxima' : 'Enviar respostas!'}
        </Button>

        <Typography variant="caption" color="rgba(255,255,255,0.6)" display="block" textAlign="center" mt={2}>
          🔒 Suas respostas são 100% anônimas
        </Typography>
      </Container>
      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
};

// ── TELA DE CONCLUSÃO ─────────────────────────────────────────────────────────

const Conclusao: React.FC<{ onRestart: () => void }> = ({ onRestart }) => (
  <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center"
    sx={{ background: 'linear-gradient(135deg,#059669 0%,#2563eb 100%)' }}>
    <Container maxWidth="sm">
      <Card elevation={8} sx={{ borderRadius: 4, p: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Celebration sx={{ fontSize: 80, color: '#059669', mb: 2 }} />
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Obrigado! 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            Suas respostas foram salvas com segurança no Firebase.
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Você ajudou sua escola a melhorar! Os gestores usarão esses dados para aprimorar as aulas.
          </Typography>

          <Stack spacing={2} alignItems="center">
            <Chip icon={<CheckCircle />} label="Respostas salvas anonimamente" color="success" />
            <Chip icon={<LockOutlined />} label="Ninguém sabe que foi você" color="primary" />
          </Stack>

          <Button variant="outlined" sx={{ mt: 4 }} onClick={onRestart} size="large">
            Responder novamente
          </Button>
        </CardContent>
      </Card>
    </Container>
  </Box>
);

// ── DASHBOARD PRINCIPAL ───────────────────────────────────────────────────────

const EstudanteDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [phase, setPhase] = useState<'landing' | 'quiz' | 'done'>('landing');
  const [schoolId, setSchoolId] = useState(searchParams.get('schoolId') || '');

  // Se receber schoolId pela URL, pular a landing
  useEffect(() => {
    const sid = searchParams.get('schoolId');
    if (sid) {
      setSchoolId(sid);
      // Não pula diretamente para quiz — mantém landing para o usuário confirmar
    }
  }, [searchParams]);

  const handleStart = (sid: string) => {
    setSchoolId(sid);
    setPhase('quiz');
  };

  const handleRestart = () => {
    setSchoolId('');
    setPhase('landing');
  };

  return (
    <>
      <Helmet><title>Estudante – Autoavalia</title></Helmet>
      {phase === 'landing' && (
        <EstudanteLanding onStart={handleStart} />
      )}
      {phase === 'quiz' && schoolId && (
        <Questionario
          schoolId={schoolId}
          onComplete={() => setPhase('done')}
          onBack={() => setPhase('landing')}
        />
      )}
      {phase === 'done' && (
        <Conclusao onRestart={handleRestart} />
      )}
    </>
  );
};

export default EstudanteDashboard;
