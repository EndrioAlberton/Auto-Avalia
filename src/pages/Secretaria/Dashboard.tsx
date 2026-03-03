import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Box, Container, Card, CardContent, Button, Chip, Grid2 as Grid,
  LinearProgress, Alert, TextField, FormControl, InputLabel, Select, IconButton,
  CircularProgress, Stack, Table, TableHead, TableRow, TableCell, MenuItem,
  TableBody, TableContainer, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, Snackbar, Typography, Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, School as SchoolIcon,
  BarChart as ChartIcon, Assignment as AssignmentIcon, Map as MapIcon,
  AdminPanelSettings as AdminIcon,
  Add, Delete, Edit, Refresh,
} from '@mui/icons-material';
import { DashboardLayout, KpiCard, LoadingSkeletonGrid, EmptyState } from '../../components/shared';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllSchools, createSchool, updateSchool, deleteSchool,
  getNetworkResponses, getAllUsers,
  getAllQuestionnaires, createQuestionnaire, updateQuestionnaire, deleteQuestionnaire,
} from '../../services/firestoreService';
import {
  responsesToAvgScores, groupBySegment, overallScore, formatFirestoreDate, DomainScore,
} from '../../services/analyticsService';
import { DOMAINS, PROFESSOR_QUESTIONS } from '../../data/questionnaireData';
import { School, UserRole, User, Questionnaire } from '../../types';

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0ea5e9', '#84cc16'];

// ── SECRETARIA HOME ───────────────────────────────────────────────────────────

