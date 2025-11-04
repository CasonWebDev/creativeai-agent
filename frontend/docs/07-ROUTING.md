# 🗺️ Sistema de Rotas

## Visão Geral

CreativeAI Agent usa **Next.js App Router** (Next.js 16) com roteamento baseado em sistema de arquivos.

---

## 📍 Mapa de Rotas

### Rotas Públicas

| URL | Arquivo | Descrição |
|-----|---------|-----------|
| `/` | `app/page.tsx` | Landing page (home) |
| `/pricing` | `app/pricing/page.tsx` | Página de preços |

### Rotas do Dashboard (Futuro: Protegidas)

| URL | Arquivo | Descrição |
|-----|---------|-----------|
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard home |
| `/dashboard/campaigns` | `app/dashboard/campaigns/page.tsx` | Lista de campanhas |
| `/dashboard/campaigns/new` | `app/dashboard/campaigns/new/page.tsx` | Nova campanha (wizard) |
| `/dashboard/library` | `app/dashboard/library/page.tsx` | Biblioteca de assets |
| `/dashboard/analytics` | `app/dashboard/analytics/page.tsx` | Analytics e insights |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | Configurações |

---

## 🏗️ Estrutura de Layouts

### Layout Hierarchy

```
Root Layout (app/layout.tsx)
│
├─ Landing Page (app/page.tsx)
├─ Pricing Page (app/pricing/page.tsx)
│
└─ Dashboard Layout (app/dashboard/layout.tsx)
   │
   ├─ Dashboard Home (app/dashboard/page.tsx)
   ├─ Campaigns (app/dashboard/campaigns/page.tsx)
   ├─ New Campaign (app/dashboard/campaigns/new/page.tsx)
   ├─ Library (app/dashboard/library/page.tsx)
   ├─ Analytics (app/dashboard/analytics/page.tsx)
   └─ Settings (app/dashboard/settings/page.tsx)
```

### Root Layout (`app/layout.tsx`)

**Responsabilidades:**
- Define `<html>` e `<body>`
- Metadata global
- Fontes (Geist, Geist Mono)
- ThemeProvider (dark mode)
- Vercel Analytics

**Código:**
```tsx
export const metadata: Metadata = {
  title: "CreativeAI Agent",
  description: "Automatize produção de mídia digital com IA",
}

export default function RootLayout({
  children,
}: {
  children: React.Node
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Dashboard Layout (`app/dashboard/layout.tsx`)

**Responsabilidades:**
- Sidebar navegação (AppSidebar)
- Header com busca (AppHeader)
- Container principal

**Estrutura:**
```tsx
export default function DashboardLayout({
  children,
}: {
  children: React.Node
}) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## 🔗 Navegação

### Link Component

**Uso interno:**
```tsx
import Link from "next/link"

<Link href="/dashboard">
  Dashboard
</Link>

<Link href="/dashboard/campaigns">
  Campanhas
</Link>
```

**Com classes:**
```tsx
<Link
  href="/pricing"
  className="text-sm hover:text-foreground"
>
  Preços
</Link>
```

### Router Programático

```tsx
"use client"

import { useRouter } from "next/navigation"

function Component() {
  const router = useRouter()

  const navigate = () => {
    router.push("/dashboard/campaigns")
  }

  return <button onClick={navigate}>Ir para Campanhas</button>
}
```

---

## 🚦 Loading States

### Loading UI

Next.js automaticamente mostra `loading.tsx` enquanto página carrega.

**Exemplo:** `app/dashboard/campaigns/loading.tsx`
```tsx
export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
```

**Quando é exibido:**
- Durante navegação para `/dashboard/campaigns`
- Enquanto Server Component carrega dados
- Streaming SSR

---

## ⚠️ Error Handling (Futuro)

### Error Boundaries

**Arquivo:** `app/dashboard/error.tsx` (a criar)
```tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2>Algo deu errado!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Tentar novamente</button>
    </div>
  )
}
```

### Not Found

**Arquivo:** `app/not-found.tsx` (a criar)
```tsx
export default function NotFound() {
  return (
    <div className="text-center">
      <h2>404 - Página Não Encontrada</h2>
      <Link href="/dashboard">Voltar ao Dashboard</Link>
    </div>
  )
}
```

---

## 🔐 Protected Routes (Futuro)

### Middleware Authentication

**Arquivo:** `middleware.ts` (a criar)
```tsx
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Verificar autenticação
  const token = request.cookies.get("auth-token")

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"]
}
```

---

## 🎯 Route Groups (Futuro)

### Organização sem afetar URL

```
app/
├── (marketing)/
│   ├── page.tsx           # /
│   └── pricing/
│       └── page.tsx       # /pricing
│
└── (app)/
    └── dashboard/
        └── page.tsx       # /dashboard
```

**Benefício:** Layouts diferentes sem afetar estrutura de URL

---

## 📊 Dynamic Routes (Futuro)

### Rotas com Parâmetros

```
app/
└── dashboard/
    └── campaigns/
        └── [id]/
            └── page.tsx   # /dashboard/campaigns/:id
```

**Uso:**
```tsx
export default function CampaignDetail({
  params
}: {
  params: { id: string }
}) {
  return <div>Campaign ID: {params.id}</div>
}
```

### Catch-all Routes

```
app/
└── docs/
    └── [...slug]/
        └── page.tsx       # /docs/* (qualquer profundidade)
```

---

## 🔄 Navegação Sidebar

**Arquivo:** `components/app-sidebar.tsx`

**Links atuais:**
```tsx
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Campanhas", href: "/dashboard/campaigns", icon: Package },
  { name: "Biblioteca", href: "/dashboard/library", icon: FolderOpen },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
]
```

**Highlight ativo:**
```tsx
<Link
  href={item.href}
  className={cn(
    "flex items-center gap-3 rounded-lg px-3 py-2",
    pathname === item.href
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:text-foreground"
  )}
>
  <item.icon className="h-5 w-5" />
  {item.name}
</Link>
```

---

## 🎨 Route Prefetching

Next.js automaticamente faz **prefetch** de rotas quando `<Link>` está visível no viewport.

**Desabilitar prefetch:**
```tsx
<Link href="/dashboard" prefetch={false}>
  Dashboard
</Link>
```

---

## 📱 Mobile Navigation (Futuro)

### Drawer para Mobile

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon">
      <Menu className="h-6 w-6" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    <nav className="flex flex-col gap-4">
      {navigation.map(item => (
        <Link key={item.href} href={item.href}>
          {item.name}
        </Link>
      ))}
    </nav>
  </SheetContent>
</Sheet>
```

---

## 🔍 Breadcrumbs (Futuro)

**Componente:** `components/ui/breadcrumb.tsx`

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard/campaigns">
        Campanhas
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Nova Campanha</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

## 📚 Referências

- [Next.js App Router](https://nextjs.org/docs/app)
- [Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
- [Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

---

**Próximo:** [Guia de Estilização](./08-STYLING.md)
