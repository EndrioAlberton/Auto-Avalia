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

// Questionário de professor — TPACK / RME-POA
const PROFESSOR_QUESTIONS = [
  // I. Contextualização
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
  // II. TK
  { id:'tk1',   domain:'tk',    section:'base',      order:6,  type:'scale',  required:true,  targetRole:['professor'],
    text:'Sinto-me confortável e competente para utilizar uma variedade de ferramentas e recursos digitais (softwares, aplicativos, plataformas online) no meu dia a dia profissional e pessoal.' },
  { id:'tk2',   domain:'tk',    section:'base',      order:7,  type:'scale',  required:true,  targetRole:['professor'],
    text:'Busco ativamente aprender sobre novas tecnologias digitais e suas funcionalidades, mesmo que não sejam diretamente relacionadas à minha disciplina.' },
  // III. PK
  { id:'pk1',   domain:'pk',    section:'base',      order:8,  type:'scale',  required:true,  targetRole:['professor'],
    text:'Consigo adaptar minhas estratégias pedagógicas para atender às diferentes necessidades e estilos de aprendizagem dos meus alunos.' },
  { id:'pk2',   domain:'pk',    section:'base',      order:9,  type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo diferentes abordagens pedagógicas (ex: trabalho em grupo, projetos, ensino investigativo) para promover a participação ativa e o engajamento dos alunos.' },
  // IV. CK
  { id:'ck1',   domain:'ck',    section:'base',      order:10, type:'scale',  required:true,  targetRole:['professor'],
    text:'Tenho um domínio aprofundado do conteúdo da(s) disciplina(s) que leciono, incluindo conceitos fundamentais, teorias e aplicações práticas.' },
  { id:'ck2',   domain:'ck',    section:'base',      order:11, type:'scale',  required:true,  targetRole:['professor'],
    text:'Consigo explicar conceitos complexos da minha disciplina de diferentes maneiras, utilizando exemplos e analogias que facilitam a compreensão dos alunos.' },
  // V. PCK
  { id:'pck1',  domain:'pck',   section:'intersect', order:12, type:'scale',  required:true,  targetRole:['professor'],
    text:'Seleciono e organizo o conteúdo da minha disciplina de forma a facilitar a aprendizagem dos alunos, considerando suas experiências prévias e desafios comuns.' },
  { id:'pck2',  domain:'pck',   section:'intersect', order:13, type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo estratégias de ensino específicas que são mais eficazes para abordar os conceitos e habilidades da minha disciplina.' },
  // V. TCK
  { id:'tck1',  domain:'tck',   section:'intersect', order:14, type:'scale',  required:true,  targetRole:['professor'],
    text:'Conheço e seleciono tecnologias digitais que são mais adequadas para representar e explorar os conteúdos específicos da minha disciplina (ex: simuladores para ciências, linhas do tempo interativas para história, editores colaborativos para português).' },
  { id:'tck2',  domain:'tck',   section:'intersect', order:15, type:'scale',  required:true,  targetRole:['professor'],
    text:'Entendo como as características de diferentes tecnologias digitais podem influenciar a forma como o conteúdo da minha disciplina é compreendido e trabalhado pelos alunos.' },
  // V. TPK
  { id:'tpk1',  domain:'tpk',   section:'intersect', order:16, type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo tecnologias digitais para implementar estratégias pedagógicas inovadoras que promovem o engajamento, a colaboração e a personalização da aprendizagem dos alunos.' },
  { id:'tpk2',  domain:'tpk',   section:'intersect', order:17, type:'scale',  required:true,  targetRole:['professor'],
    text:'Consigo adaptar o uso de tecnologias digitais para diferentes contextos de sala de aula e para atender a diversas abordagens pedagógicas (ex: ferramentas de votação para feedback instantâneo, plataformas de discussão para debates online).' },
  // V. TPACK
  { id:'tpack1',domain:'tpack', section:'intersect', order:18, type:'scale',  required:true,  targetRole:['professor'],
    text:'Ao planejar minhas aulas, integro de forma coerente e significativa o conteúdo da minha disciplina, as estratégias pedagógicas e as tecnologias digitais, visando maximizar a aprendizagem dos alunos.' },
  { id:'tpack2',domain:'tpack', section:'intersect', order:19, type:'scale',  required:true,  targetRole:['professor'],
    text:'Sou capaz de criar e adaptar atividades de aprendizagem que utilizam tecnologias digitais para abordar conceitos específicos da minha disciplina de maneira pedagógica e eficaz, promovendo a reflexão crítica e a autonomia dos estudantes.' },
  { id:'tpack3',domain:'tpack', section:'intersect', order:20, type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo as tecnologias digitais como ferramentas para fortalecer o trabalho colaborativo com outros professores da RME-POA, trocando experiências e construindo projetos pedagógicos em conjunto, evitando o isolamento profissional.' },
  { id:'tpack4',domain:'tpack', section:'intersect', order:21, type:'scale',  required:true,  targetRole:['professor'],
    text:'As formações sobre tecnologia nas quais participo me ajudam a refletir criticamente sobre as finalidades educacionais do uso do digital, indo além do mero "treinamento técnico" para apertar botões ou usar plataformas padronizadas.' },
  // VI. AFR
  { id:'afr1',  domain:'afr',   section:'afr',       order:22, type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo ferramentas digitais para realizar avaliações formativas que me ajudam a dar feedbacks rápidos e apoiar o desenvolvimento do estudante, não permitindo que a tecnologia reduza a avaliação a um mero ranqueamento ou controle de métricas.' },
  { id:'afr2',  domain:'afr',   section:'afr',       order:23, type:'scale',  required:true,  targetRole:['professor'],
    text:'Utilizo os dados gerados pelas ferramentas digitais como apoio para a minha própria reflexão docente e replanejamento, e não como instrumentos de vigilância sobre a minha prática ou sobre os estudantes.' },
  // VII. Questões Abertas
  { id:'meta1', domain:'meta',  section:'meta',      order:24, type:'open',   required:false, targetRole:['professor'],
    text:'Em sua opinião, a linguagem utilizada nesta avaliação está adequada à nossa realidade de rede municipal? Por favor, justifique sua resposta.' },
  { id:'meta2', domain:'meta',  section:'meta',      order:25, type:'open',   required:false, targetRole:['professor'],
    text:'Estas perguntas o(a) ajudam a refletir sobre o seu poder de decisão e autonomia no uso das tecnologias digitais em sala de aula, ou parecem uma cobrança da SMED? Por favor, justifique sua percepção.' },
  { id:'meta3', domain:'meta',  section:'meta',      order:26, type:'open',   required:false, targetRole:['professor'],
    text:'A ferramenta consegue captar bem a diferença entre "usar um Chromebook para inovar e promover a autonomia dos alunos" e "usar um Chromebook apenas para treinar para provas padronizadas ou cumprir metas"? Por favor, explique.' },
  { id:'meta4', domain:'meta',  section:'meta',      order:27, type:'open',   required:false, targetRole:['professor'],
    text:'Quais outros aspectos relacionados ao uso de tecnologias digitais em sua prática pedagógica você considera importantes e que não foram abordados nesta avaliação?' },
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

// Respostas dos professores — novos IDs TPACK (escala 1-5)
// Ana tem 2 entradas para mostrar evolução; os demais têm 1
const PROFESSOR_RESPONSES = [
  // ── Ana Souza: resposta antiga (6 meses) — nível intermediário ───────────
  {
    email: 'professor@self.edu.br',
    monthsAgo: 6,
    answers: {
      ctx1: 'Ensino Fundamental - Anos Finais', ctx1b: 'Matemática e Física',
      ctx2: 'Intermitente/Parcial', ctx3: 'Falta de equipamento próprio', ctx4: 3,
      tk1:3, tk2:3,           // TK ≈ 3.0
      pk1:3, pk2:3,           // PK ≈ 3.0
      ck1:4, ck2:4,           // CK ≈ 4.0
      pck1:3, pck2:3,         // PCK ≈ 3.0
      tck1:2, tck2:3,         // TCK ≈ 2.5
      tpk1:3, tpk2:2,         // TPK ≈ 2.5
      tpack1:3, tpack2:3, tpack3:3, tpack4:2,  // TPACK ≈ 2.75
      afr1:3, afr2:3,         // AFR ≈ 3.0
    },
  },
  // ── Ana Souza: resposta recente (hoje) — avançado/integrador ─────────────
  {
    email: 'professor@self.edu.br',
    monthsAgo: 0,
    answers: {
      ctx1: 'Ensino Fundamental - Anos Finais', ctx1b: 'Matemática e Física',
      ctx2: 'Intermitente/Parcial', ctx3: 'Falta de equipamento próprio', ctx4: 4,
      tk1:4, tk2:4,           // TK ≈ 4.0
      pk1:5, pk2:4,           // PK ≈ 4.5
      ck1:5, ck2:5,           // CK ≈ 5.0
      pck1:4, pck2:5,         // PCK ≈ 4.5
      tck1:4, tck2:4,         // TCK ≈ 4.0
      tpk1:4, tpk2:4,         // TPK ≈ 4.0
      tpack1:4, tpack2:4, tpack3:5, tpack4:4,  // TPACK ≈ 4.25
      afr1:4, afr2:5,         // AFR ≈ 4.5
    },
  },
  // ── Bruno Costa: forte em PK/PCK, médio em TK/TCK ───────────────────────
  {
    email: 'professor2@self.edu.br',
    monthsAgo: 1,
    answers: {
      ctx1: 'Ensino Fundamental - Anos Finais', ctx1b: 'Língua Portuguesa e Literatura',
      ctx2: 'Adequada e constante', ctx3: 'Baixo letramento digital das famílias', ctx4: 4,
      tk1:3, tk2:3,           // TK ≈ 3.0
      pk1:5, pk2:5,           // PK ≈ 5.0
      ck1:5, ck2:5,           // CK ≈ 5.0
      pck1:5, pck2:5,         // PCK ≈ 5.0
      tck1:3, tck2:3,         // TCK ≈ 3.0
      tpk1:4, tpk2:3,         // TPK ≈ 3.5
      tpack1:4, tpack2:4, tpack3:4, tpack4:5,  // TPACK ≈ 4.25
      afr1:3, afr2:3,         // AFR ≈ 3.0
    },
  },
  // ── Carla Ferreira: iniciante, infraestrutura crítica ────────────────────
  {
    email: 'professor3@self.edu.br',
    monthsAgo: 2,
    answers: {
      ctx1: 'Ensino Fundamental - Anos Iniciais', ctx1b: 'Multidisciplinar',
      ctx2: 'Inadequada/Obsoleta', ctx3: 'Falta de equipamento próprio', ctx4: 2,
      tk1:2, tk2:2,           // TK ≈ 2.0
      pk1:3, pk2:3,           // PK ≈ 3.0
      ck1:4, ck2:3,           // CK ≈ 3.5
      pck1:3, pck2:3,         // PCK ≈ 3.0
      tck1:2, tck2:2,         // TCK ≈ 2.0
      tpk1:2, tpk2:2,         // TPK ≈ 2.0
      tpack1:2, tpack2:2, tpack3:2, tpack4:3,  // TPACK ≈ 2.25
      afr1:3, afr2:2,         // AFR ≈ 2.5
    },
  },
  // ── Diego Almeida: especialista em TK/TCK/TPK ────────────────────────────
  {
    email: 'professor4@self.edu.br',
    monthsAgo: 1,
    answers: {
      ctx1: 'Ensino Fundamental - Anos Finais', ctx1b: 'Informática / Tecnologia',
      ctx2: 'Adequada e constante', ctx3: 'Nenhuma barreira significativa', ctx4: 5,
      tk1:5, tk2:5,           // TK ≈ 5.0
      pk1:4, pk2:4,           // PK ≈ 4.0
      ck1:5, ck2:4,           // CK ≈ 4.5
      pck1:4, pck2:4,         // PCK ≈ 4.0
      tck1:5, tck2:5,         // TCK ≈ 5.0
      tpk1:5, tpk2:5,         // TPK ≈ 5.0
      tpack1:5, tpack2:5, tpack3:4, tpack4:4,  // TPACK ≈ 4.5
      afr1:5, afr2:4,         // AFR ≈ 4.5
    },
  },
  // ── Eduarda Lima: equilibrada, barreira de dados ─────────────────────────
  {
    email: 'professor5@self.edu.br',
    monthsAgo: 0,
    answers: {
      ctx1: 'Ensino Fundamental - Anos Finais', ctx1b: 'História e Geografia',
      ctx2: 'Intermitente/Parcial', ctx3: 'Falta de pacote de dados/internet em casa', ctx4: 3,
      tk1:4, tk2:3,           // TK ≈ 3.5
      pk1:4, pk2:4,           // PK ≈ 4.0
      ck1:4, ck2:4,           // CK ≈ 4.0
      pck1:4, pck2:4,         // PCK ≈ 4.0
      tck1:3, tck2:4,         // TCK ≈ 3.5
      tpk1:4, tpk2:3,         // TPK ≈ 3.5
      tpack1:4, tpack2:4, tpack3:4, tpack4:4,  // TPACK ≈ 4.0
      afr1:4, afr2:4,         // AFR ≈ 4.0
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
