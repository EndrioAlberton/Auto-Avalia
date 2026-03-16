/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Autoavalia — Script de Seed do Firebase                              ║
 * ║                                                                  ║
 * ║  Popula o banco Firestore com os dados iniciais:                ║
 * ║    • 4 usuários genéricos (professor, gestor, secretaria,       ║
 * ║      estudante)                                                  ║
 * ║    • Questionário de professores (25 questões / 5 domínios)     ║
 * ║    • Questionário de estudantes  (10 questões)                  ║
 * ║    • Materiais de apoio padrão   (6 itens)                      ║
 * ║                                                                  ║
 * ║  Como usar:                                                      ║
 * ║    npm run seed                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
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
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// ── Configuração ──────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: 'AIzaSyDssywCZpu_bFr0IlSTAJUrbpSR0l82lF8',
  authDomain: 'ferramenteapoioensino.firebaseapp.com',
  projectId: 'ferramenteapoioensino',
  storageBucket: 'ferramenteapoioensino.firebasestorage.app',
  messagingSenderId: '984747057815',
  appId: '1:984747057815:web:e0462775e2dc3ed76dffd2',
};

// ══════════════════════════════════════════════════════════════════════════════
// USUÁRIOS GENÉRICOS
// ══════════════════════════════════════════════════════════════════════════════

