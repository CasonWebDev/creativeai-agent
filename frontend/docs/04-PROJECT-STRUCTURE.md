# 📁 Estrutura do Projeto

## Visão Geral da Estrutura

```
creativeAI Agent/
├── 📄 Arquivos de Configuração
├── 📁 app/                    # Next.js App Router (rotas e páginas)
├── 📁 components/             # Componentes React reutilizáveis
├── 📁 hooks/                  # Custom React Hooks
├── 📁 lib/                    # Utilitários e helpers
├── 📁 public/                 # Assets estáticos
├── 📁 styles/                 # Estilos globais adicionais
├── 📁 docs/                   # Documentação do projeto
├── 📁 node_modules/           # Dependências (gerado)
└── 📁 .next/                  # Build output (gerado)
```

---

## 📄 Arquivos de Configuração (Raiz)

### Package Management
```
package.json           # Dependências e scripts npm
pnpm-lock.yaml        # Lock file do pnpm
```

### TypeScript
```
tsconfig.json         # Configuração TypeScript
next-env.d.ts         # Type definitions Next.js (auto-gerado)
```

### Build & Styling
```
next.config.mjs       # Configuração Next.js
postcss.config.mjs    # Configuração PostCSS
components.json       # Configuração shadcn/ui
```

### Git & IDE
```
.gitignore            # Arquivos ignorados pelo Git
.claude/              # Configurações Claude Code
  └── settings.local.json
```

---

## 📁 Diretório: `/app`

**Propósito:** Sistema de rotas e páginas (Next.js App Router)

### Estrutura Completa

```
app/
├── layout.tsx                          # Layout raiz (global)
├── page.tsx                            # Landing page (/)
├── globals.css                         # Estilos globais
│
├── pricing/                            # Rota: /pricing
│   └── page.tsx                        # Página de preços
│
└── dashboard/                          # Rota: /dashboard/*
    ├── layout.tsx                      # Layout do dashboard
    ├── page.tsx                        # Dashboard home
    │
    ├── campaigns/                      # Rota: /dashboard/campaigns
    │   ├── page.tsx                    # Lista de campanhas
    │   ├── loading.tsx                 # Estado de carregamento
    │   └── new/                        # Rota: /dashboard/campaigns/new
    │       └── page.tsx                # Wizard nova campanha
    │
    ├── library/                        # Rota: /dashboard/library
    │   ├── page.tsx                    # Biblioteca de assets
    │   └── loading.tsx                 # Estado de carregamento
    │
    ├── analytics/                      # Rota: /dashboard/analytics
    │   └── page.tsx                    # Página de analytics
    │
    └── settings/                       # Rota: /dashboard/settings
        └── page.tsx                    # Configurações
```

### Descrição dos Arquivos

#### `app/layout.tsx` (Root Layout)
- Layout global aplicado a todas as páginas
- Define `<html>`, `<body>`, metadata
- Inclui fonte Geist
- Integra Vercel Analytics
- ThemeProvider para dark mode

**Código:**
```tsx
export const metadata = {
  title: "CreativeAI Agent",
  description: "Automatize produção de mídia digital com IA"
}
```

#### `app/page.tsx` (Landing Page)
- Hero section com estatísticas
- Features grid (6 recursos principais)
- Workflow steps (4 etapas)
- CTA sections
- Footer

**Componentes usados:** Button, Card, Badge, Icons

#### `app/pricing/page.tsx`
- 4 tiers de preços
- ROI Calculator
- Feature comparison
- CTA buttons

#### `app/dashboard/layout.tsx`
- Sidebar navegação (AppSidebar)
- Header com search (AppHeader)
- Container principal

**Componentes usados:** AppSidebar, AppHeader

#### `app/dashboard/page.tsx` (Dashboard Home)
- 4 cards de métricas principais
- Tabs: Recent Campaigns, Performance, AI Insights
- Lista de campanhas recentes
- Status indicators

