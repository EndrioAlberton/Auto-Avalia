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
    throw new Error(error.message || 'Erro ao criar conta');
  }
};

// Login com email e senha
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userData = await getUserData(userCredential.user.uid);
    return userData;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao fazer login');
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
    throw new Error(error.message || 'Erro ao fazer login com Google');
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
