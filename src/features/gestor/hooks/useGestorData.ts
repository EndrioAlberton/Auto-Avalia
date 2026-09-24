import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import type { School, User, Invitation, Questionnaire, ResponseSummary } from '../../../types';
import {
  getSchool,
  getTeachersBySchool,
  getSchoolResponseSummaries,
  getSchoolInvitations,
  getOrSeedQuestionnaire,
} from '../../../services/firestoreService';
import type {
  DomainScore} from '../../../services/analyticsService';
import {
  summariesToAvgScores
} from '../../../services/analyticsService';
import { UserRole } from '../../../types';

export interface GestorData {
  school: School | null;
  hasSchool: boolean;
  teachers: User[];
  invitations: Invitation[];
  schoolSummaries: ResponseSummary[];
  schoolScores: DomainScore[] | null;
  responseRate: number;
  questionnaire: Questionnaire | null;
  loading: boolean;
  error: string;
  refreshData: () => void;
}

export function useGestorData(): GestorData {
  const { currentUser } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [schoolSummaries, setSchoolSummaries] = useState<ResponseSummary[]>([]);
  const [schoolScores, setSchoolScores] = useState<DomainScore[] | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
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
        const schoolId = currentUser.schoolId;
        if (!schoolId) {
          if (!cancelled) setLoading(false);
          return;
        }

        const [sc, t, invites, summaries, q] = await Promise.all([
          getSchool(schoolId),
          getTeachersBySchool(schoolId),
          getSchoolInvitations(schoolId),
          getSchoolResponseSummaries(schoolId),
          getOrSeedQuestionnaire(UserRole.PROFESSOR),
        ]);

        if (cancelled) return;

        setSchool(sc);
        setTeachers(t);
        setInvitations(invites.filter((i) => i.status === 'pending'));
        setSchoolSummaries(summaries);
        setSchoolScores(summariesToAvgScores(summaries));
        setQuestionnaire(q);
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error)?.message ?? 'Erro ao carregar dados');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [currentUser, tick]);

  const responseRate =
    teachers.length > 0
      ? Math.round((teachers.filter((t) => (t as any).respondedQuestionnaire).length / teachers.length) * 100)
      : 0;

  return {
    school,
    hasSchool: !!currentUser?.schoolId,
    teachers,
    invitations,
    schoolSummaries,
    schoolScores,
    responseRate,
    questionnaire,
    loading,
    error,
    refreshData,
  };
}