#### `app/dashboard/campaigns/page.tsx`
- Listagem de campanhas
- Filtros por status (All, Active, Completed, Draft)
- Search input
- Campaign cards com progress bar
- Actions dropdown (View, Edit, Duplicate, Delete)

#### `app/dashboard/campaigns/loading.tsx`
- Skeleton loader para campaign list
- Melhora UX durante carregamento

#### `app/dashboard/campaigns/new/page.tsx`
- Wizard de 4 etapas
- Step 1: Basic Info (name, brand, objective)
- Step 2: Brand Assets (file uploads)
- Step 3: Formats & Specs (platform selection)
- Step 4: Review (summary)
- State management com useState

#### `app/dashboard/library/page.tsx`
- Grid de assets
- Filtros por plataforma
- Search
- Grid/List toggle
- Asset actions (Download, Share, Favorite, Delete)

#### `app/dashboard/library/loading.tsx`
- Skeleton para asset grid

#### `app/dashboard/analytics/page.tsx`
- 4 KPI cards
- Tabs: Performance, Creative, Audience
- Insights com confidence levels
- Platform comparisons

#### `app/dashboard/settings/page.tsx`
- 4 Tabs: General, Integrations, Team, Billing
- Form inputs para configurações
- Integration toggles
- Team member table
- Billing info

---

## 📁 Diretório: `/components`

**Propósito:** Componentes React reutilizáveis

### Estrutura

```
components/
├── theme-provider.tsx           # Context provider para dark mode
├── app-sidebar.tsx              # Sidebar do dashboard
├── app-header.tsx               # Header do dashboard
│
└── ui/                          # shadcn/ui components (68 arquivos)
    ├── accordion.tsx
    ├── alert-dialog.tsx
    ├── alert.tsx
    ├── aspect-ratio.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── breadcrumb.tsx
    ├── button-group.tsx
    ├── button.tsx
    ├── calendar.tsx
    ├── card.tsx
    ├── carousel.tsx
    ├── chart.tsx
    ├── checkbox.tsx
    ├── collapsible.tsx
    ├── command.tsx
    ├── context-menu.tsx
    ├── dialog.tsx
    ├── drawer.tsx
    ├── dropdown-menu.tsx
    ├── empty.tsx
    ├── field.tsx
    ├── form.tsx
    ├── hover-card.tsx
    ├── input-group.tsx
    ├── input-otp.tsx
    ├── input.tsx
    ├── item.tsx
    ├── kbd.tsx
    ├── label.tsx
    ├── menubar.tsx
    ├── navigation-menu.tsx
    ├── pagination.tsx
    ├── popover.tsx
    ├── progress.tsx
    ├── radio-group.tsx
    ├── resizable.tsx
    ├── scroll-area.tsx
    ├── select.tsx
    ├── separator.tsx
    ├── sheet.tsx
    ├── sidebar.tsx
    ├── skeleton.tsx
    ├── slider.tsx
    ├── sonner.tsx
    ├── spinner.tsx
    ├── switch.tsx
    ├── table.tsx
    ├── tabs.tsx
    ├── textarea.tsx
    ├── toast.tsx
    ├── toaster.tsx
    ├── toggle-group.tsx
    ├── toggle.tsx
    ├── tooltip.tsx
    ├── use-mobile.tsx
    └── use-toast.ts
```

### Componentes Principais

#### `theme-provider.tsx`
- Wrapper do next-themes
- Gerencia dark/light mode
- Persiste preferência do usuário

