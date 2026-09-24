# Arquitetura do Projeto Autoavalia

## 📐 Visão Geral da Arquitetura

O projeto Autoavalia utiliza uma arquitetura moderna baseada em:
- **Frontend**: React 18 + TypeScript
- **Backend**: Firebase (BaaS - Backend as a Service)
- **Autenticação**: Firebase Authentication
- **Banco de Dados**: Cloud Firestore (NoSQL)
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting

## 🏗️ Estrutura de Diretórios

```
novoprojeto/
├── public/                 # Arquivos públicos estáticos
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── common/       # Componentes genéricos (Button, Card, etc)
│   │   ├── forms/        # Componentes de formulário
│   │   ├── charts/       # Componentes de gráficos
│   │   └── layout/       # Componentes de layout (Header, Sidebar, etc)
│   │
│   ├── pages/            # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Professor/    # Páginas do professor
│   │   │   └── Dashboard.tsx
│   │   ├── Gestor/       # Páginas do gestor
│   │   │   └── Dashboard.tsx
│   │   ├── Estudante/    # Páginas do estudante
│   │   │   └── Dashboard.tsx
│   │   └── Secretaria/   # Páginas da secretaria
│   │       └── Dashboard.tsx
│   │
│   ├── contexts/         # Contextos React (Estado global)
│   │   ├── AuthContext.tsx
│   │   ├── SchoolContext.tsx
│   │   └── QuestionnaireContext.tsx
│   │
│   ├── services/         # Serviços e lógica de negócio
│   │   ├── authService.ts
│   │   ├── firestoreService.ts
│   │   ├── storageService.ts
│   │   └── analyticsService.ts
│   │
│   ├── types/            # Definições TypeScript
│   │   └── index.ts
│   │
│   ├── utils/            # Funções utilitárias
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── exporters.ts
│   │
│   ├── hooks/            # Custom Hooks
│   │   ├── useSchool.ts
│   │   ├── useQuestionnaire.ts
│   │   └── useReport.ts
│   │
│   ├── firebaseConfig.ts # Configuração do Firebase
│   ├── theme.ts          # Tema Material-UI
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Ponto de entrada
│   └── reset.css         # Reset CSS
│
├── firebase.json          # Configuração Firebase Hosting
├── firestore.rules        # Regras de segurança Firestore
├── firestore.indexes.json # Índices do Firestore
├── package.json           # Dependências do projeto
├── tsconfig.json          # Configuração TypeScript
├── vite.config.ts         # Configuração Vite
└── README.md             # Documentação principal
```

## 🔄 Fluxo de Dados

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  React Components   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   React Contexts    │ ◄──── Estado Global
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Services        │ ◄──── Lógica de Negócio
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Firebase Services  │
│  (Auth, Firestore,  │
│   Storage, etc)     │
└─────────────────────┘
```

## 🎯 Padrões de Design Utilizados

### 1. **Context API Pattern**
- Gerenciamento de estado global
- Evita prop drilling
- Contextos: Auth, School, Questionnaire

### 2. **Service Layer Pattern**
- Separação da lógica de negócio
- Facilita testes
- Reutilização de código

### 3. **Component Composition**
- Componentes pequenos e reutilizáveis
- Single Responsibility Principle
- Facilita manutenção

### 4. **Protected Routes**
- Controle de acesso baseado em roles
- Redirecionamento automático
- Segurança em nível de frontend

## 🔐 Modelo de Segurança

### Firestore Security Rules

```
Usuário Autenticado
    │
    ├─► PROFESSOR
    │   ├─ Ler: Próprios dados e dados da escola
    │   ├─ Escrever: Próprias respostas e perfil
    │   └─ Não pode: Acessar dados de outros professores
    │
    ├─► GESTOR
    │   ├─ Ler: Dados da escola e usuários da escola
    │   ├─ Escrever: Configurações da escola, convites
    │   └─ Não pode: Acessar outras escolas
    │
    ├─► ESTUDANTE
    │   ├─ Ler: Apenas questionários ativos
    │   ├─ Escrever: Respostas anônimas
    │   └─ Não pode: Acessar relatórios
    │
    └─► SECRETARIA/ADMIN
        ├─ Ler: Todas as escolas da rede
        ├─ Escrever: Escolas, questionários, configurações
        └─ Pode: Gerenciar todo o sistema
