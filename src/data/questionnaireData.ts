// ── DEFINIÇÕES COMPARTILHADAS DE QUESTIONÁRIOS ───────────────────────────────
// Usadas pelo dashboard, analyticsService e firestoreService

export const DOMAIN_LABELS: Record<string, string> = {
  plan: 'Planejamento',
  amb: 'Ambiente',
  inst: 'Instrução',
  aval: 'Avaliação',
  tech: 'Tecnologia',
};

export const DOMAINS = [
  { key: 'plan', label: 'Planejamento' },
  { key: 'amb', label: 'Ambiente' },
  { key: 'inst', label: 'Instrução' },
  { key: 'aval', label: 'Avaliação' },
  { key: 'tech', label: 'Tecnologia' },
];

export const DOMAIN_QUESTION_IDS: Record<string, string[]> = {
  plan: ['p1', 'p2', 'p3', 'p4', 'p5'],
  amb:  ['a1', 'a2', 'a3', 'a4', 'a5'],
  inst: ['i1', 'i2', 'i3', 'i4', 'i5'],
  aval: ['v1', 'v2', 'v3', 'v4', 'v5'],
  tech: ['t1', 't2', 't3', 't4', 't5'],
};

export const LIKERT_LABELS = ['', 'Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'];
export const LIKERT_COLORS = ['', '#ef5350', '#ff9800', '#ffee58', '#66bb6a', '#26a69a'];

export interface QuestionDef {
  id: string;
  domain: string;
  text: string;
  type: 'scale';
  order: number;
  required: boolean;
  targetRole: string[];
}

export const PROFESSOR_QUESTIONS: QuestionDef[] = [
  // Planejamento
  { id: 'p1', domain: 'plan', text: 'Planeio minhas aulas considerando os diferentes ritmos de aprendizagem dos estudantes.', type: 'scale', order: 1, required: true, targetRole: ['professor'] },
  { id: 'p2', domain: 'plan', text: 'Defino objetivos claros de aprendizagem para cada aula.', type: 'scale', order: 2, required: true, targetRole: ['professor'] },
  { id: 'p3', domain: 'plan', text: 'Preparo materiais diversificados para atender às necessidades dos estudantes.', type: 'scale', order: 3, required: true, targetRole: ['professor'] },
  { id: 'p4', domain: 'plan', text: 'Articulo as atividades com o projeto político-pedagógico da escola.', type: 'scale', order: 4, required: true, targetRole: ['professor'] },
  { id: 'p5', domain: 'plan', text: 'Reviso e atualizo meu planejamento com base nos resultados das avaliações.', type: 'scale', order: 5, required: true, targetRole: ['professor'] },
  // Ambiente
  { id: 'a1', domain: 'amb', text: 'Promovo um ambiente de respeito e colaboração na sala de aula.', type: 'scale', order: 6, required: true, targetRole: ['professor'] },
  { id: 'a2', domain: 'amb', text: 'Estabeleço combinados claros de convivência com os estudantes.', type: 'scale', order: 7, required: true, targetRole: ['professor'] },
  { id: 'a3', domain: 'amb', text: 'Organizo o espaço físico para facilitar diferentes tipos de atividades.', type: 'scale', order: 8, required: true, targetRole: ['professor'] },
  { id: 'a4', domain: 'amb', text: 'Incentivo a participação ativa de todos os estudantes.', type: 'scale', order: 9, required: true, targetRole: ['professor'] },
  { id: 'a5', domain: 'amb', text: 'Gerencio conflitos de forma construtiva e educativa.', type: 'scale', order: 10, required: true, targetRole: ['professor'] },
  // Instrução
  { id: 'i1', domain: 'inst', text: 'Utilizo estratégias variadas de ensino para engajar os estudantes.', type: 'scale', order: 11, required: true, targetRole: ['professor'] },
  { id: 'i2', domain: 'inst', text: 'Faço conexões entre o conteúdo e a realidade dos estudantes.', type: 'scale', order: 12, required: true, targetRole: ['professor'] },
  { id: 'i3', domain: 'inst', text: 'Verifico a compreensão durante as aulas e ajusto minha prática.', type: 'scale', order: 13, required: true, targetRole: ['professor'] },
  { id: 'i4', domain: 'inst', text: 'Estimulo o pensamento crítico e a resolução de problemas.', type: 'scale', order: 14, required: true, targetRole: ['professor'] },
  { id: 'i5', domain: 'inst', text: 'Dou instruções claras e verifico se foram compreendidas pelos estudantes.', type: 'scale', order: 15, required: true, targetRole: ['professor'] },
  // Avaliação
  { id: 'v1', domain: 'aval', text: 'Utilizo diferentes instrumentos de avaliação (provas, projetos, portfólios, etc.).', type: 'scale', order: 16, required: true, targetRole: ['professor'] },
  { id: 'v2', domain: 'aval', text: 'Dou feedback formativo regular e específico para os estudantes.', type: 'scale', order: 17, required: true, targetRole: ['professor'] },
  { id: 'v3', domain: 'aval', text: 'Uso os resultados das avaliações para planejar intervenções pedagógicas.', type: 'scale', order: 18, required: true, targetRole: ['professor'] },
  { id: 'v4', domain: 'aval', text: 'Envolvo os estudantes em processos de autoavaliação.', type: 'scale', order: 19, required: true, targetRole: ['professor'] },
  { id: 'v5', domain: 'aval', text: 'Comunico claramente os critérios de avaliação antes das atividades.', type: 'scale', order: 20, required: true, targetRole: ['professor'] },
  // Tecnologia
  { id: 't1', domain: 'tech', text: 'Incorporo recursos digitais nas atividades de ensino e aprendizagem.', type: 'scale', order: 21, required: true, targetRole: ['professor'] },
  { id: 't2', domain: 'tech', text: 'Uso plataformas digitais para comunicação e acompanhamento dos estudantes.', type: 'scale', order: 22, required: true, targetRole: ['professor'] },
  { id: 't3', domain: 'tech', text: 'Oriento os estudantes sobre o uso responsável e crítico das tecnologias.', type: 'scale', order: 23, required: true, targetRole: ['professor'] },
  { id: 't4', domain: 'tech', text: 'Estou atualizado(a) sobre novas ferramentas pedagógicas digitais.', type: 'scale', order: 24, required: true, targetRole: ['professor'] },
  { id: 't5', domain: 'tech', text: 'Utilizo dados digitais para monitorar o progresso dos estudantes.', type: 'scale', order: 25, required: true, targetRole: ['professor'] },
];

