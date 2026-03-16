import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Box, Container, Card, CardContent, CardActions, Button, Chip, Grid2 as Grid,
  LinearProgress, Stepper, Step, StepLabel, Alert, IconButton,
  TextField, FormControl, InputLabel, Select, OutlinedInput, Tooltip, MenuItem,
  CircularProgress, Stack, ToggleButton, ToggleButtonGroup,
  Accordion, AccordionSummary, AccordionDetails, Typography, Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Assignment as AssignmentIcon,
  BarChart as ChartIcon, Person as PersonIcon,
  CheckCircle, RadioButtonUnchecked, TrendingUp,
  ArrowForward, ArrowBack, Send,
  Timeline, CompareArrows, EmojiEvents, ExpandMore,
  PlayArrow,
} from '@mui/icons-material';
import { DashboardLayout, LoadingSkeletonGrid, EmptyState } from '../../components/shared';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOrSeedQuestionnaire,
  getUserResponses,
  getSchoolResponses,
  submitResponse,
  updateUserProfile,
  getUserLatestResponse,
  getAllSchools,
  getPendingInvitationsByEmail,
  acceptInvitation,
  updateInvitation,
  getSchool,
} from '../../services/firestoreService';
import {
  answersToScores,
  responsesToAvgScores,
  buildEvolutionData,
  getStrengths,
  getImprovements,
  buildComparisonData,
  buildRadarData,
  overallScore,
  formatFirestoreDate,
  DomainScore,
} from '../../services/analyticsService';
import {
  DOMAINS,
  PROFESSOR_QUESTIONS,
  LIKERT_LABELS,
  LIKERT_COLORS,
  SUBJECT_OPTIONS,
} from '../../data/questionnaireData';
import { Questionnaire, QuestionnaireResponse, UserRole, Invitation } from '../../types';

const DOMAIN_CHART_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'];

// ── PROFESSOR HOME ────────────────────────────────────────────────────────────