const GENERIC_USERS = [
  {
    email:       'professor@self.edu.br',
    password:    'Self@2025',
    displayName: 'Prof. Ana Souza',
    role:        'professor',
    segment:     ['anos_finais', 'ensino_medio'],
    subjects:    ['matematica', 'fisica'],
    classes:     ['8º A', '9º B', '1º EM'],
    profileCompleted: true,
  },
  {
    email:       'gestor@self.edu.br',
    password:    'Self@2025',
    displayName: 'Diretor Carlos Lima',
    role:        'gestor',
    profileCompleted: true,
  },
  {
    email:       'secretaria@self.edu.br',
    password:    'Self@2025',
    displayName: 'Secretaria Técnica RME',
    role:        'secretaria',
    networkId:   'rede-padrao',
    profileCompleted: true,
  },
  {
    email:       'estudante@self.edu.br',
    password:    'Self@2025',
    displayName: 'Estudante Demo',
    role:        'estudante',
    profileCompleted: true,
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// QUESTIONÁRIOS
// ══════════════════════════════════════════════════════════════════════════════

const PROFESSOR_QUESTIONS = [
  { id: 'p1', domain: 'plan', text: 'Planeio minhas aulas considerando os diferentes ritmos de aprendizagem dos estudantes.', type: 'scale', order: 1,  required: true, targetRole: ['professor'] },
  { id: 'p2', domain: 'plan', text: 'Defino objetivos claros de aprendizagem para cada aula.', type: 'scale', order: 2,  required: true, targetRole: ['professor'] },
  { id: 'p3', domain: 'plan', text: 'Preparo materiais diversificados para atender às necessidades dos estudantes.', type: 'scale', order: 3,  required: true, targetRole: ['professor'] },
  { id: 'p4', domain: 'plan', text: 'Articulo as atividades com o projeto político-pedagógico da escola.', type: 'scale', order: 4,  required: true, targetRole: ['professor'] },
  { id: 'p5', domain: 'plan', text: 'Reviso e atualizo meu planejamento com base nos resultados das avaliações.', type: 'scale', order: 5,  required: true, targetRole: ['professor'] },
  { id: 'a1', domain: 'amb',  text: 'Promovo um ambiente de respeito e colaboração na sala de aula.', type: 'scale', order: 6,  required: true, targetRole: ['professor'] },
  { id: 'a2', domain: 'amb',  text: 'Estabeleço combinados claros de convivência com os estudantes.', type: 'scale', order: 7,  required: true, targetRole: ['professor'] },
  { id: 'a3', domain: 'amb',  text: 'Organizo o espaço físico para facilitar diferentes tipos de atividades.', type: 'scale', order: 8,  required: true, targetRole: ['professor'] },
  { id: 'a4', domain: 'amb',  text: 'Incentivo a participação ativa de todos os estudantes.', type: 'scale', order: 9,  required: true, targetRole: ['professor'] },
  { id: 'a5', domain: 'amb',  text: 'Gerencio conflitos de forma construtiva e educativa.', type: 'scale', order: 10, required: true, targetRole: ['professor'] },
  { id: 'i1', domain: 'inst', text: 'Utilizo estratégias variadas de ensino para engajar os estudantes.', type: 'scale', order: 11, required: true, targetRole: ['professor'] },
  { id: 'i2', domain: 'inst', text: 'Faço conexões entre o conteúdo e a realidade dos estudantes.', type: 'scale', order: 12, required: true, targetRole: ['professor'] },
  { id: 'i3', domain: 'inst', text: 'Verifico a compreensão durante as aulas e ajusto minha prática.', type: 'scale', order: 13, required: true, targetRole: ['professor'] },
  { id: 'i4', domain: 'inst', text: 'Estimulo o pensamento crítico e a resolução de problemas.', type: 'scale', order: 14, required: true, targetRole: ['professor'] },
  { id: 'i5', domain: 'inst', text: 'Dou instruções claras e verifico se foram compreendidas pelos estudantes.', type: 'scale', order: 15, required: true, targetRole: ['professor'] },
  { id: 'v1', domain: 'aval', text: 'Utilizo diferentes instrumentos de avaliação (provas, projetos, portfólios, etc.).', type: 'scale', order: 16, required: true, targetRole: ['professor'] },
  { id: 'v2', domain: 'aval', text: 'Dou feedback formativo regular e específico para os estudantes.', type: 'scale', order: 17, required: true, targetRole: ['professor'] },
  { id: 'v3', domain: 'aval', text: 'Uso os resultados das avaliações para planejar intervenções pedagógicas.', type: 'scale', order: 18, required: true, targetRole: ['professor'] },
  { id: 'v4', domain: 'aval', text: 'Envolvo os estudantes em processos de autoavaliação.', type: 'scale', order: 19, required: true, targetRole: ['professor'] },
  { id: 'v5', domain: 'aval', text: 'Comunico claramente os critérios de avaliação antes das atividades.', type: 'scale', order: 20, required: true, targetRole: ['professor'] },
  { id: 't1', domain: 'tech', text: 'Incorporo recursos digitais nas atividades de ensino e aprendizagem.', type: 'scale', order: 21, required: true, targetRole: ['professor'] },
  { id: 't2', domain: 'tech', text: 'Uso plataformas digitais para comunicação e acompanhamento dos estudantes.', type: 'scale', order: 22, required: true, targetRole: ['professor'] },
  { id: 't3', domain: 'tech', text: 'Oriento os estudantes sobre o uso responsável e crítico das tecnologias.', type: 'scale', order: 23, required: true, targetRole: ['professor'] },
  { id: 't4', domain: 'tech', text: 'Estou atualizado(a) sobre novas ferramentas pedagógicas digitais.', type: 'scale', order: 24, required: true, targetRole: ['professor'] },
  { id: 't5', domain: 'tech', text: 'Utilizo dados digitais para monitorar o progresso dos estudantes.', type: 'scale', order: 25, required: true, targetRole: ['professor'] },
];

const STUDENT_QUESTIONS = [
  { id: 'e1',  text: 'Meu(s) professor(es) explica(m) o conteúdo de formas diferentes quando alguém não entende.',  emoji: '📚', order: 1  },
  { id: 'e2',  text: 'Me sinto à vontade para tirar dúvidas em sala de aula.',                                        emoji: '🙋', order: 2  },
  { id: 'e3',  text: 'As aulas são organizadas e é fácil entender o que vamos aprender no dia.',                     emoji: '📋', order: 3  },
  { id: 'e4',  text: 'O(s) professor(es) me dá(m) um retorno sobre minhas atividades e provas.',                    emoji: '💬', order: 4  },
  { id: 'e5',  text: 'O ambiente da sala de aula é respeitoso — todos se tratam bem.',                               emoji: '🤝', order: 5  },
  { id: 'e6',  text: 'As atividades me fazem pensar e resolver problemas, não só copiar.',                           emoji: '🧠', order: 6  },
  { id: 'e7',  text: 'O(s) professor(es) usa(m) recursos digitais (apps, vídeos) nas aulas.',                       emoji: '💻', order: 7  },
  { id: 'e8',  text: 'Sei exatamente o que preciso fazer para ser bem avaliado(a) nas atividades.',                  emoji: '🎯', order: 8  },
  { id: 'e9',  text: 'As aulas me ajudam a conectar o que estudo com situações da vida real.',                       emoji: '🌍', order: 9  },
  { id: 'e10', text: 'Me sinto encorajado(a) a participar e expressar minhas opiniões nas aulas.',                   emoji: '💡', order: 10 },
];

const SUPPORT_MATERIALS = [
  { title: 'Como utilizar a plataforma Autoavalia',          description: 'Tutorial introdutório para professores',                        type: 'video',    url: '#', targetRole: ['professor'], tags: ['tutorial', 'início']         },
  { title: 'Guia de Práticas Pedagógicas Ativas',      description: 'Estratégias para engajamento em sala de aula',                 type: 'guide',    url: '#', targetRole: ['professor'], tags: ['pedagogia', 'engajamento']   },
  { title: 'Tecnologia em sala: práticas iniciais',    description: 'Como incorporar ferramentas digitais no ensino',               type: 'video',    url: '#', targetRole: ['professor'], tags: ['tecnologia']                  },
  { title: 'Instrumentos de Avaliação Formativa',      description: 'Portfólios, rubricas e autoavaliação na prática',              type: 'document', url: '#', targetRole: ['professor'], tags: ['avaliação']                  },
  { title: 'Planejamento baseado em competências',     description: 'Alinhamento com a BNCC e objetivos de aprendizagem',           type: 'guide',    url: '#', targetRole: ['professor'], tags: ['planejamento', 'BNCC']       },
  { title: 'Feedback que transforma a aprendizagem',   description: 'Como dar retornos efetivos aos estudantes',                    type: 'video',    url: '#', targetRole: ['professor'], tags: ['feedback', 'avaliação']      },
];

// ══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE SEED
// ══════════════════════════════════════════════════════════════════════════════

async function seedUsers(auth, db) {
  console.log('\n👥 Criando usuários genéricos...');

  for (const user of GENERIC_USERS) {
    process.stdout.write(`   • ${user.role.padEnd(10)} ${user.email} ... `);

    try {
      // Tenta criar no Firebase Auth
      let uid;
      try {
        const cred = await createUserWithEmailAndPassword(auth, user.email, user.password);
        uid = cred.user.uid;
        await updateProfile(cred.user, { displayName: user.displayName });
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          // Usuário já existe no Auth — apenas sincroniza o Firestore
          // Faz login para obter o uid
          const cred = await signInWithEmailAndPassword(auth, user.email, user.password);
          uid = cred.user.uid;
        } else {
          throw authErr;
        }
      }

      // Verifica se o documento já existe no Firestore
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log('já existe — pulando.');
        continue;
      }

      // Cria o documento no Firestore
      const { password: _p, ...userData } = user;
      await setDoc(userRef, {
        ...userData,
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ criado!');
    } catch (err) {
      console.log(`❌ erro: ${err.message}`);
    }
  }
}

async function seedQuestionnaire(db, questions, role, title, description) {
  console.log(`\n📋 Verificando questionário: ${title}...`);

  let existing;
  try {
    existing = await getDocs(
      query(collection(db, 'questionnaires'), where('targetRole', '==', role), where('active', '==', true))
    );
  } catch {
    // Fallback sem índice composto
    const all = await getDocs(collection(db, 'questionnaires'));
    const filtered = all.docs.filter(d => d.data().targetRole === role && d.data().active);
    existing = { empty: filtered.length === 0, docs: filtered };
  }

  if (!existing.empty) {
    console.log(`   ✅ Já existe (id: ${existing.docs[0].id}) — pulando.`);
    return existing.docs[0].id;
  }

  const now = new Date();
  const semLabel = now.getMonth() < 6 ? '1º Semestre' : '2º Semestre';
  const ref = doc(collection(db, 'questionnaires'));

  await setDoc(ref, {
    title: `${title} – ${semLabel} ${now.getFullYear()}`,
    description,
    targetRole: role,
    questions,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log(`   ✅ Criado com sucesso (id: ${ref.id})`);
  return ref.id;
}

async function seedSupportMaterials(db) {
  console.log('\n📚 Verificando materiais de apoio...');

  const existing = await getDocs(collection(db, 'support_materials'));
  if (!existing.empty) {
    console.log(`   ✅ Já existem ${existing.size} materiais — pulando.`);
    return;
  }

  for (const material of SUPPORT_MATERIALS) {
    const ref = doc(collection(db, 'support_materials'));
    await setDoc(ref, { ...material, createdAt: serverTimestamp() });
    console.log(`   ➕ "${material.title}"`);
  }

  console.log(`   ✅ ${SUPPORT_MATERIALS.length} materiais criados.`);
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🔥 Autoavalia — Seed do Firebase');
  console.log('══════════════════════════════════════════');
  console.log('Projeto : ferramenteapoioensino');
  console.log('Senha   : Self@2025 (todos os usuários genéricos)\n');

  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db   = getFirestore(app);

  // 1. Usuários
  await seedUsers(auth, db);

  // Autentica com secretaria para seed dos demais dados (tem permissão de escrita)
  console.log('\n🔐 Autenticando como secretaria para seed de dados...');
  await signInWithEmailAndPassword(auth, 'secretaria@self.edu.br', 'Self@2025');
  console.log('   ✅ Autenticado!');

  // 2. Questionários
  await seedQuestionnaire(
    db, PROFESSOR_QUESTIONS, 'professor',
    'Diagnóstico de Práticas Pedagógicas',
    'Autoavaliação das práticas pedagógicas por domínios: Planejamento, Ambiente, Instrução, Avaliação e Tecnologia.',
  );

  await seedQuestionnaire(
    db, STUDENT_QUESTIONS, 'estudante',
    'Percepção dos Estudantes sobre as Aulas',
    'Avaliação anônima dos estudantes sobre as práticas pedagógicas observadas em sala de aula.',
  );

  // 3. Materiais de apoio
  await seedSupportMaterials(db);

  console.log('\n══════════════════════════════════════════');
  console.log('🎉 Seed concluído!\n');
  console.log('Usuários criados:');
  console.log('  👩‍🏫 Professor  → professor@self.edu.br   / Self@2025');
  console.log('  🏫 Gestor     → gestor@self.edu.br      / Self@2025');
  console.log('  📋 Secretaria → secretaria@self.edu.br  / Self@2025');
  console.log('  🎒 Estudante  → estudante@self.edu.br   / Self@2025');
  console.log('\nAcesse o Firebase Console para verificar os dados.');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Erro inesperado:', err.message || err);
  process.exit(1);
});