```

## 📊 Modelo de Dados (Firestore)

### Collections Principais

```
firestore/
├── users/                    # Usuários do sistema
│   └── {userId}
│       ├── uid
│       ├── email
│       ├── displayName
│       ├── role
│       ├── schoolId
│       └── ...
│
├── schools/                  # Escolas
│   └── {schoolId}
│       ├── name
│       ├── networkId
│       ├── region
│       ├── segments
│       └── ...
│
├── questionnaires/           # Questionários
│   └── {questionnaireId}
│       ├── title
│       ├── targetRole
│       ├── questions[]
│       └── ...
│
├── responses/                # Respostas identificadas
│   └── {responseId}
│       ├── userId
│       ├── questionnaireId
│       ├── schoolId
│       ├── answers[]
│       └── ...
│
├── reports/                  # Relatórios gerados
│   └── {reportId}
│       ├── userId
│       ├── schoolId
│       ├── data{}
│       └── ...
│
├── invitations/              # Convites
│   └── {invitationId}
│       ├── email
│       ├── role
│       ├── schoolId
│       ├── token
│       └── ...
│
└── support_materials/        # Materiais de apoio
    └── {materialId}
        ├── title
        ├── type
        ├── url
        └── ...
```

## 🚀 Fluxo de Autenticação

```
1. Usuário acessa /login
   │
   ▼
2. Preenche credenciais
   │
   ▼
3. Firebase Authentication valida
   │
   ▼
4. AuthContext atualiza currentUser
   │
   ▼
5. App.tsx verifica role
   │
   ▼
6. Redireciona para dashboard específico
   (professor, gestor, estudante, secretaria)
```

## 📱 Fluxo de Questionário (Professor)

```
1. Professor acessa /professor/questionarios
   │
   ▼
2. Lista questionários ativos (getActiveQuestionnaires)
   │
   ▼
3. Seleciona e responde questionário
   │
   ▼
4. Salva respostas (submitResponse)
   │
   ▼
5. Sistema gera relatório (generateReport)
   │
   ▼
6. Professor visualiza em /professor/relatorios
```

## 📈 Fluxo de Relatórios (Gestor)

```
1. Gestor acessa /gestor/relatorios
   │
   ▼
2. Sistema busca respostas da escola (getSchoolResponses)
   │
   ▼
3. Agrega dados por segmento/domínio
   │
   ▼
4. Gera visualizações (gráficos)
   │
   ▼
5. Permite exportação (PDF/CSV)
```

## 🔧 Tecnologias e Bibliotecas

### Core
- **React 18**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Vite**: Build tool

### UI/UX
- **Material-UI (MUI)**: Componentes UI
- **Emotion**: CSS-in-JS
- **React Icons**: Ícones
- **Recharts**: Gráficos

### Roteamento
- **React Router DOM**: Navegação SPA

### Backend/Database
- **Firebase**: BaaS completo
  - Authentication
  - Firestore
  - Storage
  - Hosting
  - Analytics

### Exportação
- **jsPDF**: Geração de PDFs
- **jsPDF-AutoTable**: Tabelas em PDF

### SEO
- **React Helmet Async**: Meta tags dinâmicas

## 🎨 Sistema de Temas

O projeto utiliza Material-UI com tema customizado:

```typescript
// src/theme.ts
{
  palette: {
    primary: '#1976d2',    // Azul
    secondary: '#dc004e',  // Rosa
    success: '#2e7d32',    // Verde
    warning: '#ed6c02',    // Laranja
    error: '#d32f2f',      // Vermelho
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif'
  }
}
```

## 🧪 Estratégia de Testes (Recomendada)

```
├── Unit Tests
│   ├── Services (authService, firestoreService)
│   ├── Utils (formatters, validators)
│   └── Hooks (custom hooks)
│
├── Integration Tests
│   ├── Context + Services
│   └── Component + Context
│
└── E2E Tests
    ├── Fluxo de login
    ├── Fluxo de questionário
    └── Fluxo de relatório
```

## 📦 Build e Deploy

### Desenvolvimento
```bash
npm run dev
# Servidor local em http://localhost:3000
```

### Produção
```bash
npm run build
# Build otimizado em /dist

firebase deploy
# Deploy no Firebase Hosting
```

## 🔄 Próximas Implementações

1. **Componentes Reutilizáveis**
   - QuestionnaireForm
   - ReportChart
   - UserInviteForm
   - DataExporter

2. **Páginas Detalhadas**
   - Questionário interativo
   - Dashboard com gráficos
   - Formulário de perfil
   - Gestão de convites

3. **Funcionalidades Avançadas**
   - Notificações em tempo real
   - Chat de suporte
   - Integração com Google Workspace
   - Backup automático
   - Logs de auditoria

4. **Otimizações**
   - Code splitting
   - Lazy loading de rotas
   - Cache de dados
   - PWA (Progressive Web App)

## 📚 Referências

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Material-UI Guides](https://mui.com/material-ui/getting-started/)
- [Vite Guide](https://vitejs.dev/guide/)
