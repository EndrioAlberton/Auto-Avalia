// ── DEFINIÇÕES COMPARTILHADAS DE QUESTIONÁRIOS ───────────────────────────────
// Usadas pelo dashboard, analyticsService e firestoreService

// Domínios TPACK de pontuação (usados em analytics e relatórios)
export const DOMAIN_LABELS: Record<string, string> = {
  tk:    'Conhecimento Tecnológico',
  pk:    'Conhecimento Pedagógico',
  ck:    'Conhecimento de Conteúdo',
  pck:   'Conhecimento Pedagógico do Conteúdo',
  tck:   'Conhecimento Tecnológico do Conteúdo',
  tpk:   'Conhecimento Tecnológico Pedagógico',
  tpack: 'TPACK',
  afr:   'Avaliação e Reflexão',
};

export const DOMAINS = [
  { key: 'tk',    label: 'Conhecimento Tecnológico' },
  { key: 'pk',    label: 'Conhecimento Pedagógico' },
  { key: 'ck',    label: 'Conhecimento de Conteúdo' },
  { key: 'pck',   label: 'Conhecimento Pedagógico do Conteúdo' },
  { key: 'tck',   label: 'Conhecimento Tecnológico do Conteúdo' },
  { key: 'tpk',   label: 'Conhecimento Tecnológico Pedagógico' },
  { key: 'tpack', label: 'TPACK' },
  { key: 'afr',   label: 'Avaliação e Reflexão' },
];

// Seções de navegação da UI (5 passos, agrupa domínios relacionados)
export const SECTIONS = [
  { key: 'ctx',       label: 'Contextualização' },
  { key: 'base',      label: 'Conhecimentos Base' },
  { key: 'intersect', label: 'Intersecções TPACK' },
  { key: 'afr',       label: 'Avaliação e Reflexão' },
  { key: 'meta',      label: 'Questões Abertas' },
];

// IDs das questões de escala por domínio TPACK (usados no cálculo de pontuações)
export const DOMAIN_QUESTION_IDS: Record<string, string[]> = {
  tk:    ['tk1', 'tk2'],
  pk:    ['pk1', 'pk2'],
  ck:    ['ck1', 'ck2'],
  pck:   ['pck1', 'pck2'],
  tck:   ['tck1', 'tck2'],
  tpk:   ['tpk1', 'tpk2'],
  tpack: ['tpack1', 'tpack2', 'tpack3', 'tpack4'],
  afr:   ['afr1', 'afr2'],
};

export const LIKERT_LABELS = ['', 'Discordo totalmente', 'Discordo parcialmente', 'Nem concordo nem discordo', 'Concordo parcialmente', 'Concordo totalmente'];
export const LIKERT_LABELS_SHORT = ['', 'Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'];
export const LIKERT_COLORS = ['', '#ef5350', '#ff9800', '#ffee58', '#66bb6a', '#26a69a'];

export type QuestionType = 'scale' | 'choice' | 'text' | 'open';

export interface QuestionDef {
  id: string;
  domain: string;   // domínio de pontuação TPACK (tk, pk, ck, pck, tck, tpk, tpack, afr, ctx, meta)
  section: string;  // agrupamento de UI (ctx, base, intersect, afr, meta)
  text: string;
  type: QuestionType;
  order: number;
  required: boolean;
  targetRole: string[];
  options?: string[];
}

