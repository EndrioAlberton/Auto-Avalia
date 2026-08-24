// Tipos de perfil de usuário
export enum UserRole {
  PROFESSOR = 'professor',
  GESTOR = 'gestor',

  SECRETARIA = 'secretaria',
  ADMIN = 'admin'
}

// Segmentos educacionais
export enum EducationSegment {
  EDUCACAO_INFANTIL = 'educacao_infantil',
  ANOS_INICIAIS = 'anos_iniciais',
  ANOS_FINAIS = 'anos_finais',
  ENSINO_MEDIO = 'ensino_medio',
  EJA = 'eja',
  EDUCACAO_ESPECIAL = 'educacao_especial'
}

// Usuário base
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  // Campos opcionais para acesso rápido ao contexto do usuário
  schoolId?: string;
  /**
   * Escola informada à mão quando ela não está na lista da rede. Não vincula o
   * usuário a nada: quem tem só este campo fica fora dos agregados por escola,
   * até que a secretaria cadastre a escola e faça o vínculo.
   */
  schoolNameOther?: string;
  networkId?: string;
  region?: string;
  district?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Professor
export interface Professor extends User {
  role: UserRole.PROFESSOR;
  schoolId: string;
  segment: EducationSegment[];
  subjects: string[]; // Áreas de conhecimento
  classes: string[]; // Turmas
  profileCompleted: boolean;
}

// Gestor
export interface Gestor extends User {
  role: UserRole.GESTOR;
  schoolId: string;
  permissions: string[];
}

// Estudante
export interface Estudante {
  anonymousId: string;
  schoolId: string;
  segment: EducationSegment;
  grade: string; // Ano/Série
  createdAt: Date;
}

// Secretaria/Rede
export interface Secretaria extends User {
  role: UserRole.SECRETARIA;
  networkId: string;
  region?: string;
  district?: string;
  permissions: string[];
}

// Escola
export interface School {
  id: string;
  name: string;
  networkId?: string;
  region?: string;
  district?: string;
  state?: string;
  city?: string;
  segments: EducationSegment[];
  gestorId?: string;
  address?: string;
  phone?: string;
  contact?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Questionário
export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'scale' | 'text' | 'yes_no';
  options?: string[];
  domain: string; // Domínio pedagógico
  required: boolean;
  order: number;
  targetRole: UserRole[];
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  targetRole: UserRole;
  questions: Question[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Resposta
export interface Answer {
  questionId: string;
  value: string | number;
  textResponse?: string;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  userId?: string; // Opcional para respostas anônimas
  anonymousId?: string; // Para estudantes
  schoolId: string;
  networkId?: string;
  answers: Answer[];
  completedAt: Date;
  segment?: EducationSegment;
}

// Relatório
export interface Report {
  id: string;
  userId: string;
  schoolId: string;
  questionnaireId: string;
  generatedAt: Date;
  data: {
    scores: Record<string, number>; // Pontuações por domínio
    strengths: string[];
    improvements: string[];
    schoolAverage?: Record<string, number>;
    networkAverage?: Record<string, number>;
  };
}

// Dashboard Analytics
export interface SchoolAnalytics {
  schoolId: string;
  period: {
    start: Date;
    end: Date;
  };
  responseRate: {
    professors: number;
    students: number;
    total: number;
  };
  averageScores: Record<string, number>;
  segmentComparison: Record<EducationSegment, Record<string, number>>;
  topDomains: string[];
  improvementAreas: string[];
}

export interface NetworkAnalytics {
  networkId: string;
  period: {
    start: Date;
    end: Date;
  };
  schoolsCount: number;
  responseRate: number;
  regionalComparison: Record<string, Record<string, number>>;
  districtComparison: Record<string, Record<string, number>>;
  overallScores: Record<string, number>;
}

// Convite
export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  schoolId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  message?: string;
  /** Definido quando o convidado abre o app e vê o convite — indica que ele já tem conta. */
  viewedAt?: Date;
  createdAt: Date;
  expiresAt: Date;
}

// Material de apoio
export interface SupportMaterial {
  id: string;
  title: string;
  description: string;
  type: 'tutorial' | 'guide' | 'video' | 'document';
  url: string;
  targetRole: UserRole[];
  tags: string[];
  createdAt: Date;
}
