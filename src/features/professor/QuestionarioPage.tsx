import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CircularProgress from '@mui/material/CircularProgress';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import SchoolIcon from '@mui/icons-material/School';
import { EmptyState } from '../../components/ui/data-display/EmptyState';
import { ProgressBar } from '../../components/ui/data-display/ProgressBar';
import { useToast } from '../../components/ui/feedback/ToastProvider';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOrSeedQuestionnaire,
  submitResponse,
} from '../../services/firestoreService';
import { SECTIONS, PROFESSOR_QUESTIONS, LIKERT_LABELS, SUBJECT_OPTIONS } from '../../data/questionnaireData';
import { UserRole } from '../../types';
import { colors, radius } from '../../components/ui/tokens';

const SEGMENT_TO_ETAPA: Record<string, string> = {
  educacao_infantil: 'Educação Infantil',
  anos_iniciais:     'Ensino Fundamental - Anos Iniciais',
  anos_finais:       'Ensino Fundamental - Anos Finais',
  eja:               'Educação de Jovens e Adultos (EJA)',
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  ctx:       'Infraestrutura, acesso digital e apoio institucional na sua escola.',
  base:      'Seu conhecimento tecnológico, pedagógico e de conteúdo — as bases do TPACK.',
  intersect: 'Como você integra tecnologia, pedagogia e conteúdo na sua prática docente.',
  afr:       'Como você usa ferramentas digitais para avaliar e replanejar.',
  meta:      'Suas impressões sobre esta ferramenta — ajude a melhorá-la (opcional).',
};

const REQUIRED_QUESTIONS = PROFESSOR_QUESTIONS.filter((q) => q.required);

