# 🏗️ Arquitetura do Projeto

## Visão Geral

CreativeAI Agent segue uma arquitetura moderna de **aplicação web full-stack** usando Next.js 16 com App Router. O projeto está atualmente no estágio de **frontend completo**, aguardando integração backend.

## 📐 Padrões Arquiteturais

### 1. App Router Pattern (Next.js 16)

O projeto utiliza o **App Router** do Next.js, que oferece:

```
app/
├── layout.tsx          # Root layout (aplicado a todas as rotas)
├── page.tsx            # Landing page (/)
├── dashboard/
│   ├── layout.tsx      # Dashboard layout (aninhado)
│   └── page.tsx        # Dashboard home (/dashboard)
└── pricing/
    └── page.tsx        # Pricing page (/pricing)
```

**Características:**
- **File-system based routing**: Estrutura de pastas define rotas
- **Nested layouts**: Layouts podem ser aninhados
- **Server Components**: Componentes renderizados no servidor por padrão
- **Client Components**: Marcados explicitamente com `"use client"`

### 2. Component Architecture (Atomic Design Adaptado)

```
┌─────────────────────────────────────────────────┐
│                    Pages                        │
│            (app/*.tsx, route level)             │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│              Layout Components                  │
│         (app-sidebar, app-header)               │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│               UI Components                     │
│    (components/ui/*, reusable primitives)       │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│                   Hooks                         │
│        (hooks/*, shared logic)                  │
└─────────────────────────────────────────────────┘
```

### 3. Server Components vs Client Components

#### Server Components (Padrão)
**Localização:** `app/page.tsx`, `app/dashboard/page.tsx`

**Vantagens:**
- Renderização no servidor
- Menor bundle JavaScript
- Acesso direto a recursos do servidor
- Melhor SEO

**Exemplo:**
```tsx
// Sem "use client" = Server Component
export default function Page() {
  return <div>Content</div>
}
```

#### Client Components
**Localização:** `components/ui/*`, `components/app-sidebar.tsx`

**Quando usar:**
- Interatividade (onClick, onChange)
- State local (useState, useReducer)
- Effects (useEffect)
- Browser APIs (window, document)
- Event listeners

**Exemplo:**
```tsx
"use client" // Marca como Client Component

import { useState } from "react"

export function InteractiveComponent() {
  const [state, setState] = useState(false)
  return <button onClick={() => setState(!state)}>Toggle</button>
}
```

## 🔄 Fluxo de Dados

### Estado Atual (Frontend Apenas)

```
┌─────────────────────────────────────────────┐
│            User Interaction                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Component Local State               │
│         (useState, useReducer)              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│             UI Update                       │
│         (re-render component)               │
└─────────────────────────────────────────────┘
```

### Fluxo Futuro (Com Backend)

```
┌─────────────────────────────────────────────┐
│            User Interaction                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Client Component                    │
│         (Form submission)                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Server Action / API Route           │
│         (app/api/* or actions.ts)           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Database / External API             │
│         (Prisma, fetch)                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Response to Client                  │
│         (JSON / Revalidation)               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         UI Update                           │
│         (re-fetch / optimistic update)      │
└─────────────────────────────────────────────┘
```

## 🎨 Design System Architecture

### Estrutura de Componentes

```
components/
├── ui/                      # Primitivos reutilizáveis
│   ├── button.tsx          # Componente base
│   ├── card.tsx            # Container genérico
│   ├── input.tsx           # Input field
│   └── ...                 # 68 componentes
├── app-sidebar.tsx         # Composição específica
├── app-header.tsx          # Composição específica
└── theme-provider.tsx      # Context provider
```

### Composição de Componentes

Os componentes seguem o padrão de **Compound Components**:

```tsx
// Compound Component Pattern
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Benefícios:**
- Flexibilidade na composição
- API intuitiva
- Responsabilidades separadas
- Fácil customização

### Variant System

Componentes usam **Class Variance Authority (CVA)** para gerenciar variantes:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center", // base classes
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## 🗂️ State Management Strategy

### Atualmente: Estado Local

```tsx
// Estado local por componente
function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(mockData)
  const [filter, setFilter] = useState("all")

  // Lógica local
  const filtered = campaigns.filter(c =>
    filter === "all" || c.status === filter
  )

  return <div>{/* render */}</div>
}
```

### Futuro: Server State + Client State

#### Server State (Recomendado: TanStack Query)
```tsx
"use client"

import { useQuery } from "@tanstack/react-query"

function CampaignsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns")
      return res.json()
    }
  })

  if (isLoading) return <Loading />
  return <CampaignsList data={data} />
}
```

#### Global Client State (Se necessário: Zustand)
```tsx
// store/useCampaignStore.ts
import { create } from "zustand"

export const useCampaignStore = create((set) => ({
  selectedCampaign: null,
  setSelectedCampaign: (id) => set({ selectedCampaign: id }),
}))
```

## 📡 Data Fetching Patterns

### Pattern 1: Server Components (Recomendado)

```tsx
// app/dashboard/page.tsx
async function DashboardPage() {
  // Fetch no servidor durante build/render
  const data = await fetch("https://api.example.com/data")
  const json = await data.json()

  return <Dashboard data={json} />
}
```

**Vantagens:**
- SEO-friendly
- Menor JavaScript no cliente
- Dados pré-renderizados

### Pattern 2: Client Components com Hooks

```tsx
"use client"

function CampaignsList() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(setData)
  }, [])

  return <List items={data} />
}
```

### Pattern 3: Server Actions (Futuro)

```tsx
// app/actions.ts
"use server"

