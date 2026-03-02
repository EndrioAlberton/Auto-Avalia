import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Box, Container, Card, CardContent, Button, Chip, Grid2 as Grid,
  LinearProgress, Paper, Alert, TextField, FormControl, InputLabel, IconButton,
  Select, CircularProgress, Stack, Table, TableHead, TableRow, TableCell, MenuItem,
  TableBody, TableContainer, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, Badge, Tooltip, Snackbar, Typography, Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, School as SchoolIcon,
  Group as GroupIcon, BarChart as ChartIcon, Download as DownloadIcon,
  Settings as SettingsIcon,
  Delete, Email, CheckCircle, RadioButtonUnchecked, PersonAdd,
  Refresh,
} from '@mui/icons-material';
import { DashboardLayout, KpiCard, LoadingSkeletonGrid, EmptyState } from '../../components/shared';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import {
  getSchool, updateSchool, createSchool, getTeachersBySchool,
  getSchoolResponses, getOrSeedQuestionnaire, createInvitation, getSchoolInvitations,
  deleteInvitation, getStudentResponsesBySchool,
} from '../../services/firestoreService';
import {
  responsesToAvgScores, classifyTeacherResponseStatus, groupBySegment,
  overallScore, formatFirestoreDate, DomainScore,
} from '../../services/analyticsService';
import { DOMAINS } from '../../data/questionnaireData';
import { School, UserRole, User, Invitation, Questionnaire } from '../../types';

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'];

// ── GESTOR HOME ───────────────────────────────────────────────────────────────