**Uso:**
```tsx
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

#### `app-sidebar.tsx`
- Navegação lateral do dashboard
- Logo + links principais
- User info no rodapé
- Client Component (interativo)

**Navegação:**
- Dashboard
- Campanhas
- Biblioteca
- Analytics
- Configurações

#### `app-header.tsx`
- Header do dashboard
- Search input
- Notifications bell
- Breadcrumbs (futuro)

---

## 📁 Diretório: `/components/ui`

**Propósito:** Biblioteca de componentes primitivos (shadcn/ui)

### Categorias de Componentes

#### 1. **Layout & Containers**
- `card.tsx` - Container com header/content/footer
- `separator.tsx` - Divider horizontal/vertical
- `scroll-area.tsx` - Área com scroll customizado
- `resizable.tsx` - Painéis redimensionáveis
- `sidebar.tsx` - Sidebar component

#### 2. **Typography & Content**
- `alert.tsx` - Alert messages
- `breadcrumb.tsx` - Navegação hierárquica
- `empty.tsx` - Empty states
- `kbd.tsx` - Keyboard shortcuts

#### 3. **Forms & Inputs**
- `input.tsx` - Text input
- `textarea.tsx` - Multi-line input
- `checkbox.tsx` - Checkbox
- `radio-group.tsx` - Radio buttons
- `select.tsx` - Dropdown select
- `slider.tsx` - Range slider
- `switch.tsx` - Toggle switch
- `input-otp.tsx` - OTP input
- `calendar.tsx` - Date picker
- `input-group.tsx` - Input com addons
- `field.tsx` - Form field wrapper
- `form.tsx` - Form components
- `label.tsx` - Form label

#### 4. **Buttons & Actions**
- `button.tsx` - Button component
- `button-group.tsx` - Button group
- `toggle.tsx` - Toggle button
- `toggle-group.tsx` - Toggle button group

#### 5. **Overlays & Dialogs**
- `dialog.tsx` - Modal dialog
- `alert-dialog.tsx` - Alert modal
- `drawer.tsx` - Side drawer
- `sheet.tsx` - Slide-in panel
- `popover.tsx` - Popover tooltip
- `hover-card.tsx` - Hover card
- `tooltip.tsx` - Simple tooltip
- `context-menu.tsx` - Right-click menu
- `dropdown-menu.tsx` - Dropdown menu
- `menubar.tsx` - Menu bar

#### 6. **Navigation**
- `tabs.tsx` - Tab navigation
- `accordion.tsx` - Collapsible sections
- `collapsible.tsx` - Expandable content
- `navigation-menu.tsx` - Complex nav
- `pagination.tsx` - Page navigation
- `command.tsx` - Command palette (⌘K)

#### 7. **Feedback & Status**
- `progress.tsx` - Progress bar
- `spinner.tsx` - Loading spinner
- `skeleton.tsx` - Skeleton loader
- `toast.tsx` - Toast notification
- `toaster.tsx` - Toast container
- `sonner.tsx` - Sonner toast
- `badge.tsx` - Status badge

#### 8. **Data Display**
- `table.tsx` - Data table
- `avatar.tsx` - User avatar
- `chart.tsx` - Chart wrapper
- `carousel.tsx` - Image carousel
- `aspect-ratio.tsx` - Aspect ratio box

#### 9. **Hooks & Utilities**
- `use-toast.ts` - Toast hook
- `use-mobile.tsx` - Mobile breakpoint hook

---

## 📁 Diretório: `/hooks`

**Propósito:** Custom React Hooks compartilhados

```
hooks/
├── use-mobile.ts          # Detecta breakpoint mobile
└── use-toast.ts           # Gerencia toast notifications
```

### `use-mobile.ts`
```tsx
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)")
    setIsMobile(mql.matches)
    // ...
  }, [])

  return isMobile
}
```

### `use-toast.ts`
- Reducer pattern para toasts
- Queue de notificações
- Auto-dismiss
- Actions: toast(), dismiss(), update()

---

## 📁 Diretório: `/lib`

**Propósito:** Utilitários e funções auxiliares

```
lib/
└── utils.ts               # Utility functions
```

### `utils.ts`
```tsx
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Uso:** Merge de classes Tailwind com conflitos resolvidos

---

## 📁 Diretório: `/public`

