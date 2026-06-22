# Plano de Testes — SELF Plataforma Educacional

## 1. Ferramentas

| Ferramenta | Versão | Finalidade |
|---|---|---|
| **Vitest** | v4.1.9 | Testes unitários (funções puras, serviços de cálculo) |
| **Cypress** | v13.17.0 | Testes de componente React e testes E2E (sistema) |
| **ESLint** | v8.57.1 | Verificação estática de código |
| **@typescript-eslint** | v7.13.1 | Regras de análise estática para TypeScript |
| **TypeScript** | v5.2.2 | Verificação de tipos em tempo de compilação (`strict`) |
| **@vitest/coverage-v8** | v4.1.9 | Relatório de cobertura de código |
| **@testing-library/cypress** | v10.1.3 | Utilitários de acessibilidade nos testes Cypress |

---

## 2. Procedimentos

### 2.1 Executar os testes localmente

```bash
# Testes unitários (execução única)
npm test

# Testes unitários em modo watch (reexecuta ao salvar)
npm run test:watch

# Relatório de cobertura de código (HTML em coverage/)
npm run test:coverage

# Testes Cypress — abre o Test Runner interativo
npm run cy:open

# Testes Cypress — headless (CI)
npm run cy:run

# Apenas testes E2E
npm run cy:run:e2e

# Apenas testes de componente
npm run cy:run:component

# Verificação estática (lint)
npm run lint

# Corrigir automaticamente o que for possível
npm run lint:fix
```

### 2.2 Configurar testes E2E autenticados

Os testes E2E de fluxo completo (professor, gestor, secretaria) requerem credenciais reais.
Criar o arquivo `cypress.env.json` na raiz do projeto (**não versionar**):

```json
{
  "TEST_PROFESSOR_EMAIL": "professor@suaescola.com",
  "TEST_PROFESSOR_PASSWORD": "senha-do-professor",
  "TEST_GESTOR_EMAIL": "gestor@suaescola.com",
  "TEST_GESTOR_PASSWORD": "senha-do-gestor",
  "TEST_SECRETARIA_EMAIL": "secretaria@rede.com",
  "TEST_SECRETARIA_PASSWORD": "senha-da-secretaria"
}
```

> Sem esse arquivo, os testes de UI sem autenticação ainda rodam normalmente; os testes autenticados pulam com `cy.log()`.

### 2.3 Fluxo de commit

1. Criar branch a partir de `main`:
   ```bash
   git checkout -b feat/minha-feature
   ```
2. Implementar a funcionalidade.
3. Escrever ou atualizar o(s) teste(s) correspondente(s).
4. Verificar lint e testes antes de commitar:
   ```bash
   npm run lint && npm test
   ```
5. Commitar com mensagem semântica:
   ```
   feat: descrição da nova funcionalidade
   fix: correção do bug X
   test: adiciona testes para Y
   refactor: refatora Z sem alterar comportamento
   ```
6. Abrir Pull Request para `main`.

### 2.4 Fluxo de Pull Request

- O PR deve ter **título claro** descrevendo o que muda.
- Incluir no corpo: **o que muda**, **como testar** e **screenshots** (para mudanças visuais).
- Todos os testes unitários (Vitest) devem passar antes do merge.
- O lint não deve ter erros (`npm run lint` com `--max-warnings 0`).
- Testes Cypress são executados manualmente ou em CI antes do merge.

---

## 3. Requisitos, Restrições e Configurações

### 3.1 Requisitos de ambiente

| Requisito | Detalhe |
|---|---|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| Java | ≥ 11 (somente se usar Firebase Emulator) |
| Browser | Chrome ou Edge (para Cypress headless) |
| Conexão com internet | Necessária para testes E2E autenticados (Firebase real) |

### 3.2 Configuração do Vitest

Arquivo: `vitest.config.ts`

```ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,           // describe/it/expect sem import
    environment: 'node',     // sem DOM — testes de lógica pura
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/utils/**', 'src/services/**'],
    },
  },
})
```

### 3.3 Configuração do Cypress

Arquivo: `cypress.config.cts`

- **E2E**: `baseUrl: http://localhost:3000` — o dev server deve estar rodando antes.
- **Component**: usa Vite como bundler — não precisa de servidor.
- `defaultCommandTimeout: 8000` ms — respeita latência do Firebase.
- `screenshotOnRunFailure: true` — screenshots salvas em `cypress/screenshots/` em caso de falha.
- `video: false` — desativado para CI mais rápido.

### 3.4 Configuração do ESLint

Arquivo: `.eslintrc.cjs`

