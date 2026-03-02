import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Credenciais do Firebase (projeto: buscarferramentasensino)
const firebaseConfig = {
  apiKey: "AIzaSyCEMUjMAaKQEE7GGViLgrP53IzsgL-HQgI",
  authDomain: "buscarferramentasensino.firebaseapp.com",
  projectId: "buscarferramentasensino",
  storageBucket: "buscarferramentasensino.appspot.com",
  messagingSenderId: "302635372121",
  appId: "1:302635372121:web:18b6f1ed60b2266586ab48",
  measurementId: "G-3PJL8BPSKT"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Serviços Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
