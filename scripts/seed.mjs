/**
 * Autoavalia — Seed Completo
 *
 * O que faz:
 *   1. Garante que todos os usuários existem no Firebase Auth + Firestore
 *   2. Limpa coleções: schools, questionnaires, responses,
 *      anonymous_responses, support_materials, invitations
 *   3. Cria 1 escola vinculando gestor + 5 professores
 *   4. Cria questionários de professor e estudante
 *   5. Cria respostas completas de cada professor (Ana tem 2 = evolução)
 *   6. Cria 20 respostas anônimas de estudantes com perfis variados
 *   7. Cria materiais de apoio
 *
 * Como usar:
 *   npm run seed
 *
 * Logins gerados (senha: Self@2025):
 *   admin@self.edu.br        — Admin Sistema        (role: admin)
 *   secretaria@self.edu.br   — Secretaria RME       (role: secretaria)
 *   gestor@self.edu.br       — Diretor Carlos Lima  (role: gestor)
 *   professor@self.edu.br    — Prof. Ana Souza      (role: professor)
 *   professor2@self.edu.br   — Prof. Bruno Costa    (role: professor)
 *   professor3@self.edu.br   — Prof. Carla Ferreira (role: professor)
 *   professor4@self.edu.br   — Prof. Diego Almeida  (role: professor)
 *   professor5@self.edu.br   — Prof. Eduarda Lima   (role: professor)
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// ── Config ────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: 'AIzaSyDssywCZpu_bFr0IlSTAJUrbpSR0l82lF8',
  authDomain: 'ferramenteapoioensino.firebaseapp.com',
  projectId: 'ferramenteapoioensino',
  storageBucket: 'ferramenteapoioensino.firebasestorage.app',
  messagingSenderId: '984747057815',
  appId: '1:984747057815:web:e0462775e2dc3ed76dffd2',
};

// ── Dados ─────────────────────────────────────────────────────────────────────

const PASSWORD = 'Self@2025';
const NETWORK_ID = 'rede-padrao';

const USERS = [
  {
    email: 'admin@self.edu.br',
    displayName: 'Admin Sistema',
    role: 'admin',
    networkId: NETWORK_ID,
  },
  {
    email: 'secretaria@self.edu.br',
    displayName: 'Secretaria Técnica RME',
    role: 'secretaria',
    networkId: NETWORK_ID,
  },
  {
    email: 'gestor@self.edu.br',
    displayName: 'Diretor Carlos Lima',
    role: 'gestor',
    networkId: NETWORK_ID,
  },
  {
    email: 'professor@self.edu.br',
    displayName: 'Prof. Ana Souza',
    role: 'professor',
    networkId: NETWORK_ID,
    segment: ['anos_finais', 'ensino_medio'],
    subjects: ['matematica', 'fisica'],
    classes: ['8º A', '9º B', '1º EM'],
    profileCompleted: true,
  },
  {
    email: 'professor2@self.edu.br',
    displayName: 'Prof. Bruno Costa',
    role: 'professor',
    networkId: NETWORK_ID,
    segment: ['anos_finais'],
    subjects: ['portugues', 'literatura'],
    classes: ['6º A', '7º B', '8º A'],
    profileCompleted: true,
  },
  {
    email: 'professor3@self.edu.br',
    displayName: 'Prof. Carla Ferreira',
    role: 'professor',
    networkId: NETWORK_ID,
    segment: ['anos_iniciais'],
    subjects: ['pedagogia'],
    classes: ['3º A', '4º B'],
    profileCompleted: true,
  },
  {
    email: 'professor4@self.edu.br',
    displayName: 'Prof. Diego Almeida',
    role: 'professor',
    networkId: NETWORK_ID,
    segment: ['ensino_medio'],
    subjects: ['informatica'],
    classes: ['1º EM', '2º EM', '3º EM'],
    profileCompleted: true,
  },
  {
    email: 'professor5@self.edu.br',
    displayName: 'Prof. Eduarda Lima',
    role: 'professor',
    networkId: NETWORK_ID,
    segment: ['anos_finais', 'ensino_medio'],
    subjects: ['historia', 'geografia'],
    classes: ['9º A', '1º EM', '2º EM'],
    profileCompleted: true,
  },
];

// Questionário de professor: IDs p1-p5, a1-a5, i1-i5, v1-v5, t1-t5
const PROFESSOR_QUESTIONS = [
  { id:'p1', domain:'plan', order:1,  text:'Planeio minhas aulas considerando os diferentes ritmos de aprendizagem dos estudantes.', type:'scale', required:true, targetRole:['professor'] },
  { id:'p2', domain:'plan', order:2,  text:'Defino objetivos claros de aprendizagem para cada aula.', type:'scale', required:true, targetRole:['professor'] },
  { id:'p3', domain:'plan', order:3,  text:'Preparo materiais diversificados para atender às necessidades dos estudantes.', type:'scale', required:true, targetRole:['professor'] },
  { id:'p4', domain:'plan', order:4,  text:'Articulo as atividades com o projeto político-pedagógico da escola.', type:'scale', required:true, targetRole:['professor'] },
  { id:'p5', domain:'plan', order:5,  text:'Reviso e atualizo meu planejamento com base nos resultados das avaliações.', type:'scale', required:true, targetRole:['professor'] },
  { id:'a1', domain:'amb',  order:6,  text:'Promovo um ambiente de respeito e colaboração na sala de aula.', type:'scale', required:true, targetRole:['professor'] },
  { id:'a2', domain:'amb',  order:7,  text:'Estabeleço combinados claros de convivência com os estudantes.', type:'scale', required:true, targetRole:['professor'] },
  { id:'a3', domain:'amb',  order:8,  text:'Organizo o espaço físico para facilitar diferentes tipos de atividades.', type:'scale', required:true, targetRole:['professor'] },
  { id:'a4', domain:'amb',  order:9,  text:'Incentivo a participação ativa de todos os estudantes.', type:'scale', required:true, targetRole:['professor'] },
  { id:'a5', domain:'amb',  order:10, text:'Gerencio conflitos de forma construtiva e educativa.', type:'scale', required:true, targetRole:['professor'] },
  { id:'i1', domain:'inst', order:11, text:'Utilizo estratégias variadas de ensino para engajar os estudantes.', type:'scale', required:true, targetRole:['professor'] },
  { id:'i2', domain:'inst', order:12, text:'Faço conexões entre o conteúdo e a realidade dos estudantes.', type:'scale', required:true, targetRole:['professor'] },
  { id:'i3', domain:'inst', order:13, text:'Verifico a compreensão durante as aulas e ajusto minha prática.', type:'scale', required:true, targetRole:['professor'] },
  { id:'i4', domain:'inst', order:14, text:'Estimulo o pensamento crítico e a resolução de problemas.', type:'scale', required:true, targetRole:['professor'] },
  { id:'i5', domain:'inst', order:15, text:'Dou instruções claras e verifico se foram compreendidas pelos estudantes.', type:'scale', required:true, targetRole:['professor'] },
  { id:'v1', domain:'aval', order:16, text:'Utilizo diferentes instrumentos de avaliação (provas, projetos, portfólios, etc.).', type:'scale', required:true, targetRole:['professor'] },
  { id:'v2', domain:'aval', order:17, text:'Dou feedback formativo regular e específico para os estudantes.', type:'scale', required:true, targetRole:['professor'] },
  { id:'v3', domain:'aval', order:18, text:'Uso os resultados das avaliações para planejar intervenções pedagógicas.', type:'scale', required:true, targetRole:['professor'] },
  { id:'v4', domain:'aval', order:19, text:'Envolvo os estudantes em processos de autoavaliação.', type:'scale', required:true, targetRole:['professor'] },
  { id:'v5', domain:'aval', order:20, text:'Comunico claramente os critérios de avaliação antes das atividades.', type:'scale', required:true, targetRole:['professor'] },
  { id:'t1', domain:'tech', order:21, text:'Incorporo recursos digitais nas atividades de ensino e aprendizagem.', type:'scale', required:true, targetRole:['professor'] },
  { id:'t2', domain:'tech', order:22, text:'Uso plataformas digitais para comunicação e acompanhamento dos estudantes.', type:'scale', required:true, targetRole:['professor'] },
  { id:'t3', domain:'tech', order:23, text:'Oriento os estudantes sobre o uso responsável e crítico das tecnologias.', type:'scale', required:true, targetRole:['professor'] },
  { id:'t4', domain:'tech', order:24, text:'Estou atualizado(a) sobre novas ferramentas pedagógicas digitais.', type:'scale', required:true, targetRole:['professor'] },
  { id:'t5', domain:'tech', order:25, text:'Utilizo dados digitais para monitorar o progresso dos estudantes.', type:'scale', required:true, targetRole:['professor'] },
];

// Questionário de estudante: IDs e1-e10
const STUDENT_QUESTIONS = [
  { id:'e1',  order:1,  emoji:'📚', text:'Meu(s) professor(es) explica(m) o conteúdo de formas diferentes quando alguém não entende.' },
  { id:'e2',  order:2,  emoji:'🙋', text:'Me sinto à vontade para tirar dúvidas em sala de aula.' },
  { id:'e3',  order:3,  emoji:'📋', text:'As aulas são organizadas e é fácil entender o que vamos aprender no dia.' },
  { id:'e4',  order:4,  emoji:'💬', text:'O(s) professor(es) me dá(m) um retorno sobre minhas atividades e provas.' },
  { id:'e5',  order:5,  emoji:'🤝', text:'O ambiente da sala de aula é respeitoso — todos se tratam bem.' },
  { id:'e6',  order:6,  emoji:'🧠', text:'As atividades me fazem pensar e resolver problemas, não só copiar.' },
  { id:'e7',  order:7,  emoji:'💻', text:'O(s) professor(es) usa(m) recursos digitais (apps, vídeos) nas aulas.' },
  { id:'e8',  order:8,  emoji:'🎯', text:'Sei exatamente o que preciso fazer para ser bem avaliado(a) nas atividades.' },
  { id:'e9',  order:9,  emoji:'🌍', text:'As aulas me ajudam a conectar o que estudo com situações da vida real.' },
  { id:'e10', order:10, emoji:'💡', text:'Me sinto encorajado(a) a participar e expressar minhas opiniões nas aulas.' },
];

// Respostas dos professores
// Cada entrada: { email, monthsAgo, answers: { qId: value } }
// Ana tem 2 entradas para mostrar evolução; os demais têm 1
const PROFESSOR_RESPONSES = [
  // ── Ana Souza: resposta antiga (6 meses) ─────────────────────────────────
  {
    email: 'professor@self.edu.br',
    monthsAgo: 6,
    answers: {
      p1:4, p2:4, p3:3, p4:3, p5:3,   // plan ≈ 3.4
      a1:4, a2:4, a3:4, a4:3, a5:4,   // amb  ≈ 3.8
      i1:3, i2:4, i3:3, i4:3, i5:4,   // inst ≈ 3.4
      v1:3, v2:3, v3:3, v4:3, v5:3,   // aval ≈ 3.0
      t1:3, t2:3, t3:2, t4:3, t5:3,   // tech ≈ 2.8
    },
  },
  // ── Ana Souza: resposta recente (hoje) ───────────────────────────────────
  {
    email: 'professor@self.edu.br',
    monthsAgo: 0,
    answers: {
      p1:5, p2:5, p3:4, p4:4, p5:4,   // plan ≈ 4.4
      a1:5, a2:5, a3:5, a4:5, a5:4,   // amb  ≈ 4.8
      i1:5, i2:4, i3:5, i4:4, i5:4,   // inst ≈ 4.4
      v1:4, v2:4, v3:5, v4:4, v5:4,   // aval ≈ 4.2
      t1:4, t2:4, t3:4, t4:3, t5:4,   // tech ≈ 3.8
    },
  },
  // ── Bruno Costa: bom em avaliação, fraco em tech ─────────────────────────
  {
    email: 'professor2@self.edu.br',
    monthsAgo: 1,
    answers: {
      p1:4, p2:4, p3:3, p4:3, p5:4,   // plan ≈ 3.6
      a1:5, a2:4, a3:5, a4:4, a5:4,   // amb  ≈ 4.4
      i1:4, i2:4, i3:4, i4:3, i5:4,   // inst ≈ 3.8
      v1:5, v2:5, v3:4, v4:5, v5:4,   // aval ≈ 4.6
      t1:3, t2:3, t3:2, t4:3, t5:3,   // tech ≈ 2.8
    },
  },
  // ── Carla Ferreira: professora iniciante ─────────────────────────────────
  {
    email: 'professor3@self.edu.br',
    monthsAgo: 2,
    answers: {
      p1:3, p2:3, p3:2, p4:3, p5:3,   // plan ≈ 2.8
      a1:3, a2:3, a3:3, a4:4, a5:3,   // amb  ≈ 3.2
      i1:3, i2:2, i3:3, i4:2, i5:3,   // inst ≈ 2.6
      v1:2, v2:3, v3:2, v4:2, v5:3,   // aval ≈ 2.4
      t1:4, t2:4, t3:4, t4:4, t5:4,   // tech ≈ 4.0
    },
  },
  // ── Diego Almeida: focado em tecnologia ──────────────────────────────────
  {
    email: 'professor4@self.edu.br',
    monthsAgo: 1,
    answers: {
      p1:3, p2:4, p3:3, p4:3, p5:4,   // plan ≈ 3.4
      a1:4, a2:3, a3:4, a4:3, a5:4,   // amb  ≈ 3.6
      i1:4, i2:4, i3:4, i4:4, i5:4,   // inst ≈ 4.0
      v1:3, v2:3, v3:3, v4:3, v5:4,   // aval ≈ 3.2
      t1:5, t2:5, t3:5, t4:5, t5:4,   // tech ≈ 4.8
    },
  },
  // ── Eduarda Lima: equilibrada ─────────────────────────────────────────────
  {
    email: 'professor5@self.edu.br',
    monthsAgo: 0,
    answers: {
      p1:4, p2:4, p3:4, p4:4, p5:4,   // plan ≈ 4.0
      a1:4, a2:4, a3:4, a4:4, a5:4,   // amb  ≈ 4.0
      i1:4, i2:4, i3:4, i4:4, i5:4,   // inst ≈ 4.0
      v1:4, v2:4, v3:4, v4:4, v5:4,   // aval ≈ 4.0
      t1:3, t2:4, t3:3, t4:4, t5:3,   // tech ≈ 3.4
    },
  },
];

// 20 respostas anônimas de estudantes (perfis variados)
const STUDENT_RESPONSES = [
  // Muito positivos (6)
  { e1:5,e2:5,e3:5,e4:5,e5:5,e6:5,e7:4,e8:5,e9:5,e10:5 },
  { e1:5,e2:4,e3:5,e4:4,e5:5,e6:5,e7:5,e8:4,e9:4,e10:5 },
  { e1:4,e2:5,e3:4,e4:5,e5:4,e6:4,e7:5,e8:5,e9:5,e10:4 },
  { e1:5,e2:5,e3:5,e4:4,e5:5,e6:5,e7:4,e8:4,e9:5,e10:5 },
  { e1:4,e2:4,e3:5,e4:5,e5:5,e6:4,e7:5,e8:5,e9:4,e10:4 },
  { e1:5,e2:5,e3:4,e4:5,e5:4,e6:5,e7:3,e8:4,e9:5,e10:5 },
  // Moderadamente positivos (5)
  { e1:4,e2:3,e3:4,e4:3,e5:4,e6:4,e7:3,e8:4,e9:3,e10:4 },
  { e1:3,e2:4,e3:3,e4:4,e5:4,e6:3,e7:4,e8:3,e9:4,e10:3 },
  { e1:4,e2:4,e3:3,e4:3,e5:4,e6:4,e7:4,e8:4,e9:3,e10:4 },
  { e1:3,e2:3,e3:4,e4:4,e5:3,e6:4,e7:3,e8:3,e9:4,e10:4 },
  { e1:4,e2:4,e3:4,e4:3,e5:4,e6:3,e7:4,e8:4,e9:3,e10:3 },
  // Neutros / mistos (5)
  { e1:3,e2:3,e3:3,e4:2,e5:3,e6:3,e7:4,e8:3,e9:3,e10:2 },
  { e1:2,e2:3,e3:3,e4:3,e5:3,e6:2,e7:3,e8:2,e9:3,e10:3 },
  { e1:3,e2:2,e3:3,e4:3,e5:4,e6:3,e7:2,e8:3,e9:2,e10:3 },
  { e1:3,e2:3,e3:2,e4:2,e5:3,e6:3,e7:3,e8:3,e9:3,e10:2 },
  { e1:4,e2:3,e3:3,e4:2,e5:3,e6:3,e7:3,e8:3,e9:2,e10:3 },
  // Críticos (4)
  { e1:2,e2:2,e3:3,e4:2,e5:3,e6:2,e7:2,e8:2,e9:2,e10:2 },
  { e1:2,e2:2,e3:2,e4:3,e5:2,e6:2,e7:3,e8:2,e9:2,e10:2 },
  { e1:1,e2:2,e3:2,e4:2,e5:3,e6:2,e7:2,e8:1,e9:2,e10:2 },
  { e1:2,e2:3,e3:2,e4:2,e5:2,e6:2,e7:2,e8:2,e9:3,e10:2 },
];

const SUPPORT_MATERIALS = [
  { title:'Como utilizar o Autoavalia',            description:'Tutorial introdutório para professores',                  type:'video',    url:'#', targetRole:['professor'], tags:['tutorial','início']       },
  { title:'Guia de Práticas Pedagógicas Ativas',   description:'Estratégias para engajamento em sala de aula',           type:'guide',    url:'#', targetRole:['professor'], tags:['pedagogia','engajamento'] },
  { title:'Tecnologia em sala: práticas iniciais', description:'Como incorporar ferramentas digitais no ensino',          type:'video',    url:'#', targetRole:['professor'], tags:['tecnologia']              },
  { title:'Instrumentos de Avaliação Formativa',   description:'Portfólios, rubricas e autoavaliação na prática',        type:'document', url:'#', targetRole:['professor'], tags:['avaliação']               },
  { title:'Planejamento baseado em competências',  description:'Alinhamento com a BNCC e objetivos de aprendizagem',     type:'guide',    url:'#', targetRole:['professor'], tags:['planejamento','BNCC']     },
  { title:'Feedback que transforma a aprendizagem',description:'Como dar retornos efetivos aos estudantes',              type:'video',    url:'#', targetRole:['professor'], tags:['feedback','avaliação']    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return Timestamp.fromDate(d);
}

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return Timestamp.fromDate(d);
}

function answersFromMap(map) {
  return Object.entries(map).map(([questionId, value]) => ({ questionId, value }));
}

async function clearCollection(db, name) {
  const snap = await getDocs(collection(db, name));
  if (snap.empty) { console.log(`   ℹ️  ${name}: vazia`); return; }
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  console.log(`   🗑️  ${name}: ${snap.docs.length} doc(s) removidos`);
}

// Cria ou faz login — retorna uid. Cria/atualiza doc Firestore do próprio usuário.
async function ensureUser(auth, db, userData) {
  const { email, displayName, ...rest } = userData;
  let uid;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, PASSWORD);
    uid = cred.user.uid;
    await updateProfile(cred.user, { displayName });
    process.stdout.write('criado ');
  } catch (err) {
    if (err.code !== 'auth/email-already-in-use') throw err;
    const cred = await signInWithEmailAndPassword(auth, email, PASSWORD);
    uid = cred.user.uid;
    process.stdout.write('já existe ');
  }

  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  const payload = { ...rest, uid, email, displayName };

  if (snap.exists()) {
    await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }

  console.log(`→ ${uid.slice(0, 8)}…`);
  return uid;
}

// ── Fases ─────────────────────────────────────────────────────────────────────

async function phase1_users(auth, db) {
  console.log('\n👥  FASE 1 — Usuários');
  const uids = {};
  for (const u of USERS) {
    process.stdout.write(`   [${u.role.padEnd(10)}] ${u.email.padEnd(30)} `);
    uids[u.email] = await ensureUser(auth, db, u);
  }
  return uids;
}

async function phase2_clean(auth, db) {
  console.log('\n🧹  FASE 2 — Limpeza (autenticando como admin)');
  await signInWithEmailAndPassword(auth, 'admin@self.edu.br', PASSWORD);
  console.log('   ✅ Autenticado como admin');

  const cols = ['schools','questionnaires','responses','anonymous_responses','support_materials','invitations'];
  for (const c of cols) await clearCollection(db, c);
}

async function phase3_school(db, uids) {
  console.log('\n🏫  FASE 3 — Escola');

  const gestorUid = uids['gestor@self.edu.br'];
  const schoolRef = doc(collection(db, 'schools'));
  const schoolId = schoolRef.id;

  await setDoc(schoolRef, {
    name: 'Escola Municipal João Paulo II',
    networkId: NETWORK_ID,
    region: 'Sul',
    district: 'Centro',
    segments: ['anos_iniciais','anos_finais','ensino_medio'],
    address: 'Rua das Flores, 123 — Centro',
    phone: '(11) 3456-7890',
    contact: 'contato@jpaulo2.edu.br',
    gestorId: gestorUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log(`   ✅ Escola criada: ${schoolId.slice(0,8)}…`);

  // Vincula gestor e professores à escola
  const toLink = [
    'gestor@self.edu.br',
    'professor@self.edu.br',
    'professor2@self.edu.br',
    'professor3@self.edu.br',
    'professor4@self.edu.br',
    'professor5@self.edu.br',
  ];
  for (const email of toLink) {
    const uid = uids[email];
    await updateDoc(doc(db, 'users', uid), { schoolId, updatedAt: serverTimestamp() });
    console.log(`   🔗 ${email} → schoolId vinculado`);
  }

  return schoolId;
}

async function phase4_questionnaires(db) {
  console.log('\n📋  FASE 4 — Questionários');

  const now = new Date();
  const sem = now.getMonth() < 6 ? '1º Semestre' : '2º Semestre';
  const year = now.getFullYear();

  const profRef = doc(collection(db, 'questionnaires'));
  await setDoc(profRef, {
    title: `Diagnóstico de Práticas Pedagógicas – ${sem} ${year}`,
    description: 'Autoavaliação por domínios: Planejamento, Ambiente, Instrução, Avaliação e Tecnologia.',
    targetRole: 'professor',
    questions: PROFESSOR_QUESTIONS,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log(`   ✅ Questionário professor: ${profRef.id.slice(0,8)}…`);

  const studRef = doc(collection(db, 'questionnaires'));
  await setDoc(studRef, {
    title: `Percepção dos Estudantes – ${sem} ${year}`,
    description: 'Avaliação anônima das práticas pedagógicas observadas em sala.',
    targetRole: 'estudante',
    questions: STUDENT_QUESTIONS,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log(`   ✅ Questionário estudante: ${studRef.id.slice(0,8)}…`);

  return { profQId: profRef.id, studQId: studRef.id };
}

async function phase5_professorResponses(db, uids, schoolId, profQId) {
  console.log('\n✍️   FASE 5 — Respostas dos professores');

  for (const resp of PROFESSOR_RESPONSES) {
    const uid = uids[resp.email];
    const ref = doc(collection(db, 'responses'));
    const completedAt = resp.monthsAgo === 0
      ? serverTimestamp()
      : monthsAgo(resp.monthsAgo);

    await setDoc(ref, {
      questionnaireId: profQId,
      userId: uid,
      schoolId,
      networkId: NETWORK_ID,
      answers: answersFromMap(resp.answers),
      completedAt,
    });

    const tag = resp.monthsAgo === 0 ? 'agora' : `${resp.monthsAgo} mes(es) atrás`;
    console.log(`   ✅ ${resp.email.split('@')[0].padEnd(12)} [${tag}]`);
  }
}

async function phase6_studentResponses(db, schoolId, studQId) {
  console.log('\n🎒  FASE 6 — Respostas anônimas de estudantes');

  for (let i = 0; i < STUDENT_RESPONSES.length; i++) {
    const ref = doc(collection(db, 'anonymous_responses'));
    await setDoc(ref, {
      questionnaireId: studQId,
      schoolId,
      answers: answersFromMap(STUDENT_RESPONSES[i]),
      completedAt: daysAgo(Math.floor(Math.random() * 30)),
    });
  }
  console.log(`   ✅ ${STUDENT_RESPONSES.length} respostas criadas`);
}

async function phase7_materials(db) {
  console.log('\n📚  FASE 7 — Materiais de apoio');

  for (const m of SUPPORT_MATERIALS) {
    const ref = doc(collection(db, 'support_materials'));
    await setDoc(ref, { ...m, createdAt: serverTimestamp() });
  }
  console.log(`   ✅ ${SUPPORT_MATERIALS.length} materiais criados`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔥  Autoavalia — Seed Completo');
  console.log('═══════════════════════════════════════════════');

  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  const uids    = await phase1_users(auth, db);
  await           phase2_clean(auth, db);
  const schoolId = await phase3_school(db, uids);
  const { profQId, studQId } = await phase4_questionnaires(db);
  await phase5_professorResponses(db, uids, schoolId, profQId);
  await phase6_studentResponses(db, schoolId, studQId);
  await phase7_materials(db);

  console.log('\n═══════════════════════════════════════════════');
  console.log('🎉  Seed concluído! Senha de todos: Self@2025\n');
  console.log('  admin@self.edu.br          Admin Sistema');
  console.log('  secretaria@self.edu.br     Secretaria Técnica RME');
  console.log('  gestor@self.edu.br         Diretor Carlos Lima');
  console.log('  professor@self.edu.br      Prof. Ana Souza   (2 respostas — evolução visível)');
  console.log('  professor2@self.edu.br     Prof. Bruno Costa (forte em avaliação)');
  console.log('  professor3@self.edu.br     Prof. Carla Ferreira (iniciante)');
  console.log('  professor4@self.edu.br     Prof. Diego Almeida (forte em tech)');
  console.log('  professor5@self.edu.br     Prof. Eduarda Lima (equilibrada)');
  console.log('\n  🏫  Escola: "Escola Municipal João Paulo II"');
  console.log('  📊  20 respostas de estudantes + 6 respostas de professores\n');

  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message || err);
  process.exit(1);
});