const SecretariaHome: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [avgScores, setAvgScores] = useState<DomainScore[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sc, u] = await Promise.all([
          getAllSchools(currentUser?.networkId),
          getAllUsers(currentUser?.networkId),
        ]);
        setSchools(sc);
        setUsers(u);
        if (currentUser?.networkId) {
          const resp = await getNetworkResponses(currentUser.networkId);
          setResponses(resp);
          setAvgScores(responsesToAvgScores(resp));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  if (loading) return <LoadingSkeletonGrid />;

  const professors = users.filter(u => u.role === UserRole.PROFESSOR);
  const overall = avgScores ? overallScore(avgScores) : 0;
  const pieData = [
    { name: 'Professores', value: professors.length },
    { name: 'Gestores', value: users.filter(u => u.role === UserRole.GESTOR).length },
    { name: 'Outros', value: users.filter(u => u.role !== UserRole.PROFESSOR && u.role !== UserRole.GESTOR).length },
  ].filter(d => d.value > 0);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Painel da Secretaria</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Visão geral da rede — dados em tempo real do Firebase</Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Escolas cadastradas" value={schools.length} color="#7c3aed" sub="na rede" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Usuários ativos" value={users.length} color="#2563eb" sub="professores e gestores" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Respostas coletadas" value={responses.length} color="#059669" sub="de professores" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Pontuação média da rede" value={overall > 0 ? overall.toFixed(1) : '—'} color="#d97706" sub="de 5.0" />
        </Grid>

        {/* Gráfico de domínios da rede */}
        {avgScores && (
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Médias da Rede por Domínio</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={DOMAINS.map(d => ({
                  domain: d.label,
                  média: avgScores.find(s => s.domain === d.key)?.score ?? 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} />
                  <RTooltip />
                  <Bar dataKey="média" radius={[4, 4, 0, 0]}>
                    {DOMAINS.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        )}

        {/* Distribuição de usuários */}
        {pieData.length > 0 && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Card elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Distribuição de Usuários</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        )}

        {responses.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">Nenhuma resposta registrada na rede ainda. Gerencie escolas e incentive os professores a responderem.</Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// ── GERENCIAR ESCOLAS ─────────────────────────────────────────────────────────

const GerenciarEscolas: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [dialog, setDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [form, setForm] = useState({ name: '', region: '', district: '', address: '', contact: '' });
  const [snack, setSnack] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sc = await getAllSchools(currentUser?.networkId);
    setSchools(sc);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', region: '', district: '', address: '', contact: '' });
    setDialog(true);
  };

  const openEdit = (sc: School) => {
    setEditing(sc);
    setForm({ name: sc.name, region: sc.region || '', district: sc.district || '', address: sc.address || '', contact: sc.contact || '' });
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      if (editing) {
        await updateSchool(editing.id, {
          name: form.name, region: form.region, district: form.district,
          address: form.address, contact: form.contact,
        });
        setSnack('Escola atualizada com sucesso!');
      } else {
        await createSchool({
          name: form.name, region: form.region, district: form.district,
          address: form.address, contact: form.contact,
          networkId: currentUser?.networkId || 'rede-padrao', segments: [], gestorId: '',
        });
        setSnack('Escola criada com sucesso!');
      }
      setDialog(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchool(id);
      setSnack('Escola removida');
      setDeleteConfirm(null);
      await load();
    } catch { setSnack('Erro ao remover escola'); }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Gerenciar Escolas</Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Refresh />} onClick={load} variant="outlined" size="small">Atualizar</Button>
          <Button startIcon={<Add />} variant="contained" onClick={openCreate}>Nova Escola</Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Nome</b></TableCell>
              <TableCell><b>Estado</b></TableCell>
              <TableCell><b>Cidade</b></TableCell>
              <TableCell><b>Contato</b></TableCell>
              <TableCell><b>Ações</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary" py={3}>
                  Nenhuma escola cadastrada. Clique em "Nova Escola" para começar.
                </Typography>
              </TableCell></TableRow>
            ) : schools.map(sc => (
              <TableRow key={sc.id} hover>
                <TableCell><Typography fontWeight={500}>{sc.name}</Typography></TableCell>
                <TableCell>{sc.region || '—'}</TableCell>
                <TableCell>{sc.district || '—'}</TableCell>
                <TableCell>{typeof sc.contact === 'string' ? sc.contact : '—'}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" color="primary" onClick={() => openEdit(sc)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm(sc.id)}><Delete fontSize="small" /></IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog criar/editar */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Escola' : 'Nova Escola'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField fullWidth label="Nome da escola *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="Estado" value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} />
              <TextField fullWidth label="Cidade" value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} />
            </Stack>
            <TextField fullWidth label="Endereço" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            <TextField fullWidth label="Contato" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name.trim()}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmar exclusão */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja remover esta escola? Esta ação não pode ser desfeita.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
};

// ── RELATÓRIOS DA REDE ────────────────────────────────────────────────────────

const RelatoriosRede: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<any[]>([]);
  const [avgScores, setAvgScores] = useState<DomainScore[] | null>(null);
  const [segData, setSegData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        let resp: any[] = [];
        if (currentUser?.networkId) {
          resp = await getNetworkResponses(currentUser.networkId);
        }
        setResponses(resp);
        setAvgScores(responsesToAvgScores(resp));
        setSegData(groupBySegment(resp));
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  if (responses.length === 0) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>Relatórios da Rede</Typography>
        <EmptyState icon={ChartIcon} message="Nenhuma resposta registrada na rede ainda." />
      </Box>
    );
  }

  const radarData = DOMAINS.map(d => ({
    subject: d.label,
    Rede: avgScores?.find(s => s.domain === d.key)?.score ?? 0,
  }));

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Relatórios da Rede</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {responses.length} respostas analisadas · Dados em tempo real do Firebase
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Perfil da Rede — Radar</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 5]} tickCount={6} />
                <Radar name="Rede" dataKey="Rede" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.4} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Médias por Domínio</Typography>
            <Stack spacing={1.5}>
              {avgScores?.map((d, i) => (
                <Box key={d.domain}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">{d.label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{d.score.toFixed(1)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(d.score / 5) * 100}
                    sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { bgcolor: COLORS[i] } }} />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {segData.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Comparação por Segmento</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis domain={[0, 5]} />
                  <RTooltip />
                  <Legend />
                  {DOMAINS.map((d, i) => (
                    <Bar key={d.key} dataKey={d.key} name={d.label} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// ── GERENCIAR QUESTIONÁRIOS ───────────────────────────────────────────────────

const GerenciarQuestionarios: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [dialog, setDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', targetRole: UserRole.PROFESSOR, active: true });
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    const q = await getAllQuestionnaires();
    setQuestionnaires(q);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      setSaving(true);
      await createQuestionnaire({
        title: form.title,
        description: form.description,
        targetRole: form.targetRole,
        questions: (PROFESSOR_QUESTIONS as any[]).map(q => ({
          id: q.id, text: q.text, type: q.type, domain: q.domain,
          required: q.required, order: q.order, targetRole: q.targetRole,
        })),
        active: form.active,
      });
      setSnack('Questionário criado no Firebase!');
      setDialog(false);
      setForm({ title: '', description: '', targetRole: UserRole.PROFESSOR, active: true });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (q: Questionnaire) => {
    await updateQuestionnaire(q.id, { active: !q.active });
    setSnack(`Questionário ${q.active ? 'desativado' : 'ativado'}`);
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteQuestionnaire(id);
    setSnack('Questionário removido');
    await load();
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Banco de Questionários</Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Refresh />} onClick={load} variant="outlined" size="small">Atualizar</Button>
          <Button startIcon={<Add />} variant="contained" onClick={() => setDialog(true)}>Novo Questionário</Button>
        </Stack>
      </Box>

      {questionnaires.length === 0 ? (
        <Alert severity="info">
          Nenhum questionário cadastrado. O sistema cria automaticamente um questionário padrão na primeira vez que um professor acessa a plataforma.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {questionnaires.map(q => (
            <Card key={q.id} elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip label={q.active ? 'Ativo' : 'Inativo'} color={q.active ? 'success' : 'default'} size="small" />
                      <Chip label={q.targetRole} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>{q.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{q.description}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {q.questions?.length || 0} perguntas
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <Button size="small" variant="outlined" onClick={() => handleToggleActive(q)}>
                      {q.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <IconButton size="small" color="error" onClick={() => handleDelete(q.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Questionário</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField fullWidth label="Título *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <TextField fullWidth label="Descrição" multiline rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Destinado a</InputLabel>
              <Select value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value as UserRole }))} label="Destinado a">
                <MenuItem value={UserRole.PROFESSOR}>Professores</MenuItem>
                <MenuItem value={UserRole.ESTUDANTE}>Estudantes</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">O novo questionário será criado com as 25 perguntas padrão dos domínios pedagógicos. Você pode editar as perguntas após criar.</Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.title.trim()}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {saving ? 'Criando...' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
};

// ── VISÃO REGIONAL ────────────────────────────────────────────────────────────

const VisaoRegional: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    getAllSchools(currentUser?.networkId).then(setSchools).finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  // Agrupar escolas por regional
  const byRegion: Record<string, School[]> = {};
  for (const sc of schools) {
    const region = sc.region || 'Sem Estado';
    if (!byRegion[region]) byRegion[region] = [];
    byRegion[region].push(sc);
  }

  const regionData = Object.entries(byRegion).map(([region, list]) => ({
    region,
    escolas: list.length,
  }));

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Visão por Estado</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Distribuição das escolas por estado/cidade
      </Typography>

      {schools.length === 0 ? (
        <EmptyState icon={SchoolIcon} message="Nenhuma escola cadastrada ainda." />
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Escolas por Estado</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="region" type="category" width={120} tick={{ fontSize: 12 }} />
                  <RTooltip />
                  <Bar dataKey="escolas" fill="#7c3aed" radius={[0, 4, 4, 0]}>
                    {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Escola</b></TableCell>
                      <TableCell><b>Estado</b></TableCell>
                      <TableCell><b>Cidade</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schools.map(sc => (
                      <TableRow key={sc.id} hover>
                        <TableCell>{sc.name}</TableCell>
                        <TableCell>{sc.region || '—'}</TableCell>
                        <TableCell>{sc.district || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

// ── ADMINISTRAÇÃO DO SISTEMA ──────────────────────────────────────────────────

const AdministracaoSistema: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    getAllUsers(currentUser?.networkId).then(setUsers).finally(() => setLoading(false));
  }, [currentUser]);

  const byRole: Record<string, User[]> = {
    [UserRole.PROFESSOR]: users.filter(u => u.role === UserRole.PROFESSOR),
    [UserRole.GESTOR]: users.filter(u => u.role === UserRole.GESTOR),
    [UserRole.SECRETARIA]: users.filter(u => u.role === UserRole.SECRETARIA),
    [UserRole.ESTUDANTE]: users.filter(u => u.role === UserRole.ESTUDANTE),
  };

  const roles = [UserRole.PROFESSOR, UserRole.GESTOR, UserRole.SECRETARIA];

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Administração do Sistema</Typography>

      <Grid container spacing={2} mb={3}>
        {roles.map((r, i) => (
          <Grid size={{ xs: 6, sm: 3 }} key={r}>
            <KpiCard label={r.charAt(0).toUpperCase() + r.slice(1) + 's'} value={byRole[r]?.length || 0} color={COLORS[i]} />
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        {roles.map(r => (
          <Tab key={r} label={`${r.charAt(0).toUpperCase() + r.slice(1)}s (${byRole[r]?.length || 0})`} />
        ))}
      </Tabs>

      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead><TableRow>
            <TableCell><b>Nome</b></TableCell>
            <TableCell><b>E-mail</b></TableCell>
            <TableCell><b>Escola</b></TableCell>
            <TableCell><b>Cadastro</b></TableCell>
          </TableRow></TableHead>
          <TableBody>
            {(byRole[roles[tab]] || []).length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">
                <Typography variant="body2" color="text.secondary" py={2}>
                  Nenhum usuário nesta categoria.
                </Typography>
              </TableCell></TableRow>
            ) : (byRole[roles[tab]] || []).map(u => (
              <TableRow key={u.uid} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>
                      {u.displayName?.charAt(0)}
                    </Avatar>
                    {u.displayName}
                  </Box>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.schoolId || '—'}</TableCell>
                <TableCell>{formatFirestoreDate((u as any).createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info" sx={{ mt: 3 }}>
        Integração com Google Workspace e sistemas externos disponível via API. Entre em contato com o suporte técnico para configurar.
      </Alert>
    </Box>
  );
};

// ── LAYOUT PRINCIPAL ──────────────────────────────────────────────────────────

const SecretariaDashboard: React.FC = () => {
  const menuItems = [
    { text: 'Painel', icon: <DashboardIcon />, path: '/secretaria' },
    { text: 'Escolas', icon: <SchoolIcon />, path: '/secretaria/escolas' },
    { text: 'Relatórios da Rede', icon: <ChartIcon />, path: '/secretaria/relatorios' },
    { text: 'Questionários', icon: <AssignmentIcon />, path: '/secretaria/questionarios' },
    { text: 'Visão Regional', icon: <MapIcon />, path: '/secretaria/regional' },
    { text: 'Administração', icon: <AdminIcon />, path: '/secretaria/admin' },
  ];

  return (
    <>
      <Helmet><title>Secretaria – SELF</title></Helmet>
      <DashboardLayout
        title="SELF — Secretaria da Educação"
        menuItems={menuItems}
        gradientFrom="#dc2626"
        gradientTo="#d97706"
        activeColor="error.main"
      >
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<SecretariaHome />} />
            <Route path="/escolas" element={<GerenciarEscolas />} />
            <Route path="/relatorios" element={<RelatoriosRede />} />
            <Route path="/questionarios" element={<GerenciarQuestionarios />} />
            <Route path="/regional" element={<VisaoRegional />} />
            <Route path="/admin" element={<AdministracaoSistema />} />
          </Routes>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default SecretariaDashboard;