- Parser: `@typescript-eslint/parser`
- Extends: `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `plugin:react-hooks/recommended`
- Regras de nível **error**: `no-unused-vars`, `no-debugger`, `prefer-const`, `no-var`, `eqeqeq`
- Regras de nível **warn**: `no-explicit-any`, `consistent-type-imports`, `no-console`, `react-refresh/only-export-components`
- Override em arquivos `*.test.ts/tsx`: `no-explicit-any` desligado (permitido em testes)

### 3.5 Restrições

- Testes unitários **não devem** acessar o Firebase real — usar dados em memória.
- Testes de componente Cypress **não devem** depender de rotas ou estado global da aplicação.
- O arquivo `cypress.env.json` **nunca deve** ser commitado (está em `.gitignore`).
- O comando `npm run lint` deve ser executado com `--max-warnings 0` em CI para não deixar passar erros silenciosos.

---

## 4. Matriz de Funcionalidades × Testes

### 4.1 Testes Unitários — Vitest

| Funcionalidade | Arquivo | Suíte (describe) | Casos de Teste |
|---|---|---|---|
| Iniciais de usuário para avatar | `userUtils.test.ts` | `initials` | Nome+sobrenome, nome único, nome composto, maiúsculas, espaços extras, string vazia |
| Cálculo de score por domínio TPACK | `analyticsService.test.ts` | `answersToScores` | Média por domínio, domínio vazio, ignora valor 0, 8 domínios, arredondamento |
| Score geral (média de domínios) | `analyticsService.test.ts` | `overallScore` | Média normal, ignora score 0, todos zeros |
| Pontos fortes (top 2 domínios) | `analyticsService.test.ts` | `getStrengths` | Top 2, ignora score 0 |
| Pontos de melhoria (bottom 2) | `analyticsService.test.ts` | `getImprovements` | Bottom 2 |
| Média de múltiplas respostas | `analyticsService.test.ts` | `responsesToAvgScores` | Array vazio, média entre respostas, domínio sem resposta |
| Série temporal de evolução | `analyticsService.test.ts` | `buildEvolutionData` | Array vazio, ordenação por data, campo `period` |
| Dados comparativos (eu/escola/rede) | `analyticsService.test.ts` | `buildComparisonData` | Fallback para null, valores reais |
| Formatação de data do Firestore | `analyticsService.test.ts` | `formatFirestoreDate` | Null/undefined, objeto Date, Firestore Timestamp |
| Status de resposta por professor | `analyticsService.test.ts` | `classifyTeacherResponseStatus` | Responded, not_started, ignora outro questionário |
| Agrupamento por segmento | `analyticsService.test.ts` | `groupBySegment` | Agrupamento correto, fallback "Não informado" |

### 4.2 Testes de Componente — Cypress Component

| Componente | Arquivo | Casos de Teste |
|---|---|---|
| `Badge` | `Badge.cy.tsx` | Label visível, 4 variantes (success/warning/error/neutral/accent), label longo, label vazio |
| `DataTable` | `DataTable.cy.tsx` | Cabeçalhos, dados, estado vazio padrão, estado vazio customizado, loading skeleton, render customizado, paginação ativa, paginação ausente |
| `ProgressBar` | `ProgressBar.cy.tsx` | value=0, value=100, value=50, clamp acima de 100, clamp negativo, prop label, showValue=true/false, label+showValue |
| `StatCard` | `StatCard.cy.tsx` | label+value numérico, value string, prop sub, sub oculto no loading, skeleton no loading, ausência de skeleton, value "—" |

### 4.3 Testes de Sistema (E2E) — Cypress

| Funcionalidade | Arquivo | Contexts | Testes | Requer Auth |
|---|---|---|---|---|
| Página de login — UI | `01-auth.cy.ts` | Página de Login | 9 | Não |
| Página de cadastro — UI | `01-auth.cy.ts` | Página de Cadastro | 6 | Não |
| Redirecionamento sem auth (professor) | `02-professor.cy.ts` | UI sem auth | 1 | Não |
| Dashboard do professor | `02-professor.cy.ts` | Página Inicial | 3 | Sim |
| Questionário TPACK multi-passo | `02-professor.cy.ts` | Questionário TPACK | 5 | Sim |
| Relatórios do professor | `02-professor.cy.ts` | Relatórios | 2 | Sim |
| Perfil do professor | `02-professor.cy.ts` | Perfil | 3 | Sim |
| Navegação lateral (professor) | `02-professor.cy.ts` | Navegação lateral | 3 | Sim |
| Redirecionamento sem auth (gestor) | `03-gestor.cy.ts` | Sem auth | 1 | Não |
| Dashboard do gestor | `03-gestor.cy.ts` | Página Inicial | 3 | Sim |
| Gestão de equipe (convite de professores) | `03-gestor.cy.ts` | Gestão de Equipe | 8 | Sim |
| Configuração da escola | `03-gestor.cy.ts` | Config. Escola | 3 | Sim |
| Relatórios da escola | `03-gestor.cy.ts` | Relatórios | 2 | Sim |
| Navegação lateral (gestor) | `03-gestor.cy.ts` | Navegação lateral | 3 | Sim |
| Redirecionamento sem auth (secretaria) | `04-secretaria.cy.ts` | Sem auth | 1 | Não |
| Dashboard da rede (secretaria) | `04-secretaria.cy.ts` | Visão da Rede | 8 | Sim |
| Gestão de escolas | `04-secretaria.cy.ts` | Gestão de Escolas | 5 | Sim |
| Relatórios da rede | `04-secretaria.cy.ts` | Relatórios da Rede | 5 | Sim |
| Administração de usuários | `04-secretaria.cy.ts` | Admin Usuários | 5 | Sim |
| Navegação lateral (secretaria) | `04-secretaria.cy.ts` | Navegação lateral | 2 | Sim |

### 4.4 Análise Estática — ESLint

| Regra | Nível | Funcionalidade coberta |
|---|---|---|
| `@typescript-eslint/no-unused-vars` | error | Todo o código-fonte `src/` |
| `@typescript-eslint/no-explicit-any` | warn | Todo o código-fonte `src/` |
| `@typescript-eslint/consistent-type-imports` | warn | Imports de tipo em todo `src/` |
| `prefer-const` / `no-var` | error | Todo o código-fonte `src/` |
| `eqeqeq` | error | Comparações em todo `src/` |
| `no-console` | warn | Todo o código-fonte `src/` |
| `react-refresh/only-export-components` | warn | Componentes React em `src/` |

---

## 5. Resumo de Totais

| Camada | Ferramenta | Arquivos | Testes |
|---|---|---|---|
| Unitários | Vitest | 2 | 33 |
| Componentes React | Cypress Component | 4 | 33 |
| Sistema (E2E) | Cypress E2E | 4 | 78 |
| Análise estática | ESLint | todos em `src/` | 9 regras ativas |
| **Total** | | **10** | **144 testes** |
