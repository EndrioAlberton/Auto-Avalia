import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { School, User, QuestionnaireResponse } from '../../../types';
import { getAllSchools, getAllUsers, getSchoolResponses, getTeachersBySchool } from '../../../services/firestoreService';
import {
  responsesToAvgScores,
  answersToScores,
  overallScore,
  DomainScore,
} from '../../../services/analyticsService';

export interface SchoolWithStats extends School {
  responseRate: number;
  avgScore: number;
  respondedCount: number;
  teachersCount: number;
  avgScores: DomainScore[];
}

export interface TeacherWithScore extends User {
  schoolName: string;
  hasResponded: boolean;
  scores: DomainScore[] | null;
  overall: number;
  completedAt: any;
}

export interface SecretariaData {
  schools: School[];
  allUsers: User[];
  schoolsWithStats: SchoolWithStats[];
  teachersWithScores: TeacherWithScore[];
  loading: boolean;
  error: string;
  refreshData: () => void;
}

export function useSecretariaData(): SecretariaData {
  const { currentUser } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [schoolsWithStats, setSchoolsWithStats] = useState<SchoolWithStats[]>([]);
  const [teachersWithScores, setTeachersWithScores] = useState<TeacherWithScore[]>([]);
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

        // Agrega professores com scores individuais
        const teacherRows: TeacherWithScore[] = schoolDataList.flatMap(({ school, responses, teachers }) => {
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
            let overall = 0;
            if (latest) {
              const map: Record<string, number> = {};
              for (const a of latest.answers) map[a.questionId] = Number(a.value);
              scores = answersToScores(map);
              overall = overallScore(scores);
            }

            return {
              ...teacher,
              schoolName: school.name,
              hasResponded: !!latest,
              scores,
              overall,
              completedAt: latest?.completedAt ?? null,
            };
          });
        });

        if (!cancelled) {
          setSchoolsWithStats(stats);
          setTeachersWithScores(teacherRows);
        }
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error)?.message ?? 'Erro ao carregar dados');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [currentUser, tick]);

  return {
    schools,
    allUsers,
    schoolsWithStats,
    teachersWithScores,
    loading,
    error,
    refreshData,
  };
}