export async function createCampaign(formData: FormData) {
  const name = formData.get("name")

  await db.campaign.create({
    data: { name }
  })

  revalidatePath("/dashboard/campaigns")
}
```

```tsx
// app/dashboard/campaigns/new/page.tsx
"use client"

import { createCampaign } from "@/app/actions"

function NewCampaignForm() {
  return (
    <form action={createCampaign}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  )
}
```

## 🎯 Routing Architecture

### Route Groups

```
app/
├── (marketing)/         # Grupo: páginas públicas
│   ├── page.tsx         # /
│   └── pricing/         # /pricing
│       └── page.tsx
└── (app)/               # Grupo: páginas protegidas
    └── dashboard/       # /dashboard
        ├── layout.tsx
        └── page.tsx
```

**Benefícios:**
- Organização lógica
- Layouts específicos por grupo
- Não afeta URLs

### Dynamic Routes (Futuro)

```
app/
└── dashboard/
    └── campaigns/
        └── [id]/
            └── page.tsx     # /dashboard/campaigns/123
```

```tsx
// app/dashboard/campaigns/[id]/page.tsx
export default function CampaignDetail({
  params
}: {
  params: { id: string }
}) {
  return <div>Campaign {params.id}</div>
}
```

### Parallel Routes (Futuro)

```
app/
└── dashboard/
    ├── @analytics/      # Slot paralelo
    │   └── page.tsx
    ├── @campaigns/      # Slot paralelo
    │   └── page.tsx
    └── layout.tsx       # Renderiza ambos
```

## 🔐 Segurança Architecture (Planejado)

### Middleware Authentication

```tsx
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")

  // Proteger rotas /dashboard/*
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"]
}
```

### RBAC (Role-Based Access Control)

```tsx
// lib/auth.ts
export function checkPermission(
  user: User,
  resource: string,
  action: string
) {
  const permissions = {
    admin: ["*"],
    member: ["campaigns:read", "campaigns:create"],
    viewer: ["campaigns:read"]
  }

  const userPermissions = permissions[user.role]
  return userPermissions.includes(`${resource}:${action}`) ||
         userPermissions.includes("*")
}
```

## 📦 Modularização

### Feature-Based Structure (Futuro)

```
app/
└── dashboard/
    ├── campaigns/
    │   ├── _components/      # Componentes privados
    │   │   ├── campaign-card.tsx
    │   │   └── campaign-filters.tsx
    │   ├── _actions/         # Server actions
    │   │   └── create-campaign.ts
    │   ├── _lib/             # Utilidades
    │   │   └── campaign-utils.ts
    │   └── page.tsx          # Página pública
    └── analytics/
        ├── _components/
        └── page.tsx
```

**Convenção:** Prefixo `_` para pastas privadas (não geram rotas)

## 🔄 Error Handling Architecture

### Error Boundaries (Futuro)

```tsx
// app/dashboard/error.tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Loading States

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <Skeleton />
}
```

## 🎨 Styling Architecture

### CSS-in-JS Evolution: Tailwind Utility-First

```tsx
// Composition via className
function Component() {
  return (
    <div className="flex items-center gap-4 p-6 rounded-lg border">
      <Avatar />
      <div className="space-y-1">
        <h3 className="font-semibold">Title</h3>
        <p className="text-sm text-muted-foreground">Description</p>
      </div>
    </div>
  )
}
```

### CSS Variables para Theming

```css
/* app/globals.css */
:root {
  --background: oklch(100% 0 0);
  --foreground: oklch(10% 0 0);
  --primary: oklch(47.68% 0.246 264.4);
}

.dark {
  --background: oklch(10% 0 0);
  --foreground: oklch(98% 0 0);
}
```

## 📊 Performance Architecture

### Code Splitting

Next.js automaticamente faz code splitting por rota:
- Cada `page.tsx` gera um bundle separado
- Lazy loading automático
- Prefetch em `<Link>` components

### Image Optimization

```tsx
import Image from "next/image"

<Image
  src="/placeholder.jpg"
  alt="Description"
  width={400}
  height={300}
  loading="lazy"  // Lazy load
  priority={false} // Não prioritário
/>
```

### Bundle Optimization

```js
// next.config.mjs
export default {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons'
    ]
  }
}
```

## 🧪 Testing Architecture (Futuro)

### Estrutura Recomendada

```
__tests__/
├── unit/
│   └── components/
│       └── button.test.tsx
├── integration/
│   └── campaigns/
│       └── create-campaign.test.tsx
└── e2e/
    └── dashboard-flow.spec.ts
```

### Testing Stack Recomendada

- **Unit/Integration**: Vitest + Testing Library
- **E2E**: Playwright
- **Visual Regression**: Chromatic / Percy

## 📝 Decisões Arquiteturais

### Por que Next.js App Router?

✅ **Vantagens:**
- Server Components reduzem JavaScript no cliente
- Nested layouts simplificam UI compartilhada
- Streaming SSR para melhor UX
- Suporte nativo a Server Actions

❌ **Desafios:**
- Curva de aprendizado (paradigma novo)
- Ecosistema ainda em evolução
- Alguns pacotes não compatíveis com RSC

### Por que shadcn/ui ao invés de Material-UI?

✅ **Vantagens:**
- Componentes que você possui (não biblioteca)
- Customização total
- Menor bundle size
- Design moderno e flexível
- TypeScript-first

### Por que Tailwind CSS v4?

✅ **Vantagens:**
- Utility-first = rápido desenvolvimento
- CSS-in-JS zero runtime overhead
- Design system via config
- JIT compiler (apenas CSS usado)

---

**Próximo:** [Stack Tecnológica](./03-TECH-STACK.md) para detalhes sobre bibliotecas e versões.
