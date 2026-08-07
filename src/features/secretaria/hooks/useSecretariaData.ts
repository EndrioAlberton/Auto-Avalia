import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import type { School, User, QuestionnaireResponse } from '../../../types';
import { getAllSchools, getAllUsers, getSchoolResponses, getTeachersBySchool } from '../../../services/firestoreService';
import type {
  DomainScore} from '../../../services/analyticsService';
import {
  responsesToAvgScores,
  answersToScores
} from '../../../services/analyticsService';
import { SUBJECT_OPTIONS, DOMAIN_LABELS } from '../../../data/questionnaireData';

export interface SchoolWithStats extends School {
  responseRate: number;
  avgScore: number;
  respondedCount: number;
  teachersCount: number;
  avgScores: DomainScore[];
}

export interface DisciplineStat {
  subject: string;
  label: string;
  total: number;
  domainScores: DomainScore[];
}

export interface SecretariaData {
  schools: School[];
  allUsers: User[];
  schoolsWithStats: SchoolWithStats[];
  disciplineStats: DisciplineStat[];
  totalTeachers: number;
  totalResponded: number;
  loading: boolean;
  error: string;
  refreshData: () => void;
}

export function useSecretariaData(): SecretariaData {
  const { currentUser } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [schoolsWithStats, setSchoolsWithStats] = useState<SchoolWithStats[]>([]);
  const [disciplineStats, setDisciplineStats] = useState<DisciplineStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  const refreshData = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const networkId = currentUser.networkId;
        const [schoolList, users] = await Promise.all([
          getAllSchools(networkId),
          getAllUsers(networkId),
        ]);

        if (cancelled) return;

        setSchools(schoolList);
        setAllUsers(users);

        // Carrega respostas e professores de cada escola em paralelo
        const schoolDataList = await Promise.all(
          schoolList.map(async (school) => {
            const [responses, teachers] = await Promise.all([
              getSchoolResponses(school.id),
              getTeachersBySchool(school.id),
            ]);
            return { school, responses, teachers };
          }),
        );

        if (cancelled) return;

        // Agrega stats por escola
        const stats: SchoolWithStats[] = schoolDataList.map(({ school, responses, teachers }) => {
          const respondedUids = new Set(responses.map((r) => r.userId));
          const responseRate =
            teachers.length > 0
              ? Math.round((teachers.filter((t) => respondedUids.has(t.uid)).length / teachers.length) * 100)
              : 0;
          const avgScores = responsesToAvgScores(responses) ?? [];
          const validScores = avgScores.filter((d) => d.score > 0);
          const avgScore =
            validScores.length > 0
              ? parseFloat((validScores.reduce((s, d) => s + d.score, 0) / validScores.length).toFixed(1))
              : 0;
          return {
            ...school,
            responseRate,
            avgScore,
            respondedCount: new Set(responses.map((r) => r.userId)).size,
            teachersCount: teachers.length,
            avgScores,
          };
        });

        // Calcula scores individuais por professor apenas para alimentar a agregação
        // por disciplina abaixo — nome/identidade nunca sai deste escopo.
        const perTeacherScores = schoolDataList.flatMap(({ responses, teachers }) => {
          const byTeacher = new Map<string, QuestionnaireResponse[]>();
          for (const r of responses) {
            if (!r.userId) continue;
            if (!byTeacher.has(r.userId)) byTeacher.set(r.userId, []);
            byTeacher.get(r.userId)!.push(r);
          }

          return teachers.map((teacher) => {
            const teacherResponses = byTeacher.get(teacher.uid) ?? [];
            const latest = teacherResponses.sort((a, b) => {
              const tsA = (a.completedAt as any)?.seconds ?? 0;
              const tsB = (b.completedAt as any)?.seconds ?? 0;
              return tsB - tsA;
            })[0];

            let scores: DomainScore[] | null = null;
            if (latest) {
              const map: Record<string, number> = {};
              for (const a of latest.answers) map[a.questionId] = Number(a.value);
              scores = answersToScores(map);
            }

            return {
              subjects: (teacher as any).subjects as string[] | undefined,
              hasResponded: !!latest,
              scores,
            };
          });
        });

        // Agrega por disciplina — nenhum campo de identidade é mantido no resultado
        const disciplineAccum: Record<string, { label: string; domainSums: Record<string, number[]>; count: number }> = {};
        for (const t of perTeacherScores) {
          if (!t.hasResponded || !t.scores) continue;
          for (const sub of t.subjects ?? []) {
            const opt = SUBJECT_OPTIONS.find((o) => o.value === sub);
            if (!opt) continue;
            if (!disciplineAccum[sub]) disciplineAccum[sub] = { label: opt.label, domainSums: {}, count: 0 };
            disciplineAccum[sub].count++;
            for (const { domain, score } of t.scores) {
              if (score <= 0) continue;
              if (!disciplineAccum[sub].domainSums[domain]) disciplineAccum[sub].domainSums[domain] = [];
              disciplineAccum[sub].domainSums[domain].push(score);
            }
          }
        }

        const discStats: DisciplineStat[] = Object.entries(disciplineAccum)
          .filter(([, d]) => d.count > 0)
          .map(([subject, d]) => ({
            subject,
            label: d.label,
            total: d.count,
            domainScores: Object.entries(d.domainSums).map(([domain, vals]) => ({
              domain,
              label: DOMAIN_LABELS[domain] ?? domain,
              score: vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0,
            })),
          }))
          .sort((a, b) => b.total - a.total);

        if (!cancelled) {
          setSchoolsWithStats(stats);
          setDisciplineStats(discStats);
        }
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error)?.message ?? 'Erro ao carregar dados');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [currentUser, tick]);

  const totalTeachers = schoolsWithStats.reduce((s, sc) => s + sc.teachersCount, 0);
  const totalResponded = schoolsWithStats.reduce((s, sc) => s + sc.respondedCount, 0);

  return {
    schools,
    allUsers,
    schoolsWithStats,
    disciplineStats,
    totalTeachers,
    totalResponded,
    loading,
    error,
    refreshData,
  };
}
