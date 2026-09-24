/**
 * Autoavalia — Seed Completo
 *
 * O que faz — tudo em upsert (cria se não existe, sobrescreve se já existe),
 * NUNCA apaga coleção nenhuma. Seguro rodar contra um projeto com dado real:
 *   1.  Garante que todos os usuários existem no Firebase Auth + Firestore
 *       (sempre como professor — é o único cargo que o autocadastro permite)
 *   1b. Autentica como admin e atribui os cargos reais (secretaria, gestor)
 *   3.  Cria as 102 escolas próprias da RME-POA (só as que ainda não existem)
 *       e lota gestor + 5 professores de demo em uma delas
 *   4.  Cria/atualiza o questionário de professor (ID determinístico)
 *   5.  Cria/atualiza as respostas de demo de cada professor (Ana tem 2 =
 *       evolução), com ID determinístico — reexecutar sobrescreve as mesmas,
 *       não duplica
 *   7.  Cria/atualiza materiais de apoio (ID determinístico)
 *
 * Como usar:
 *   npm run seed
 *
 * ⚠️  PRÉ-REQUISITO EM PROJETO NOVO (uma única vez):
 *   As regras do Firestore só permitem autocadastro como `professor`, e ninguém
 *   pode alterar o próprio cargo. Nenhum caminho pelo SDK cliente consegue,
 *   portanto, criar o primeiro admin.
 *
 *   Rode `npm run seed` uma vez (vai parar na Fase 1b com instruções), abra o
 *   console do Firebase → Firestore → coleção `users` → documento de
 *   admin@self.edu.br e defina `role: "admin"`. Depois rode o seed de novo.
 *   A partir daí ele é idempotente.
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
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { ESCOLAS_POA } from './data/escolas-poa.mjs';

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

// Escola onde o gestor e os professores de demonstração ficam lotados. É uma
// EMEB porque os professores do seed cobrem fundamental e médio — as demais 101
// escolas entram sem gestor e sem respostas.
const ESCOLA_DEMO_ID = 'emeb-dr-liberato-salzano-vieira-da-cunha';

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

// Questionário de professor — TPACK / RME-POA
const PROFESSOR_QUESTIONS = [
  { id:'ctx1',  domain:'ctx',   section:'ctx',       order:1,  type:'choice', required:true,  targetRole:['professor'],
    text:'Em qual etapa de ensino você atua majoritariamente na Rede Municipal de Porto Alegre?',
    options:['Educação Infantil','Ensino Fundamental - Anos Iniciais','Ensino Fundamental - Anos Finais','Educação de Jovens e Adultos (EJA)','Outro'] },
  { id:'ctx1b', domain:'ctx',   section:'ctx',       order:2,  type:'text',   required:false, targetRole:['professor'],
    text:'Componente curricular que você leciona:' },
  { id:'ctx2',  domain:'ctx',   section:'ctx',       order:3,  type:'choice', required:true,  targetRole:['professor'],
    text:'Como você avalia a disponibilidade real de equipamentos (ex: Chromebooks da SMED) e a estabilidade da internet para uso pedagógico com a turma inteira na sua escola?',
    options:['Adequada e constante','Intermitente/Parcial','Inadequada/Obsoleta','Dependo exclusivamente do celular dos alunos'] },
  { id:'ctx3',  domain:'ctx',   section:'ctx',       order:4,  type:'choice', required:true,  targetRole:['professor'],
    text:'Qual é a principal barreira estrutural que seus alunos enfrentam para o uso de tecnologias digitais?',
    options:['Falta de equipamento próprio','Falta de pacote de dados/internet em casa','Baixo letramento digital das famílias','Nenhuma barreira significativa','Outra'] },
  { id:'ctx4',  domain:'ctx',   section:'ctx',       order:5,  type:'scale',  required:true,  targetRole:['professor'],
    text:'A gestão da minha escola estimula o uso autoral e reflexivo das tecnologias digitais, oferecendo apoio prático em vez de apenas cobrar o cumprimento de metas ou o uso obrigatório de plataformas.' },
  { id:'tk1',   domain:'tk',    section:'base',      order:6,  type:'scale',  required:true,  targetRole:['professor'],
    text:'Sinto-me confortável e competente para utilizar uma variedade de ferramentas e recursos digitais (softwares, aplicativos, plataformas online) no meu dia a dia profissional e pessoal.' },
  { id:'tk2',   domain:'tk',    section:'base',      order:7,  type:'scale',  required:true,  targetRole:['professor'],
    text:'Busco ativamente aprender sobre novas tecnologias digitais e suas funcionalidades, mesmo que não sejam diretamente relacionadas à minha disciplina.' },
  { id:'pk1',   domain:'pk',    section:'base',      order:8,  type:'scale',  required:true,  targetRole:['professor'],
    text:'Consigo adaptar minhas estratégias pedagógicas para atender às diferentes necessidades e estilos de aprendizagem dos meus alunos.' },
  { id:'pk2',   domain:'pk',    section:'base',      order:9,  type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo diferentes abordagens pedagógicas (ex: trabalho em grupo, projetos, ensino investigativo) para promover a participação ativa e o engajamento dos alunos.' },
  { id:'ck1',   domain:'ck',    section:'base',      order:10, type:'scale',  required:true,  targetRole:['professor'],
    text:'Tenho um domínio aprofundado do conteúdo da(s) disciplina(s) que leciono, incluindo conceitos fundamentais, teorias e aplicações práticas.' },
  { id:'ck2',   domain:'ck',    section:'base',      order:11, type:'scale',  required:true,  targetRole:['professor'],
    text:'Consigo explicar conceitos complexos da minha disciplina de diferentes maneiras, utilizando exemplos e analogias que facilitam a compreensão dos alunos.' },
  { id:'pck1',  domain:'pck',   section:'intersect', order:12, type:'scale',  required:true,  targetRole:['professor'],
    text:'Seleciono e organizo o conteúdo da minha disciplina de forma a facilitar a aprendizagem dos alunos, considerando suas experiências prévias e desafios comuns.' },
  { id:'pck2',  domain:'pck',   section:'intersect', order:13, type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo estratégias de ensino específicas que são mais eficazes para abordar os conceitos e habilidades da minha disciplina.' },
  { id:'tck1',  domain:'tck',   section:'intersect', order:14, type:'scale',  required:true,  targetRole:['professor'],
    text:'Conheço e seleciono tecnologias digitais que são mais adequadas para representar e explorar os conteúdos específicos da minha disciplina.' },
  { id:'tck2',  domain:'tck',   section:'intersect', order:15, type:'scale',  required:true,  targetRole:['professor'],
    text:'Entendo como as características de diferentes tecnologias digitais podem influenciar a forma como o conteúdo da minha disciplina é compreendido pelos alunos.' },
  { id:'tpk1',  domain:'tpk',   section:'intersect', order:16, type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo tecnologias digitais para implementar estratégias pedagógicas inovadoras que promovem o engajamento, a colaboração e a personalização da aprendizagem.' },
  { id:'tpk2',  domain:'tpk',   section:'intersect', order:17, type:'scale',  required:true,  targetRole:['professor'],
    text:'Consigo adaptar o uso de tecnologias digitais para diferentes contextos de sala de aula e diversas abordagens pedagógicas.' },
  { id:'tpack1',domain:'tpack', section:'intersect', order:18, type:'scale',  required:true,  targetRole:['professor'],
    text:'Ao planejar minhas aulas, integro de forma coerente o conteúdo, as estratégias pedagógicas e as tecnologias digitais, visando maximizar a aprendizagem.' },
  { id:'tpack2',domain:'tpack', section:'intersect', order:19, type:'scale',  required:true,  targetRole:['professor'],
    text:'Sou capaz de criar atividades que utilizam tecnologias digitais para abordar conceitos específicos da minha disciplina de forma pedagógica e eficaz.' },
  { id:'tpack3',domain:'tpack', section:'intersect', order:20, type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo as tecnologias digitais para fortalecer o trabalho colaborativo com outros professores da RME-POA, trocando experiências e construindo projetos em conjunto.' },
  { id:'tpack4',domain:'tpack', section:'intersect', order:21, type:'scale',  required:true,  targetRole:['professor'],
    text:'As formações sobre tecnologia me ajudam a refletir criticamente sobre as finalidades educacionais do uso do digital, além do mero treinamento técnico.' },
  { id:'afr1',  domain:'afr',   section:'afr',       order:22, type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo ferramentas digitais para avaliações formativas que me ajudam a dar feedbacks rápidos e apoiar o desenvolvimento do estudante.' },
  { id:'afr2',  domain:'afr',   section:'afr',       order:23, type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo os dados gerados pelas ferramentas digitais como apoio para minha própria reflexão docente e replanejamento.' },
  { id:'meta1', domain:'meta',  section:'meta',      order:24, type:'open',   required:false, targetRole:['professor'],
    text:'Em sua opinião, a linguagem utilizada nesta avaliação está adequada à nossa realidade de rede municipal?' },
  { id:'meta2', domain:'meta',  section:'meta',      order:25, type:'open',   required:false, targetRole:['professor'],
    text:'Estas perguntas o(a) ajudam a refletir sobre seu poder de decisão e autonomia no uso das tecnologias, ou parecem uma cobrança da SMED?' },
  { id:'meta3', domain:'meta',  section:'meta',      order:26, type:'open',   required:false, targetRole:['professor'],
    text:'A ferramenta capta bem a diferença entre "usar tecnologia para inovar" e "usar apenas para treinar para provas padronizadas"?' },
  { id:'meta4', domain:'meta',  section:'meta',      order:27, type:'open',   required:false, targetRole:['professor'],
    text:'Quais outros aspectos relacionados ao uso de tecnologias em sua prática você considera importantes e não foram abordados?' },
];


// Respostas dos professores — IDs TPACK (escala 1-5)
// Ana tem 2 entradas para mostrar evolução; os demais têm 1
const PROFESSOR_RESPONSES = [
  // ── Ana Souza: resposta antiga (6 meses) — nível intermediário ───────────
  {
    email: 'professor@self.edu.br', monthsAgo: 6, segment: 'anos_finais',
    answers: {
      ctx1:'Ensino Fundamental - Anos Finais', ctx1b:'Matemática e Física',
      ctx2:'Intermitente/Parcial', ctx3:'Falta de equipamento próprio', ctx4:3,
      tk1:3, tk2:3, pk1:3, pk2:3, ck1:4, ck2:4,
      pck1:3, pck2:3, tck1:2, tck2:3, tpk1:3, tpk2:2,
      tpack1:3, tpack2:3, tpack3:3, tpack4:2,
      afr1:3, afr2:3,
    },
  },
  // ── Ana Souza: resposta recente (hoje) — avançado/integrador ─────────────
  {
    email: 'professor@self.edu.br', monthsAgo: 0, segment: 'anos_finais',
    answers: {
      ctx1:'Ensino Fundamental - Anos Finais', ctx1b:'Matemática e Física',
      ctx2:'Intermitente/Parcial', ctx3:'Falta de equipamento próprio', ctx4:4,
      tk1:4, tk2:4, pk1:5, pk2:4, ck1:5, ck2:5,
      pck1:4, pck2:5, tck1:4, tck2:4, tpk1:4, tpk2:4,
      tpack1:4, tpack2:4, tpack3:5, tpack4:4,
      afr1:4, afr2:5,
    },
  },
  // ── Bruno Costa: forte em PK/PCK, médio em TK/TCK ───────────────────────
  {
    email: 'professor2@self.edu.br', monthsAgo: 1, segment: 'anos_finais',
    answers: {
      ctx1:'Ensino Fundamental - Anos Finais', ctx1b:'Língua Portuguesa e Literatura',
      ctx2:'Adequada e constante', ctx3:'Baixo letramento digital das famílias', ctx4:4,
      tk1:3, tk2:3, pk1:5, pk2:5, ck1:5, ck2:5,
      pck1:5, pck2:5, tck1:3, tck2:3, tpk1:4, tpk2:3,
      tpack1:4, tpack2:4, tpack3:4, tpack4:5,
      afr1:3, afr2:3,
    },
  },
  // ── Carla Ferreira: iniciante, infraestrutura crítica ────────────────────
  {
    email: 'professor3@self.edu.br', monthsAgo: 2, segment: 'anos_iniciais',
    answers: {
      ctx1:'Ensino Fundamental - Anos Iniciais', ctx1b:'Multidisciplinar',
      ctx2:'Inadequada/Obsoleta', ctx3:'Falta de equipamento próprio', ctx4:2,
      tk1:2, tk2:2, pk1:3, pk2:3, ck1:4, ck2:3,
      pck1:3, pck2:3, tck1:2, tck2:2, tpk1:2, tpk2:2,
      tpack1:2, tpack2:2, tpack3:2, tpack4:3,
      afr1:3, afr2:2,
    },
  },
  // ── Diego Almeida: especialista em TK/TCK/TPK ────────────────────────────
  {
    email: 'professor4@self.edu.br', monthsAgo: 1, segment: 'anos_finais',
    answers: {
      ctx1:'Ensino Fundamental - Anos Finais', ctx1b:'Informática / Tecnologia',
      ctx2:'Adequada e constante', ctx3:'Nenhuma barreira significativa', ctx4:5,
      tk1:5, tk2:5, pk1:4, pk2:4, ck1:5, ck2:4,
      pck1:4, pck2:4, tck1:5, tck2:5, tpk1:5, tpk2:5,
      tpack1:5, tpack2:5, tpack3:4, tpack4:4,
      afr1:5, afr2:4,
    },
  },
  // ── Eduarda Lima: equilibrada, barreira de dados ─────────────────────────
  {
    email: 'professor5@self.edu.br', monthsAgo: 0, segment: 'anos_finais',
    answers: {
      ctx1:'Ensino Fundamental - Anos Finais', ctx1b:'História e Geografia',
      ctx2:'Intermitente/Parcial', ctx3:'Falta de pacote de dados/internet em casa', ctx4:3,
      tk1:4, tk2:3, pk1:4, pk2:4, ck1:4, ck2:4,
      pck1:4, pck2:4, tck1:3, tck2:4, tpk1:4, tpk2:3,
      tpack1:4, tpack2:4, tpack3:4, tpack4:4,
      afr1:4, afr2:4,
    },
  },
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


function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return Timestamp.fromDate(d);
}

function answersFromMap(map) {
  return Object.entries(map).map(([questionId, value]) => ({ questionId, value }));
}

// Espelha DOMAIN_QUESTION_IDS / answersToScores de src/data/questionnaireData.ts
// e src/services/analyticsService.ts — o seed roda fora do bundle da app, então
// não dá pra importar direto; mudou lá, muda aqui também.
const DOMAIN_QUESTION_IDS = {
  tk: ['tk1', 'tk2'],
  pk: ['pk1', 'pk2'],
  ck: ['ck1', 'ck2'],
  pck: ['pck1', 'pck2'],
  tck: ['tck1', 'tck2'],
  tpk: ['tpk1', 'tpk2'],
  tpack: ['tpack1', 'tpack2', 'tpack3', 'tpack4'],
  afr: ['afr1', 'afr2'],
};

function answersToDomainScores(answersMap) {
  const out = {};
  for (const [domain, ids] of Object.entries(DOMAIN_QUESTION_IDS)) {
    const vals = ids.map((id) => answersMap[id]).filter((v) => v !== undefined && v > 0);
    out[domain] = vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
  }
  return out;
}

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const ADMIN_EMAIL = 'admin@self.edu.br';

// Cria ou faz login — retorna uid. Cria/atualiza doc Firestore do próprio usuário.
// Nunca grava o cargo real: as regras só aceitam autocadastro como professor e
// proíbem o usuário de alterar o próprio cargo. Os cargos reais vêm na Fase 1b.
async function ensureUser(auth, db, userData) {
  const { email, displayName, role: _targetRole, ...rest } = userData;
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
    // `role` fora do payload de propósito — reescrevê-lo aqui seria o próprio
    // usuário alterando seu cargo, e as regras negam.
    await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, {
      ...payload,
      role: 'professor',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  console.log(`→ ${uid.slice(0, 8)}…`);
  return uid;
}

// ── Fases ─────────────────────────────────────────────────────────────────────

async function phase1_users(auth, db) {
  console.log('\n👥  FASE 1 — Usuários (todos como professor)');
  const uids = {};
  for (const u of USERS) {
    process.stdout.write(`   [${u.role.padEnd(10)}] ${u.email.padEnd(30)} `);
    uids[u.email] = await ensureUser(auth, db, u);
  }
  return uids;
}

// Autentica como admin e confirma que ele realmente tem o cargo. Sem isso o
// resto do seed falharia com PERMISSION_DENIED sem explicar o motivo.
async function signInAsAdmin(auth, db) {
  const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, PASSWORD);
  const snap = await getDoc(doc(db, 'users', cred.user.uid));
  const role = snap.exists() ? snap.data().role : null;

  if (role !== 'admin') {
    console.error(`
❌  Bootstrap pendente.

    As regras do Firestore só permitem autocadastro como "professor", e ninguém
    pode alterar o próprio cargo — então o primeiro admin precisa ser definido
    manualmente, uma única vez:

      1. Console do Firebase → Firestore Database
      2. Coleção "users" → documento ${cred.user.uid}
         (é o ${ADMIN_EMAIL}, cargo atual: ${role ?? 'nenhum'})
      3. Defina o campo  role = "admin"
      4. Rode "npm run seed" de novo

    A partir daí o seed roda de ponta a ponta quantas vezes quiser.
`);
    process.exit(1);
  }

  return cred.user.uid;
}

async function phase1b_roles(auth, db, uids) {
  console.log('\n🎓  FASE 1b — Cargos (autenticando como admin)');
  await signInAsAdmin(auth, db);
  console.log('   ✅ Autenticado como admin');

  // O admin não aparece aqui: ninguém altera o próprio cargo (ver signInAsAdmin).
  const elevated = USERS.filter((u) => u.role !== 'professor' && u.email !== ADMIN_EMAIL);
  for (const u of elevated) {
    await updateDoc(doc(db, 'users', uids[u.email]), {
      role: u.role,
      updatedAt: serverTimestamp(),
    });
    console.log(`   🎖️  ${u.email.padEnd(30)} → ${u.role}`);
  }
}

async function phase3_schools(db, uids) {
  console.log('\n🏫  FASE 3 — Escolas da RME-POA');

  const gestorUid = uids['gestor@self.edu.br'];
  const demo = ESCOLAS_POA.find((e) => e.id === ESCOLA_DEMO_ID);
  if (!demo) throw new Error(`Escola de demonstração não encontrada: ${ESCOLA_DEMO_ID}`);

  // Ids determinísticos (slug do nome), mas só cria as que ainda não existem —
  // nunca sobrescreve, pra não perder edição real feita pelo gestor na escola.
  const existing = new Set((await getDocs(collection(db, 'schools'))).docs.map((d) => d.id));
  const faltantes = ESCOLAS_POA.filter((e) => !existing.has(e.id));

  if (faltantes.length > 0) {
    const batch = writeBatch(db);
    for (const { id, ...escola } of faltantes) {
      batch.set(doc(db, 'schools', id), {
        ...escola,
        networkId: NETWORK_ID,
        ...(id === ESCOLA_DEMO_ID ? { gestorId: gestorUid } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  }

  const porSigla = {};
  for (const e of ESCOLAS_POA) {
    const sigla = e.name.split(' ')[0];
    porSigla[sigla] = (porSigla[sigla] ?? 0) + 1;
  }
  const resumo = Object.entries(porSigla).map(([s, n]) => `${n} ${s}`).join(' · ');
  console.log(`   ✅ ${faltantes.length} escola(s) criada(s) agora, ${existing.size} já existiam (${resumo})`);
  console.log(`   🎓 Escola de demonstração: ${demo.name}`);

  // Vincula gestor e professores à escola de demonstração
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
    await updateDoc(doc(db, 'users', uid), {
      schoolId: ESCOLA_DEMO_ID,
      updatedAt: serverTimestamp(),
    });
    console.log(`   🔗 ${email} → schoolId vinculado`);
  }

  return ESCOLA_DEMO_ID;
}

// ID determinístico: reexecutar atualiza o mesmo questionário de demo em vez
// de criar um segundo "active: true" concorrente para o mesmo targetRole.
const QUESTIONNAIRE_SEED_ID = 'seed-professor-tpack';

async function phase4_questionnaires(db) {
  console.log('\n📋  FASE 4 — Questionários');

  const now = new Date();
  const sem = now.getMonth() < 6 ? '1º Semestre' : '2º Semestre';
  const year = now.getFullYear();

  const profRef = doc(db, 'questionnaires', QUESTIONNAIRE_SEED_ID);
  const existed = (await getDoc(profRef)).exists();
  await setDoc(profRef, {
    title: `Diagnóstico TPACK – ${sem} ${year}`,
    description: 'Autoavaliação por domínios TPACK: TK, PK, CK, PCK, TCK, TPK, TPACK, AFR.',
    targetRole: 'professor',
    questions: PROFESSOR_QUESTIONS,
    active: true,
    ...(existed ? {} : { createdAt: serverTimestamp() }),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  console.log(`   ✅ Questionário professor: ${profRef.id}`);

  return { profQId: profRef.id };
}

// As regras exigem que a resposta seja gravada pelo próprio autor, com a escola
// dele — daí autenticar como cada professor em vez de escrever tudo como admin.
async function phase5_professorResponses(auth, db, uids, schoolId, profQId) {
  console.log('\n✍️   FASE 5 — Respostas dos professores');

  for (const resp of PROFESSOR_RESPONSES) {
    const uid = uids[resp.email];
    const userDef = USERS.find((u) => u.email === resp.email);
    await signInWithEmailAndPassword(auth, resp.email, PASSWORD);
    const completedAt = resp.monthsAgo === 0
      ? serverTimestamp()
      : monthsAgo(resp.monthsAgo);

    // ID determinístico (email + monthsAgo): reexecutar sobrescreve a mesma
    // resposta de demo em vez de acumular uma nova a cada rodada do seed.
    const seedId = `seed-${resp.email.split('@')[0]}-${resp.monthsAgo}`;
    const summaryRef = doc(db, 'responseSummaries', seedId);
    // responseSummaries é anônimo por design — regras só deixam admin
    // atualizar um que já existe (ninguém "dono" pra provar que é seu de
    // novo). Então só cria na primeira vez; reexecuções pulam o sumário já
    // existente e só atualizam a resposta bruta (essa sim, o próprio autor
    // pode sobrescrever).
    const summaryExists = (await getDoc(summaryRef)).exists();

    const batch = writeBatch(db);
    batch.set(doc(db, 'responses', seedId), {
      questionnaireId: profQId,
      userId: uid,
      schoolId,
      networkId: NETWORK_ID,
      segment: resp.segment ?? null,
      answers: answersFromMap(resp.answers),
      completedAt,
    });
    if (!summaryExists) {
      batch.set(summaryRef, {
        questionnaireId: profQId,
        schoolId,
        networkId: NETWORK_ID,
        segment: resp.segment ?? null,
        subjects: userDef?.subjects ?? [],
        domainScores: answersToDomainScores(resp.answers),
        completedAt,
      });
    }
    batch.update(doc(db, 'users', uid), { respondedQuestionnaire: true });
    await batch.commit();

    const tag = resp.monthsAgo === 0 ? 'agora' : `${resp.monthsAgo} mes(es) atrás`;
    console.log(`   ✅ ${resp.email.split('@')[0].padEnd(12)} [${tag}]${summaryExists ? ' (sumário já existia)' : ''}`);
  }

  // As fases seguintes voltam a precisar de admin.
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, PASSWORD);
}


async function phase7_materials(db) {
  console.log('\n📚  FASE 7 — Materiais de apoio');

  // ID determinístico (slug do título): reexecutar atualiza o mesmo material
  // em vez de duplicar.
  const batch = writeBatch(db);
  for (const m of SUPPORT_MATERIALS) {
    const ref = doc(db, 'support_materials', `seed-${slugify(m.title)}`);
    const existed = (await getDoc(ref)).exists();
    batch.set(ref, { ...m, ...(existed ? {} : { createdAt: serverTimestamp() }) }, { merge: true });
  }
  await batch.commit();
  console.log(`   ✅ ${SUPPORT_MATERIALS.length} materiais criados/atualizados`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔥  Autoavalia — Seed Completo');
  console.log('═══════════════════════════════════════════════');

  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  const uids    = await phase1_users(auth, db);
  await           phase1b_roles(auth, db, uids);
  const schoolId = await phase3_schools(db, uids);
  const { profQId } = await phase4_questionnaires(db);
  await phase5_professorResponses(auth, db, uids, schoolId, profQId);
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
  console.log(`\n  🏫  ${ESCOLAS_POA.length} escolas próprias da RME-POA`);
  console.log(`  🎓  Escola de demonstração: ${ESCOLAS_POA.find((e) => e.id === ESCOLA_DEMO_ID).name}`);
  console.log('  📊  6 respostas de professores\n');

  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message || err);
  process.exit(1);
});
