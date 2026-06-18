import { describe, it, expect } from 'vitest';
import {
  answersToScores,
  responsesToAvgScores,
  buildEvolutionData,
  getStrengths,
  getImprovements,
  buildComparisonData,
  overallScore,
  formatFirestoreDate,
  classifyTeacherResponseStatus,
  groupBySegment,
} from './analyticsService';
import type { DomainScore } from './analyticsService';
import type { QuestionnaireResponse } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeResponse(
  rawAnswers: Record<string, number>,
  overrides: Partial<QuestionnaireResponse> = {},
): QuestionnaireResponse {
  return {
    id: 'test-id',
    questionnaireId: 'q-default',
    userId: 'user-default',
    schoolId: 'school-default',
    answers: Object.entries(rawAnswers).map(([questionId, value]) => ({ questionId, value })),
    completedAt: new Date(),
    ...overrides,
  };
}




// ── answersToScores ───────────────────────────────────────────────────────────

describe('answersToScores', () => {
  it('calcula a média correta por domínio', () => {
    const answers = { tk1: 4, tk2: 2 }; // média tk = 3.00
    const scores = answersToScores(answers);
    const tk = scores.find(s => s.domain === 'tk');
    expect(tk?.score).toBe(3);
  });

  it('retorna 0 para domínios sem respostas', () => {
    const scores = answersToScores({});
    expect(scores.every(s => s.score === 0)).toBe(true);
  });

  it('ignora valores iguais a 0 no cálculo', () => {
    const answers = { tk1: 4, tk2: 0 }; // tk2 = 0 é ignorado → média = 4
    const scores = answersToScores(answers);
    const tk = scores.find(s => s.domain === 'tk');
    expect(tk?.score).toBe(4);
  });

  it('retorna um score para cada domínio definido', () => {
    const scores = answersToScores({});
    expect(scores.length).toBe(8); // 8 domínios TPACK
  });

  it('arredonda para 2 casas decimais', () => {
    // pk1=5, pk2=4, pk avg = 4.50
    const scores = answersToScores({ pk1: 5, pk2: 4 });
    const pk = scores.find(s => s.domain === 'pk');
    expect(pk?.score).toBe(4.5);
  });
});

// ── overallScore ──────────────────────────────────────────────────────────────

describe('overallScore', () => {
  it('calcula a média entre domínios com score > 0', () => {
    const scores: DomainScore[] = [
      { domain: 'tk', label: 'TK', score: 4 },
      { domain: 'pk', label: 'PK', score: 2 },
    ];
    expect(overallScore(scores)).toBe(3.0);
  });

  it('ignora domínios com score 0', () => {
    const scores: DomainScore[] = [
      { domain: 'tk', label: 'TK', score: 4 },
      { domain: 'pk', label: 'PK', score: 0 },
    ];
    expect(overallScore(scores)).toBe(4.0);
  });

  it('retorna 0 quando todos os scores são 0', () => {
    const scores: DomainScore[] = [
      { domain: 'tk', label: 'TK', score: 0 },
    ];
    expect(overallScore(scores)).toBe(0);
  });
});

// ── getStrengths / getImprovements ────────────────────────────────────────────

describe('getStrengths', () => {
  const scores: DomainScore[] = [
    { domain: 'tk', label: 'TK', score: 5 },
    { domain: 'pk', label: 'PK', score: 3 },
    { domain: 'ck', label: 'CK', score: 4 },
  ];

  it('retorna os 2 maiores scores', () => {
    const result = getStrengths(scores);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('TK');
    expect(result[1]).toContain('CK');
  });

  it('ignora domínios com score 0', () => {
    const withZero = [...scores, { domain: 'pck', label: 'PCK', score: 0 }];
    const result = getStrengths(withZero);
    expect(result.some(r => r.includes('PCK'))).toBe(false);
  });
});

describe('getImprovements', () => {
  const scores: DomainScore[] = [
    { domain: 'tk', label: 'TK', score: 5 },
    { domain: 'pk', label: 'PK', score: 1 },
    { domain: 'ck', label: 'CK', score: 2 },
  ];

  it('retorna os 2 menores scores', () => {
    const result = getImprovements(scores);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('PK');
    expect(result[1]).toContain('CK');
  });
});

// ── responsesToAvgScores ──────────────────────────────────────────────────────

describe('responsesToAvgScores', () => {
  it('retorna null para array vazio', () => {
    expect(responsesToAvgScores([])).toBeNull();
  });

  it('calcula a média correta entre múltiplas respostas', () => {
    const r1 = makeResponse({ tk1: 4, tk2: 4 }); // tk = 4.00
    const r2 = makeResponse({ tk1: 2, tk2: 2 }); // tk = 2.00
    const avg = responsesToAvgScores([r1, r2]);
    const tk = avg?.find(s => s.domain === 'tk');
    expect(tk?.score).toBe(3); // média de 4.00 e 2.00
  });

  it('retorna 0 para domínios sem respostas em nenhuma entrada', () => {
    const r = makeResponse({ tk1: 3, tk2: 3 });
    const avg = responsesToAvgScores([r]);
    const pk = avg?.find(s => s.domain === 'pk');
    expect(pk?.score).toBe(0);
  });
});

