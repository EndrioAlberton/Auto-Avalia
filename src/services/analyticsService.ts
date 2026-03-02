// ── SERVIÇO DE ANÁLISE E CÁLCULO DE PONTUAÇÕES ───────────────────────────────
// Converte respostas brutas do Firestore em dados de relatório

import { QuestionnaireResponse } from '../types';
import { DOMAIN_QUESTION_IDS, DOMAINS } from '../data/questionnaireData';

// ── INTERFACES ────────────────────────────────────────────────────────────────

export interface DomainScore {
  domain: string;     // chave: 'plan', 'amb', etc.
  label: string;      // rótulo: 'Planejamento', 'Ambiente', etc.
  score: number;      // 0.0 – 5.0
}

export interface EvolutionPoint {
  period: string;
  [label: string]: number | string;
}

export interface ComparisonPoint {
  domain: string;
  minha: number;
  escola: number;
  rede: number;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

/** Converte um Record<questionId, value> em pontuações por domínio */
export function answersToScores(answers: Record<string, number>): DomainScore[] {
  return DOMAINS.map(({ key: domain, label }) => {
    const ids = DOMAIN_QUESTION_IDS[domain] ?? [];
    const vals = ids.map(id => answers[id]).filter(v => v !== undefined && v > 0);
    const score = vals.length > 0
      ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
      : 0;
    return { domain, label, score };
  });
}

/** Calcula a média de pontuação por domínio a partir de múltiplas respostas */
export function responsesToAvgScores(responses: QuestionnaireResponse[]): DomainScore[] | null {
  if (!responses || responses.length === 0) return null;

  const totals: Record<string, number[]> = {};

  for (const response of responses) {
    const map: Record<string, number> = {};
    for (const a of response.answers) {
      map[a.questionId] = Number(a.value);
    }
    const scores = answersToScores(map);
    for (const { domain, score } of scores) {
      if (score > 0) {
        if (!totals[domain]) totals[domain] = [];
        totals[domain].push(score);
      }
    }
  }

  return DOMAINS.map(({ key: domain, label }) => ({
    domain,
    label,
    score: totals[domain]?.length > 0
      ? parseFloat((totals[domain].reduce((a, b) => a + b, 0) / totals[domain].length).toFixed(2))
      : 0,
  }));
}

/** Extrai ponto de evolução (1 por resposta) com data formatada */
function responseToEvolutionPoint(response: QuestionnaireResponse): EvolutionPoint {
  const map: Record<string, number> = {};
  for (const a of response.answers) map[a.questionId] = Number(a.value);
  const scores = answersToScores(map);

  // Firestore Timestamp → Date
  let date: Date;
  const ts = response.completedAt as any;
  if (ts instanceof Date) {
    date = ts;
  } else if (ts?.seconds) {
    date = new Date(ts.seconds * 1000);
  } else {
    date = new Date();
  }

  const period = `${date.toLocaleString('pt-BR', { month: 'short' })}/${String(date.getFullYear()).slice(2)}`;
  const point: EvolutionPoint = { period };
  for (const { label, score } of scores) {
    point[label] = score;
  }
  return point;
}

/** Constrói série temporal de evolução a partir das respostas do usuário */
export function buildEvolutionData(responses: QuestionnaireResponse[]): EvolutionPoint[] {
  if (!responses || responses.length === 0) return [];

  const sorted = [...responses].sort((a, b) => {
    const tsA = (a.completedAt as any)?.seconds ?? 0;
    const tsB = (b.completedAt as any)?.seconds ?? 0;
    return tsA - tsB;
  });

  return sorted.map(responseToEvolutionPoint);
}

/** Pontos fortes: top 2 domínios por pontuação */
export function getStrengths(scores: DomainScore[]): string[] {
  return [...scores]
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(s => `${s.label} (${s.score.toFixed(1)})`);
}

/** Pontos a desenvolver: bottom 2 domínios */
export function getImprovements(scores: DomainScore[]): string[] {
  return [...scores]
    .filter(s => s.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map(s => `${s.label} (${s.score.toFixed(1)})`);
}

/** Monta dados para gráfico de barras comparativo */
export function buildComparisonData(
  myScores: DomainScore[],
  schoolAvg: DomainScore[] | null,
  networkAvg: DomainScore[] | null,
): ComparisonPoint[] {
  return DOMAINS.map(({ key: domain, label }) => ({
    domain: label,
    minha: myScores.find(s => s.domain === domain)?.score ?? 0,
    escola: schoolAvg?.find(s => s.domain === domain)?.score ?? 0,
    rede: networkAvg?.find(s => s.domain === domain)?.score ?? 0,
  }));
}

/** Monta dados de radar para comparação */
export function buildRadarData(
  myScores: DomainScore[],
  schoolAvg: DomainScore[] | null,
) {
  return DOMAINS.map(({ key: domain, label }) => ({
    subject: label,
    Eu: myScores.find(s => s.domain === domain)?.score ?? 0,
    Escola: schoolAvg?.find(s => s.domain === domain)?.score ?? 0,
  }));
}

/** Verifica quais professores já responderam um determinado questionário */
export function classifyTeacherResponseStatus(
  teachers: any[],
  responses: QuestionnaireResponse[],
  questionnaireId: string,
) {
  const respondedSet = new Set(
    responses
      .filter(r => r.questionnaireId === questionnaireId)
      .map(r => r.userId),
  );

  return teachers.map(t => ({
    ...t,
    status: respondedSet.has(t.uid) ? 'responded' : 'not_started',
  }));
}

/** Agrupa respostas por segmento e calcula médias */
export function groupBySegment(responses: QuestionnaireResponse[]) {
  const grouped: Record<string, QuestionnaireResponse[]> = {};
  for (const r of responses) {
    const seg = r.segment ?? 'Não informado';
    if (!grouped[seg]) grouped[seg] = [];
    grouped[seg].push(r);
  }

  return Object.entries(grouped).map(([segment, list]) => {
    const avg = responsesToAvgScores(list);
    const entry: Record<string, any> = { segment, total: list.length };
    if (avg) {
      for (const { domain, score } of avg) {
        entry[domain] = score;
      }
    }
    return entry;
  });
}

/** Formata a pontuação geral (média de todos os domínios) */
export function overallScore(scores: DomainScore[]): number {
  const valid = scores.filter(s => s.score > 0);
  if (valid.length === 0) return 0;
  return parseFloat((valid.reduce((s, d) => s + d.score, 0) / valid.length).toFixed(1));
}

/** Formata data do Firestore Timestamp para string legível */
export function formatFirestoreDate(ts: any): string {
  if (!ts) return '—';
  const date = ts instanceof Date ? ts : new Date(ts.seconds * 1000);
  return date.toLocaleDateString('pt-BR');
}