export interface StudentQuestionDef {
  id: string;
  text: string;
  emoji: string;
}

export const STUDENT_QUESTIONS: StudentQuestionDef[] = [
  { id: 'e1', text: 'Meu(s) professor(es) explica(m) o conteúdo de formas diferentes quando alguém não entende.', emoji: '📚' },
  { id: 'e2', text: 'Me sinto à vontade para tirar dúvidas em sala de aula.', emoji: '🙋' },
  { id: 'e3', text: 'As aulas são organizadas e é fácil entender o que vamos aprender no dia.', emoji: '📋' },
  { id: 'e4', text: 'O(s) professor(es) me dá(m) um retorno sobre minhas atividades e provas.', emoji: '💬' },
  { id: 'e5', text: 'O ambiente da sala de aula é respeitoso — todos se tratam bem.', emoji: '🤝' },
  { id: 'e6', text: 'As atividades me fazem pensar e resolver problemas, não só copiar.', emoji: '🧠' },
  { id: 'e7', text: 'O(s) professor(es) usa(m) recursos digitais (apps, vídeos) nas aulas.', emoji: '💻' },
  { id: 'e8', text: 'Sei exatamente o que preciso fazer para ser bem avaliado(a) nas atividades.', emoji: '🎯' },
  { id: 'e9', text: 'As aulas me ajudam a conectar o que estudo com situações da vida real.', emoji: '🌍' },
  { id: 'e10', text: 'Me sinto encorajado(a) a participar e expressar minhas opiniões nas aulas.', emoji: '💡' },
];

// ── ÁREAS DE CONHECIMENTO E DISCIPLINAS PRÉ-DEFINIDAS ────────────────────────
// Baseado na BNCC e na estrutura curricular das redes municipais e estaduais

export interface SubjectOption {
  value: string;
  label: string;
  area: string;
}