**Propósito:** Assets estáticos (servidos diretamente)

```
public/
├── placeholder.svg          # SVG placeholder genérico
├── placeholder.jpg          # Image placeholder
├── placeholder-user.jpg     # Avatar placeholder
├── placeholder-logo.svg     # Logo placeholder
└── placeholder-logo.png     # Logo PNG
```

**Acesso:** `/placeholder.svg` (sem `/public`)

---

## 📁 Diretório: `/styles`

**Propósito:** Estilos globais adicionais

```
styles/
└── globals.css              # Duplicate de app/globals.css
```

**Nota:** Redundante com `app/globals.css`, pode ser removido.

---

## 📁 Diretório: `/docs`

**Propósito:** Documentação completa do projeto

```
docs/
├── README.md                       # Índice da documentação
├── 01-OVERVIEW.md                  # Visão geral
├── 02-ARCHITECTURE.md              # Arquitetura
├── 03-TECH-STACK.md                # Stack tecnológica
├── 04-PROJECT-STRUCTURE.md         # Este arquivo
├── 05-FEATURES.md                  # Features
├── 06-COMPONENTS.md                # Guia de componentes
├── 07-ROUTING.md                   # Rotas
├── 08-STYLING.md                   # Estilos
├── 09-SETUP.md                     # Setup
├── 10-DEVELOPMENT.md               # Desenvolvimento
├── 11-INTEGRATION-GUIDE.md         # Integração backend
└── 12-ROADMAP.md                   # Roadmap
```

---

## 🚫 Arquivos/Pastas Ignorados (.gitignore)

```
node_modules/             # Dependências npm
.next/                    # Build output Next.js
out/                      # Export output
.env*.local               # Variáveis de ambiente locais
.DS_Store                 # macOS
*.log                     # Logs
.vercel                   # Vercel deployment
```

---

## 📊 Estatísticas do Projeto

| Categoria | Quantidade |
|-----------|------------|
| Páginas (rotas) | 9 |
| Layouts | 2 |
| Componentes UI | 68 |
| Custom Hooks | 2 |
| Utilitários | 1 |
| Arquivos Config | 6 |
| Assets Estáticos | 5 |

---

## 🗺️ Mapa de Navegação Rápida

### Precisa encontrar...

| O que | Onde |
|-------|------|
| Landing page | `app/page.tsx` |
| Dashboard | `app/dashboard/page.tsx` |
| Listagem campanhas | `app/dashboard/campaigns/page.tsx` |
| Wizard nova campanha | `app/dashboard/campaigns/new/page.tsx` |
| Biblioteca assets | `app/dashboard/library/page.tsx` |
| Analytics | `app/dashboard/analytics/page.tsx` |
| Configurações | `app/dashboard/settings/page.tsx` |
| Sidebar | `components/app-sidebar.tsx` |
| Header | `components/app-header.tsx` |
| Componente Button | `components/ui/button.tsx` |
| Estilos globais | `app/globals.css` |
| Utilitários | `lib/utils.ts` |
| Config Next.js | `next.config.mjs` |

---

## 🔮 Estrutura Futura (Backend)

```
app/
├── api/                           # API Routes
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts
│   ├── campaigns/
│   │   ├── route.ts              # GET, POST /api/campaigns
│   │   └── [id]/
│   │       └── route.ts          # GET, PUT, DELETE /api/campaigns/:id
│   ├── assets/
│   │   └── route.ts
│   └── analytics/
│       └── route.ts
│
├── actions.ts                     # Server Actions
│
lib/
├── db.ts                          # Database client (Prisma)
├── auth.ts                        # Auth helpers
└── api/                           # API clients
    ├── openai.ts
    ├── anthropic.ts
    └── stability.ts

prisma/
├── schema.prisma                  # Database schema
└── migrations/                    # DB migrations
```

---

**Próximo:** [Features Implementadas](./05-FEATURES.md)
