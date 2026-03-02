# Guia de Configuração e Deploy - SELF

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Firebase (gratuita)
- Editor de código (VS Code recomendado)

## 🔧 Passo 1: Instalação das Dependências

Navegue até a pasta do projeto e instale as dependências:

```bash
cd novoprojeto
npm install
```

## 🔥 Passo 2: Configurar Firebase

### 2.1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: "self-educacional")
4. Siga o assistente de configuração

### 2.2. Ativar Serviços do Firebase

#### Authentication (Autenticação)
1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Ative os seguintes métodos de login:
   - **Email/Password**: Clique em "Email/senha" e ative
   - **Google**: Clique em "Google" e ative
   - Configure o email de suporte público

#### Firestore Database
1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha modo de produção
4. Selecione a localização (escolha a mais próxima, ex: southamerica-east1)

#### Storage (Opcional para uploads de arquivos)
1. No menu lateral, clique em "Storage"
2. Clique em "Começar"
3. Aceite as regras padrão

### 2.3. Obter Credenciais do Firebase

1. No menu lateral, clique no ícone de engrenagem ⚙️ e depois em "Configurações do projeto"
2. Role até "Seus aplicativos"
3. Clique no ícone Web `</>`
4. Registre seu app (nome: "self-web")
5. Copie o objeto de configuração que aparece

### 2.4. Configurar Credenciais no Projeto

Abra o arquivo `src/firebaseConfig.ts` e substitua as credenciais:

```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-ABC123"
};
```

## 🛡️ Passo 3: Configurar Regras de Segurança

### 3.1. Regras do Firestore

1. No Firebase Console, vá em "Firestore Database" > "Regras"
2. Copie o conteúdo do arquivo `firestore.rules` do projeto
3. Cole no editor de regras do Firebase
4. Clique em "Publicar"

### 3.2. Índices do Firestore

1. Vá em "Firestore Database" > "Índices"
2. Os índices serão criados automaticamente quando necessário
3. Ou você pode criar manualmente usando o arquivo `firestore.indexes.json`

## 🚀 Passo 4: Executar o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

### Build de Produção

```bash
npm run build
```

Os arquivos de produção estarão na pasta `dist/`

## 📤 Passo 5: Deploy no Firebase Hosting

### 5.1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 5.2. Fazer Login

```bash
firebase login
```

### 5.3. Inicializar Firebase no Projeto

```bash
firebase init
```

Selecione:
- **Hosting**: Configure files for Firebase Hosting
- **Use an existing project**: Selecione seu projeto
- **Public directory**: Digite `dist`
- **Configure as a single-page app**: `Yes`
- **Set up automatic builds**: `No`

### 5.4. Fazer Deploy

```bash
npm run build
firebase deploy
```

## 🔐 Passo 6: Configuração Inicial de Dados

### 6.1. Criar Primeiro Usuário Admin

1. Acesse o projeto em produção ou desenvolvimento
2. Clique em "Cadastre-se"
3. Preencha o formulário:
   - Nome: Seu nome
   - Email: Seu email
   - Perfil: Secretaria/Rede
   - Senha: Sua senha segura

4. No Firebase Console, vá em "Firestore Database"
5. Encontre o documento do usuário em `users/{uid}`
6. Edite o campo `role` para `admin`

### 6.2. Criar Estrutura Inicial (Opcional)

Você pode criar dados de exemplo no Firestore:

#### Criar uma Escola
```
Collection: schools
Document ID: auto-generated
Dados:
{
  name: "Escola Municipal Exemplo",
  networkId: "rede-porto-alegre",
  region: "Centro",
  district: "Distrito 1",
  segments: ["anos_iniciais", "anos_finais"],
  address: {
    street: "Rua Exemplo, 123",
    city: "Porto Alegre",
    state: "RS",
    zipCode: "90000-000"
  },
  contact: {
    phone: "(51) 3333-4444",
    email: "contato@escola.edu.br"
  }
}
```

#### Criar um Questionário de Exemplo
```
Collection: questionnaires
Document ID: auto-generated
Dados:
{
  title: "Autoavaliação Docente - Uso de Tecnologia",
  description: "Questionário sobre práticas pedagógicas e uso de tecnologias educacionais",
  targetRole: "professor",
  active: true,
  questions: [
    {
      id: "q1",
      text: "Com que frequência você utiliza tecnologias digitais em suas aulas?",
      type: "scale",
      options: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"],
      domain: "uso_tecnologia",
      required: true,
      order: 1,
      targetRole: ["professor"]
    },
    // ... mais perguntas
  ]
}
```

## 🔍 Passo 7: Verificar Instalação

1. ✅ Acesse a URL do projeto
2. ✅ Teste criar uma conta
3. ✅ Teste fazer login
4. ✅ Verifique se o dashboard carrega
5. ✅ No Firebase Console, verifique se os dados estão sendo salvos em Firestore

## ⚡ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview da build
npm run preview

# Lint
npm run lint

# Deploy Firebase
firebase deploy

# Ver logs do Firebase
firebase logs

# Ver URL do projeto hospedado
firebase hosting:sites:get
```

## 🐛 Solução de Problemas

### Erro: "Firebase not initialized"
- Verifique se as credenciais em `firebaseConfig.ts` estão corretas
- Confirme que os serviços foram ativados no Firebase Console

### Erro: "Permission denied" no Firestore
- Verifique se as regras do Firestore foram publicadas corretamente
- Confirme que o usuário está autenticado

### Erro ao fazer login
- Verifique se o método de autenticação está ativado no Firebase
- Para Google Login, configure o email de suporte público

### Página em branco após build
- Verifique se configurou como "single-page app" no Firebase Hosting
- Confirme que a configuração de rewrites está correta em `firebase.json`

## 📞 Suporte

Para mais informações:
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do React](https://react.dev)
- [Documentação do Material-UI](https://mui.com)

## 🔄 Próximos Passos

Após a instalação básica, você pode:

1. **Personalizar o design**: Edite `src/theme.ts`
2. **Adicionar mais funcionalidades**: Implemente as páginas pendentes
3. **Configurar domínio personalizado**: No Firebase Hosting
4. **Configurar backup automático**: No Firestore
5. **Adicionar analytics**: Configure o Google Analytics no Firebase
6. **Implementar notificações**: Use Firebase Cloud Messaging

## 🎯 Checklist de Produção

Antes de lançar em produção:

- [ ] Credenciais do Firebase configuradas
- [ ] Regras de segurança do Firestore publicadas
- [ ] Authentication configurado (Email e Google)
- [ ] Primeiro usuário admin criado
- [ ] Build de produção testado
- [ ] Deploy no Firebase Hosting realizado
- [ ] Domínio personalizado configurado (se aplicável)
- [ ] SSL/HTTPS ativo
- [ ] Backup do Firestore configurado
- [ ] Monitoramento e logs ativos
