import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type {
  School,
  Questionnaire,
  QuestionnaireResponse,
  Report,
  Invitation,
  SupportMaterial,
  User} from '../types';
import {
  UserRole
} from '../types';
import { PROFESSOR_QUESTIONS, DEFAULT_SUPPORT_MATERIALS } from '../data/questionnaireData';

// ── Utilitário: remove campos undefined antes de salvar no Firestore ──────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripUndefined = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

// ══════════════════════════════════════════════════════════════════════════════
// ESCOLAS
// ══════════════════════════════════════════════════════════════════════════════

export const createSchool = async (
  schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> => {
  const ref = doc(collection(db, 'schools'));
  await setDoc(ref, stripUndefined({ ...schoolData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  return ref.id;
};

export const getSchool = async (schoolId: string): Promise<School> => {
  const snap = await getDoc(doc(db, 'schools', schoolId));
  if (!snap.exists()) throw new Error('Escola não encontrada');
  return { id: snap.id, ...snap.data() } as School;
};

export const updateSchool = async (schoolId: string, data: Partial<School>): Promise<void> => {
  await updateDoc(doc(db, 'schools', schoolId), { ...data, updatedAt: serverTimestamp() });
};

export const deleteSchool = async (schoolId: string): Promise<void> => {
  await deleteDoc(doc(db, 'schools', schoolId));
};

/** Retorna todas as escolas da rede (networkId opcional) */
export const getAllSchools = async (networkId?: string): Promise<School[]> => {
  const ref = collection(db, 'schools');
  const q = networkId
    ? query(ref, where('networkId', '==', networkId))
    : query(ref, orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as School));
};

export const getSchoolsByNetwork = async (networkId: string): Promise<School[]> => {
  const q = query(collection(db, 'schools'), where('networkId', '==', networkId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as School));
};

// ══════════════════════════════════════════════════════════════════════════════
// USUÁRIOS
// ══════════════════════════════════════════════════════════════════════════════

export const getUserData = async (uid: string): Promise<User> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) throw new Error('Usuário não encontrado');
  return snap.data() as User;
};

export const updateUserProfile = async (uid: string, data: Partial<User>): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
};

/** Retorna usuários de uma escola, com filtro opcional de role */
export const getUsersBySchool = async (schoolId: string, role?: UserRole): Promise<User[]> => {
  const ref = collection(db, 'users');
  const q = role
    ? query(ref, where('schoolId', '==', schoolId), where('role', '==', role))
    : query(ref, where('schoolId', '==', schoolId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as User);
};

/** Retorna professores de uma escola */
export const getTeachersBySchool = async (schoolId: string): Promise<User[]> =>
  getUsersBySchool(schoolId, UserRole.PROFESSOR);

/** Retorna todos os usuários da rede (para secretaria) */
export const getAllUsers = async (networkId?: string): Promise<User[]> => {
  const ref = collection(db, 'users');
  if (networkId) {
    const snap = await getDocs(query(ref, where('networkId', '==', networkId)));
    const users = snap.docs.map(d => d.data() as User);
    if (users.length === 0) {
      const allSnap = await getDocs(query(ref, orderBy('displayName')));
      return allSnap.docs.map(d => d.data() as User);
    }
    // Se não houver professores/gestores com networkId mas houver secretarias,
    // voltar para lista completa para garantir visibilidade de todos os perfis.
    const hasStaff = users.some(u => u.role === UserRole.PROFESSOR || u.role === UserRole.GESTOR);
    if (!hasStaff) {
      const allSnap = await getDocs(query(ref, orderBy('displayName')));
      return allSnap.docs.map(d => d.data() as User);
    }
    return users;
  }
  const allSnap = await getDocs(query(ref, orderBy('displayName')));
  return allSnap.docs.map(d => d.data() as User);
};

/** Retorna usuários por role (para secretaria) */
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const q = query(collection(db, 'users'), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as User);
};

// ══════════════════════════════════════════════════════════════════════════════
// QUESTIONÁRIOS
// ══════════════════════════════════════════════════════════════════════════════

