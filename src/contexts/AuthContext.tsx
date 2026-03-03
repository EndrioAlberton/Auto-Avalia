import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { User } from '../types';
import { getUserData, signIn, signOut, signUp, signInWithGoogle } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (email: string, password: string, displayName: string, role: any, additionalData?: any) => Promise<User>;
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          setCurrentUser(userData);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
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
    role: any,
    additionalData?: any
  ): Promise<User> => {
    const user = await signUp(email, password, displayName, role, additionalData);
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