export function QuestionarioPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionnaireId, setQuestionnaireId] = useState('');
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
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

  // Pré-preenche ctx1 (etapa) e ctx1b (componente) do perfil do professor
  useEffect(() => {
    if (!currentUser) return;
    const user = currentUser as any;
    const segments: string[] = user.segment ?? [];
    const subjects: string[] = user.subjects ?? [];

    setAnswers((prev) => {
      const next = { ...prev };
      if (!next.ctx1 && segments.length > 0) {
        next.ctx1 = SEGMENT_TO_ETAPA[segments[0]] ?? 'Outro';
      }
      if (!next.ctx1b && subjects.length > 0) {
        next.ctx1b = subjects
          .map((s: string) => SUBJECT_OPTIONS.find((o) => o.value === s)?.label ?? s)
          .join(', ');
      }
      return next;
    });
  }, [currentUser]);

  const IS_REVIEW = step === SECTIONS.length;
  const currentSection = !IS_REVIEW ? SECTIONS[step] : null;
  const sectionQuestions = currentSection
    ? PROFESSOR_QUESTIONS.filter((q) => q.section === currentSection.key)
    : [];
  const allAnswered = sectionQuestions
    .filter((q) => q.required)
    .every((q) => answers[q.id] !== undefined && answers[q.id] !== '');

  const totalAnswered = REQUIRED_QUESTIONS.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== '',
  ).length;
  const progressPct = IS_REVIEW ? 100 : Math.round((step / SECTIONS.length) * 100);

  const setAnswer = (id: string, value: number | string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

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
        ...(currentUser.schoolId ? { schoolId: currentUser.schoolId } : {}),
        ...(currentUser.schoolNameOther ? { schoolNameOther: currentUser.schoolNameOther } : {}),
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

  if (!currentUser?.schoolId && !currentUser?.schoolNameOther) {
    return (
      <EmptyState
        icon={<SchoolIcon />}
        title="Informe sua escola antes de responder"
        body="A autoavaliação é sempre lida no contexto de uma escola. Escolha a sua na lista da rede — ou informe o nome, se ela não estiver lá."
        action={{ label: 'Ir para o meu perfil', onClick: () => navigate('/app/professor/perfil') }}
      />
    );
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      {/* Progress */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={0.75} mb={1.5}>
          {SECTIONS.map((s, i) => (
            <Box key={s.key} display="flex" alignItems="center" gap={0.75} sx={{ flex: 1 }}>
              <Box
                sx={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: i <= step ? colors.accent : colors.hairlineStrong,
                  transition: 'background 250ms ease',
                }}
              />
              {i < SECTIONS.length - 1 && (
                <Box sx={{ flex: 1, height: 1, background: i < step ? colors.accent : colors.hairline, transition: 'background 250ms ease' }} />
              )}
            </Box>
          ))}
        </Box>
        <Typography sx={{ fontSize: 12, color: colors.inkSubtle, mb: 1 }}>
          {IS_REVIEW
            ? `Revisão final`
            : `Seção ${step + 1} de ${SECTIONS.length} — ${SECTIONS[step]?.label}`}
        </Typography>
        <ProgressBar value={progressPct} />
      </Box>

      {!IS_REVIEW ? (
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 600, color: colors.ink, letterSpacing: '-0.6px', mb: 0.5 }}>
            {currentSection!.label}
          </Typography>
          <Typography sx={{ fontSize: 16, color: colors.inkMuted, mb: 4 }}>
            {SECTION_DESCRIPTIONS[currentSection!.key]}
          </Typography>

          <Box display="flex" flexDirection="column" gap={3}>
            {sectionQuestions.map((q, idx) => (
              <Box
                key={q.id}
                sx={{
                  background: colors.surface2,
                  border: `1px solid ${colors.hairline}`,
                  borderRadius: `${radius.lg}px`,
                  p: 2.5,
                }}
              >
                <Typography sx={{ fontSize: 15, color: colors.ink, mb: 2, lineHeight: 1.5 }}>
                  {idx + 1}. {q.text}
                  {!q.required && (
                    <Typography component="span" sx={{ fontSize: 12, color: colors.inkSubtle, ml: 1 }}>
                      (opcional)
                    </Typography>
                  )}
                </Typography>

                {/* Scale */}
                {q.type === 'scale' && (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {[1, 2, 3, 4, 5].map((val) => {
                      const selected = answers[q.id] === val;
                      return (
                        <Box
                          key={val}
                          onClick={() => setAnswer(q.id, val)}
                          sx={{
                            px: 1.5, py: 1,
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
                )}

                {/* Choice */}
                {q.type === 'choice' && q.options && (
                  <Box display="flex" flexDirection="column" gap={1}>
                    {q.options.map((opt) => {
                      const selected = answers[q.id] === opt;
                      return (
                        <Box
                          key={opt}
                          onClick={() => setAnswer(q.id, opt)}
                          sx={{
                            px: 2, py: 1.5,
                            borderRadius: `${radius.md}px`,
                            border: `1px solid ${selected ? colors.accent : colors.hairline}`,
                            background: selected ? colors.accentDim : colors.surface1,
                            cursor: 'pointer',
                            transition: 'all 150ms ease',
                            '&:hover': { borderColor: colors.accent, background: colors.accentDim },
                          }}
                        >
                          <Typography sx={{ fontSize: 14, color: selected ? colors.accentHover : colors.ink, fontWeight: selected ? 500 : 400 }}>
                            {opt}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {/* Text */}
                {q.type === 'text' && (
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Ex: Anos Finais — Matemática"
                    value={(answers[q.id] as string) ?? ''}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: colors.surface1,
                        '& fieldset': { borderColor: colors.hairline },
                        '&:hover fieldset': { borderColor: colors.accent },
                        '&.Mui-focused fieldset': { borderColor: colors.accent },
                      },
                    }}
                  />
                )}

                {/* Open */}
                {q.type === 'open' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    placeholder="Escreva seu comentário aqui..."
                    value={(answers[q.id] as string) ?? ''}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: colors.surface1,
                        '& fieldset': { borderColor: colors.hairline },
                        '&:hover fieldset': { borderColor: colors.accent },
                        '&.Mui-focused fieldset': { borderColor: colors.accent },
                      },
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

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
              {step === SECTIONS.length - 1 ? 'Revisar respostas' : 'Próxima seção'}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 600, color: colors.ink, mb: 1 }}>
            Revise suas respostas
          </Typography>
          <Typography sx={{ fontSize: 14, color: colors.inkSubtle, mb: 4 }}>
            {totalAnswered} de {REQUIRED_QUESTIONS.length} questões obrigatórias respondidas
          </Typography>

          {SECTIONS.map((section) => (
            <Accordion
              key={section.key}
              defaultExpanded={section.key !== 'meta'}
              sx={{
                background: colors.surface2,
                border: `1px solid ${colors.hairline}`,
                mb: 1,
                boxShadow: 'none',
                borderRadius: `${radius.md}px !important`,
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: colors.inkSubtle }} />}>
                <Typography sx={{ fontWeight: 600, color: colors.ink }}>{section.label}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {PROFESSOR_QUESTIONS.filter((q) => q.section === section.key).map((q, idx) => (
                  <Box key={q.id} mb={2}>
                    <Typography sx={{ fontSize: 13, color: colors.inkSubtle }}>
                      {idx + 1}. {q.text}
                    </Typography>
                    {answers[q.id] !== undefined && answers[q.id] !== '' ? (
                      <Typography sx={{ fontSize: 13, color: colors.accent, fontWeight: 500, mt: 0.5 }}>
                        {q.type === 'scale'
                          ? `${answers[q.id]} — ${LIKERT_LABELS[Number(answers[q.id])]}`
                          : String(answers[q.id])}
                      </Typography>
                    ) : (
                      <Typography sx={{ fontSize: 12, color: q.required ? colors.error : colors.inkSubtle, mt: 0.5 }}>
                        {q.required ? 'Não respondida' : 'Opcional — não preenchida'}
                      </Typography>
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
              onClick={() => setStep(SECTIONS.length - 1)}
              sx={{ color: colors.inkMuted, borderColor: colors.hairline }}
            >
              Editar
            </Button>
            <Button
              variant="contained"
              color="success"
              endIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={saving || totalAnswered < REQUIRED_QUESTIONS.length}
            >
              {saving ? 'Enviando...' : 'Enviar autoavaliação'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