export const KNOWLEDGE_AREAS = [
  { value: 'linguagens', label: 'Linguagens' },
  { value: 'matematica', label: 'Matemática' },
  { value: 'ciencias_natureza', label: 'Ciências da Natureza' },
  { value: 'ciencias_humanas', label: 'Ciências Humanas' },
  { value: 'ensino_religioso', label: 'Ensino Religioso' },
  { value: 'formacao_tecnica', label: 'Formação Técnica e Profissional' },
  { value: 'educacao_infantil', label: 'Educação Infantil (multidisciplinar)' },
  { value: 'anos_iniciais', label: 'Anos Iniciais (multidisciplinar)' },
];

export const SUBJECT_OPTIONS: SubjectOption[] = [
  // Linguagens
  { value: 'lingua_portuguesa', label: 'Língua Portuguesa', area: 'linguagens' },
  { value: 'lingua_inglesa',    label: 'Língua Inglesa',    area: 'linguagens' },
  { value: 'lingua_espanhola',  label: 'Língua Espanhola',  area: 'linguagens' },
  { value: 'arte',              label: 'Arte',              area: 'linguagens' },
  { value: 'educacao_fisica',   label: 'Educação Física',   area: 'linguagens' },
  { value: 'literatura',        label: 'Literatura',        area: 'linguagens' },
  // Matemática
  { value: 'matematica',        label: 'Matemática',        area: 'matematica' },
  // Ciências da Natureza
  { value: 'ciencias',          label: 'Ciências',          area: 'ciencias_natureza' },
  { value: 'biologia',          label: 'Biologia',          area: 'ciencias_natureza' },
  { value: 'quimica',           label: 'Química',           area: 'ciencias_natureza' },
  { value: 'fisica',            label: 'Física',            area: 'ciencias_natureza' },
  // Ciências Humanas
  { value: 'historia',          label: 'História',          area: 'ciencias_humanas' },
  { value: 'geografia',         label: 'Geografia',         area: 'ciencias_humanas' },
  { value: 'filosofia',         label: 'Filosofia',         area: 'ciencias_humanas' },
  { value: 'sociologia',        label: 'Sociologia',        area: 'ciencias_humanas' },
  // Ensino Religioso
  { value: 'ensino_religioso',  label: 'Ensino Religioso',  area: 'ensino_religioso' },
  // Formação Técnica
  { value: 'informatica',       label: 'Informática / Tecnologia', area: 'formacao_tecnica' },
  { value: 'administracao',     label: 'Administração',     area: 'formacao_tecnica' },
  { value: 'contabilidade',     label: 'Contabilidade',     area: 'formacao_tecnica' },
  { value: 'enfermagem_tec',    label: 'Enfermagem (Técnico)', area: 'formacao_tecnica' },
  { value: 'meio_ambiente',     label: 'Meio Ambiente',     area: 'formacao_tecnica' },
  // Multidisciplinar / Infantil / Anos Iniciais
  { value: 'multidisciplinar',  label: 'Multidisciplinar',  area: 'anos_iniciais' },
  { value: 'pedagogia_infantil', label: 'Pedagogia / Ed. Infantil', area: 'educacao_infantil' },
];

export const DEFAULT_SUPPORT_MATERIALS = [
  { title: 'Como utilizar a plataforma Auto Avalia', description: 'Tutorial introdutório para professores', type: 'video' as const, url: '#', targetRole: ['professor'], tags: ['tutorial', 'início'] },
  { title: 'Guia de Práticas Pedagógicas Ativas', description: 'Estratégias para engajamento em sala de aula', type: 'guide' as const, url: '#', targetRole: ['professor'], tags: ['pedagogia', 'engajamento'] },
  { title: 'Tecnologia em sala: práticas iniciais', description: 'Como incorporar ferramentas digitais no ensino', type: 'video' as const, url: '#', targetRole: ['professor'], tags: ['tecnologia'] },
  { title: 'Instrumentos de Avaliação Formativa', description: 'Portfólios, rubricas e autoavaliação na prática', type: 'document' as const, url: '#', targetRole: ['professor'], tags: ['avaliação'] },
  { title: 'Planejamento baseado em competências', description: 'Alinhamento com a BNCC e objetivos de aprendizagem', type: 'guide' as const, url: '#', targetRole: ['professor'], tags: ['planejamento', 'BNCC'] },
  { title: 'Feedback que transforma a aprendizagem', description: 'Como dar retornos efetivos aos estudantes', type: 'video' as const, url: '#', targetRole: ['professor'], tags: ['feedback', 'avaliação'] },
];