export const PROFESSOR_QUESTIONS: QuestionDef[] = [
  // ── I. Contextualização e Perfil ──────────────────────────────────────────
  {
    id: 'ctx1', domain: 'ctx', section: 'ctx', order: 1, type: 'choice', required: true, targetRole: ['professor'],
    text: 'Em qual etapa de ensino você atua majoritariamente na Rede Municipal de Porto Alegre?',
    options: [
      'Educação Infantil',
      'Ensino Fundamental - Anos Iniciais',
      'Ensino Fundamental - Anos Finais',
      'Educação de Jovens e Adultos (EJA)',
      'Outro',
    ],
  },
  {
    id: 'ctx1b', domain: 'ctx', section: 'ctx', order: 2, type: 'text', required: false, targetRole: ['professor'],
    text: 'Componente curricular que você leciona:',
  },
  {
    id: 'ctx2', domain: 'ctx', section: 'ctx', order: 3, type: 'choice', required: true, targetRole: ['professor'],
    text: 'Como você avalia a disponibilidade real de equipamentos (ex: Chromebooks da SMED) e a estabilidade da internet para uso pedagógico com a turma inteira na sua escola?',
    options: [
      'Adequada e constante',
      'Intermitente/Parcial',
      'Inadequada/Obsoleta',
      'Dependo exclusivamente do celular dos alunos',
    ],
  },
  {
    id: 'ctx3', domain: 'ctx', section: 'ctx', order: 4, type: 'choice', required: true, targetRole: ['professor'],
    text: 'Qual é a principal barreira estrutural que seus alunos enfrentam para o uso de tecnologias digitais?',
    options: [
      'Falta de equipamento próprio',
      'Falta de pacote de dados/internet em casa',
      'Baixo letramento digital das famílias',
      'Nenhuma barreira significativa',
      'Outra',
    ],
  },
  {
    id: 'ctx4', domain: 'ctx', section: 'ctx', order: 5, type: 'scale', required: true, targetRole: ['professor'],
    text: 'A gestão da minha escola estimula o uso autoral e reflexivo das tecnologias digitais, oferecendo apoio prático em vez de apenas cobrar o cumprimento de metas ou o uso obrigatório de plataformas.',
  },

  // ── II. Conhecimento Tecnológico (TK) ─────────────────────────────────────
  {
    id: 'tk1', domain: 'tk', section: 'base', order: 6, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Sinto-me confortável e competente para utilizar uma variedade de ferramentas e recursos digitais (softwares, aplicativos, plataformas online) no meu dia a dia profissional e pessoal.',
  },
  {
    id: 'tk2', domain: 'tk', section: 'base', order: 7, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Busco ativamente aprender sobre novas tecnologias digitais e suas funcionalidades, mesmo que não sejam diretamente relacionadas à minha disciplina.',
  },

  // ── III. Conhecimento Pedagógico (PK) ─────────────────────────────────────
  {
    id: 'pk1', domain: 'pk', section: 'base', order: 8, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Consigo adaptar minhas estratégias pedagógicas para atender às diferentes necessidades e estilos de aprendizagem dos meus alunos.',
  },
  {
    id: 'pk2', domain: 'pk', section: 'base', order: 9, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Utilizo diferentes abordagens pedagógicas (ex: trabalho em grupo, projetos, ensino investigativo) para promover a participação ativa e o engajamento dos alunos.',
  },

  // ── IV. Conhecimento de Conteúdo (CK) ─────────────────────────────────────
  {
    id: 'ck1', domain: 'ck', section: 'base', order: 10, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Tenho um domínio aprofundado do conteúdo da(s) disciplina(s) que leciono, incluindo conceitos fundamentais, teorias e aplicações práticas.',
  },
  {
    id: 'ck2', domain: 'ck', section: 'base', order: 11, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Consigo explicar conceitos complexos da minha disciplina de diferentes maneiras, utilizando exemplos e analogias que facilitam a compreensão dos alunos.',
  },

  // ── V. Conhecimento Pedagógico do Conteúdo (PCK) ──────────────────────────
  {
    id: 'pck1', domain: 'pck', section: 'intersect', order: 12, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Seleciono e organizo o conteúdo da minha disciplina de forma a facilitar a aprendizagem dos alunos, considerando suas experiências prévias e desafios comuns.',
  },
  {
    id: 'pck2', domain: 'pck', section: 'intersect', order: 13, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Utilizo estratégias de ensino específicas que são mais eficazes para abordar os conceitos e habilidades da minha disciplina.',
  },

  // ── V. Conhecimento Tecnológico do Conteúdo (TCK) ─────────────────────────
  {
    id: 'tck1', domain: 'tck', section: 'intersect', order: 14, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Conheço e seleciono tecnologias digitais que são mais adequadas para representar e explorar os conteúdos específicos da minha disciplina (ex: simuladores para ciências, linhas do tempo interativas para história, editores colaborativos para português).',
  },
  {
    id: 'tck2', domain: 'tck', section: 'intersect', order: 15, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Entendo como as características de diferentes tecnologias digitais podem influenciar a forma como o conteúdo da minha disciplina é compreendido e trabalhado pelos alunos.',
  },

  // ── V. Conhecimento Tecnológico Pedagógico (TPK) ──────────────────────────
  {
    id: 'tpk1', domain: 'tpk', section: 'intersect', order: 16, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Utilizo tecnologias digitais para implementar estratégias pedagógicas inovadoras que promovem o engajamento, a colaboração e a personalização da aprendizagem dos alunos.',
  },
  {
    id: 'tpk2', domain: 'tpk', section: 'intersect', order: 17, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Consigo adaptar o uso de tecnologias digitais para diferentes contextos de sala de aula e para atender a diversas abordagens pedagógicas (ex: ferramentas de votação para feedback instantâneo, plataformas de discussão para debates online).',
  },

  // ── V. TPACK Completo ─────────────────────────────────────────────────────
  {
    id: 'tpack1', domain: 'tpack', section: 'intersect', order: 18, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Ao planejar minhas aulas, integro de forma coerente e significativa o conteúdo da minha disciplina, as estratégias pedagógicas e as tecnologias digitais, visando maximizar a aprendizagem dos alunos.',
  },
  {
    id: 'tpack2', domain: 'tpack', section: 'intersect', order: 19, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Sou capaz de criar e adaptar atividades de aprendizagem que utilizam tecnologias digitais para abordar conceitos específicos da minha disciplina de maneira pedagógica e eficaz, promovendo a reflexão crítica e a autonomia dos estudantes.',
  },
  {
    id: 'tpack3', domain: 'tpack', section: 'intersect', order: 20, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Utilizo as tecnologias digitais como ferramentas para fortalecer o trabalho colaborativo com outros professores da RME-POA, trocando experiências e construindo projetos pedagógicos em conjunto, evitando o isolamento profissional.',
  },
  {
    id: 'tpack4', domain: 'tpack', section: 'intersect', order: 21, type: 'scale', required: true, targetRole: ['professor'],
    text: 'As formações sobre tecnologia nas quais participo me ajudam a refletir criticamente sobre as finalidades educacionais do uso do digital, indo além do mero "treinamento técnico" para apertar botões ou usar plataformas padronizadas.',
  },

  // ── VI. Avaliação Formativa e Reflexão (AFR) ──────────────────────────────
  {
    id: 'afr1', domain: 'afr', section: 'afr', order: 22, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Utilizo ferramentas digitais para realizar avaliações formativas que me ajudam a dar feedbacks rápidos e apoiar o desenvolvimento do estudante, não permitindo que a tecnologia reduza a avaliação a um mero ranqueamento ou controle de métricas.',
  },
  {
    id: 'afr2', domain: 'afr', section: 'afr', order: 23, type: 'scale', required: true, targetRole: ['professor'],
    text: 'Utilizo os dados gerados pelas ferramentas digitais como apoio para a minha própria reflexão docente e replanejamento, e não como instrumentos de vigilância sobre a minha prática ou sobre os estudantes.',
  },

  // ── VII. Questões Abertas (opcionais) ─────────────────────────────────────
  {
    id: 'meta1', domain: 'meta', section: 'meta', order: 24, type: 'open', required: false, targetRole: ['professor'],
    text: 'Em sua opinião, a linguagem utilizada nesta avaliação está adequada à nossa realidade de rede municipal? Por favor, justifique sua resposta.',
  },
  {
    id: 'meta2', domain: 'meta', section: 'meta', order: 25, type: 'open', required: false, targetRole: ['professor'],
    text: 'Estas perguntas o(a) ajudam a refletir sobre o seu poder de decisão e autonomia no uso das tecnologias digitais em sala de aula, ou parecem uma cobrança da SMED? Por favor, justifique sua percepção.',
  },
  {
    id: 'meta3', domain: 'meta', section: 'meta', order: 26, type: 'open', required: false, targetRole: ['professor'],
    text: 'A ferramenta consegue captar bem a diferença entre "usar um Chromebook para inovar e promover a autonomia dos alunos" e "usar um Chromebook apenas para treinar para provas padronizadas ou cumprir metas"? Por favor, explique.',
  },
  {
    id: 'meta4', domain: 'meta', section: 'meta', order: 27, type: 'open', required: false, targetRole: ['professor'],
    text: 'Quais outros aspectos relacionados ao uso de tecnologias digitais em sua prática pedagógica você considera importantes e que não foram abordados nesta avaliação?',
  },
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