export const createQuestionnaire = async (
  data: Omit<Questionnaire, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> => {
  const ref = doc(collection(db, 'questionnaires'));
  await setDoc(ref, stripUndefined({ ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  return ref.id;
};

export const getQuestionnaire = async (id: string): Promise<Questionnaire> => {
  const snap = await getDoc(doc(db, 'questionnaires', id));
  if (!snap.exists()) throw new Error('Questionário não encontrado');
  return { id: snap.id, ...snap.data() } as Questionnaire;
};

export const updateQuestionnaire = async (id: string, data: Partial<Questionnaire>): Promise<void> => {
  await updateDoc(doc(db, 'questionnaires', id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteQuestionnaire = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'questionnaires', id));
};

export const getAllQuestionnaires = async (): Promise<Questionnaire[]> => {
  const snap = await getDocs(collection(db, 'questionnaires'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Questionnaire));
};

export const getActiveQuestionnaires = async (role: UserRole): Promise<Questionnaire[]> => {
  try {
    // Query composta — exige índice composto no Firestore
    const q = query(
      collection(db, 'questionnaires'),
      where('active', '==', true),
      where('targetRole', '==', role),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Questionnaire));
  } catch {
    // Fallback: busca todos e filtra em memória (índice ainda não publicado)
    const snap = await getDocs(collection(db, 'questionnaires'));
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Questionnaire))
      .filter(q => q.active && q.targetRole === role);
  }
};

/**
 * Retorna o questionário ativo para um perfil.
 * Se não existir, cria automaticamente o questionário padrão (seed).
 */
export const getOrSeedQuestionnaire = async (role: UserRole): Promise<Questionnaire> => {
  const active = await getActiveQuestionnaires(role);
  if (active.length > 0) return active[0];

  // Não existe — cria o questionário padrão
  const now = new Date();
  const semLabel = now.getMonth() < 6 ? '1º Semestre' : '2º Semestre';
  const defaultData: Omit<Questionnaire, 'id' | 'createdAt' | 'updatedAt'> = {
    title: `Diagnóstico de Práticas Pedagógicas – ${semLabel} ${now.getFullYear()}`,
    description: 'Autoavaliação das práticas pedagógicas por domínios: Planejamento, Ambiente, Instrução, Avaliação e Tecnologia.',
    targetRole: role,
    questions: (PROFESSOR_QUESTIONS as any[]).map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      domain: q.domain,
      required: q.required,
      order: q.order,
      targetRole: q.targetRole,
    })),
    active: true,
  };
  const id = await createQuestionnaire(defaultData);
  return { id, ...defaultData, createdAt: new Date(), updatedAt: new Date() };
};

// ══════════════════════════════════════════════════════════════════════════════
// RESPOSTAS (PROFESSORES — autenticadas)
// ══════════════════════════════════════════════════════════════════════════════

export const submitResponse = async (
  data: Omit<QuestionnaireResponse, 'id' | 'completedAt'>,
): Promise<string> => {
  const ref = doc(collection(db, 'responses'));
  await setDoc(ref, stripUndefined({ ...data, completedAt: serverTimestamp() }));
  return ref.id;
};

const sortByCompletedAtDesc = (docs: QuestionnaireResponse[]) =>
  docs.sort((a, b) => {
    const ta = (a.completedAt as any)?.seconds ?? 0;
    const tb = (b.completedAt as any)?.seconds ?? 0;
    return tb - ta;
  });

export const getUserResponses = async (userId: string): Promise<QuestionnaireResponse[]> => {
  try {
    const q = query(
      collection(db, 'responses'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionnaireResponse));
  } catch {
    // Fallback: busca sem orderBy (evita erro de índice ainda em construção)
    const q = query(collection(db, 'responses'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return sortByCompletedAtDesc(
      snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionnaireResponse))
    );
  }
};

export const getSchoolResponses = async (schoolId: string): Promise<QuestionnaireResponse[]> => {
  try {
    const q = query(
      collection(db, 'responses'),
      where('schoolId', '==', schoolId),
      orderBy('completedAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionnaireResponse));
  } catch {
    // Fallback: busca sem orderBy
    const q = query(collection(db, 'responses'), where('schoolId', '==', schoolId));
    const snap = await getDocs(q);
    return sortByCompletedAtDesc(
      snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionnaireResponse))
    );
  }
};

/** Respostas de uma escola para um questionário específico */
export const getSchoolResponsesByQuestionnaire = async (
  schoolId: string,
  questionnaireId: string,
): Promise<QuestionnaireResponse[]> => {
  const q = query(
    collection(db, 'responses'),
    where('schoolId', '==', schoolId),
    where('questionnaireId', '==', questionnaireId),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionnaireResponse));
};

/** Verifica se um usuário já respondeu um questionário */
export const getUserLatestResponse = async (
  userId: string,
  questionnaireId: string,
): Promise<QuestionnaireResponse | null> => {
  try {
    const q = query(
      collection(db, 'responses'),
      where('userId', '==', userId),
      where('questionnaireId', '==', questionnaireId),
      orderBy('completedAt', 'desc'),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as QuestionnaireResponse;
  } catch {
    // Fallback sem orderBy
    const q = query(
      collection(db, 'responses'),
      where('userId', '==', userId),
      where('questionnaireId', '==', questionnaireId),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docs = sortByCompletedAtDesc(
      snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionnaireResponse))
    );
    return docs[0] ?? null;
  }
};

