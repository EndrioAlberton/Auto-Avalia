# SELF - Sistema Educacional de Learning e Formação

Plataforma web para autoavaliação e diagnóstico pedagógico, baseada nos princípios de "Self-reflection on Effective Learning by Fostering Innovation through Educational technologies".

## 🎯 Objetivo

Fornecer uma ferramenta completa para:
- Professores realizarem autoavaliação de suas práticas pedagógicas
- Gestores escolares acompanharem e gerenciarem o processo
- Estudantes fornecerem feedback anônimo
- Secretarias/Redes de ensino gerenciarem múltiplas escolas

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript
- **UI**: Material-UI (MUI)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Gráficos**: Recharts
- **Exportação**: jsPDF
- **Bundler**: Vite

## 📦 Instalação

```bash
npm install
```

## 🔧 Configuração

1. Crie um projeto no Firebase Console
2. Ative Authentication (Email/Password e Google)
3. Ative Firestore Database
4. Copie as credenciais e cole em `src/firebaseConfig.ts`

## 🏃 Execução

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview
```

## 📁 Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
├── pages/            # Páginas da aplicação
├── contexts/         # Contextos React (Auth, User, etc)
├── services/         # Serviços Firebase
├── types/            # Definições TypeScript
├── utils/            # Funções utilitárias
├── hooks/            # Custom Hooks
└── theme.ts          # Tema Material-UI
```

## 👥 Perfis de Usuário

### Professor
- Responder questionários
- Visualizar relatórios individuais
- Acompanhar evolução
- Comparar com médias

### Gestor Escolar
- Gerenciar escola
- Convidar usuários
- Visualizar relatórios agregados
- Exportar dados

### Estudante
- Responder questionários anônimos
- Interface simplificada

### Secretaria/Rede
- Gerenciar múltiplas escolas
- Relatórios por região
- Administração geral

## 📊 Funcionalidades Principais

- ✅ Autenticação segura
- ✅ Questionários customizáveis
- ✅ Relatórios dinâmicos e gráficos
- ✅ Comparações e benchmarks
- ✅ Exportação de dados (PDF/CSV)
- ✅ Dashboard analítico
- ✅ Gestão de permissões
- ✅ Respostas anônimas para estudantes

## 🔒 Segurança

- Autenticação Firebase
- Regras Firestore para controle de acesso
- Dados anonimizados conforme perfil
- Backup automático

## 📄 Licença

Propriedade de MAXIQUIM - Todos os direitos reservados
