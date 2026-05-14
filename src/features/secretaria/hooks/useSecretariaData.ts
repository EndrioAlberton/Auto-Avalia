import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { School, User } from '../../../types';
import { getAllSchools, getAllUsers } from '../../../services/firestoreService';

export interface SchoolWithStats extends School {
  responseRate: number;
  avgScore: number;
  respondedCount: number;
}

export interface SecretariaData {
  schools: School[];
  allUsers: User[];
  schoolsWithStats: SchoolWithStats[];
  loading: boolean;
  error: string;
  refreshData: () => void;
}

export function useSecretariaData(): SecretariaData {
  const { currentUser } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
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
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error)?.message ?? 'Erro ao carregar dados');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [currentUser, tick]);

  const schoolsWithStats: SchoolWithStats[] = schools.map((s) => ({
    ...s,
    responseRate: 0,
    avgScore: 0,
    respondedCount: 0,
  }));

  return {
    schools,
    allUsers,
    schoolsWithStats,
    loading,
    error,
    refreshData,
  };
}
