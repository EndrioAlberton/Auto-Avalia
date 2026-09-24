/**
 * Autoavalia — Remove dados de teste do seed
 *
 * Contraparte do seed.mjs: apaga só o que ele cria — as 8 contas de demo
 * (Firebase Auth + Firestore), o questionário de demo e as respostas/sumários
 * ligados a ele. NUNCA toca em schools, support_materials, invitations, nem
 * em qualquer usuário ou escola real.
 *
 * Como usar:
 *   npm run unseed
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDssywCZpu_bFr0IlSTAJUrbpSR0l82lF8',
  authDomain: 'ferramenteapoioensino.firebaseapp.com',
  projectId: 'ferramenteapoioensino',
  storageBucket: 'ferramenteapoioensino.firebasestorage.app',
  messagingSenderId: '984747057815',
  appId: '1:984747057815:web:e0462775e2dc3ed76dffd2',
};

const PASSWORD = 'Self@2025';
const ADMIN_EMAIL = 'admin@self.edu.br';
const QUESTIONNAIRE_SEED_ID = 'seed-professor-tpack';

// Mesmas 8 contas que o seed.mjs cria — nunca mexe em nenhuma outra.
const DEMO_EMAILS = [
  'admin@self.edu.br',
  'secretaria@self.edu.br',
  'gestor@self.edu.br',
  'professor@self.edu.br',
  'professor2@self.edu.br',
  'professor3@self.edu.br',
  'professor4@self.edu.br',
  'professor5@self.edu.br',
];

async function main() {
  console.log('🧹  Autoavalia — Remove dados de teste do seed');
  console.log('═══════════════════════════════════════════════');

  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  // ── Fase 1: autentica como admin (precisa pra apagar responses/users) ────────
  const adminCred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, PASSWORD);
  const adminSnap = await getDoc(doc(db, 'users', adminCred.user.uid));
  if (!adminSnap.exists() || adminSnap.data().role !== 'admin') {
    console.error('❌  admin@self.edu.br não tem role "admin" — nada foi apagado.');
    process.exit(1);
  }
  console.log('\n✅  Autenticado como admin');

  // ── Fase 2: apaga questionário + respostas/sumários de demo ──────────────────
  console.log('\n🗑️   Questionário e respostas de demo');
  const [responsesSnap, summariesSnap] = await Promise.all([
    getDocs(query(collection(db, 'responses'), where('questionnaireId', '==', QUESTIONNAIRE_SEED_ID))),
    getDocs(query(collection(db, 'responseSummaries'), where('questionnaireId', '==', QUESTIONNAIRE_SEED_ID))),
  ]);
  const batch1 = writeBatch(db);
  batch1.delete(doc(db, 'questionnaires', QUESTIONNAIRE_SEED_ID));
  for (const d of responsesSnap.docs) batch1.delete(d.ref);
  for (const d of summariesSnap.docs) batch1.delete(d.ref);
  await batch1.commit();
  console.log(`   ✅ questionário + ${responsesSnap.size} resposta(s) + ${summariesSnap.size} sumário(s) removidos`);

  // ── Fase 3: apaga os documentos users/{uid} das 8 contas de demo ─────────────
  console.log('\n🗑️   Documentos de usuário (Firestore)');
  const usersSnap = await getDocs(query(collection(db, 'users'), where('email', 'in', DEMO_EMAILS)));
  const uidByEmail = {};
  const batch2 = writeBatch(db);
  for (const d of usersSnap.docs) {
    uidByEmail[d.data().email] = d.id;
    batch2.delete(d.ref);
  }
  await batch2.commit();
  console.log(`   ✅ ${usersSnap.size} documento(s) de usuário removidos`);

  // ── Fase 4: apaga as contas do Firebase Auth (cada uma só apaga a si mesma) ──
  // admin por último: as fases 2/3 acima ainda precisavam da sessão dele.
  console.log('\n🗑️   Contas do Firebase Auth');
  const ordered = [...DEMO_EMAILS.filter((e) => e !== ADMIN_EMAIL), ADMIN_EMAIL];
  for (const email of ordered) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, PASSWORD);
      await deleteUser(cred.user);
      console.log(`   ✅ ${email}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log(`   ℹ️  ${email}: já não existia`);
      } else {
        throw err;
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('🎉  Dados de teste removidos. Escolas, materiais e convites ficaram intactos.\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Erro:', err.message || err);
  process.exit(1);
});
