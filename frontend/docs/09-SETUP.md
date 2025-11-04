# ⚙️ Setup e Instalação

## Pré-requisitos

### Software Necessário

| Software | Versão Mínima | Recomendado |
|----------|---------------|-------------|
| **Node.js** | 18.x | 20.x ou superior |
| **npm** | 9.x | 10.x ou superior |
| **pnpm** | 8.x | 9.x (opcional) |
| **Git** | 2.x | Última versão |

### Verificar Instalações

```bash
node --version    # v20.x.x
npm --version     # 10.x.x
git --version     # 2.x.x
```

---

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd creativeAI\ Agent
```

### 2. Instalar Dependências

#### Opção A: npm (Recomendado para este projeto)

```bash
npm install --legacy-peer-deps
```

**Nota:** `--legacy-peer-deps` é necessário devido a conflitos de peer dependencies com React 19.

#### Opção B: pnpm

```bash
pnpm install
```

#### Opção C: yarn

```bash
yarn install
```

---

## 🏃 Rodando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

**Servidor estará disponível em:**
- Local: http://localhost:3000
- Network: http://<seu-ip>:3000

**Features do Dev Mode:**
- Hot Module Replacement (HMR)
- Fast Refresh
- Error overlay
- Source maps

### Build para Produção

```bash
npm run build
```

**Output:** Pasta `.next/` com build otimizado

### Rodar Produção Localmente

```bash
npm run start
```

### Lint

```bash
npm run lint
```

---

## 📁 Variáveis de Ambiente

### Criar arquivo `.env.local`

```bash
touch .env.local
```

### Variáveis Atuais

**Nenhuma necessária** para rodar o frontend.

### Variáveis Futuras (Backend)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/creativeai"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"

# AI APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
STABILITY_API_KEY="sk-..."

# Cloud Storage
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="creativeai-assets"

# Integrations
META_APP_ID="..."
META_APP_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email
RESEND_API_KEY="re_..."

# Payments
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Monitoring
VERCEL_ANALYTICS_ID="..."
```

**⚠️ Segurança:**
- Nunca commitar `.env.local`
- Usar variáveis diferentes para dev/prod
- Rotacionar secrets periodicamente

---

## 🔧 Configuração de IDEs

### VS Code (Recomendado)

**Extensões recomendadas:**

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "PKief.material-icon-theme",
    "usernamehw.errorlens"
  ]
}
```

**Settings.json:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### WebStorm / IntelliJ

**Configuração:**
- Ativar TypeScript Language Service
- Configurar Node.js interpreter
- Instalar plugin Tailwind CSS

---

## 🐳 Docker (Futuro)

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/creativeai
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=creativeai
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🧪 Verificação da Instalação

### Checklist

- [ ] Node.js instalado (v18+)
- [ ] npm instalado
- [ ] Dependências instaladas sem erros
- [ ] `npm run dev` inicia sem erros
- [ ] http://localhost:3000 carrega
- [ ] Landing page exibida corretamente
- [ ] Dashboard acessível em /dashboard
- [ ] Dark mode funcionando

### Troubleshooting

#### Erro: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### Erro: Port 3000 já em uso

```bash
# Mudar porta
PORT=3001 npm run dev

# Ou matar processo na porta 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9
```

#### Erro: TypeScript errors during build

**Temporário:** Editar `next.config.mjs`

```js
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true  // Apenas para desenvolvimento
  }
}
```

**Permanente:** Resolver erros de tipo

---

## 📦 Dependências Opcionais

### Adicionar shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

### Adicionar Ícones

```bash
npm install lucide-react
```

**Uso:**
```tsx
import { Sparkles, ArrowRight } from "lucide-react"
```

---

## 🔄 Atualizar Dependências

### Verificar outdated

```bash
npm outdated
```

### Atualizar minor/patch

```bash
npm update
```

### Atualizar major (cuidado!)

```bash
npm install next@latest react@latest react-dom@latest
```

---

## 🚀 Deploy

### Vercel (Recomendado)

1. Instalar Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Seguir prompts de configuração

**Configuração automática:**
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install --legacy-peer-deps`

### Outras Plataformas

- **Netlify:** Compatível com Next.js
- **Railway:** Suporte nativo
- **Render:** Deploy direto do Git
- **AWS Amplify:** Integração completa

---

## 📚 Próximos Passos

Após instalação bem-sucedida:

1. Ler [Guia de Desenvolvimento](./10-DEVELOPMENT.md)
2. Explorar [Estrutura do Projeto](./04-PROJECT-STRUCTURE.md)
3. Consultar [Guia de Componentes](./06-COMPONENTS.md)
4. Ver [Roadmap](./12-ROADMAP.md) para features futuras

---

**Próximo:** [Guia de Desenvolvimento](./10-DEVELOPMENT.md)