const GestorHome: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<School | null>(null);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [avgScores, setAvgScores] = useState<DomainScore[] | null>(null);
  const [studentResponses, setStudentResponses] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const schoolId = currentUser.schoolId;
        if (!schoolId) { setLoading(false); return; }
        const [sc, t] = await Promise.all([
          getSchool(schoolId),
          getTeachersBySchool(schoolId),
        ]);
        setSchool(sc);
        setTeachers(t);
        const [resp, studResp] = await Promise.all([
          getSchoolResponses(schoolId),
          getStudentResponsesBySchool(schoolId),
        ]);
        setResponses(resp);
        setStudentResponses(studResp);
        setAvgScores(responsesToAvgScores(resp));
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  if (loading) return <LoadingSkeletonGrid />;

  if (!currentUser?.schoolId) {
    return (
      <EmptyState
        icon={SchoolIcon}
        severity="warning"
        title="Escola não vinculada"
        message="Sua conta ainda não tem uma escola associada. Entre em contato com a Secretaria para vincular sua escola."
      />
    );
  }

  const respondedIds = new Set(responses.map((r: any) => r.userId));
  const responded = teachers.filter(t => respondedIds.has(t.uid)).length;
  const rate = teachers.length > 0 ? Math.round((responded / teachers.length) * 100) : 0;
  const overall = avgScores ? overallScore(avgScores) : 0;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {school?.name || 'Minha Escola'} — Painel Gestor
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Professores cadastrados" value={teachers.length} color="#7c3aed" sub="na plataforma" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Taxa de resposta" value={`${rate}%`} color="#059669" sub={`${responded}/${teachers.length} responderam`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Pontuação média" value={overall > 0 ? overall.toFixed(1) : '—'} color="#2563eb" sub="de 5.0 pontos" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Respostas de Estudantes" value={studentResponses.length} color="#d97706" sub="respostas anônimas" />
        </Grid>

        {/* Progresso por domínio */}
        {avgScores && (
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Médias por Domínio</Typography>
                {avgScores.map((d, i) => (
                  <Box key={d.domain} mb={1.5}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">{d.label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{d.score.toFixed(1)}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(d.score / 5) * 100}
                      sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { bgcolor: COLORS[i] } }} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Taxa de resposta */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Coleta em Tempo Real</Typography>
              <Box textAlign="center" py={2}>
                <Typography variant="h2" fontWeight={700} color={rate === 100 ? 'success.main' : 'primary.main'}>{rate}%</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>{responded} de {teachers.length} professores</Typography>
                <LinearProgress variant="determinate" value={rate} sx={{ mt: 2, height: 12, borderRadius: 6 }} color={rate === 100 ? 'success' : 'primary'} />
              </Box>
              <Button variant="outlined" fullWidth onClick={() => onNavigate('/gestor/usuarios')} sx={{ mt: 2 }}>
                Ver status individual
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {(!avgScores || responses.length === 0) && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              Nenhuma resposta coletada ainda. Convide professores para responderem o questionário.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// ── GERENCIAR ESCOLA ──────────────────────────────────────────────────────────

const GerenciarEscola: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [school, setSchool] = useState<Partial<School>>({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        if (currentUser.schoolId) {
          const sc = await getSchool(currentUser.schoolId);
          setSchool(sc);
        } else {
          setCreating(true);
        }
      } catch {
        setCreating(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  const handleChange = (e: any) => setSchool(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      setSaving(true);
      if (creating) {
        const id = await createSchool({
          name: school.name || '',
          networkId: currentUser.networkId || 'rede-padrao',
          region: school.region,
          district: school.district,
          gestorId: currentUser.uid,
          segments: school.segments || [],
          address: school.address,
          contact: school.contact,
        } as any);
        // Atualiza o schoolId do gestor
        setSchool(prev => ({ ...prev, id }));
        setCreating(false);
      } else if (school.id) {
        await updateSchool(school.id, {
          name: school.name,
          region: school.region,
          district: school.district,
          address: school.address,
          contact: school.contact,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {creating ? 'Criar Escola' : 'Configurar Escola'}
      </Typography>
      {saved && <Alert severity="success" sx={{ mb: 3 }}>✅ Dados da escola salvos no Firebase!</Alert>}
      {creating && <Alert severity="info" sx={{ mb: 3 }}>Configure os dados da sua escola para começar a usar a plataforma.</Alert>}

      <Card elevation={2} sx={{ p: 3, maxWidth: 700 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Nome da Escola *" name="name" value={school.name || ''} onChange={handleChange} required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Regional / Região" name="region" value={school.region || ''} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Distrito / Zona" name="district" value={school.district || ''} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Endereço" name="address" value={school.address || ''} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Contato (telefone ou e-mail)" name="contact" value={school.contact || ''} onChange={handleChange} />
          </Grid>
        </Grid>
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={handleSave} disabled={saving || !school.name}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {saving ? 'Salvando...' : creating ? 'Criar Escola no Firebase' : 'Salvar Alterações'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

// ── GERENCIAR USUÁRIOS ────────────────────────────────────────────────────────

const GerenciarUsuarios: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.PROFESSOR);
  const [inviting, setInviting] = useState(false);
  const [snack, setSnack] = useState('');
  const [tab, setTab] = useState(0);

  const load = useCallback(async () => {
    if (!currentUser?.schoolId) { setLoading(false); return; }
    try {
      const [t, q, inv] = await Promise.all([
        getTeachersBySchool(currentUser.schoolId),
        getOrSeedQuestionnaire(UserRole.PROFESSOR),
        getSchoolInvitations(currentUser.schoolId),
      ]);
      const r = await getSchoolResponses(currentUser.schoolId);
      setTeachers(t);
      setQuestionnaire(q);
      setInvitations(inv);
      setResponses(r);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { load(); }, [load]);

  const teachersWithStatus = questionnaire
    ? classifyTeacherResponseStatus(teachers, responses, questionnaire.id)
    : teachers.map(t => ({ ...t, status: 'not_started' }));

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentUser?.schoolId) return;
    try {
      setInviting(true);
      await createInvitation({
        email: inviteEmail.trim(),
        role: inviteRole,
        schoolId: currentUser.schoolId,
        networkId: currentUser.networkId,
        invitedBy: currentUser.uid,
      } as any);
      setSnack(`Convite enviado para ${inviteEmail.trim()}`);
      setInviteEmail('');
      setInviteDialog(false);
      await load();
    } catch (e: any) {
      setSnack('Erro ao criar convite: ' + e.message);
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteInvite = async (id: string) => {
    try {
      await deleteInvitation(id);
      setSnack('Convite cancelado');
      setInvitations(prev => prev.filter(i => i.id !== id));
    } catch { /* ignore */ }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  if (!currentUser?.schoolId) {
    return <Alert severity="warning">Vincule sua escola primeiro em "Configurar Escola".</Alert>;
  }

  const responded = teachersWithStatus.filter(t => t.status === 'responded').length;
  const pending = teachersWithStatus.filter(t => t.status === 'not_started').length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Professores e Convites</Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Refresh />} onClick={load} variant="outlined" size="small">Atualizar</Button>
          <Button startIcon={<PersonAdd />} onClick={() => setInviteDialog(true)} variant="contained">Convidar</Button>
        </Stack>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard label="Professores" value={teachers.length} color="#7c3aed" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard label="Responderam" value={responded} color="#059669" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard label="Pendentes" value={pending} color="#d97706" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard label="Convites ativos" value={invitations.length} color="#2563eb" />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Professores (${teachers.length})`} />
        <Tab label={<Badge badgeContent={invitations.length} color="primary">Convites Pendentes</Badge>} />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell><b>Nome</b></TableCell>
              <TableCell><b>E-mail</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Última Resposta</b></TableCell>
            </TableRow></TableHead>
            <TableBody>
              {teachersWithStatus.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary" py={2}>
                    Nenhum professor vinculado. Convide professores para sua escola.
                  </Typography>
                </TableCell></TableRow>
              ) : teachersWithStatus.map(t => (
                <TableRow key={t.uid} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>
                        {t.displayName?.charAt(0)}
                      </Avatar>
                      {t.displayName}
                    </Box>
                  </TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={t.status === 'responded' ? <CheckCircle /> : <RadioButtonUnchecked />}
                      label={t.status === 'responded' ? 'Respondido' : 'Pendente'}
                      color={t.status === 'responded' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {responses.filter((r: any) => r.userId === t.uid).length > 0
                      ? formatFirestoreDate(responses.filter((r: any) => r.userId === t.uid)[0].completedAt)
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell><b>E-mail</b></TableCell>
              <TableCell><b>Perfil</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Ações</b></TableCell>
            </TableRow></TableHead>
            <TableBody>
              {invitations.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary" py={2}>Nenhum convite pendente.</Typography>
                </TableCell></TableRow>
              ) : invitations.map(inv => (
                <TableRow key={inv.id} hover>
                  <TableCell>{inv.email}</TableCell>
                  <TableCell><Chip label={inv.role} size="small" /></TableCell>
                  <TableCell><Chip label={inv.status} color={inv.status === 'pending' ? 'warning' : 'success'} size="small" /></TableCell>
                  <TableCell>
                    <Tooltip title="Cancelar convite">
                      <IconButton size="small" color="error" onClick={() => handleDeleteInvite(inv.id)}><Delete fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de convite */}
      <Dialog open={inviteDialog} onClose={() => setInviteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Convidar Usuário</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField fullWidth label="E-mail do usuário *" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel>Perfil</InputLabel>
              <Select value={inviteRole} onChange={e => setInviteRole(e.target.value as UserRole)} label="Perfil">
                <MenuItem value={UserRole.PROFESSOR}>Professor</MenuItem>
                <MenuItem value={UserRole.GESTOR}>Gestor</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info" icon={<Email />}>
              O link de convite será gerado. Compartilhe com o usuário para ele se cadastrar.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}
            startIcon={inviting ? <CircularProgress size={18} color="inherit" /> : <PersonAdd />}>
            {inviting ? 'Enviando...' : 'Criar Convite'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
};

// ── RELATÓRIOS DA ESCOLA ──────────────────────────────────────────────────────

const RelatoriosEscola: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<any[]>([]);
  const [avgScores, setAvgScores] = useState<DomainScore[] | null>(null);
  const [segmentData, setSegmentData] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser?.schoolId) { setLoading(false); return; }
    (async () => {
      const r = await getSchoolResponses(currentUser.schoolId!);
      setResponses(r);
      setAvgScores(responsesToAvgScores(r));
      setSegmentData(groupBySegment(r));
      setLoading(false);
    })();
  }, [currentUser]);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  if (responses.length === 0) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>Relatórios da Escola</Typography>
        <EmptyState
          icon={ChartIcon}
          message="Nenhuma resposta coletada ainda. Os relatórios serão gerados quando os professores responderem."
        />
      </Box>
    );
  }

  const radarData = DOMAINS.map(d => ({
    subject: d.label,
    Escola: avgScores?.find(s => s.domain === d.key)?.score ?? 0,
  }));

  const barData = DOMAINS.map(d => ({
    domain: d.label,
    média: avgScores?.find(s => s.domain === d.key)?.score ?? 0,
  }));

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Relatórios da Escola</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {responses.length} respostas analisadas • Dados em tempo real do Firebase
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Perfil Coletivo — Radar</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 5]} tickCount={6} />
                <Radar name="Escola" dataKey="Escola" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.4} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Médias por Domínio</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} />
                <RTooltip />
                <Bar dataKey="média" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {segmentData.length > 1 && (
          <Grid size={{ xs: 12 }}>
            <Card elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Por Segmento de Ensino</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell><b>Segmento</b></TableCell>
                    <TableCell><b>Respostas</b></TableCell>
                    {DOMAINS.map(d => <TableCell key={d.key} align="center"><b>{d.label}</b></TableCell>)}
                  </TableRow></TableHead>
                  <TableBody>
                    {segmentData.map(seg => (
                      <TableRow key={seg.segment} hover>
                        <TableCell>{seg.segment}</TableCell>
                        <TableCell>{seg.total}</TableCell>
                        {DOMAINS.map(d => (
                          <TableCell key={d.key} align="center">
                            <Chip label={seg[d.key]?.toFixed(1) ?? '—'} size="small"
                              color={seg[d.key] >= 4 ? 'success' : seg[d.key] >= 3 ? 'default' : 'warning'} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// ── EXPORTAR DADOS ────────────────────────────────────────────────────────────

const ExportarDados: React.FC = () => {
  const { currentUser } = useAuth();
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    if (!currentUser?.schoolId) return;
    setExporting(true);
    try {
      const [responses, teachers] = await Promise.all([
        getSchoolResponses(currentUser.schoolId),
        getTeachersBySchool(currentUser.schoolId),
      ]);
      const teacherMap = Object.fromEntries(teachers.map(t => [t.uid, t.displayName]));
      const domainPrefixes: Record<string, string> = { plan: 'p', amb: 'a', inst: 'i', aval: 'v', tech: 't' };
      const rows = [['Professor', 'Data', ...DOMAINS.map(d => d.label)]];
      for (const r of responses) {
        const map: Record<string, number> = {};
        for (const a of r.answers) map[a.questionId] = Number(a.value);
        const scores = DOMAINS.map(d => {
          const prefix = domainPrefixes[d.key];
          const vals = [1, 2, 3, 4, 5].map(i => map[`${prefix}${i}`]).filter(v => v > 0);
          return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
        });
        const ts = r.completedAt as any;
        const date = ts instanceof Date ? ts : new Date(ts.seconds * 1000);
        rows.push([teacherMap[r.userId ?? ''] || 'Professor', date.toLocaleDateString('pt-BR'), ...scores]);
      }
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'relatorio-escola.csv'; link.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Exportar Dados</Typography>
      <Grid container spacing={3} maxWidth={700}>
        {[
          { label: 'Exportar CSV — Respostas dos Professores', desc: 'Todas as respostas com pontuações por domínio', icon: '📊', action: handleExportCSV },
          { label: 'Exportar CSV — Respostas dos Estudantes', desc: 'Respostas anônimas coletadas', icon: '🎓', action: handleExportCSV },
        ].map(item => (
          <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
            <Card elevation={2}>
              <CardContent>
                <Typography fontSize={36}>{item.icon}</Typography>
                <Typography variant="h6" fontWeight={600} mt={1}>{item.label}</Typography>
                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
              </CardContent>
              <Box px={2} pb={2}>
                <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} onClick={item.action} disabled={exporting}>
                  {exporting ? 'Gerando...' : 'Download CSV'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// ── LAYOUT PRINCIPAL ──────────────────────────────────────────────────────────

const GestorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Painel', icon: <DashboardIcon />, path: '/gestor' },
    { text: 'Minha Escola', icon: <SchoolIcon />, path: '/gestor/escola' },
    { text: 'Professores', icon: <GroupIcon />, path: '/gestor/usuarios' },
    { text: 'Relatórios', icon: <ChartIcon />, path: '/gestor/relatorios' },
    { text: 'Exportar Dados', icon: <DownloadIcon />, path: '/gestor/exportar' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/gestor/configuracoes' },
  ];

  return (
    <>
      <Helmet><title>Gestor Escolar – SELF</title></Helmet>
      <DashboardLayout
        title="SELF — Gestor Escolar"
        menuItems={menuItems}
        gradientFrom="#059669"
        gradientTo="#2563eb"
        activeColor="success.main"
      >
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<GestorHome onNavigate={navigate} />} />
            <Route path="/escola" element={<GerenciarEscola />} />
            <Route path="/usuarios" element={<GerenciarUsuarios />} />
            <Route path="/relatorios" element={<RelatoriosEscola />} />
            <Route path="/exportar" element={<ExportarDados />} />
            <Route path="/configuracoes" element={
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>Configurações</Typography>
                <Alert severity="info">Configurações avançadas — em desenvolvimento.</Alert>
              </Box>
            } />
          </Routes>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default GestorDashboard;
