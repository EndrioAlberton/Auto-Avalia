import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import type { User } from '../types';
import { getUserData, signIn, signOut, signUp, signInWithGoogle } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (email: string, password: string, displayName: string) => Promise<User>;
  logout: () => Promise<void>;
  /** Recarrega os dados do usuário do Firestore e atualiza o contexto */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assinatura do documento do usuário, renovada a cada troca de sessão.
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);

      unsubscribeDoc?.();
      unsubscribeDoc = null;

      if (!user) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      // onSnapshot em vez de leitura única: mudanças de cargo passam a valer na
      // hora, sem o usuário precisar sair e entrar de novo.
      unsubscribeDoc = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
          setCurrentUser(snap.exists() ? (snap.data() as User) : null);
          setLoading(false);
        },
        (error) => {
          console.error('Erro ao carregar dados do usuário:', error);
          setCurrentUser(null);
          setLoading(false);
        },
      );
    });

    return () => {
      unsubscribeDoc?.();
      unsubscribeAuth();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const user = await signIn(email, password);
    setCurrentUser(user);
    return user;
  };

  const loginWithGoogle = async (): Promise<User> => {
    const user = await signInWithGoogle();
    setCurrentUser(user);
    return user;
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<User> => {
    const user = await signUp(email, password, displayName);
    setCurrentUser(user);
    return user;
  };

  const logout = async (): Promise<void> => {
    await signOut();
    setCurrentUser(null);
    setFirebaseUser(null);
  };

  /**
   * Recarrega os dados do usuário do Firestore.
   * Deve ser chamado após qualquer updateUserProfile para que
   * currentUser reflita os dados atualizados (ex: schoolId).
   */
  const refreshUser = async (): Promise<void> => {
    const fbUser = auth.currentUser;
    if (!fbUser) return;
    try {
      const userData = await getUserData(fbUser.uid);
      setCurrentUser(userData);
    } catch (err) {
      console.error('refreshUser erro:', err);
    }
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
