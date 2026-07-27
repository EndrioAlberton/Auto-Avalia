# Autoavalia

Plataforma web de autoavaliação e diagnóstico pedagógico. Professores respondem questionários sobre suas práticas, gestores acompanham a equipe, estudantes fornecem feedback anônimo e a secretaria gerencia a rede de escolas.

Este projeto faz parte do **Inovação Pedagógica na Educação Básica** (Edital INOVA EAD CAPES/2023).

---

## 🏛️ Instituição

**Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Sul**  
Campus Porto Alegre

---

## 👥 Colaboradores

### Coordenação
- **Carine Bueira Loureiro**

### Colaboradora
- **Silvia de Castro Bertagnolli**

### Desenvolvimento
- **Endrio Alberton Correa Nunes**  
  Contato: endrio@maxiquim.com.br

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | Material-UI v6 |
| Backend | Firebase (Auth + Firestore) |
| Gráficos | Recharts |
| Exportação | jsPDF |

## Perfis de acesso

| Perfil | O que pode fazer |
|---|---|
| **Professor** | Responder questionário, ver relatório individual e evolução |
| **Gestor** | Gerenciar escola, convidar professores, ver relatórios da equipe |
| **Estudante** | Responder questionário anônimo (sem login) |
| **Secretaria** | Gerenciar escolas e usuários da rede |
| **Admin** | Acesso total |

## Estrutura

```
src/
├── app/            # Rotas e configuração global
├── components/     # Componentes visuais reutilizáveis (layout, data-display, feedback)
├── contexts/       # AuthContext
├── data/           # Dados estáticos (questionários)
├── features/       # Lógica por domínio (auth, professor, gestor, secretaria, questionnaire, analytics)
├── services/       # Firestore e Firebase Auth
├── types/          # Tipos TypeScript globais
└── utils/          # Funções utilitárias
```

## Instalação

```bash
npm install
```

Configure o Firebase em `src/firebaseConfig.ts` com as credenciais do seu projeto (Auth e Firestore habilitados).

## Comandos

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run seed      # popula o Firestore com dados de exemplo
```

## Seed

O seed cria 8 usuários (admin, secretaria, gestor, 5 professores) com respostas já preenchidas, uma escola e 20 respostas anônimas de estudantes. Senha de todos: `Self@2025`.

| Usuário | Email |
|---|---|
| Admin | admin@autoavalia.com |
| Secretaria | secretaria@autoavalia.com |
| Gestor | gestor@joaopaulo.edu.br |
| Professor (Ana) | ana.silva@joaopaulo.edu.br |
| Professor (Carlos) | carlos.santos@joaopaulo.edu.br |
| Professor (Maria) | maria.oliveira@joaopaulo.edu.br |
| Professor (Pedro) | pedro.costa@joaopaulo.edu.br |
| Professor (Lucia) | lucia.ferreira@joaopaulo.edu.br |

## Regras Firestore

As regras de segurança estão em `firestore.rules`. Para publicar:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```
