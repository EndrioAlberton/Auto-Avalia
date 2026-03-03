import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Credenciais do Firebase (projeto: ferramenteapoioensino)
const firebaseConfig = {
  apiKey: "AIzaSyDssywCZpu_bFr0IlSTAJUrbpSR0l82lF8",
  authDomain: "ferramenteapoioensino.firebaseapp.com",
  projectId: "ferramenteapoioensino",
  storageBucket: "ferramenteapoioensino.firebasestorage.app",
  messagingSenderId: "984747057815",
  appId: "1:984747057815:web:e0462775e2dc3ed76dffd2",
  measurementId: "G-9VBQRND03Z"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Serviços Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