const ProfessorHome: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  const { currentUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [myResponses, setMyResponses] = useState<QuestionnaireResponse[]>([]);
  const [myScores, setMyScores] = useState<DomainScore[]>([]);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [schoolNames, setSchoolNames] = useState<Record<string, string>>({});
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const [q, responses, invites] = await Promise.all([
          getOrSeedQuestionnaire(UserRole.PROFESSOR),
          getUserResponses(currentUser.uid),
          getPendingInvitationsByEmail(currentUser.email),
        ]);
        setQuestionnaire(q);
        setMyResponses(responses);
        setInvitations(invites);

        // Busca o nome de cada escola dos convites
        if (invites.length > 0) {
          const names: Record<string, string> = {};
          await Promise.all(
            invites.map(async inv => {
              try {
                const school = await getSchool(inv.schoolId);
                names[inv.schoolId] = school.name;
              } catch {
                names[inv.schoolId] = 'Escola não identificada';
              }
            })
          );
          setSchoolNames(names);
        }
        if (responses.length > 0) {
          const latest = responses[0];
          const map: Record<string, number> = {};
          for (const a of latest.answers) map[a.questionId] = Number(a.value);
          setMyScores(answersToScores(map));
        }
        const answered = await getUserLatestResponse(currentUser.uid, q.id);
        setAlreadyAnswered(!!answered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  const handleAcceptInvite = async (invite: Invitation) => {
    if (!currentUser) return;
    setAcceptingId(invite.id);
    try {
      await acceptInvitation(invite.id);
      await updateUserProfile(currentUser.uid, { schoolId: invite.schoolId });
      await refreshUser();
      const schoolName = schoolNames[invite.schoolId] || 'escola';
      setInvitations(prev => prev.filter(i => i.id !== invite.id));
      setInviteMsg(`✅ Convite aceito! Você foi vinculado à ${schoolName}.`);
    } catch (e: any) {
      setInviteMsg('Erro ao aceitar convite: ' + (e?.message || e));
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await updateInvitation(inviteId, { status: 'expired' } as any);
      setInvitations(prev => prev.filter(i => i.id !== inviteId));
      setInviteMsg('Convite recusado.');
    } catch { /* ignore */ }
  };

  if (loading) return <LoadingSkeletonGrid />;

  const overall = overallScore(myScores);
  const topDomain = [...myScores].sort((a, b) => b.score - a.score)[0];
  const bottomDomain = [...myScores].sort((a, b) => a.score - b.score)[0];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Olá, {currentUser?.displayName?.split(' ')[0] || 'Professor'}! 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Bem-vindo ao seu espaço de autoavaliação.
      </Typography>

      {/* ── Convites pendentes ── */}
      {inviteMsg && (
        <Alert severity={inviteMsg.startsWith('✅') ? 'success' : inviteMsg.startsWith('Erro') ? 'error' : 'info'}
          onClose={() => setInviteMsg('')} sx={{ mb: 2 }}>
          {inviteMsg}
        </Alert>
      )}
      {invitations.map(invite => (
        <Alert
          key={invite.id}
          severity="info"
          sx={{ mb: 2, alignItems: 'center' }}
          icon={<CheckCircle />}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                size="small" variant="contained" color="success"
                disabled={acceptingId === invite.id}
                onClick={() => handleAcceptInvite(invite)}
              >
                {acceptingId === invite.id ? <CircularProgress size={16} color="inherit" /> : 'Aceitar'}
              </Button>
              <Button
                size="small" variant="outlined" color="error"
                disabled={acceptingId === invite.id}
                onClick={() => handleDeclineInvite(invite.id)}
              >
                Recusar
              </Button>
            </Stack>
          }
        >
          <strong>Convite de escola!</strong> Você foi convidado para integrar a equipe de{' '}
          <strong>{schoolNames[invite.schoolId] || 'uma escola'}</strong>.
          Clique em <strong>Aceitar</strong> para ser vinculado automaticamente.
        </Alert>
      ))}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderLeft: '4px solid #7c3aed' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Questionários Respondidos</Typography>
              <Typography variant="h3" fontWeight={700} color="primary">{myResponses.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                {myResponses.length > 0 ? `Último: ${formatFirestoreDate(myResponses[0].completedAt)}` : 'Nenhum ainda'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderLeft: '4px solid #059669' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Pontuação Geral</Typography>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {overall > 0 ? overall.toFixed(1) : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">de 5.0 pontos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderLeft: '4px solid #2563eb' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Ponto Forte</Typography>
              <Typography variant="h6" fontWeight={700} color="info.main">
                {topDomain?.score > 0 ? topDomain.label : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">domínio com maior pontuação</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderLeft: '4px solid #d97706' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">A Desenvolver</Typography>
              <Typography variant="h6" fontWeight={700} color="warning.main">
                {bottomDomain?.score > 0 ? bottomDomain.label : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">domínio com menor pontuação</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Questionário */}
        {questionnaire && (
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <AssignmentIcon color={alreadyAnswered ? 'success' : 'warning'} />
                  <Typography variant="h6" fontWeight={600}>{questionnaire.title}</Typography>
                  <Chip label={alreadyAnswered ? 'Respondido' : 'Pendente'} color={alreadyAnswered ? 'success' : 'warning'} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {questionnaire.questions?.length || 25} questões • 5 domínios • ~15 minutos
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={alreadyAnswered ? 100 : 0}
                  sx={{ mt: 2, borderRadius: 4 }}
                  color={alreadyAnswered ? 'success' : 'warning'}
                />
              </CardContent>
              <CardActions>
                {alreadyAnswered ? (
                  <Button variant="outlined" endIcon={<ChartIcon />} onClick={() => onNavigate('/professor/relatorios')}>
                    Ver resultados
                  </Button>
                ) : (
                  <Button variant="contained" endIcon={<PlayArrow />} onClick={() => onNavigate('/professor/questionarios')}>
                    Iniciar questionário
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        )}

        {myScores.length > 0 && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Visão Geral</Typography>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={myScores.map(s => ({ subject: s.label, Eu: s.score }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 5]} tick={false} />
                    <Radar name="Eu" dataKey="Eu" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
              <CardActions>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => onNavigate('/professor/relatorios')}>
                  Ver relatório completo
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}

        {myScores.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info" icon={<AssignmentIcon />}>
              Você ainda não respondeu nenhum questionário. Responda para ver seus relatórios e comparações!
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// ── QUESTIONÁRIOS ─────────────────────────────────────────────────────────────

const Questionarios: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [myResponses, setMyResponses] = useState<QuestionnaireResponse[]>([]);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoadError('');
    try {
      setLoading(true);
      const [q, responses] = await Promise.all([
        getOrSeedQuestionnaire(UserRole.PROFESSOR),
        getUserResponses(currentUser.uid),
      ]);
      setQuestionnaire(q);
      setMyResponses(responses);
      const answered = await getUserLatestResponse(currentUser.uid, q.id);
      setAlreadyAnswered(!!answered);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('permission-denied') || msg.includes('Missing or insufficient')) {
        setLoadError('Sem permissão para carregar os questionários. Verifique se você está autenticado e se as regras do Firestore estão publicadas.');
      } else if (msg.includes('index') || msg.includes('requires an index')) {
        setLoadError('Índice do Firestore não encontrado. Publique as regras/índices ou aguarde a propagação no Firebase Console.');
      } else {
        setLoadError(`Erro ao carregar questionários: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { loadData(); }, [loadData]);

  // Usa as questões vindas do Firestore; fallback para as locais se o banco ainda não tiver sido populado
  const firestoreQuestions = (questionnaire?.questions ?? PROFESSOR_QUESTIONS) as typeof PROFESSOR_QUESTIONS;

  const questionsForStep = (step: number) =>
    firestoreQuestions.filter(q => q.domain === DOMAINS[step].key);

  const handleAnswer = (qId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleNext = () => {
    if (activeStep < 4) setActiveStep(prev => prev + 1);
    else setActiveStep(5);
  };

  const handleSubmit = async () => {
    if (!currentUser || !questionnaire) return;
    setSubmitError('');
    try {
      setSaving(true);
      const answersArr = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));
      await submitResponse({
        questionnaireId: questionnaire.id,
        userId: currentUser.uid,
        schoolId: currentUser.schoolId || 'sem-escola',
        ...(currentUser.networkId ? { networkId: currentUser.networkId } : {}),
        answers: answersArr,
        segment: (currentUser as any).segment?.[0] ?? null,
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('permission-denied') || msg.includes('Missing or insufficient')) {
        setSubmitError('Permissão negada pelo Firebase. Verifique se você está autenticado.');
      } else {
        setSubmitError(`Erro ao enviar: ${msg}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  if (loadError) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>Questionários</Typography>
        <Alert severity="error" sx={{ mb: 2 }} action={
          <Button color="inherit" size="small" onClick={loadData}>Tentar novamente</Button>
        }>
          {loadError}
        </Alert>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box textAlign="center" py={6}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>Respostas salvas no Firebase! ✅</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Seus dados foram armazenados com segurança. Acesse o relatório para ver seus resultados.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={() => { setActiveStep(-1); setAnswers({}); setSubmitted(false); loadData(); }}>
            Voltar à lista
          </Button>
          <Button variant="contained" endIcon={<ChartIcon />} onClick={() => navigate('/professor/relatorios')}>
            Ver meu relatório
          </Button>
        </Stack>
      </Box>
    );
  }

  if (activeStep === -1) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>Questionários</Typography>

        {!questionnaire && !loading && (
          <Alert severity="warning" sx={{ mb: 3 }} action={
            <Button color="inherit" size="small" onClick={loadData}>Recarregar</Button>
          }>
            Nenhum questionário ativo encontrado. O sistema tentará criar um automaticamente — clique em <strong>Recarregar</strong> ou aguarde e tente novamente.
          </Alert>
        )}

        <Grid container spacing={3}>
          {questionnaire && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={2} sx={{ border: '1px solid', borderColor: alreadyAnswered ? 'success.light' : 'warning.light' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Chip label={alreadyAnswered ? 'Respondido' : 'Pendente'} color={alreadyAnswered ? 'success' : 'warning'} size="small" sx={{ mb: 1 }} />
                      <Typography variant="h6" fontWeight={600}>{questionnaire.title}</Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {questionnaire.questions?.length || 25} questões • ~15 min
                      </Typography>
                    </Box>
                    <AssignmentIcon color={alreadyAnswered ? 'success' : 'warning'} sx={{ fontSize: 40 }} />
                  </Box>
                  <LinearProgress variant="determinate" value={alreadyAnswered ? 100 : 0} sx={{ mt: 2, borderRadius: 4 }} color={alreadyAnswered ? 'success' : 'warning'} />
                </CardContent>
                <CardActions>
                  {alreadyAnswered ? (
                    <Button size="small" endIcon={<ChartIcon />} onClick={() => navigate('/professor/relatorios')}>
                      Ver resultados
                    </Button>
                  ) : (
                    <Button variant="contained" color="warning" endIcon={<PlayArrow />} onClick={() => setActiveStep(0)}>
                      Iniciar
                    </Button>
                  )}
                  {alreadyAnswered && (
                    <Button size="small" color="warning" onClick={() => setActiveStep(0)}>
                      Responder novamente
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          )}

          {myResponses.map((r, idx) => (
            <Grid size={{ xs: 12, md: 6 }} key={r.id}>
              <Card elevation={1} sx={{ opacity: 0.85 }}>
                <CardContent>
                  <Chip label="Concluído" color="success" size="small" sx={{ mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>Resposta #{myResponses.length - idx}</Typography>
                  <Typography variant="body2" color="text.secondary">{formatFirestoreDate(r.completedAt)}</Typography>
                  <LinearProgress variant="determinate" value={100} sx={{ mt: 2, borderRadius: 4 }} color="success" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const isReview = activeStep === 5;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => activeStep > 0 ? setActiveStep(p => p - 1) : setActiveStep(-1)}><ArrowBack /></IconButton>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700}>
            {isReview ? 'Revisão' : `${DOMAINS[activeStep].label} (${activeStep + 1}/5)`}
          </Typography>
          <LinearProgress variant="determinate" value={isReview ? 100 : (activeStep / 5) * 100} sx={{ mt: 1, borderRadius: 4 }} />
        </Box>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {DOMAINS.map((d, i) => (
          <Step key={d.key} completed={i < activeStep || isReview}>
            <StepLabel>{d.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {!isReview ? (
        <Box>
          <Stack spacing={3}>
            {questionsForStep(activeStep).map((q, idx) => (
              <Card key={q.id} elevation={1} sx={{ p: 2 }}>
                <Typography variant="body1" fontWeight={500} mb={2}>{idx + 1}. {q.text}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {[1, 2, 3, 4, 5].map(val => (
                    <Button
                      key={val}
                      variant={answers[q.id] === val ? 'contained' : 'outlined'}
                      onClick={() => handleAnswer(q.id, val)}
                      size="small"
                      sx={{
                        minWidth: 110,
                        bgcolor: answers[q.id] === val ? LIKERT_COLORS[val] : undefined,
                        borderColor: LIKERT_COLORS[val],
                        color: answers[q.id] === val ? '#fff' : LIKERT_COLORS[val],
                        '&:hover': { bgcolor: LIKERT_COLORS[val] + '22' },
                      }}
                    >
                      {val} – {LIKERT_LABELS[val]}
                    </Button>
                  ))}
                </Stack>
              </Card>
            ))}
          </Stack>
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button variant="outlined" onClick={() => activeStep > 0 ? setActiveStep(p => p - 1) : setActiveStep(-1)} startIcon={<ArrowBack />}>
              {activeStep === 0 ? 'Cancelar' : 'Anterior'}
            </Button>
            <Button
              variant="contained"
              endIcon={activeStep === 4 ? <Send /> : <ArrowForward />}
              onClick={handleNext}
              disabled={questionsForStep(activeStep).some(q => answers[q.id] === undefined)}
            >
              {activeStep === 4 ? 'Revisar' : 'Próximo'}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>Revise antes de enviar. Suas respostas serão salvas no Firebase.</Alert>
          {DOMAINS.map(domain => (
            <Accordion key={domain.key} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={600}>{domain.label}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {firestoreQuestions.filter(q => q.domain === domain.key).map((q, idx) => (
                  <Box key={q.id} mb={2}>
                    <Typography variant="body2" color="text.secondary">{idx + 1}. {q.text}</Typography>
                    {answers[q.id] && (
                      <Chip label={`${answers[q.id]} – ${LIKERT_LABELS[answers[q.id]]}`} size="small"
                        sx={{ mt: 0.5, bgcolor: LIKERT_COLORS[answers[q.id]], color: '#fff' }} />
                    )}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button variant="outlined" onClick={() => setActiveStep(4)} startIcon={<ArrowBack />}>Editar</Button>
            <Button
              variant="contained" color="success" endIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Send />}
              onClick={handleSubmit}
              disabled={saving || Object.keys(answers).length < 25}
            >
              {saving ? 'Salvando...' : 'Salvar no Firebase'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ── RELATÓRIOS ────────────────────────────────────────────────────────────────

const Relatorios: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [myResponses, setMyResponses] = useState<QuestionnaireResponse[]>([]);
  const [myScores, setMyScores] = useState<DomainScore[]>([]);
  const [schoolScores, setSchoolScores] = useState<DomainScore[] | null>(null);
  const [view, setView] = useState<'radar' | 'barras' | 'evolucao'>('radar');

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        setLoadError('');
        const [myR, schoolR] = await Promise.all([
          getUserResponses(currentUser.uid),
          currentUser.schoolId ? getSchoolResponses(currentUser.schoolId) : Promise.resolve([]),
        ]);
        setMyResponses(myR);
        if (myR.length > 0) {
          const map: Record<string, number> = {};
          for (const a of myR[0].answers) map[a.questionId] = Number(a.value);
          setMyScores(answersToScores(map));
        }
        const filtered = schoolR.filter(r => r.userId !== currentUser.uid);
        const avgSchool = filtered.length >= 1 ? responsesToAvgScores(filtered) : null;
        setSchoolScores(avgSchool);
      } catch (e: any) {
        console.error('Erro ao carregar relatórios:', e);
        setLoadError(e?.message || 'Erro ao carregar relatórios. Tente novamente.');
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  if (loadError) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>Meus Relatórios</Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>Tentar novamente</Button>
      </Box>
    );
  }

  if (myResponses.length === 0) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>Meus Relatórios</Typography>
        <EmptyState
          icon={ChartIcon}
          title="Nenhum relatório disponível"
          message="Você ainda não respondeu nenhum questionário. Após responder, seus relatórios aparecerão aqui."
          actionLabel="Ir para Questionários"
          onAction={() => navigate('/professor/questionarios')}
        />
      </Box>
    );
  }

  const compData = buildComparisonData(myScores, schoolScores, null);
  const radarData = buildRadarData(myScores, schoolScores);
  const evolutionData = buildEvolutionData(myResponses);
  const strengths = getStrengths(myScores);
  const improvements = getImprovements(myScores);
  const overall = overallScore(myScores);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Meus Relatórios</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Baseado em {myResponses.length} resposta(s) salva(s) no Firebase.
        Última resposta: {formatFirestoreDate(myResponses[0].completedAt)}
      </Typography>

      <Grid container spacing={2} mb={4}>
        {myScores.map(d => (
          <Grid size={{ xs: 6, sm: 4, md: 'auto' }} key={d.domain}>
            <Card elevation={1} sx={{ textAlign: 'center', p: 1.5, minWidth: 120 }}>
              <Typography variant="h4" fontWeight={700} color="primary">{d.score.toFixed(1)}</Typography>
              <Typography variant="caption">{d.label}</Typography>
              {schoolScores && (
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mt={0.5}>
                  <Typography variant="caption" color={d.score >= (schoolScores.find(s => s.domain === d.domain)?.score ?? 0) ? 'success.main' : 'warning.main'}>
                    {d.score >= (schoolScores.find(s => s.domain === d.domain)?.score ?? 0) ? '↑' : '↓'} vs escola
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
        <Grid size={{ xs: 6, sm: 4, md: 'auto' }}>
          <Card elevation={1} sx={{ textAlign: 'center', p: 1.5, minWidth: 120, bgcolor: 'primary.50' }}>
            <Typography variant="h4" fontWeight={700} color="primary">{overall.toFixed(1)}</Typography>
            <Typography variant="caption" fontWeight={600}>Geral</Typography>
          </Card>
        </Grid>
      </Grid>

      <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} sx={{ mb: 3 }}>
        <ToggleButton value="radar"><CompareArrows sx={{ mr: 1 }} />Radar</ToggleButton>
        <ToggleButton value="barras"><ChartIcon sx={{ mr: 1 }} />Comparação</ToggleButton>
        <ToggleButton value="evolucao" disabled={evolutionData.length < 2}>
          <Timeline sx={{ mr: 1 }} />Evolução
        </ToggleButton>
      </ToggleButtonGroup>

      {view === 'radar' && (
        <Card elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Perfil — Eu vs Média da Escola</Typography>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis domain={[0, 5]} tickCount={6} />
              <Radar name="Minha avaliação" dataKey="Eu" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.35} />
              {schoolScores && <Radar name="Média da escola" dataKey="Escola" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
          {!schoolScores && <Alert severity="info" sx={{ mt: 1 }}>Comparação com a escola disponível quando pelo menos 1 outro professor responder.</Alert>}
        </Card>
      )}

      {view === 'barras' && (
        <Card elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Comparação com Médias da Escola</Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={compData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="domain" />
              <YAxis domain={[0, 5]} />
              <RTooltip />
              <Legend />
              <Bar dataKey="minha" name="Minha avaliação" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              {schoolScores && <Bar dataKey="escola" name="Média da escola" fill="#2563eb" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {view === 'evolucao' && evolutionData.length >= 2 && (
        <Card elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Evolução ao Longo do Tempo</Typography>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[0, 5]} />
              <RTooltip />
              <Legend />
              {DOMAINS.map((d, i) => (
                <Line key={d.key} type="monotone" dataKey={d.label} stroke={DOMAIN_CHART_COLORS[i]} strokeWidth={2} dot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Grid container spacing={3} mt={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ border: '1px solid', borderColor: 'success.light' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <EmojiEvents color="success" />
                <Typography variant="h6" fontWeight={600} color="success.main">Pontos Fortes</Typography>
              </Box>
              {strengths.length > 0 ? strengths.map(s => (
                <Box key={s} display="flex" alignItems="center" gap={1} mb={1}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">{s}</Typography>
                </Box>
              )) : <Typography variant="body2" color="text.secondary">Responda um questionário para ver seus pontos fortes.</Typography>}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ border: '1px solid', borderColor: 'warning.light' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TrendingUp color="warning" />
                <Typography variant="h6" fontWeight={600} color="warning.main">Pontos a Desenvolver</Typography>
              </Box>
              {improvements.length > 0 ? improvements.map(s => (
                <Box key={s} display="flex" alignItems="center" gap={1} mb={1}>
                  <RadioButtonUnchecked color="warning" fontSize="small" />
                  <Typography variant="body2">{s}</Typography>
                </Box>
              )) : <Typography variant="body2" color="text.secondary">Responda um questionário para ver áreas de melhoria.</Typography>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ── PERFIL ────────────────────────────────────────────────────────────────────

const Perfil: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    displayName: currentUser?.displayName || '',
    segment: (currentUser as any)?.segment || [] as string[],
    subjects: (currentUser as any)?.subjects || [] as string[],
    classes: (currentUser as any)?.classes?.join(', ') || '',
    schoolId: currentUser?.schoolId || '',
  });

  useEffect(() => {
    getAllSchools().then(list => setSchools(list.map(s => ({ id: s.id, name: s.name })))).catch(() => {});
  }, []);

  const segmentOptions = [
    { value: 'educacao_infantil', label: 'Educação Infantil' },
    { value: 'anos_iniciais', label: 'Anos Iniciais' },
    { value: 'anos_finais', label: 'Anos Finais' },
    { value: 'ensino_medio', label: 'Ensino Médio' },
    { value: 'eja', label: 'EJA' },
    { value: 'educacao_especial', label: 'Educação Especial' },
  ];

  const handleChange = (e: any) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!currentUser) return;
    setSaveError('');
    try {
      setSaving(true);
      await updateUserProfile(currentUser.uid, {
        displayName: form.displayName,
        schoolId: form.schoolId || undefined,
        subjects: form.subjects,
        ...(form.classes ? { classes: form.classes.split(',').map((s: string) => s.trim()) } : {}),
        segment: form.segment as any,
      } as any);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (msg.includes('permission-denied') || msg.includes('Missing or insufficient')) {
        setSaveError('Permissão negada. Verifique as regras do Firestore ou se o seu usuário está autenticado.');
      } else {
        setSaveError(`Erro ao salvar: ${msg}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Meu Perfil</Typography>
      {saved && <Alert severity="success" sx={{ mb: 3 }}>✅ Perfil atualizado no Firebase com sucesso!</Alert>}
      {saveError && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSaveError('')}>{saveError}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ textAlign: 'center', p: 3 }}>
            <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, fontSize: 36, bgcolor: 'primary.main' }}>
              {currentUser?.displayName?.charAt(0).toUpperCase() || 'P'}
            </Avatar>
            <Typography variant="h6" fontWeight={600}>{currentUser?.displayName}</Typography>
            <Typography variant="body2" color="text.secondary">{currentUser?.email}</Typography>
            <Chip label="Professor" color="primary" size="small" sx={{ mt: 1 }} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Informações Profissionais</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Nome Completo" name="displayName" value={form.displayName} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Escola</InputLabel>
                  <Select name="schoolId" value={form.schoolId} onChange={handleChange} label="Escola">
                    <MenuItem value="">— Selecione —</MenuItem>
                    {schools.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Segmento(s) de atuação</InputLabel>
                  <Select
                    multiple name="segment" value={form.segment} onChange={handleChange}
                    input={<OutlinedInput label="Segmento(s) de atuação" />}
                    renderValue={(s: any) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(s as string[]).map(v => (
                          <Chip key={v} label={segmentOptions.find(o => o.value === v)?.label || v} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {segmentOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Áreas / Disciplinas</InputLabel>
                  <Select
                    multiple
                    name="subjects"
                    value={form.subjects}
                    onChange={handleChange}
                    input={<OutlinedInput label="Áreas / Disciplinas" />}
                    renderValue={(selected: any) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map(v => (
                          <Chip
                            key={v}
                            label={SUBJECT_OPTIONS.find(o => o.value === v)?.label || v}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {SUBJECT_OPTIONS.map(o => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Turmas" name="classes" value={form.classes} onChange={handleChange}
                  helperText="Separe por vírgula (ex: 8º A, 9º B)" />
              </Grid>
            </Grid>
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button variant="contained" onClick={handleSave} disabled={saving}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}>
                {saving ? 'Salvando...' : 'Salvar no Firebase'}
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ── LAYOUT PRINCIPAL ──────────────────────────────────────────────────────────

const ProfessorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Início', icon: <DashboardIcon />, path: '/professor' },
    { text: 'Questionários', icon: <AssignmentIcon />, path: '/professor/questionarios' },
    { text: 'Relatórios', icon: <ChartIcon />, path: '/professor/relatorios' },
    { text: 'Perfil', icon: <PersonIcon />, path: '/professor/perfil' },
  ];

  const incompleteChip = !currentUser?.schoolId ? (
    <Tooltip title="Complete seu perfil para comparações com a escola">
      <Chip
        label="Perfil incompleto"
        color="warning"
        size="small"
        sx={{ mr: 2, cursor: 'pointer' }}
        onClick={() => navigate('/professor/perfil')}
      />
    </Tooltip>
  ) : undefined;

  return (
    <>
      <Helmet><title>Professor – Autoavalia</title></Helmet>
      <DashboardLayout
        title="Autoavalia — Professor"
        menuItems={menuItems}
        gradientFrom="#7c3aed"
        gradientTo="#2563eb"
        profilePath="/professor/perfil"
        extraAppBar={incompleteChip}
      >
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<ProfessorHome onNavigate={navigate} />} />
            <Route path="/questionarios" element={<Questionarios />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/perfil" element={<Perfil />} />
          </Routes>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default ProfessorDashboard;
