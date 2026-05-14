import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole, Questionnaire, QuestionnaireResponse, Invitation } from '../../../types';
import {
  getOrSeedQuestionnaire,
  getUserResponses,
  getSchoolResponses,
  getPendingInvitationsByEmail,
  getSchool,
} from '../../../services/firestoreService';
import {
  answersToScores,
  responsesToAvgScores,
  buildEvolutionData,
  getStrengths,
  getImprovements,
  overallScore,
  DomainScore,
  EvolutionPoint,
} from '../../../services/analyticsService';

export interface ProfessorData {
  questionnaire: Questionnaire | null;
  myResponses: QuestionnaireResponse[];
  latestResponse: QuestionnaireResponse | null;
  hasResponded: boolean;
  pendingInvitations: Invitation[];
  schoolNames: Record<string, string>;
  myScores: DomainScore[];
  schoolScores: DomainScore[] | null;
  evolutionData: EvolutionPoint[];
  strengths: string[];
  improvements: string[];
  overallScore: number;
  loading: boolean;
  error: string;
  refreshData: () => void;
}

export function useProfessorData(): ProfessorData {
  const { currentUser } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [myResponses, setMyResponses] = useState<QuestionnaireResponse[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [schoolNames, setSchoolNames] = useState<Record<string, string>>({});
  const [myScores, setMyScores] = useState<DomainScore[]>([]);
  const [schoolScores, setSchoolScores] = useState<DomainScore[] | null>(null);
  const [evolutionData, setEvolutionData] = useState<EvolutionPoint[]>([]);
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
        const [q, responses, invites] = await Promise.all([
          getOrSeedQuestionnaire(UserRole.PROFESSOR),
          getUserResponses(currentUser.uid),
          getPendingInvitationsByEmail(currentUser.email),
        ]);

        if (cancelled) return;

        setQuestionnaire(q);
        setMyResponses(responses);
        setPendingInvitations(invites);

        if (invites.length > 0) {
          const names: Record<string, string> = {};
          await Promise.all(
            invites.map(async (inv) => {
              try {
                const school = await getSchool(inv.schoolId);
                names[inv.schoolId] = school.name;
              } catch {
                names[inv.schoolId] = 'Escola não identificada';
              }
            }),
          );
          if (!cancelled) setSchoolNames(names);
        }

        const latest = responses.length > 0 ? responses[0] : null;

        if (latest) {
          const map: Record<string, number> = {};
          for (const a of latest.answers) map[a.questionId] = Number(a.value);
          setMyScores(answersToScores(map));
          setEvolutionData(buildEvolutionData(responses));
        }

        if (currentUser.schoolId) {
          const schoolR = await getSchoolResponses(currentUser.schoolId);
          const others = schoolR.filter((r) => r.userId !== currentUser.uid);
          const avg = others.length >= 1 ? responsesToAvgScores(others) : null;
          if (!cancelled) setSchoolScores(avg);
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
    questionnaire,
    myResponses,
    latestResponse: myResponses[0] ?? null,
    hasResponded: myResponses.length > 0,
    pendingInvitations,
    schoolNames,
    myScores,
    schoolScores,
    evolutionData,
    strengths: getStrengths(myScores),
    improvements: getImprovements(myScores),
    overallScore: overallScore(myScores),
    loading,
    error,
    refreshData,
  };
}
