// ── DEFINIÇÕES COMPARTILHADAS DE QUESTIONÁRIOS ───────────────────────────────
// Usadas pelo dashboard, analyticsService e firestoreService

// Domínios de pontuação (usados em analytics e relatórios)
export const DOMAIN_LABELS: Record<string, string> = {
  ctx:  'Contextualização',
  ref:  'Reflexão Docente',
  aval: 'Avaliação Formativa',
};

export const DOMAINS = [
  { key: 'ctx',  label: 'Contextualização' },
  { key: 'ref',  label: 'Reflexão Docente' },
  { key: 'aval', label: 'Avaliação Formativa' },
];

// Seções do questionário (inclui meta, que é opcional/não pontuada)
export const SECTIONS = [
  { key: 'ctx',  label: 'Contextualização' },
  { key: 'ref',  label: 'Reflexão Docente' },
  { key: 'aval', label: 'Avaliação Formativa' },
  { key: 'meta', label: 'Questões Finais' },
];

// IDs das questões de escala por domínio (usados no cálculo de pontuações)
export const DOMAIN_QUESTION_IDS: Record<string, string[]> = {
  ctx:  ['ctx4'],
  ref:  ['ref1', 'ref2', 'ref3', 'ref4', 'ref5', 'ref6'],
  aval: ['av1', 'av2'],
};

export const LIKERT_LABELS = ['', 'Discordo totalmente', 'Discordo parcialmente', 'Nem concordo nem discordo', 'Concordo parcialmente', 'Concordo totalmente'];
export const LIKERT_LABELS_SHORT = ['', 'Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'];
export const LIKERT_COLORS = ['', '#ef5350', '#ff9800', '#ffee58', '#66bb6a', '#26a69a'];

export type QuestionType = 'scale' | 'choice' | 'text' | 'open';

export interface QuestionDef {
  id: string;
  domain: string;
  text: string;
  type: QuestionType;
  order: number;
  required: boolean;
  targetRole: string[];
  options?: string[];
}

