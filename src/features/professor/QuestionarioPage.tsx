import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CircularProgress from '@mui/material/CircularProgress';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import { ProgressBar } from '../../components/ui/data-display/ProgressBar';
import { useToast } from '../../components/ui/feedback/ToastProvider';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOrSeedQuestionnaire,
  submitResponse,
} from '../../services/firestoreService';
import { DOMAINS, PROFESSOR_QUESTIONS, LIKERT_LABELS } from '../../data/questionnaireData';
import { UserRole } from '../../types';
import { colors, radius } from '../../components/ui/tokens';

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  plan: 'Como você planeja suas aulas e organiza o currículo.',
  amb: 'Como você cria um ambiente seguro e propício à aprendizagem.',
  inst: 'Como você ensina e engaja os estudantes durante as aulas.',
  aval: 'Como você avalia e dá feedback sobre o aprendizado.',
  tech: 'Como você usa tecnologia para apoiar o ensino e aprendizado.',
};

export function QuestionarioPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionnaireId, setQuestionnaireId] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);

  const loadQuestionnaire = useCallback(async () => {
    try {
      const q = await getOrSeedQuestionnaire(UserRole.PROFESSOR);
      setQuestionnaireId(q.id);
    } catch {
      toast.error('Erro ao carregar o questionário.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadQuestionnaire(); }, [loadQuestionnaire]);

  const IS_REVIEW = step === DOMAINS.length;
  const currentDomain = !IS_REVIEW ? DOMAINS[step] : null;
  const domainQuestions = currentDomain ? PROFESSOR_QUESTIONS.filter((q) => q.domain === currentDomain.key) : [];
  const allAnswered = domainQuestions.every((q) => answers[q.id] !== undefined);
  const totalAnswered = PROFESSOR_QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const progressPct = IS_REVIEW ? 100 : Math.round((step / DOMAINS.length) * 100);

  const handleSubmit = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const answersArr = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));
      await submitResponse({
        questionnaireId,
        userId: currentUser.uid,
        schoolId: currentUser.schoolId ?? 'sem-escola',
        ...(currentUser.networkId ? { networkId: currentUser.networkId } : {}),
        answers: answersArr,
        segment: (currentUser as any).segment?.[0] ?? null,
      });
      toast.success('Autoavaliação enviada com sucesso!');
      navigate('/app/professor/relatorios');
    } catch {
      toast.error('Erro ao enviar autoavaliação. Tente novamente.');
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
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      {/* Progress bar */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          {DOMAINS.map((d, i) => (
            <Typography
              key={d.key}
              sx={{
                fontSize: 12,
                fontWeight: i === step ? 600 : 400,
                color: i < step ? colors.accent : i === step ? colors.ink : colors.inkSubtle,
              }}
            >
              {d.label}
            </Typography>
          ))}
        </Box>
        <ProgressBar value={progressPct} />
      </Box>

      {!IS_REVIEW ? (
        <Box>
          {/* Domain header */}
          <Typography sx={{ fontSize: 28, fontWeight: 600, color: colors.ink, letterSpacing: '-0.6px', mb: 0.5 }}>
            {currentDomain!.label}
          </Typography>
          <Typography sx={{ fontSize: 16, color: colors.inkMuted, mb: 4 }}>
            {DOMAIN_DESCRIPTIONS[currentDomain!.key]}
          </Typography>

          {/* Questions */}
          <Box display="flex" flexDirection="column" gap={3}>
            {domainQuestions.map((q, idx) => (
              <Box
                key={q.id}
                sx={{
                  background: colors.surface2,
                  border: `1px solid ${colors.hairline}`,
                  borderRadius: `${radius.lg}px`,
                  p: 2.5,
                }}
              >
                <Typography sx={{ fontSize: 15, color: colors.ink, mb: 2 }}>
                  {idx + 1}. {q.text}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {[1, 2, 3, 4, 5].map((val) => {
                    const selected = answers[q.id] === val;
                    return (
                      <Box
                        key={val}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderRadius: `${radius.md}px`,
                          border: `1px solid ${selected ? colors.accent : colors.hairline}`,
                          background: selected ? colors.accentDim : colors.surface1,
                          color: selected ? colors.accentHover : colors.inkMuted,
                          fontSize: 13,
                          fontWeight: selected ? 500 : 400,
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                          whiteSpace: 'nowrap',
                          '&:hover': { borderColor: colors.accent, background: colors.accentDim },
                        }}
                      >
                        {val} — {LIKERT_LABELS[val]}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Navigation */}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => step > 0 ? setStep((s) => s - 1) : navigate('/app/professor/inicio')}
              sx={{ color: colors.inkMuted, borderColor: colors.hairline }}
            >
              {step === 0 ? 'Cancelar' : 'Voltar'}
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              disabled={!allAnswered}
              onClick={() => setStep((s) => s + 1)}
            >
              {step === DOMAINS.length - 1 ? 'Revisar respostas' : 'Próximo domínio'}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 600, color: colors.ink, mb: 1 }}>
            Revise suas respostas
          </Typography>
          <Typography sx={{ fontSize: 14, color: colors.inkSubtle, mb: 4 }}>
            {totalAnswered} de {PROFESSOR_QUESTIONS.length} questões respondidas
          </Typography>

          {DOMAINS.map((domain) => (
            <Accordion
              key={domain.key}
              defaultExpanded
              sx={{ background: colors.surface2, border: `1px solid ${colors.hairline}`, mb: 1, boxShadow: 'none', borderRadius: `${radius.md}px !important` }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: colors.inkSubtle }} />}>
                <Typography sx={{ fontWeight: 600, color: colors.ink }}>{domain.label}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {PROFESSOR_QUESTIONS.filter((q) => q.domain === domain.key).map((q, idx) => (
                  <Box key={q.id} mb={2}>
                    <Typography sx={{ fontSize: 13, color: colors.inkSubtle }}>{idx + 1}. {q.text}</Typography>
                    {answers[q.id] !== undefined ? (
                      <Typography sx={{ fontSize: 13, color: colors.accent, fontWeight: 500, mt: 0.5 }}>
                        {answers[q.id]} — {LIKERT_LABELS[answers[q.id]]}
                      </Typography>
                    ) : (
                      <Typography sx={{ fontSize: 12, color: colors.error, mt: 0.5 }}>Não respondida</Typography>
                    )}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}

          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setStep(DOMAINS.length - 1)}
              sx={{ color: colors.inkMuted, borderColor: colors.hairline }}
            >
              Editar
            </Button>
            <Button
              variant="contained"
              color="success"
              endIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={saving || totalAnswered < PROFESSOR_QUESTIONS.length}
            >
              {saving ? 'Enviando...' : 'Enviar autoavaliação'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
