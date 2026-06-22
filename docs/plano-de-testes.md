# Plano de Testes — SELF Plataforma Educacional

**Projeto:** self-plataforma-educacional  
**Repositório:** https://github.com/EndrioAlberton/novoprojeto  
**Versão do documento:** 1.1  
**Data:** 22/06/2026  
**Autor:** Endrio Alberton  

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Objetivos dos Testes](#2-objetivos-dos-testes)
3. [Escopo](#3-escopo)
4. [Ferramentas](#4-ferramentas)
5. [Ambiente de Testes](#5-ambiente-de-testes)
6. [Versionamento dos Testes no Git](#6-versionamento-dos-testes-no-git)
7. [Procedimentos](#7-procedimentos)
8. [Requisitos, Restrições e Configurações](#8-requisitos-restrições-e-configurações)
9. [Casos de Teste Detalhados](#9-casos-de-teste-detalhados)
10. [Matriz de Funcionalidades × Testes](#10-matriz-de-funcionalidades--testes)
11. [Análise Estática](#11-análise-estática)
12. [Resumo e Métricas](#12-resumo-e-métricas)
4. [Ferramentas](#4-ferramentas)
5. [Ambiente de Testes](#5-ambiente-de-testes)
6. [Procedimentos](#6-procedimentos)
7. [Requisitos, Restrições e Configurações](#7-requisitos-restrições-e-configurações)
8. [Casos de Teste Detalhados](#8-casos-de-teste-detalhados)
9. [Matriz de Funcionalidades × Testes](#9-matriz-de-funcionalidades--testes)
10. [Análise Estática](#10-análise-estática)
11. [Resumo e Métricas](#11-resumo-e-métricas)

---

## 1. Visão Geral do Projeto

O **SELF** (Sistema Educacional de Learning e Formação) é uma plataforma web de autoavaliação pedagógica baseada no modelo **TPACK** (Technological Pedagogical Content Knowledge). A plataforma permite que professores respondam questionários de diagnóstico e acompanhem sua evolução em 8 domínios de competência.

**Tecnologias principais:**

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | MUI (Material UI) v6 |
| Backend / Banco | Firebase (Firestore + Auth) |
| Deploy | Vercel / Firebase Hosting |

**Perfis de usuário:**

| Perfil | Acesso |
|---|---|
| Professor | Responde questionários, visualiza próprio relatório e evolução |
| Gestor | Gerencia equipe da escola, convida professores, vê relatórios da escola |
| Secretaria | Visão da rede de ensino, gerencia escolas e usuários |

---

## 2. Objetivos dos Testes

- Garantir a **correção dos cálculos** de pontuação TPACK (base do produto).
- Validar a **renderização e comportamento** dos componentes de UI compartilhados.
- Verificar os **fluxos de usuário completos** (autenticação, navegação, formulários) para cada perfil.
- Identificar problemas de **qualidade de código** antes do merge (lint, tipos, padrões).
- Assegurar que **regressões** não sejam introduzidas em funcionalidades existentes.

---

## 3. Escopo

### 3.1 O que está dentro do escopo

- Funções de cálculo e transformação de dados (`analyticsService.ts`, `userUtils.ts`)
- Componentes de UI reutilizáveis (`Badge`, `DataTable`, `ProgressBar`, `StatCard`)
- Fluxo de autenticação (login, cadastro, redirecionamento)
- Fluxo completo dos 3 perfis (professor, gestor, secretaria)
- Análise estática de todo o código em `src/`

### 3.2 O que está fora do escopo

- Regras de segurança do Firestore (`firestore.rules`)
- Testes de carga ou performance
- Testes de acessibilidade (a11y) aprofundados
- Testes em dispositivos móveis / responsividade
- Integração com Stripe ou sistemas de pagamento

---

## 4. Ferramentas

| Ferramenta | Versão | Tipo | Finalidade |
|---|---|---|---|
| **Vitest** | 4.1.9 | Teste unitário | Executa testes de funções puras e serviços sem DOM |
| **@vitest/coverage-v8** | 4.1.9 | Cobertura | Relatório HTML/texto de cobertura de código |
| **Cypress** | 13.17.0 | Teste E2E + Componente | Testa o app no browser real e monta componentes React isolados |
| **@testing-library/cypress** | 10.1.3 | Utilitário | Queries semânticas (`findByRole`, `findByText`) nos testes Cypress |
| **ESLint** | 8.57.1 | Análise estática | Detecta erros de padrão e qualidade sem executar o código |
| **@typescript-eslint/parser** | 7.13.1 | Parser ESLint | Permite ao ESLint entender sintaxe TypeScript |
| **@typescript-eslint/eslint-plugin** | 7.13.1 | Plugin ESLint | Regras específicas para TypeScript |
| **eslint-plugin-react-hooks** | 4.6.2 | Plugin ESLint | Regras para uso correto de React Hooks |
| **eslint-plugin-react-refresh** | 0.4.7 | Plugin ESLint | Garante compatibilidade com o Fast Refresh do Vite |
| **TypeScript** | 5.2.2 | Verificação de tipos | Análise estática em tempo de compilação com modo `strict` |

---

## 5. Ambiente de Testes

### 5.1 Requisitos de ambiente local

| Requisito | Versão mínima | Observação |
|---|---|---|
| Node.js | 18.x | Necessário para Vite, Vitest e Cypress |
| npm | 9.x | Gerenciador de pacotes |
| Google Chrome | Versão estável | Cypress usa Chromium por padrão |
| Conexão com internet | — | Testes E2E autenticados acessam o Firebase |
| Java JRE | 11+ | Apenas se usar Firebase Emulator (opcional) |

### 5.2 Variáveis de ambiente

Arquivo `cypress.env.json` na raiz do projeto (**não versionado**, listado no `.gitignore`):

```json
{
  "TEST_PROFESSOR_EMAIL": "professor@escola.com",
  "TEST_PROFESSOR_PASSWORD": "senha123",
  "TEST_GESTOR_EMAIL": "gestor@escola.com",
  "TEST_GESTOR_PASSWORD": "senha123",
  "TEST_SECRETARIA_EMAIL": "secretaria@rede.com",
  "TEST_SECRETARIA_PASSWORD": "senha123"
}
```

> **Nota:** Os testes de UI sem autenticação rodam sem esse arquivo. Os testes de fluxo autenticado verificam a existência das variáveis e pulam graciosamente com `cy.log()` se não estiverem configuradas, sem causar falha de CI.

### 5.3 Estrutura de arquivos de teste

```
projeto/
├── src/
│   ├── utils/
│   │   ├── userUtils.ts                   ← código testado
│   │   └── userUtils.test.ts              ← testes unitários (6 casos)
│   └── services/
│       ├── analyticsService.ts            ← código testado
│       └── analyticsService.test.ts       ← testes unitários (27 casos)
├── cypress/
│   ├── e2e/
│   │   ├── 01-auth.cy.ts                  ← E2E autenticação (15 casos)
│   │   ├── 02-professor.cy.ts             ← E2E perfil professor (17 casos)
│   │   ├── 03-gestor.cy.ts                ← E2E perfil gestor (20 casos)
│   │   └── 04-secretaria.cy.ts            ← E2E perfil secretaria (26 casos)
│   ├── component/
│   │   ├── Badge.cy.tsx                   ← componente Badge (8 casos)
│   │   ├── DataTable.cy.tsx               ← componente DataTable (9 casos)
│   │   ├── ProgressBar.cy.tsx             ← componente ProgressBar (9 casos)
│   │   └── StatCard.cy.tsx                ← componente StatCard (7 casos)
│   ├── support/
│   │   ├── commands.ts                    ← comandos customizados (loginAs, stubFirebaseAuth)
│   │   ├── e2e.ts                         ← setup global E2E
│   │   └── component.ts                   ← setup global componentes
│   └── fixtures/
│       ├── users.json                     ← dados mockados de usuários
│       └── school.json                    ← dados mockados de escola
├── .eslintrc.cjs                          ← configuração ESLint
├── vitest.config.ts                       ← configuração Vitest
└── cypress.config.cts                     ← configuração Cypress
```

---

## 6. Versionamento dos Testes no Git

Todos os arquivos de teste estão versionados no repositório principal (`main`). Abaixo está o histórico completo de commits do projeto, do mais recente ao mais antigo.

### 6.1 Histórico completo de commits

| Data | Mensagem do commit |
|---|---|
| 22/06/2026 | `docs: reescreve plano de testes completo com casos detalhados e matriz` |
| 22/06/2026 | `docs: adiciona plano de testes e relatório de testes` |
| 18/06/2026 | `fix: adicionado eslint` |
| 18/06/2026 | `fix: função definida` |
| 18/06/2026 | `fix: vercel build` |
| 18/06/2026 | `fix: separa config do Vitest em vitest.config.ts para não quebrar build do Vite` |
| 18/06/2026 | `test: adiciona testes unitários com Vitest para analyticsService e userUtils` |
| 18/06/2026 | `fix: renomeia cypress.config para .cts e adiciona cypress.env.json com credenciais de teste` |
| 18/06/2026 | `test: adiciona infraestrutura de testes Cypress (E2E + componentes)` |
| 01/06/2026 | `feat: tooltip por barra e legenda clicável no DomainBarChart` |
| 01/06/2026 | `fix: adiciona campo segment nas respostas do seed` |
| 01/06/2026 | `fix: atualiza seed com IDs TPACK e remove módulo de estudantes` |
| 01/06/2026 | `chore: remove todo o módulo de estudantes e reverte seed.mjs` |
| 01/06/2026 | `feat: questionário TPACK com 8 domínios e 5 seções de navegação` |
| 18/05/2026 | `feat: questionário RME-POA, dashboards de estudantes e ajustes de UI` |
| 14/05/2026 | `fix: erros vercel` |
| 14/05/2026 | `fix: import to components/ui` |
| 14/05/2026 | `fix: ajuste import` |
| 14/05/2026 | `fix: reestrutura UI, seed, regras e limpeza geral de código` |
| 16/03/2026 | `Atualiza a lógica de carregamento de usuários e escolas, garantindo visibilidade de todos os perfis` |
| 16/03/2026 | `Renomear referências de "SELF" para "Autoavalia" em documentos e componentes` |
| 03/03/2026 | `Update Firebase configuration, enhance Firestore rules, and improve user management` |
| 02/03/2026 | `first commit` |

### 6.2 Como consultar o histórico

```bash
# Listar todos os commits do projeto
git log --oneline

# Ver o histórico de um arquivo de teste específico
git log --oneline -- src/services/analyticsService.test.ts
git log --oneline -- cypress/e2e/01-auth.cy.ts
```

---

## 7. Procedimentos

> Esta seção descreve como executar os testes e o fluxo de trabalho para adicionar novos testes ao repositório.

### 6.1 Execução dos testes

#### Testes unitários (Vitest)

```bash
# Execução única — usado em CI
npm test

# Modo watch — usado durante desenvolvimento (reexecuta ao salvar)
npm run test:watch

# Relatório de cobertura de código (gera HTML em /coverage)
npm run test:coverage
```

#### Testes Cypress

```bash
# Antes de rodar E2E: iniciar o servidor de desenvolvimento
npm run dev

# Abre o Cypress Test Runner interativo (interface gráfica)
npm run cy:open

# Execução headless — todos os testes (CI)
npm run cy:run

# Apenas testes E2E
npm run cy:run:e2e

# Apenas testes de componente (não precisa do servidor)
npm run cy:run:component
```

#### Análise estática (ESLint)

```bash
# Verificação completa — falha se houver erros
npm run lint

# Correção automática dos problemas corrigíveis
npm run lint:fix
```

#### TypeScript

```bash
# Verifica tipos sem gerar arquivos (inclui no build)
npm run build
```

---

### 6.2 Fluxo de desenvolvimento com testes (Git Flow)

```
main
 └── feat/nome-da-feature   ← branch de trabalho
      ├── implementa o código
      ├── escreve/atualiza os testes
      ├── npm run lint && npm test   ← verificação local
      └── Pull Request → main
```

#### Passo a passo

**1. Criar branch a partir de `main`**
```bash
git checkout main
git pull origin main
git checkout -b feat/minha-feature
```

**2. Implementar a funcionalidade**

Escrever o código em `src/`. Convenção de nomes de arquivos:
- Código: `nomeDoArquivo.ts` / `NomeDoComponente.tsx`
- Teste: `nomeDoArquivo.test.ts` / `NomeDoComponente.test.tsx`
- Teste Cypress E2E: `XX-fluxo.cy.ts`
- Teste Cypress Component: `NomeDoComponente.cy.tsx`

**3. Escrever ou atualizar os testes**

A cada nova função ou componente, criar os testes correspondentes antes de commitar. Regra geral:
- Toda função exportada de `src/utils/` e `src/services/` deve ter teste unitário.
- Todo componente novo em `src/components/ui/` deve ter teste de componente Cypress.

**4. Verificar lint e testes localmente**
```bash
npm run lint && npm test
```
Não commitar se houver erros.

**5. Commitar com mensagem semântica**

Formato: `tipo: descrição curta no imperativo`

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `test` | Adiciona ou corrige testes |
| `refactor` | Refatora sem alterar comportamento |
| `docs` | Documentação |
| `chore` | Configuração, dependências |
| `style` | Formatação, sem lógica |

**Exemplos:**
```
feat: adiciona filtro por segmento na página de relatórios
fix: corrige cálculo de média quando todos os scores são zero
test: adiciona testes para classifyTeacherResponseStatus
docs: atualiza plano de testes com seção Cypress
```

```bash
git add src/services/analyticsService.ts src/services/analyticsService.test.ts
git commit -m "feat: adiciona cálculo de score por segmento"
```

**6. Abrir Pull Request**

```bash
git push origin feat/minha-feature
# Abrir PR no GitHub via interface ou CLI:
gh pr create --title "feat: descrição" --body "..."
```

---

### 6.3 Fluxo de Pull Request

#### Título
Seguir o mesmo padrão semântico dos commits: `feat: ...`, `fix: ...`, etc.

#### Corpo do PR — seções obrigatórias

```markdown
## O que muda
- Descrição das mudanças

## Como testar
1. Passo 1
2. Passo 2

## Checklist
- [ ] npm run lint passou sem erros
- [ ] npm test passou (todos os 33 testes unitários)
- [ ] Testes Cypress relevantes executados localmente
- [ ] Screenshots incluídas (se mudança visual)
```

#### Critérios para merge

| Critério | Obrigatório |
|---|---|
| `npm run lint` sem erros | Sim |
| `npm test` 100% passing | Sim |
| Testes Cypress de componente passing | Sim (se alterou componentes) |
| Testes E2E passing | Recomendado |
| Revisão de código por outro membro | Recomendado |

---

### 6.4 Integração Contínua (CI)

Em ambiente CI (ex.: GitHub Actions), a sequência recomendada é:

```bash
npm ci                       # instala dependências limpas
npm run lint                 # análise estática — falha se houver erros
npm test                     # testes unitários — falha se algum falhar
npm run build                # verifica compilação TypeScript
npm run cy:run:component     # testes de componente headless
# npm run cy:run:e2e         # E2E (requer servidor e credenciais configuradas)
```

---

## 8. Requisitos, Restrições e Configurações

### 7.1 Configuração do Vitest

**Arquivo:** `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,            // describe/it/expect disponíveis sem import explícito
    environment: 'node',      // ambiente Node.js puro — sem DOM, sem window
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/utils/**', 'src/services/**'],
    },
  },
})
```

**Decisões de configuração:**

| Opção | Valor | Motivo |
|---|---|---|
| `environment` | `node` | Os testes cobrem funções puras — DOM não é necessário e aumentaria o tempo |
| `globals: true` | `true` | Evita repetir `import { describe, it, expect }` em cada arquivo |
| `include` em coverage | `utils/**`, `services/**` | Foco nas camadas com lógica testável; componentes são cobertos pelo Cypress |

### 7.2 Configuração do Cypress

**Arquivo:** `cypress.config.cts`

```ts
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',   // dev server (npm run dev)
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,                        // desativado para CI mais rápido
    screenshotOnRunFailure: true,        // captura screenshot em falha
    defaultCommandTimeout: 8000,         // 8s para latência do Firebase
  },
  component: {
    devServer: { framework: 'react', bundler: 'vite' },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.tsx',
    viewportWidth: 800,
    viewportHeight: 600,
  },
})
```

**Comandos customizados disponíveis** (`cypress/support/commands.ts`):

| Comando | Assinatura | O que faz |
|---|---|---|
| `cy.loginAs` | `(role: 'professor' \| 'gestor' \| 'secretaria')` | Login via formulário; reutiliza sessão com `cy.session` |
| `cy.stubFirebaseAuth` | `(fixture: AuthFixture)` | Intercepta chamada de auth e retorna mock sem Firebase real |
| `cy.waitForPage` | `()` | Aguarda desaparecimento do spinner de loading |

### 7.3 Configuração do ESLint

**Arquivo:** `.eslintrc.cjs`

```js
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', 'coverage'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx'],
      rules: { '@typescript-eslint/no-explicit-any': 'off' },
    },
  ],
}
```

### 7.4 Configuração do TypeScript (modo strict)

**Arquivo:** `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

O modo `strict` engloba: `strictNullChecks`, `strictFunctionTypes`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis` e `alwaysStrict`.

### 7.5 Restrições

| Restrição | Motivo |
|---|---|
| Testes unitários **não acessam** Firebase | Isolamento — testes rápidos, deterministicos, sem dependência de rede |
| Testes de componente **não dependem** de rota ou estado global | Isolamento — cada componente é montado com `cy.mount()` e props diretas |
| `cypress.env.json` **nunca é commitado** | Segurança — contém senhas reais de contas de teste |
| `npm run lint` deve rodar com `--max-warnings 0` em CI | Qualidade — warnings ignorados viram problemas em produção |
| Não usar `vi.mock()` para Firebase nos testes unitários | Os serviços testados (`analyticsService`) não importam Firebase; mocks seriam desnecessários |

---

## 9. Casos de Teste Detalhados

### 8.1 Testes Unitários — `src/utils/userUtils.test.ts`

**Função testada:** `initials(name: string): string`  
**Localização:** `src/utils/userUtils.ts`  
**Descrição:** Extrai as iniciais do nome do usuário para exibição em avatares.

| ID | Descrição | Entrada | Saída esperada | Tipo |
|---|---|---|---|---|
| U-01 | Iniciais de nome e sobrenome | `'João Silva'` | `'JS'` | Positivo |
| U-02 | Apenas um nome | `'Ana'` | `'A'` | Edge case |
| U-03 | Nome composto — limita a 2 palavras | `'João Carlos Silva'` | `'JC'` | Positivo |
| U-04 | Converte para maiúsculas | `'ana souza'` | `'AS'` | Positivo |
| U-05 | Ignora espaços extras | `'  Maria  José  '` | `'MJ'` | Edge case |
| U-06 | String vazia | `''` | `''` | Edge case negativo |

---

### 8.2 Testes Unitários — `src/services/analyticsService.test.ts`

#### Helper de teste — `makeResponse`

Todos os testes que precisam de um `QuestionnaireResponse` usam o helper `makeResponse`, definido no próprio arquivo de teste:

```ts
function makeResponse(
  rawAnswers: Record<string, number>,   // ex.: { tk1: 4, tk2: 2 }
  overrides: Partial<QuestionnaireResponse> = {},
): QuestionnaireResponse {
  return {
    id: 'test-id',
    questionnaireId: 'q-default',
    userId: 'user-default',
    schoolId: 'school-default',
    answers: Object.entries(rawAnswers).map(([questionId, value]) => ({ questionId, value })),
    completedAt: new Date(),
    ...overrides,
  };
}
```

**Motivo:** evita repetição de 6+ campos obrigatórios em cada teste; o segundo parâmetro permite sobrescrever apenas o necessário (ex.: `userId`, `completedAt`, `segment`).

---

#### Suíte: `answersToScores`

**Função:** `answersToScores(answers: Record<string, number>): DomainScore[]`  
**Descrição:** Converte um mapa plano de respostas em pontuações por domínio TPACK (8 domínios).

| ID | Descrição | Entrada | Saída esperada |
|---|---|---|---|
| A-01 | Calcula média correta por domínio | `{ tk1: 4, tk2: 2 }` | `tk.score === 3` |
| A-02 | Retorna 0 para domínios sem respostas | `{}` | todos `score === 0` |
| A-03 | Ignora valores iguais a 0 | `{ tk1: 4, tk2: 0 }` | `tk.score === 4` |
| A-04 | Retorna exatamente 8 domínios | `{}` | `scores.length === 8` |
| A-05 | Arredonda para 2 casas decimais | `{ pk1: 5, pk2: 4 }` | `pk.score === 4.5` |

---

#### Suíte: `overallScore`

**Função:** `overallScore(scores: DomainScore[]): number`  
**Descrição:** Calcula a pontuação geral como média dos domínios com score > 0.

| ID | Descrição | Entrada | Saída esperada |
|---|---|---|---|
| B-01 | Média entre domínios ativos | `[TK=4, PK=2]` | `3.0` |
| B-02 | Ignora domínios com score 0 | `[TK=4, PK=0]` | `4.0` |
| B-03 | Retorna 0 quando todos os scores são 0 | `[TK=0]` | `0` |

---

#### Suíte: `getStrengths`

**Função:** `getStrengths(scores: DomainScore[]): string[]`  
**Descrição:** Retorna os 2 domínios com maior pontuação.

| ID | Descrição | Entrada | Saída esperada |
|---|---|---|---|
| C-01 | Retorna os 2 maiores scores | `[TK=5, PK=3, CK=4]` | `['TK (5.0)', 'CK (4.0)']` |
| C-02 | Ignora domínios com score 0 | `[...scores, PCK=0]` | PCK ausente no resultado |

---

#### Suíte: `getImprovements`

**Função:** `getImprovements(scores: DomainScore[]): string[]`  
**Descrição:** Retorna os 2 domínios com menor pontuação (pontos a desenvolver).

| ID | Descrição | Entrada | Saída esperada |
|---|---|---|---|
| D-01 | Retorna os 2 menores scores | `[TK=5, PK=1, CK=2]` | `['PK (1.0)', 'CK (2.0)']` |

---

#### Suíte: `responsesToAvgScores`

**Função:** `responsesToAvgScores(responses: QuestionnaireResponse[]): DomainScore[] | null`  
**Descrição:** Agrega múltiplas respostas em scores médios por domínio.

| ID | Descrição | Entrada | Saída esperada |
|---|---|---|---|
| E-01 | Array vazio retorna null | `[]` | `null` |
| E-02 | Média entre múltiplas respostas | `[r1(tk=4.0), r2(tk=2.0)]` | `tk.score === 3` |
| E-03 | Domínio sem resposta alguma retorna 0 | `[r(tk1=3, tk2=3)]` | `pk.score === 0` |

---

#### Suíte: `buildEvolutionData`

**Função:** `buildEvolutionData(responses: QuestionnaireResponse[]): EvolutionPoint[]`  
**Descrição:** Constrói série temporal de evolução com 1 ponto por resposta, ordenado por data.

| ID | Descrição | Entrada | Saída esperada |
|---|---|---|---|
| F-01 | Array vazio retorna array vazio | `[]` | `[]` |
| F-02 | Ordena por data crescente | `[newer(tk=4), older(tk=3)]` | `result[0][TK] < result[1][TK]` |
| F-03 | Cada ponto tem campo `period` | `[r]` | `result[0].period` definido |

---

#### Suíte: `buildComparisonData`

**Função:** `buildComparisonData(my, school, network): ComparisonPoint[]`  
**Descrição:** Monta dados para o gráfico comparativo (minha pontuação × escola × rede).

| ID | Descrição | Entrada | Saída esperada |
|---|---|---|---|
| G-01 | Preenche escola e rede com 0 quando null | `(myScores, null, null)` | `tk.escola === 0, tk.rede === 0` |
| G-02 | Usa valores reais quando fornecidos | `(my=4, school=3, network=2)` | `minha=4, escola=3, rede=2` |

---

#### Suíte: `formatFirestoreDate`

**Função:** `formatFirestoreDate(ts: any): string`  
**Descrição:** Formata datas do Firestore (Timestamp ou Date) para string `dd/mm/yyyy`.

| ID | Descrição | Entrada | Saída esperada |
|---|---|---|---|
| H-01 | Retorna `—` para null | `null` | `'—'` |
| H-02 | Retorna `—` para undefined | `undefined` | `'—'` |
| H-03 | Formata objeto `Date` | `new Date('2024-06-15')` | `match /\d{2}\/\d{2}\/\d{4}/` |
| H-04 | Formata Firestore Timestamp (`{ seconds }`) | `{ seconds: ... }` | `match /\d{2}\/\d{2}\/\d{4}/` |

---

#### Suíte: `classifyTeacherResponseStatus`

**Função:** `classifyTeacherResponseStatus(teachers, responses, questionnaireId)`  
**Descrição:** Classifica cada professor como `"responded"` ou `"not_started"` para um questionário.

| ID | Descrição | Cenário | Saída esperada |
|---|---|---|---|
| I-01 | Professor que respondeu | prof1 tem resposta para q1 | `prof1.status === 'responded'` |
| I-02 | Professor que não respondeu | prof2 sem resposta | `prof2.status === 'not_started'` |
| I-03 | Ignora respostas de outro questionário | respostas para q1, busca q-outro | todos `'not_started'` |

---

#### Suíte: `groupBySegment`

**Função:** `groupBySegment(responses: QuestionnaireResponse[])`  
**Descrição:** Agrupa respostas pelo campo `segment` e calcula total e médias por grupo.

| ID | Descrição | Entrada | Saída esperada |
|---|---|---|---|
| J-01 | Agrupa pelo campo segment | `[r1(anos_iniciais), r2(anos_iniciais), r3(ensino_medio)]` | 2 grupos, `anos_iniciais.total === 2` |
| J-02 | Fallback para respostas sem segment | `[r sem segment]` | `result[0].segment === 'Não informado'` |

---

### 8.3 Testes de Componente — Cypress Component

#### Badge — `cypress/component/Badge.cy.tsx`

**Componente:** `src/components/ui/primitives/Badge.tsx`  
**Props:** `label: string`, `variant: 'success' | 'warning' | 'error' | 'neutral' | 'accent'`

| ID | Descrição | Props | Verificação |
|---|---|---|---|
| BC-01 | Renderiza texto do label | `label="Respondido" variant="success"` | `contains('Respondido').visible` |
| BC-02 | Variante success — cor CSS aplicada | `label="Aprovado" variant="success"` | `have.css('color')` definido |
| BC-03 | Variante warning renderiza sem erro | `label="Atenção" variant="warning"` | `contains('Atenção').visible` |
| BC-04 | Variante error renderiza sem erro | `label="Erro" variant="error"` | `contains('Erro').visible` |
| BC-05 | Variante neutral renderiza sem erro | `label="Pendente" variant="neutral"` | `contains('Pendente').visible` |
| BC-06 | Variante accent renderiza sem erro | `label="Novo" variant="accent"` | `contains('Novo').visible` |
| BC-07 | Label longo não quebra layout | `label="Conhecimento Pedagógico do Conteúdo"` | texto visível sem overflow |
| BC-08 | Label vazio renderiza sem crash | `label=""` | elemento MuiBox existe |

---

#### DataTable — `cypress/component/DataTable.cy.tsx`

**Componente:** `src/components/ui/data-display/DataTable.tsx`  
**Props:** `columns`, `rows`, `loading?`, `emptyState?`, `rowsPerPage?`, `render?`

Dados de teste usados:
```ts
const columns = [{ key: 'id', header: 'ID' }, { key: 'nome', header: 'Nome' }, { key: 'status', header: 'Status' }]
const rows    = [{ id: 1, nome: 'Ana Silva', status: 'Ativo' }, ...]
```

| ID | Descrição | Condição | Verificação |
|---|---|---|---|
| DT-01 | Renderiza cabeçalhos | `rows` com dados | `contains('ID')`, `contains('Nome')`, `contains('Status')` |
| DT-02 | Renderiza dados das linhas | `rows` com dados | `contains('Ana Silva')`, `contains('Bruno Lima')` |
| DT-03 | Estado vazio padrão | `rows=[]` | `contains(/nenhum registro/i)` |
| DT-04 | Estado vazio customizado | `rows=[], emptyState=<div>Custom</div>` | `contains('Custom')` |
| DT-05 | Skeletons de loading | `loading=true` | `MuiSkeleton` presente |
| DT-06 | Sem estado vazio durante loading | `rows=[], loading=true` | `contains(/nenhum registro/i).not.exist` |
| DT-07 | Render customizado de célula | `columns[].render = r => 'Prof. ' + r.nome` | `contains('Prof. Ana Silva')` |
| DT-08 | Paginação ativa com muitas linhas | 15 linhas, `rowsPerPage=10` | `contains('Por página:').visible`, linha 11 não existe |
| DT-09 | Sem paginação com poucas linhas | 3 linhas, `rowsPerPage=10` | `contains('Por página:').not.exist` |

---

#### ProgressBar — `cypress/component/ProgressBar.cy.tsx`

**Componente:** `src/components/ui/data-display/ProgressBar.tsx`  
**Props:** `value: number`, `label?: string`, `showValue?: boolean`

| ID | Descrição | Props | Verificação |
|---|---|---|---|
| PB-01 | Renderiza com valor 0 (limite inferior) | `value={0}` | MuiBox existe |
| PB-02 | Renderiza com valor 100 (limite superior) | `value={100}` | MuiBox existe |
| PB-03 | Renderiza com valor intermediário | `value={50}` | MuiBox existe |
| PB-04 | Clampeia valor acima de 100 | `value={150}` | MuiBox existe, sem crash |
| PB-05 | Clampeia valor negativo | `value={-10}` | MuiBox existe, sem crash |
| PB-06 | Exibe label quando fornecido | `value={75} label="Taxa de resposta"` | `contains('Taxa de resposta').visible` |
| PB-07 | Exibe percentual quando `showValue=true` | `value={75} showValue` | `contains('75%').visible` |
| PB-08 | Não exibe percentual quando `showValue=false` | `value={75}` | `contains('75%').not.exist` |
| PB-09 | Exibe label e percentual juntos | `value={60} label="Progresso" showValue` | ambos visíveis |

---

#### StatCard — `cypress/component/StatCard.cy.tsx`

**Componente:** `src/components/ui/data-display/StatCard.tsx`  
**Props:** `label: string`, `value: string | number`, `sub?: string`, `loading?: boolean`

| ID | Descrição | Props | Verificação |
|---|---|---|---|
| SC-01 | Renderiza label e value numérico | `label="Total de escolas" value={42}` | ambos visíveis |
| SC-02 | Renderiza value string | `label="Pontuação" value="3.8"` | `contains('3.8').visible` |
| SC-03 | Exibe texto sub | `value={15} sub="+3 esta semana"` | sub visível |
| SC-04 | Oculta sub durante loading | `value={15} sub="subtexto" loading` | sub não existe |
| SC-05 | Exibe skeleton quando loading=true | `value={0} loading` | MuiSkeleton presente |
| SC-06 | Sem skeleton quando loading=false | `value={5} loading={false}` | MuiSkeleton não existe |
| SC-07 | Value "—" (placeholder) | `value="—"` | `contains('—').visible` |

---

### 8.4 Testes E2E — `cypress/e2e/01-auth.cy.ts`

**Fluxo:** Autenticação (login e cadastro)  
**Pré-condição:** App rodando em `http://localhost:3000`. Não requer credenciais.

| ID | Describe / Context | Descrição | Ação | Verificação |
|---|---|---|---|---|
| E2E-01 | Login UI | Exibe logo e título | `visit('/login')` | `contains('Autoavalia').visible` |
| E2E-02 | Login UI | Exibe campos email e senha | `visit('/login')` | inputs visíveis |
| E2E-03 | Login UI | Exibe botão submit | `visit('/login')` | `button[type="submit"].visible` |
| E2E-04 | Login UI | Toggle mostrar/ocultar senha | `click no botão toggle` | input muda de `password` para `text` |
| E2E-05 | Login UI | Link para cadastro | `contains('Criar conta').click()` | URL inclui `/register` |
| E2E-06 | Login UI | Botão Google visível | `visit('/login')` | `contains('Entrar com Google').visible` |
| E2E-07 | Login UI | Mensagem de erro para credencial inválida | tipo email+senha errados e clica submit | mensagem de erro visível |
| E2E-08 | Login UI | Redireciona "/" para login | `visit('/')` | URL inclui `/login` |
| E2E-09 | Login UI | Rota protegida redireciona | `visit('/app/professor/inicio')` | URL inclui `/login` |
| E2E-10 | Cadastro UI | Exibe formulário de cadastro | `visit('/register')` | `contains('Criar conta').visible` |
| E2E-11 | Cadastro UI | Campo de nome | `visit('/register')` | `input[type="text"].visible` |
| E2E-12 | Cadastro UI | Campo de email | `visit('/register')` | `input[type="email"].visible` |
| E2E-13 | Cadastro UI | Campo de senha | `visit('/register')` | `input[type="password"].visible` |
| E2E-14 | Cadastro UI | Seletor de perfil | `visit('/register')` | `contains(/professor|gestor/i).visible` |
| E2E-15 | Cadastro UI | Link para voltar ao login | `visit('/register')` | `contains(/entrar|login/i).visible` |

---

### 8.5 Testes E2E — `cypress/e2e/02-professor.cy.ts`

**Fluxo:** Perfil Professor  
**Pré-condição (UI):** Nenhuma. **Pré-condição (autenticado):** `cypress.env.json` com `TEST_PROFESSOR_EMAIL/PASSWORD`.

| ID | Context | Descrição | Verificação |
|---|---|---|---|
| E2E-P01 | UI sem auth | Rota /professor redireciona para login | URL inclui `/login` |
| E2E-P02 | Página Inicial | Exibe saudação ao professor | `contains(/professor|início|bem-vindo/i)` |
| E2E-P03 | Página Inicial | Exibe cards de estatísticas (KPIs) | `MuiCard` ou `StatCard` presentes |
| E2E-P04 | Página Inicial | Exibe botão para questionário | `contains(/questionário|responder/i)` |
| E2E-P05 | Questionário TPACK | Exibe seção de contextualização | `contains(/contextualização/i)` |
| E2E-P06 | Questionário TPACK | Indicador de progresso — 5 seções | `contains(/1\s*\/\s*5/i)` |
| E2E-P07 | Questionário TPACK | Botão Próximo ativo após seleção | `click radio → Próximo not.be.disabled` |
| E2E-P08 | Questionário TPACK | Navega para seção seguinte | `click Próximo → contains(/seção 2/i)` |
| E2E-P09 | Questionário TPACK | Botão Voltar retorna à seção anterior | `click Voltar → seção 1 visível` |
| E2E-P10 | Relatórios | Exibe página de relatórios | `contains(/relatório/i)` |
| E2E-P11 | Relatórios | Estado vazio ou abas com dados | `contains(/questionário|relatório/i)` |
| E2E-P12 | Perfil | Exibe dados do perfil | `contains(/perfil|nome|email/i)` |
| E2E-P13 | Perfil | Exibe campos editáveis | `input[type="text"]` presente |
| E2E-P14 | Perfil | Exibe botão Salvar | `contains(/salvar|atualizar/i)` |
| E2E-P15 | Navegação | Sidebar com links do professor | início, questionário, relatórios, perfil |
| E2E-P16 | Navegação | Clica Relatórios → navega | URL inclui `/professor/relatorios` |
| E2E-P17 | Navegação | Clica Questionário → navega | URL inclui `/professor/questionario` |

---

### 8.6 Testes E2E — `cypress/e2e/03-gestor.cy.ts`

**Fluxo:** Perfil Gestor  
**Pré-condição (autenticado):** `TEST_GESTOR_EMAIL/PASSWORD` no `cypress.env.json`.

| ID | Context | Descrição | Verificação |
|---|---|---|---|
| E2E-G01 | UI sem auth | Rota /gestor redireciona para login | URL inclui `/login` |
| E2E-G02 | Dashboard | Exibe título da página | `contains(/gestor|início/i)` |
| E2E-G03 | Dashboard | Exibe KPIs (professores, taxa, pontuação) | `contains(/professor|resposta/i)` |
| E2E-G04 | Dashboard | Prompt de escola não cadastrada | `contains(/configurar escola/i)` (condicional) |
| E2E-G05 | Equipe | Exibe título "Equipe" | `contains('Equipe').visible` |
| E2E-G06 | Equipe | Botão "Convidar professor" visível | `contains(/convidar professor/i)` |
| E2E-G07 | Equipe | Cards de estatísticas da equipe | `contains(/total|responderam/i)` |
| E2E-G08 | Equipe | Abre modal de convite | `click → input[type="email"].visible` |
| E2E-G09 | Equipe | Fecha modal ao clicar Cancelar | `click Cancelar → input não existe` |
| E2E-G10 | Equipe | Botão Enviar desabilitado sem email | `Enviar.be.disabled` |
| E2E-G11 | Equipe | Habilita Enviar ao digitar email | `type email → Enviar.not.be.disabled` |
| E2E-G12 | Equipe | Tabela de professores/convites | `contains(/nome|email|status/i)` |
| E2E-G13 | Config. Escola | Exibe formulário | `contains(/escola|nome da escola/i)` |
| E2E-G14 | Config. Escola | Campos de texto presentes | `input[type="text"]` presente |
| E2E-G15 | Config. Escola | Botão Salvar presente | `contains(/salvar/i)` |
| E2E-G16 | Relatórios | Exibe página de relatórios | `contains(/relatório/i)` |
| E2E-G17 | Relatórios | Abas Coletivo/Segmento/Professor (se dados) | condicional — verifica se texto existe |
| E2E-G18 | Navegação | Sidebar com 4 links | início, equipe, escola, relatórios |
| E2E-G19 | Navegação | Clica Equipe → navega | URL inclui `/gestor/equipe` |
| E2E-G20 | Navegação | Clica Escola → navega | URL inclui `/gestor/escola` |

---

### 8.7 Testes E2E — `cypress/e2e/04-secretaria.cy.ts`

**Fluxo:** Perfil Secretaria  
**Pré-condição (autenticado):** `TEST_SECRETARIA_EMAIL/PASSWORD` no `cypress.env.json`.

| ID | Context | Descrição | Verificação |
|---|---|---|---|
| E2E-S01 | UI sem auth | Rota /secretaria redireciona para login | URL inclui `/login` |
| E2E-S02 | Visão da Rede | Título "Visão da Rede" | `contains(/visão da rede/i)` |
| E2E-S03 | Visão da Rede | KPI escolas ativas | `contains(/escolas ativas/i)` |
| E2E-S04 | Visão da Rede | KPI usuários totais | `contains(/usuários totais/i)` |
| E2E-S05 | Visão da Rede | KPI respostas coletadas | `contains(/respostas coletadas/i)` |
| E2E-S06 | Visão da Rede | KPI pontuação média | `contains(/pontuação média/i)` |
| E2E-S07 | Visão da Rede | Seção "Domínios da rede" | `contains(/domínios da rede/i)` |
| E2E-S08 | Visão da Rede | Seção "Escolas com menor coleta" | `contains(/escolas com menor coleta/i)` |
| E2E-S09 | Visão da Rede | Botão "Ver todas" navega para /escolas | URL inclui `/secretaria/escolas` |
| E2E-S10 | Gestão Escolas | Título da página | `contains(/escola/i)` |
| E2E-S11 | Gestão Escolas | Botão "Nova escola" | `contains(/nova escola/i)` |
| E2E-S12 | Gestão Escolas | Abre modal ao clicar Nova escola | `input[type="text"].visible` |
| E2E-S13 | Gestão Escolas | Fecha modal ao clicar Cancelar | modal fechado |
| E2E-S14 | Gestão Escolas | Tabela com coluna Nome | `contains(/nome/i)` |
| E2E-S15 | Relatórios | Exibe página | `contains(/relatório/i)` |
| E2E-S16 | Relatórios | Abas Rede / Por Escola / Por Professor | 3 abas visíveis |
| E2E-S17 | Relatórios | Aba Rede ativa por padrão | conteúdo da aba visível |
| E2E-S18 | Relatórios | Troca para aba Por Escola | `contains(/nome|escola/i)` |
| E2E-S19 | Relatórios | Troca para aba Por Professor | `contains(/professor|nome/i)` |
| E2E-S20 | Admin Usuários | Título da página | `contains(/admin|usuário/i)` |
| E2E-S21 | Admin Usuários | Campo de busca | `input[type="text"]` |
| E2E-S22 | Admin Usuários | Filtro por perfil | `contains(/todos|professor|gestor/i)` |
| E2E-S23 | Admin Usuários | Colunas da tabela | `contains(/nome|email|perfil/i)` |
| E2E-S24 | Admin Usuários | Filtro Professor exclui Gestor | após filtrar, "Gestor" não existe |
| E2E-S25 | Navegação | Sidebar com 4 links | início, escolas, relatórios, admin |
| E2E-S26 | Navegação | Clica Escolas → navega | URL inclui `/secretaria/escolas` |

---

## 10. Matriz de Funcionalidades × Testes

A tabela abaixo mapeia cada funcionalidade do sistema para os testes que a cobrem.

| Funcionalidade | Unitário (Vitest) | Componente (Cypress) | E2E (Cypress) |
|---|---|---|---|
| Cálculo de score TPACK por domínio | A-01 a A-05 | — | — |
| Score geral (média de domínios) | B-01 a B-03 | — | — |
| Pontos fortes (top 2 domínios) | C-01, C-02 | — | — |
| Pontos de melhoria (bottom 2) | D-01 | — | — |
| Média de múltiplas respostas | E-01 a E-03 | — | — |
| Série temporal de evolução | F-01 a F-03 | — | — |
| Dados comparativos eu/escola/rede | G-01, G-02 | — | — |
| Formatação de data do Firestore | H-01 a H-04 | — | — |
| Status de resposta por professor | I-01 a I-03 | — | — |
| Agrupamento por segmento | J-01, J-02 | — | — |
| Iniciais de nome para avatar | U-01 a U-06 | — | — |
| Componente Badge (variantes) | — | BC-01 a BC-08 | — |
| Componente DataTable (tabela, paginação, loading) | — | DT-01 a DT-09 | — |
| Componente ProgressBar (valor, label, clamp) | — | PB-01 a PB-09 | — |
| Componente StatCard (KPI, loading, skeleton) | — | SC-01 a SC-07 | — |
| Login com email/senha | — | — | E2E-01 a E2E-07 |
| Proteção de rotas (redirect sem auth) | — | — | E2E-08, E2E-09, E2E-P01, E2E-G01, E2E-S01 |
| Cadastro de usuário | — | — | E2E-10 a E2E-15 |
| Dashboard do professor | — | — | E2E-P02 a E2E-P04 |
| Questionário TPACK multi-passo | — | — | E2E-P05 a E2E-P09 |
| Relatórios do professor | — | — | E2E-P10, E2E-P11 |
| Perfil do professor | — | — | E2E-P12 a E2E-P14 |
| Navegação lateral — professor | — | — | E2E-P15 a E2E-P17 |
| Dashboard do gestor | — | — | E2E-G02 a E2E-G04 |
| Convite de professores (modal) | — | — | E2E-G05 a E2E-G12 |
| Configuração da escola | — | — | E2E-G13 a E2E-G15 |
| Relatórios da escola | — | — | E2E-G16, E2E-G17 |
| Navegação lateral — gestor | — | — | E2E-G18 a E2E-G20 |
| Dashboard da rede (secretaria) | — | — | E2E-S02 a E2E-S09 |
| Gestão de escolas | — | — | E2E-S10 a E2E-S14 |
| Relatórios da rede | — | — | E2E-S15 a E2E-S19 |
| Administração de usuários | — | — | E2E-S20 a E2E-S24 |
| Navegação lateral — secretaria | — | — | E2E-S25, E2E-S26 |

---

## 11. Análise Estática

### 10.1 TypeScript — verificação de tipos

Executado automaticamente durante `npm run build`.

| Opção | Efeito |
|---|---|
| `strict: true` | Habilita `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes` e outros |
| `noUnusedLocals: true` | Erro ao declarar variável local sem usar |
| `noUnusedParameters: true` | Erro ao declarar parâmetro de função sem usar |
| `noFallthroughCasesInSwitch: true` | Erro em `switch` com case sem `break` ou `return` |

### 10.2 ESLint — regras ativas

| Regra | Nível | O que detecta |
|---|---|---|
| `@typescript-eslint/no-unused-vars` | **error** | Variáveis declaradas e não utilizadas |
| `@typescript-eslint/no-explicit-any` | warn | Uso de `any` sem intenção — reduz segurança de tipos |
| `@typescript-eslint/consistent-type-imports` | warn | Imports que deveriam ser `import type` para tree-shaking |
| `react-refresh/only-export-components` | warn | Exports mistos que impedem o Fast Refresh do Vite |
| `no-console` | warn | `console.log` esquecido (permite `.warn` e `.error`) |
| `no-debugger` | **error** | Instrução `debugger` deixada no código |
| `prefer-const` | **error** | `let` declarado quando `const` seria suficiente |
| `no-var` | **error** | Uso de `var` (escopo de função) em vez de `let`/`const` |
| `eqeqeq` | **error** | Comparação `==` em vez de `===` |

### 10.3 Resultado da varredura inicial

Ao configurar o ESLint pela primeira vez no projeto, foram encontrados:

| Tipo | Quantidade | Ação |
|---|---|---|
| Erros | 1 (`prefer-as-const` em `EquipePage.tsx:59`) | Corrigido automaticamente com `--fix` |
| Warnings auto-corrigíveis (`consistent-type-imports`) | ~23 | Corrigidos automaticamente com `--fix` |
| Warnings restantes (`no-explicit-any`) | 89 | Monitorados — uso intencional em handlers Firebase |

---

## 12. Resumo e Métricas

### 11.1 Totais por camada

| Camada | Framework | Arquivos | Suítes | Testes |
|---|---|---|---|---|
| Unitários | Vitest | 2 | 10 | **33** |
| Componentes React | Cypress Component | 4 | 4 | **33** |
| E2E — Autenticação | Cypress E2E | 1 | 3 | **15** |
| E2E — Professor | Cypress E2E | 1 | 6 | **17** |
| E2E — Gestor | Cypress E2E | 1 | 6 | **20** |
| E2E — Secretaria | Cypress E2E | 1 | 6 | **26** |
| **Total** | | **10** | **35** | **144** |

### 11.2 Cobertura de funcionalidades

| Perfil / Área | Funcionalidades cobertas |
|---|---|
| Lógica de cálculo TPACK | 100% das funções exportadas de `analyticsService.ts` |
| Utilitários de usuário | 100% das funções exportadas de `userUtils.ts` |
| Componentes de UI | 4 dos componentes compartilhados (`Badge`, `DataTable`, `ProgressBar`, `StatCard`) |
| Autenticação | Login (UI + erro), Cadastro (UI), Redirecionamento sem auth |
| Perfil Professor | Dashboard, Questionário multi-passo, Relatórios, Perfil, Navegação |
| Perfil Gestor | Dashboard, Convite de professores, Config. escola, Relatórios, Navegação |
| Perfil Secretaria | Dashboard da rede, Gestão de escolas, Relatórios, Admin usuários, Navegação |

### 11.3 Comandos rápidos de referência

```bash
npm test                    # roda os 33 testes unitários
npm run test:coverage       # cobertura HTML em /coverage
npm run lint                # análise estática — deve retornar 0 erros
npm run cy:run:component    # roda os 33 testes de componente (sem servidor)
npm run dev & npm run cy:run:e2e   # roda os 78 testes E2E (requer servidor + cypress.env.json)
```