export const PROFESSOR_QUESTIONS: QuestionDef[] = [
  // ── Seção 1: Contextualização da RME-POA ─────────────────────────────────
  {
    id: 'ctx1', domain: 'ctx', order: 1, type: 'text', required: true, targetRole: ['professor'],
    text: 'Em qual etapa de ensino e componente curricular você atua majoritariamente na Rede Municipal de Porto Alegre?',
  },
  {
    id: 'ctx2', domain: 'ctx', order: 2, type: 'choice', required: true, targetRole: ['professor'],
    text: 'Como você avalia a disponibilidade real de equipamentos (ex: Chromebooks da SMED) e a estabilidade da internet para uso pedagógico com a turma inteira na sua escola?',
    options: [
      'Adequada e constante',
      'Intermitente/Parcial',
      'Inadequada/Obsoleta',
      'Dependo exclusivamente do celular dos alunos',
    ],
  },
  {
    id: 'ctx3', domain: 'ctx', order: 3, type: 'choice', required: true, targetRole: ['professor'],
    text: 'Qual é a principal barreira estrutural que seus alunos enfrentam para o uso de tecnologias digitais?',
    options: [
      'Falta de equipamento próprio',
      'Falta de pacote de dados/internet em casa',
      'Baixo letramento digital das famílias',
      'Nenhuma barreira significativa',
    ],
  },
  {
    id: 'ctx4', domain: 'ctx', order: 4, type: 'scale', required: true, targetRole: ['professor'],
    text: 'A gestão da minha escola estimula o uso autoral e reflexivo das tecnologias digitais, oferecendo apoio prático em vez de apenas cobrar o cumprimento de metas ou o uso obrigatório de plataformas.',
  },

  // ── Seção 2: Reflexão Docente ─────────────────────────────────────────────
  {
    id: 'ref1', domain: 'ref', order: 5, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Utilizo as tecnologias digitais como ferramentas para fortalecer o trabalho colaborativo com outros professores da RME-POA, trocando experiências e construindo projetos pedagógicos em conjunto, evitando o isolamento profissional.',
  },
  {
    id: 'ref2', domain: 'ref', order: 6, type: 'scale', required: true, targetRole: ['professor'],
    text: 'As formações sobre tecnologia nas quais participo me ajudam a refletir criticamente sobre as finalidades educacionais do uso do digital, indo além do mero "treinamento técnico" para apertar botões ou usar plataformas padronizadas.',
  },
  {
    id: 'ref3', domain: 'ref', order: 7, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Sinto que possuo autonomia profissional para decidir quando e como integrar as tecnologias digitais no meu planejamento, adequando-as à realidade dos meus alunos, sem me sentir pressionado por lógicas de controle externo.',
  },
  {
    id: 'ref4', domain: 'ref', order: 8, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Ao planejar minhas aulas com tecnologias, considero ativamente as vulnerabilidades sociais da minha turma, selecionando recursos acessíveis (leves ou offline) e sempre prevendo alternativas pedagógicas caso a internet da escola falhe.',
  },
  {
    id: 'ref5', domain: 'ref', order: 9, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Nas minhas aulas, as tecnologias são utilizadas pelos estudantes de forma ativa (para pesquisar, criar projetos, debater o mundo), superando o uso da tecnologia apenas para a "transmissão" passiva de conteúdos ou adestramento comportamental.',
  },
  {
    id: 'ref6', domain: 'ref', order: 10, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Promovo debates críticos com os alunos sobre o mundo digital, abordando temas como privacidade de dados, algoritmos, fake news e segurança online, ajudando-os a resistir à lógica de consumo e controle das grandes plataformas tecnológicas.',
  },

  // ── Seção 3: Avaliação Formativa ──────────────────────────────────────────
  {
    id: 'av1', domain: 'aval', order: 11, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Utilizo ferramentas digitais para realizar avaliações formativas que me ajudam a dar feedbacks rápidos e apoiar o desenvolvimento do estudante, não permitindo que a tecnologia reduza a avaliação a um mero ranqueamento ou controle de métricas.',
  },
  {
    id: 'av2', domain: 'aval', order: 12, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Utilizo os dados gerados pelas ferramentas digitais como apoio para a minha própria reflexão docente e replanejamento, e não como instrumentos de vigilância sobre a minha prática ou sobre os estudantes.',
  },

  // ── Seção 4: Questões de Ajuste (opcionais) ───────────────────────────────
  {
    id: 'meta1', domain: 'meta', order: 13, type: 'open', required: false, targetRole: ['professor'],
    text: 'A linguagem está adequada à nossa realidade de rede municipal? Deixe seu comentário.',
  },
  {
    id: 'meta2', domain: 'meta', order: 14, type: 'open', required: false, targetRole: ['professor'],
    text: 'Estas perguntas nos ajudam a refletir sobre o nosso poder de decisão, ou parecem uma cobrança da SMED? Compartilhe sua percepção.',
  },
  {
    id: 'meta3', domain: 'meta', order: 15, type: 'open', required: false, targetRole: ['professor'],
    text: 'A ferramenta capta bem a diferença entre "usar um Chromebook para inovar" e "usar um Chromebook para treinar para provas padronizadas"? O que poderia ser melhorado?',
  },
];

export interface StudentQuestionDef {
  id: string;
  text: string;
  emoji: string;
}

export const STUDENT_QUESTIONS: StudentQuestionDef[] = [
  { id: 'e1',  text: 'Meu(s) professor(es) explica(m) o conteúdo de formas diferentes quando alguém não entende.', emoji: '📚' },
  { id: 'e2',  text: 'Me sinto à vontade para tirar dúvidas em sala de aula.', emoji: '🙋' },
  { id: 'e3',  text: 'As aulas são organizadas e é fácil entender o que vamos aprender no dia.', emoji: '📋' },
  { id: 'e4',  text: 'O(s) professor(es) me dá(m) um retorno sobre minhas atividades e provas.', emoji: '💬' },
  { id: 'e5',  text: 'O ambiente da sala de aula é respeitoso — todos se tratam bem.', emoji: '🤝' },
  { id: 'e6',  text: 'As atividades me fazem pensar e resolver problemas, não só copiar.', emoji: '🧠' },
  { id: 'e7',  text: 'O(s) professor(es) usa(m) recursos digitais (apps, vídeos) nas aulas.', emoji: '💻' },
  { id: 'e8',  text: 'Sei exatamente o que preciso fazer para ser bem avaliado(a) nas atividades.', emoji: '🎯' },
  { id: 'e9',  text: 'As aulas me ajudam a conectar o que estudo com situações da vida real.', emoji: '🌍' },
  { id: 'e10', text: 'Me sinto encorajado(a) a participar e expressar minhas opiniões nas aulas.', emoji: '💡' },
];

// ── ÁREAS DE CONHECIMENTO E DISCIPLINAS PRÉ-DEFINIDAS ────────────────────────

export interface SubjectOption {
  value: string;
  label: string;
  area: string;
}

