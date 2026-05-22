# 💸 Digital Wallet — Frontend

> Interface Vue.js 3 para a carteira digital pessoal — autenticação, dashboard, depósito, saque e histórico de transações.

---

## 📑 Índice

- [Visão Geral](#-visão-geral)
- [Stack](#-stack)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Instalação](#-instalação)
- [Configuração do .env](#-configuração-do-env)
- [Como Rodar](#-como-rodar)
- [Build e Deploy](#-build-e-deploy)
- [Integração com a API](#-integração-com-a-api)
- [Arquitetura](#-arquitetura)
- [Rotas](#-rotas)
- [Stores (Pinia)](#-stores-pinia)
- [Commits Semânticos](#-commits-semânticos)

---

## 🌐 Visão Geral

SPA (Single Page Application) que consome a [Digital Wallet API](../digital-wallet-api) em Laravel.

Funcionalidades:

| Tela | Descrição |
|---|---|
| Login / Registro | Autenticação com Sanctum, persistência via localStorage |
| Dashboard | Saldo, últimas 5 transações, totais mensais |
| Depositar | Formulário com atalhos de valor, validação e feedback |
| Sacar | Preview do saldo restante, validação de saldo insuficiente |
| Histórico | Tabela paginada com filtros por tipo e período |

---

## 🛠 Stack

| Camada | Tecnologia |
|---|---|
| Framework | Vue.js 3 (Composition API) |
| Build | Vite 5 |
| State | Pinia 2 |
| Roteamento | Vue Router 4 |
| HTTP | Axios 1.6 |
| UI | TailwindCSS 3 + @tailwindcss/forms |
| Lint | ESLint + Prettier |
| Deploy | Vercel ou Netlify |

---

## 📁 Estrutura de Pastas

```
src/
├── api/
│   ├── axios.js              # Instância Axios com interceptors
│   ├── auth.js               # Endpoints de autenticação
│   ├── wallet.js             # Endpoints da carteira
│   └── transactions.js       # Endpoints de transações
│
├── stores/
│   ├── auth.js               # Autenticação (token, user, login, logout)
│   ├── wallet.js             # Saldo, depósito, saque, dashboard
│   └── transactions.js       # Lista, filtros, paginação
│
├── router/
│   └── index.js              # Rotas + navigation guards
│
├── views/
│   ├── auth/
│   │   ├── LoginView.vue
│   │   └── RegisterView.vue
│   ├── DashboardView.vue
│   ├── DepositView.vue
│   ├── WithdrawView.vue
│   └── TransactionsView.vue
│
├── layouts/
│   └── AppLayout.vue         # Layout autenticado (sidebar + topbar mobile)
│
├── components/
│   ├── SidebarContent.vue
│   ├── dashboard/
│   │   ├── BalanceCard.vue
│   │   ├── SummaryCard.vue
│   │   └── RecentTransactions.vue
│   ├── forms/
│   │   └── AmountInput.vue
│   └── ui/
│       ├── NotificationStack.vue  # Toast global
│       ├── LoadingSpinner.vue
│       ├── EmptyState.vue
│       ├── ErrorAlert.vue
│       ├── FieldError.vue
│       └── IconMenu.vue
│
├── composables/
│   ├── useNotification.js    # Toast system
│   └── useForm.js            # Formulários reutilizáveis
│
├── validations/
│   └── transaction.js        # Validações de formulário (frontend)
│
├── utils/
│   └── currency.js           # formatCurrency, formatDate, getErrorMessage
│
├── App.vue
├── main.js
└── style.css                 # Tailwind + classes utilitárias
```

---

## 🚀 Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/luizHramoss/front-wallet.git
cd digital-wallet-frontend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com a URL da sua API
```

---

## 🔧 Configuração do .env

```env
# URL base da API Laravel (sem barra no final)
VITE_API_BASE_URL=http://localhost:8000

# Nome da aplicação (exibido no título)
VITE_APP_NAME="Digital Wallet"
```

Em produção:
```env
VITE_API_BASE_URL=https://sua-api.up.railway.app
```

---

## ▶️ Como Rodar

```bash
# Desenvolvimento
npm run dev
# Acesse: http://localhost:5173

# Lint
npm run lint

# Formatar código
npm run format

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## 📦 Build e Deploy

### Vercel (recomendado)

```bash
# Instalar CLI
npm install -g vercel

# Deploy
vercel

# Variáveis de ambiente no painel Vercel:
# VITE_API_BASE_URL = https://sua-api.up.railway.app
```

O arquivo `vercel.json` já está configurado para redirecionar todas as rotas para `index.html` (SPA).

### Netlify

```bash
# Instalar CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

O arquivo `netlify.toml` já está configurado com redirects para SPA.

### GitHub Actions (opcional)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🔌 Integração com a API

### Fluxo de autenticação

```
Login → POST /api/auth/login
      ← { data: { token, user } }
         Token salvo em localStorage
         Injetado em todo request via interceptor

Logout → POST /api/auth/logout
       ← Token removido do localStorage
          Redirect para /login

401 automático → interceptor limpa token + redirect /login
```

### Endpoints consumidos

| Método | Endpoint | Store |
|---|---|---|
| POST | `/api/auth/register` | `auth` |
| POST | `/api/auth/login` | `auth` |
| POST | `/api/auth/logout` | `auth` |
| GET | `/api/wallet` | `wallet` |
| GET | `/api/wallet/dashboard` | `wallet` |
| POST | `/api/wallet/deposit` | `wallet` |
| POST | `/api/wallet/withdraw` | `wallet` |
| GET | `/api/transactions` | `transactions` |

### CORS

Garanta que a API Laravel tem CORS configurado para aceitar o domínio do frontend:

```php
// config/cors.php
'allowed_origins' => ['http://localhost:5173', 'https://seu-frontend.vercel.app'],
```

Ou via `.env` da API:
```env
FRONTEND_URL=https://seu-frontend.vercel.app
```

---

## 🏛 Arquitetura

### Fluxo de dados

```
View → Action (store) → API call (axios) → Response
                ↓
           State update (Pinia)
                ↓
        View re-renders automaticamente
```

### Gerenciamento de estado

- **`auth`** — token, user, isAuthenticated. Persiste no localStorage.
- **`wallet`** — balance, dashboard. Carregado no mount de cada view.
- **`transactions`** — lista paginada + filtros reativos.

### Tratamento de erros

```
Axios interceptor (401) → limpa sessão → redirect /login

Por request:
  getErrorMessage(e)  → string legível para o usuário
  getFieldErrors(e)   → Record<field, message> para campos do form
```

---

## 🗺 Rotas

| Path | Nome | Auth | View |
|---|---|---|---|
| `/login` | Login | ❌ | LoginView |
| `/register` | Register | ❌ | RegisterView |
| `/` | Dashboard | ✅ | DashboardView |
| `/deposit` | Deposit | ✅ | DepositView |
| `/withdraw` | Withdraw | ✅ | WithdrawView |
| `/transactions` | Transactions | ✅ | TransactionsView |

Navigation guards:
- Rota `requiresAuth` + não autenticado → redirect `/login`
- Rota `public` + autenticado → redirect `/`

---

## 🗃 Stores (Pinia)

### `useAuthStore`
```js
// State
token, user, isAuthenticated

// Actions
register(data), login(data), logout()
```

### `useWalletStore`
```js
// State
balance, dashboard, loading, error

// Actions
fetchBalance(), fetchDashboard(), deposit(amount), withdraw(amount), $reset()
```

### `useTransactionsStore`
```js
// State
items, meta, loading, error, filters

// Actions
fetchTransactions(params?), setFilter(key, value), resetFilters(), $reset()
```

---

## 💬 Commits Semânticos Sugeridos

```bash
git commit -m "feat: setup inicial Vue 3 + Vite + Tailwind"
git commit -m "feat: instância Axios com interceptors de auth e 401"
git commit -m "feat: stores Pinia para auth, wallet e transactions"
git commit -m "feat: router com navigation guards"
git commit -m "feat: layout autenticado com sidebar responsiva"
git commit -m "feat: views de login e registro com validação"
git commit -m "feat: dashboard com saldo e últimas transações"
git commit -m "feat: formulário de depósito com atalhos de valor"
git commit -m "feat: formulário de saque com preview de saldo"
git commit -m "feat: histórico paginado com filtros"
git commit -m "feat: sistema de toast notifications global"
git commit -m "chore: configuração Vercel e Netlify para SPA"
git commit -m "docs: README completo do frontend"
```

---

## 📄 Licença

MIT © Digital Wallet Frontend