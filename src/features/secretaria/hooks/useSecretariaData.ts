import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import type { School, User } from '../../../types';
import { getAllSchools, getAllUsers, getSchoolResponseSummaries, getTeachersBySchool } from '../../../services/firestoreService';
import type {
  DomainScore} from '../../../services/analyticsService';
import {
  summariesToAvgScores
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

        // Carrega sumários anônimos e professores de cada escola em paralelo
        const schoolDataList = await Promise.all(
          schoolList.map(async (school) => {
            const [summaries, teachers] = await Promise.all([
              getSchoolResponseSummaries(school.id),
              getTeachersBySchool(school.id),
            ]);
            return { school, summaries, teachers };
          }),
        );

        if (cancelled) return;

        // Agrega stats por escola
        const stats: SchoolWithStats[] = schoolDataList.map(({ school, summaries, teachers }) => {
          const respondedCount = teachers.filter((t) => (t as any).respondedQuestionnaire).length;
          const responseRate =
            teachers.length > 0 ? Math.round((respondedCount / teachers.length) * 100) : 0;
          const avgScores = summariesToAvgScores(summaries) ?? [];
          const validScores = avgScores.filter((d) => d.score > 0);
          const avgScore =
            validScores.length > 0
              ? parseFloat((validScores.reduce((s, d) => s + d.score, 0) / validScores.length).toFixed(1))
              : 0;
          return {
            ...school,
            responseRate,
            avgScore,
            respondedCount,
            teachersCount: teachers.length,
            avgScores,
          };
        });

        // Agrega por disciplina direto dos sumários anônimos — sem join de
        // identidade. ponytail: como o sumário não carrega userId, um
        // professor que respondeu mais de uma vez (evolução) entra com todas
        // as submissões aqui, não só a mais recente; upgrade só voltando a
        // vincular por identidade, que é o que estamos evitando.
        const disciplineAccum: Record<string, { label: string; domainSums: Record<string, number[]>; count: number }> = {};
        for (const { summaries } of schoolDataList) {
          for (const s of summaries) {
            for (const sub of s.subjects ?? []) {
              const opt = SUBJECT_OPTIONS.find((o) => o.value === sub);
              if (!opt) continue;
              if (!disciplineAccum[sub]) disciplineAccum[sub] = { label: opt.label, domainSums: {}, count: 0 };
              disciplineAccum[sub].count++;
              for (const [domain, score] of Object.entries(s.domainScores)) {
                if (score <= 0) continue;
                if (!disciplineAccum[sub].domainSums[domain]) disciplineAccum[sub].domainSums[domain] = [];
                disciplineAccum[sub].domainSums[domain].push(score);
              }
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