// ── buildEvolutionData ────────────────────────────────────────────────────────

describe('buildEvolutionData', () => {
  it('retorna array vazio para entrada vazia', () => {
    expect(buildEvolutionData([])).toEqual([]);
  });

  it('ordena por data crescente', () => {
    const older = makeResponse({ tk1: 3 }, {
      id: 'r-old',
      completedAt: { seconds: 1000, toDate: () => new Date(1000000) } as any,
    });
    const newer = makeResponse({ tk1: 4 }, {
      id: 'r-new',
      completedAt: { seconds: 2000, toDate: () => new Date(2000000) } as any,
    });
    const result = buildEvolutionData([newer, older]);
    const tkLabel = 'Conhecimento Tecnológico';
    expect((result[0] as any)[tkLabel]).toBeLessThan((result[1] as any)[tkLabel]);
  });

  it('gera um ponto por resposta com campo period', () => {
    const r = makeResponse({ tk1: 3, tk2: 3 });
    const result = buildEvolutionData([r]);
    expect(result).toHaveLength(1);
    expect(result[0].period).toBeDefined();
  });
});

// ── buildComparisonData ───────────────────────────────────────────────────────

describe('buildComparisonData', () => {
  const myScores: DomainScore[] = [
    { domain: 'tk', label: 'TK', score: 4 },
  ];

  it('preenche escola e rede com 0 quando null', () => {
    const result = buildComparisonData(myScores, null, null);
    const tk = result.find(r => r.domain === 'Conhecimento Tecnológico');
    expect(tk?.escola).toBe(0);
    expect(tk?.rede).toBe(0);
  });

  it('usa os valores fornecidos de escola e rede', () => {
    const school: DomainScore[] = [{ domain: 'tk', label: 'TK', score: 3 }];
    const network: DomainScore[] = [{ domain: 'tk', label: 'TK', score: 2 }];
    const result = buildComparisonData(myScores, school, network);
    const tk = result.find(r => r.domain === 'Conhecimento Tecnológico');
    expect(tk?.minha).toBe(4);
    expect(tk?.escola).toBe(3);
    expect(tk?.rede).toBe(2);
  });
});

// ── formatFirestoreDate ───────────────────────────────────────────────────────

describe('formatFirestoreDate', () => {
  it('retorna "—" para valor nulo', () => {
    expect(formatFirestoreDate(null)).toBe('—');
    expect(formatFirestoreDate(undefined)).toBe('—');
  });

  it('formata um objeto Date', () => {
    const result = formatFirestoreDate(new Date('2024-06-15'));
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('formata um Firestore Timestamp (objeto com .seconds)', () => {
    const ts = { seconds: new Date('2024-01-20').getTime() / 1000 };
    const result = formatFirestoreDate(ts);
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

// ── classifyTeacherResponseStatus ─────────────────────────────────────────────

describe('classifyTeacherResponseStatus', () => {
  const teachers = [
    { uid: 'prof1', name: 'Ana' },
    { uid: 'prof2', name: 'Bruno' },
  ];
  const responses = [makeResponse({}, { userId: 'prof1', questionnaireId: 'q1' })];

  it('marca professor que respondeu como "responded"', () => {
    const result = classifyTeacherResponseStatus(teachers, responses, 'q1');
    expect(result.find(t => t.uid === 'prof1')?.status).toBe('responded');
  });

  it('marca professor que não respondeu como "not_started"', () => {
    const result = classifyTeacherResponseStatus(teachers, responses, 'q1');
    expect(result.find(t => t.uid === 'prof2')?.status).toBe('not_started');
  });

  it('ignora respostas de outro questionário', () => {
    const result = classifyTeacherResponseStatus(teachers, responses, 'q-outro');
    expect(result.every(t => t.status === 'not_started')).toBe(true);
  });
});

// ── groupBySegment ────────────────────────────────────────────────────────────

describe('groupBySegment', () => {
  it('agrupa respostas pelo campo segment', () => {
    const r1 = makeResponse({ tk1: 4 }, { segment: 'anos_iniciais' as any });
    const r2 = makeResponse({ tk1: 2 }, { segment: 'anos_iniciais' as any });
    const r3 = makeResponse({ tk1: 5 }, { segment: 'ensino_medio' as any });
    const result = groupBySegment([r1, r2, r3]);
    expect(result).toHaveLength(2);
    const ai = result.find(r => r.segment === 'anos_iniciais');
    expect(ai?.total).toBe(2);
  });

  it('usa "Não informado" para respostas sem segment', () => {
    const r = makeResponse({});
    const result = groupBySegment([r]);
    expect(result[0].segment).toBe('Não informado');
  });
});
