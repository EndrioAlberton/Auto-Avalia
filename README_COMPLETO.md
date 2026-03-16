# Autoavalia - Sistema Educacional de Learning e Formação

## 🎓 Sobre o Projeto

O **Autoavalia** é uma plataforma web completa para autoavaliação e diagnóstico pedagógico, desenvolvida com base nos princípios de "Self-reflection on Effective Learning by Fostering Innovation through Educational technologies".

A plataforma permite que professores avaliem suas práticas pedagógicas, gestores acompanhem o progresso de suas escolas, estudantes forneçam feedback anônimo, e secretarias de educação gerenciem redes inteiras de ensino.

## ✨ Funcionalidades Principais

### 👨‍🏫 Para Professores
- ✅ Criar conta com login institucional ou Google
- ✅ Responder questionários sobre práticas pedagógicas
- ✅ Visualizar relatórios individuais com pontos fortes e áreas de melhoria
- ✅ Comparar autopercepção com médias da escola/rede
- ✅ Acompanhar evolução ao longo do tempo
- ✅ Editar perfil (segmento, área, turma)
- ✅ Acessar materiais de apoio e tutoriais

### 🏫 Para Gestores Escolares
- ✅ Criar e configurar ambiente da escola
- ✅ Convidar professores e estudantes
- ✅ Acompanhar progresso da coleta em tempo real
- ✅ Visualizar relatórios agregados da escola
- ✅ Comparar segmentos educacionais
- ✅ Exportar dados (PDF, CSV)
- ✅ Identificar necessidades de formação docente

### 🎓 Para Estudantes
- ✅ Responder questionários simples e adequados à faixa etária
- ✅ Participação totalmente anônima
- ✅ Interface acessível em qualquer dispositivo
- ✅ Feedback geral opcional

### 🏛️ Para Secretarias/Redes de Ensino
- ✅ Cadastrar e gerenciar múltiplas escolas
- ✅ Gerar relatórios por região, distrito ou segmento
- ✅ Monitorar indicadores gerais da rede
- ✅ Criar e atualizar questionários
- ✅ Gerenciar permissões e acessos
- ✅ Integração com sistemas externos
- ✅ Dashboards e visualizações para tomada de decisão

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca UI moderna
- **TypeScript** - Tipagem estática
- **Material-UI (MUI)** - Design system
- **React Router** - Navegação SPA
- **Recharts** - Visualização de dados

### Backend
- **Firebase Authentication** - Autenticação segura
- **Cloud Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de arquivos
- **Firebase Hosting** - Hospedagem web
- **Firebase Analytics** - Análise de uso

### Build & Dev Tools
- **Vite** - Build tool ultra-rápido
- **ESLint** - Linter JavaScript/TypeScript
- **Prettier** - Formatação de código

## 📦 Instalação

### Pré-requisitos
- Node.js 18 ou superior
- npm ou yarn
- Conta no Firebase (gratuita)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd novoprojeto
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication (Email/Password e Google)
   - Ative Firestore Database
   - Copie as credenciais e cole em `src/firebaseConfig.ts`

4. **Execute o projeto**
```bash
npm run dev
```

Acesse: `http://localhost:3000`

Para instruções detalhadas, consulte [GUIA_INSTALACAO.md](./GUIA_INSTALACAO.md)

## 📁 Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
├── pages/            # Páginas da aplicação
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Professor/    # Dashboard do professor
│   ├── Gestor/       # Dashboard do gestor
│   ├── Estudante/    # Interface do estudante
│   └── Secretaria/   # Painel administrativo
├── contexts/         # Contextos React (estado global)
├── services/         # Serviços e lógica de negócio
├── types/            # Definições TypeScript
├── utils/            # Funções utilitárias
└── hooks/            # Custom Hooks
```

## 🔐 Segurança

- ✅ Autenticação Firebase com múltiplos métodos
- ✅ Regras de segurança Firestore configuradas
- ✅ Controle de acesso baseado em roles (RBAC)
- ✅ Respostas de estudantes totalmente anônimas
- ✅ Dados criptografados em trânsito e em repouso

## 📊 Modelo de Dados

### Perfis de Usuário
- **Professor**: Responde questionários e visualiza relatórios
- **Gestor**: Gerencia escola e visualiza dados agregados
- **Estudante**: Fornece feedback anônimo
- **Secretaria/Admin**: Gerencia rede de escolas

### Segmentos Educacionais
- Educação Infantil
- Anos Iniciais
- Anos Finais
- Ensino Médio
- EJA (Educação de Jovens e Adultos)
- Educação Especial

## 🎨 Personalização

O projeto utiliza Material-UI com tema customizável. Para personalizar cores e estilos, edite:

```typescript
// src/theme.ts
export const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    // ... suas cores
  }
});
```

## 🚀 Deploy

### Firebase Hosting

```bash
# Build de produção
npm run build

# Deploy
firebase deploy
```

### Outras Opções
- Vercel
- Netlify
- AWS Amplify
- Google Cloud Run

## 📚 Documentação

- [Guia de Instalação](./GUIA_INSTALACAO.md) - Setup completo passo a passo
- [Arquitetura](./ARQUITETURA.md) - Detalhes técnicos da arquitetura
- [README](./README.md) - Este arquivo

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é propriedade de MAXIQUIM. Todos os direitos reservados.

## 👥 Autores

- **MAXIQUIM** - Desenvolvimento inicial

## 📧 Contato

Para dúvidas ou sugestões, entre em contato:
- Email: [seu-email]
- Website: [seu-website]

## 🙏 Agradecimentos

- Baseado nos princípios de "Self-reflection on Effective Learning by Fostering Innovation through Educational technologies"
- Material-UI pela excelente biblioteca de componentes
- Firebase pela infraestrutura backend
- Comunidade React pela inspiração

## 📈 Roadmap

### Fase 1 - MVP ✅
- [x] Sistema de autenticação
- [x] Dashboards básicos por perfil
- [x] Estrutura de tipos e serviços

### Fase 2 - Funcionalidades Core 🚧
- [ ] Sistema completo de questionários
- [ ] Geração de relatórios com gráficos
- [ ] Exportação de dados (PDF/CSV)
- [ ] Sistema de convites

### Fase 3 - Features Avançadas 📋
- [ ] Notificações em tempo real
- [ ] Integração com Google Workspace
- [ ] Dashboard analítico avançado
- [ ] Sistema de recomendações

### Fase 4 - Otimizações 🔮
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Performance otimizada
- [ ] Testes automatizados

## 🌟 Diferenciais

- ✨ **Interface Intuitiva**: Design moderno e fácil de usar
- 📊 **Relatórios Visuais**: Gráficos e comparações interativas
- 🔒 **Segurança**: Dados protegidos e anonimização garantida
- 📱 **Responsivo**: Funciona em qualquer dispositivo
- ⚡ **Rápido**: Build otimizado com Vite
- 🎯 **Focado**: Desenvolvido especificamente para educação

---

**Desenvolvido com ❤️ para transformar a educação através da tecnologia**
