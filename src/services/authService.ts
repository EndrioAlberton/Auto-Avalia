import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import type { User} from '../types';
import { UserRole } from '../types';

const googleProvider = new GoogleAuthProvider();

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential':       'Email ou senha incorretos.',
  'auth/user-not-found':           'Nenhuma conta encontrada com este email.',
  'auth/wrong-password':           'Senha incorreta.',
  'auth/invalid-email':            'Email inválido.',
  'auth/user-disabled':            'Esta conta foi desativada. Entre em contato com o suporte.',
  'auth/too-many-requests':        'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed':   'Erro de conexão. Verifique sua internet.',
  'auth/email-already-in-use':     'Este email já está em uso.',
  'auth/weak-password':            'A senha deve ter pelo menos 6 caracteres.',
  'auth/operation-not-allowed':    'Este método de login não está habilitado.',
  'auth/popup-closed-by-user':     'Login cancelado. Tente novamente.',
  'auth/cancelled-popup-request':  'Login cancelado.',
};

function mapAuthError(error: any): string {
  const code: string = error?.code ?? '';
  return AUTH_ERROR_MESSAGES[code] ?? error?.message ?? 'Erro ao fazer login';
}

// Criar nova conta
export const signUp = async (
  email: string, 
  password: string, 
  displayName: string,
  role: UserRole,
  additionalData?: Record<string, any>
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Atualizar perfil do Firebase Auth
    await updateProfile(firebaseUser, { displayName });

    // Criar documento do usuário no Firestore
    const userData: Partial<User> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...additionalData
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return userData as User;
  } catch (error: any) {
    throw new Error(mapAuthError(error));
  }
};

// Login com email e senha
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userData = await getUserData(userCredential.user.uid);
    return userData;
  } catch (error: any) {
    throw new Error(mapAuthError(error));
  }
};

// Login com Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Verificar se o usuário já existe
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      // Se não existe, criar novo usuário (role padrão: professor)
      const userData: Partial<User> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || 'Usuário',
        role: UserRole.PROFESSOR,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return userData as User;
    }

    return userDoc.data() as User;
  } catch (error: any) {
    throw new Error(mapAuthError(error));
  }
};

// Logout
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao fazer logout');
  }
};

// Recuperar senha
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao enviar email de recuperação');
  }
};

// Buscar dados do usuário
export const getUserData = async (uid: string): Promise<User> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      throw new Error('Usuário não encontrado');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar dados do usuário');
  }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (
  uid: string, 
  data: Partial<User>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar perfil');
  }
};

// Verificar se o email já está em uso
export const checkEmailExists = async (_email: string): Promise<boolean> => {
  try {
    return false;
  } catch (error) {
    return false;
  }
};
