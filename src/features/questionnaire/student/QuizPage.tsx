import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { ProgressBar } from '../../../components/data-display/ProgressBar';
import { saveStudentResponse } from '../../../services/firestoreService';
import { STUDENT_QUESTIONS } from '../../../data/questionnaireData';
import { colors, radius } from '../../../components/tokens';

const EMOJI_SCALE = ['', '😢', '😕', '😐', '😊', '🤩'];
const SCALE_LABELS = ['', 'Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'];

export function QuizPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const schoolId = sessionStorage.getItem('student_school_id');

  useEffect(() => {
    if (!schoolId) navigate('/estudante/escola');
  }, [schoolId, navigate]);

  const question = STUDENT_QUESTIONS[current];
  const total = STUDENT_QUESTIONS.length;
  const progressPct = Math.round((current / total) * 100);

  const handleSelect = (val: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: val }));
  };

  const handleNext = async () => {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      return;
    }
    // Last question — submit
    setSubmitting(true);
    try {
      const answersArr = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));
      await saveStudentResponse({
        schoolId: schoolId!,
        answers: answersArr,
      } as any);
      navigate('/estudante/concluido');
    } catch {
      // Still navigate on error to not block the user
      navigate('/estudante/concluido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: colors.canvas,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 560 }}>
        {/* Progress */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography sx={{ fontSize: 12, color: colors.inkSubtle }}>
              Questão {current + 1} de {total}
            </Typography>
            <Typography sx={{ fontSize: 12, color: colors.inkSubtle }}>{progressPct}%</Typography>
          </Box>
          <ProgressBar value={progressPct} />
        </Box>

        {/* Question */}
        <Typography sx={{ fontSize: 18, color: colors.ink, mb: 4, lineHeight: 1.5 }}>
          {question.emoji} {question.text}
        </Typography>

        {/* Scale */}
        <Box display="grid" gridTemplateColumns="repeat(5, 1fr)" gap={1} mb={4}>
          {[1, 2, 3, 4, 5].map((val) => {
            const selected = answers[question.id] === val;
            return (
              <Box
                key={val}
                onClick={() => handleSelect(val)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  p: 1.5,
                  borderRadius: `${radius.md}px`,
                  border: `1px solid ${selected ? colors.accent : colors.hairline}`,
                  background: selected ? colors.accentDim : colors.surface1,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  '&:hover': { borderColor: colors.accent, background: colors.surface2 },
                }}
              >
                <Typography sx={{ fontSize: 28 }}>{EMOJI_SCALE[val]}</Typography>
                <Typography sx={{ fontSize: 11, color: selected ? colors.accentHover : colors.inkSubtle, textAlign: 'center' }}>
                  {SCALE_LABELS[val]}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Navigation */}
        <Box display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            onClick={() => current > 0 ? setCurrent((c) => c - 1) : navigate('/estudante/escola')}
            sx={{ color: colors.inkMuted, borderColor: colors.hairline }}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            disabled={answers[question.id] === undefined || submitting}
            onClick={handleNext}
            endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {submitting ? 'Enviando...' : current === total - 1 ? 'Enviar' : 'Próxima'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