export const KNOWLEDGE_AREAS = [
  { value: 'linguagens',        label: 'Linguagens' },
  { value: 'matematica',        label: 'Matemática' },
  { value: 'ciencias_natureza', label: 'Ciências da Natureza' },
  { value: 'ciencias_humanas',  label: 'Ciências Humanas' },
  { value: 'ensino_religioso',  label: 'Ensino Religioso' },
  { value: 'formacao_tecnica',  label: 'Formação Técnica e Profissional' },
  { value: 'educacao_infantil', label: 'Educação Infantil (multidisciplinar)' },
  { value: 'anos_iniciais',     label: 'Anos Iniciais (multidisciplinar)' },
];

export const SUBJECT_OPTIONS: SubjectOption[] = [
  { value: 'lingua_portuguesa',  label: 'Língua Portuguesa',          area: 'linguagens' },
  { value: 'lingua_inglesa',     label: 'Língua Inglesa',             area: 'linguagens' },
  { value: 'lingua_espanhola',   label: 'Língua Espanhola',           area: 'linguagens' },
  { value: 'arte',               label: 'Arte',                       area: 'linguagens' },
  { value: 'educacao_fisica',    label: 'Educação Física',            area: 'linguagens' },
  { value: 'literatura',         label: 'Literatura',                 area: 'linguagens' },
  { value: 'matematica',         label: 'Matemática',                 area: 'matematica' },
  { value: 'ciencias',           label: 'Ciências',                   area: 'ciencias_natureza' },
  { value: 'biologia',           label: 'Biologia',                   area: 'ciencias_natureza' },
  { value: 'quimica',            label: 'Química',                    area: 'ciencias_natureza' },
  { value: 'fisica',             label: 'Física',                     area: 'ciencias_natureza' },
  { value: 'historia',           label: 'História',                   area: 'ciencias_humanas' },
  { value: 'geografia',          label: 'Geografia',                  area: 'ciencias_humanas' },
  { value: 'filosofia',          label: 'Filosofia',                  area: 'ciencias_humanas' },
  { value: 'sociologia',         label: 'Sociologia',                 area: 'ciencias_humanas' },
  { value: 'ensino_religioso',   label: 'Ensino Religioso',           area: 'ensino_religioso' },
  { value: 'informatica',        label: 'Informática / Tecnologia',   area: 'formacao_tecnica' },
  { value: 'administracao',      label: 'Administração',              area: 'formacao_tecnica' },
  { value: 'contabilidade',      label: 'Contabilidade',              area: 'formacao_tecnica' },
  { value: 'enfermagem_tec',     label: 'Enfermagem (Técnico)',       area: 'formacao_tecnica' },
  { value: 'meio_ambiente',      label: 'Meio Ambiente',              area: 'formacao_tecnica' },
  { value: 'multidisciplinar',   label: 'Multidisciplinar',           area: 'anos_iniciais' },
  { value: 'pedagogia_infantil', label: 'Pedagogia / Ed. Infantil',   area: 'educacao_infantil' },
];

export const DEFAULT_SUPPORT_MATERIALS = [
  { title: 'Como utilizar a plataforma Auto Avalia',  description: 'Tutorial introdutório para professores',               type: 'video'    as const, url: '#', targetRole: ['professor'], tags: ['tutorial', 'início'] },
  { title: 'Guia de Práticas Pedagógicas Ativas',    description: 'Estratégias para engajamento em sala de aula',         type: 'guide'    as const, url: '#', targetRole: ['professor'], tags: ['pedagogia', 'engajamento'] },
  { title: 'Tecnologia em sala: práticas iniciais',  description: 'Como incorporar ferramentas digitais no ensino',        type: 'video'    as const, url: '#', targetRole: ['professor'], tags: ['tecnologia'] },
  { title: 'Instrumentos de Avaliação Formativa',    description: 'Portfólios, rubricas e autoavaliação na prática',      type: 'document' as const, url: '#', targetRole: ['professor'], tags: ['avaliação'] },
  { title: 'Planejamento baseado em competências',   description: 'Alinhamento com a BNCC e objetivos de aprendizagem',   type: 'guide'    as const, url: '#', targetRole: ['professor'], tags: ['planejamento', 'BNCC'] },
  { title: 'Feedback que transforma a aprendizagem', description: 'Como dar retornos efetivos aos estudantes',            type: 'video'    as const, url: '#', targetRole: ['professor'], tags: ['feedback', 'avaliação'] },
];
