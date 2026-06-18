import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import type { School, User, Invitation, Questionnaire } from '../../../types';
import {
  getSchool,
  getTeachersBySchool,
  getSchoolResponses,
  getSchoolInvitations,
  getOrSeedQuestionnaire,
} from '../../../services/firestoreService';
import type {
  DomainScore} from '../../../services/analyticsService';
import {
  responsesToAvgScores
} from '../../../services/analyticsService';
import { UserRole } from '../../../types';

export interface GestorData {
  school: School | null;
  hasSchool: boolean;
  teachers: User[];
  invitations: Invitation[];
  schoolResponses: any[];
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
  const [schoolResponses, setSchoolResponses] = useState<any[]>([]);
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

        const [sc, t, invites, resp, q] = await Promise.all([
          getSchool(schoolId),
          getTeachersBySchool(schoolId),
          getSchoolInvitations(schoolId),
          getSchoolResponses(schoolId),
          getOrSeedQuestionnaire(UserRole.PROFESSOR),
        ]);

        if (cancelled) return;

        setSchool(sc);
        setTeachers(t);
        setInvitations(invites.filter((i) => i.status === 'pending'));
        setSchoolResponses(resp);
        setSchoolScores(responsesToAvgScores(resp));
        setQuestionnaire(q);
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error)?.message ?? 'Erro ao carregar dados');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [currentUser, tick]);

  const respondedSet = new Set(schoolResponses.map((r) => r.userId));
  const responseRate =
    teachers.length > 0
      ? Math.round((teachers.filter((t) => respondedSet.has(t.uid)).length / teachers.length) * 100)
      : 0;

  return {
    school,
    hasSchool: !!currentUser?.schoolId,
    teachers,
    invitations,
    schoolResponses,
    schoolScores,
    responseRate,
    questionnaire,
    loading,
    error,
    refreshData,
  };
}