/** Respostas de toda a rede (networkId) */
export const getNetworkResponses = async (networkId: string): Promise<QuestionnaireResponse[]> => {
  const q = query(collection(db, 'responses'), where('networkId', '==', networkId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionnaireResponse));
};


// ══════════════════════════════════════════════════════════════════════════════
// CONVITES
// ══════════════════════════════════════════════════════════════════════════════

export const createInvitation = async (
  data: Omit<Invitation, 'id' | 'createdAt' | 'expiresAt' | 'token' | 'status'>,
): Promise<string> => {
  const ref = doc(collection(db, 'invitations'));
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await setDoc(ref, stripUndefined({
    ...data,
    token,
    status: 'pending',
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  }));
  return ref.id;
};

export const getSchoolInvitations = async (schoolId: string): Promise<Invitation[]> => {
  const q = query(
    collection(db, 'invitations'),
    where('schoolId', '==', schoolId),
    where('status', '==', 'pending'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Invitation));
};

export const updateInvitation = async (id: string, data: Partial<Invitation>): Promise<void> => {
  await updateDoc(doc(db, 'invitations', id), data);
};

export const deleteInvitation = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'invitations', id));
};

export const getInvitationByToken = async (token: string): Promise<Invitation | null> => {
  const q = query(
    collection(db, 'invitations'),
    where('token', '==', token),
    where('status', '==', 'pending'),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Invitation;
};

export const acceptInvitation = async (id: string): Promise<void> => {
  await updateDoc(doc(db, 'invitations', id), { status: 'accepted' });
};

/** Convites pendentes para um e-mail específico (para o professor ver na home) */
export const getPendingInvitationsByEmail = async (email: string): Promise<Invitation[]> => {
  try {
    const q = query(
      collection(db, 'invitations'),
      where('email', '==', email),
      where('status', '==', 'pending'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Invitation));
  } catch {
    // Fallback sem índice composto
    const snap = await getDocs(collection(db, 'invitations'));
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Invitation))
      .filter(i => i.email === email && i.status === 'pending');
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// MATERIAIS DE APOIO
// ══════════════════════════════════════════════════════════════════════════════

export const getSupportMaterials = async (role: UserRole): Promise<SupportMaterial[]> => {
  const q = query(
    collection(db, 'support_materials'),
    where('targetRole', 'array-contains', role),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportMaterial));
};

export const createSupportMaterial = async (
  data: Omit<SupportMaterial, 'id' | 'createdAt'>,
): Promise<string> => {
  const ref = doc(collection(db, 'support_materials'));
  await setDoc(ref, stripUndefined({ ...data, createdAt: serverTimestamp() }));
  return ref.id;
};

export const deleteSupportMaterial = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'support_materials', id));
};

/**
 * Garante que existam materiais de apoio padrão no Firestore.
 * Chamado na primeira visita à página de Ajuda.
 */
export const seedDefaultSupportMaterials = async (): Promise<void> => {
  const existing = await getDocs(collection(db, 'support_materials'));
  if (!existing.empty) return; // já existem materiais

  const batch = DEFAULT_SUPPORT_MATERIALS.map(m => createSupportMaterial(m as any));
  await Promise.all(batch);
};

// ══════════════════════════════════════════════════════════════════════════════
// RELATÓRIOS
// ══════════════════════════════════════════════════════════════════════════════

export const generateReport = async (data: Omit<Report, 'id'>): Promise<string> => {
  const ref = doc(collection(db, 'reports'));
  await setDoc(ref, data);
  return ref.id;
};

export const getUserReports = async (userId: string): Promise<Report[]> => {
  const q = query(
    collection(db, 'reports'),
    where('userId', '==', userId),
    orderBy('generatedAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Report));
};

// ══════════════════════════════════════════════════════════════════════════════
// ESTATÍSTICAS RÁPIDAS
// ══════════════════════════════════════════════════════════════════════════════

/** Retorna taxa de resposta de uma escola: { responded, total, rate } */
export const getSchoolResponseRate = async (
  schoolId: string,
  questionnaireId: string,
): Promise<{ responded: number; total: number; rate: number }> => {
  const [teachers, responses] = await Promise.all([
    getTeachersBySchool(schoolId),
    getSchoolResponsesByQuestionnaire(schoolId, questionnaireId),
  ]);
  const respondedIds = new Set(responses.map(r => r.userId));
  const responded = teachers.filter(t => respondedIds.has(t.uid)).length;
  const total = teachers.length;
  return { responded, total, rate: total > 0 ? Math.round((responded / total) * 100) : 0 };
};
