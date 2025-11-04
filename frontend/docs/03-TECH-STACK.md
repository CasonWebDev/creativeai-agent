# 🛠️ Stack Tecnológica

## Visão Geral

CreativeAI Agent utiliza tecnologias modernas de ponta para garantir performance, escalabilidade e excelente experiência de desenvolvimento.

## 📚 Dependências por Categoria

### 🎯 Core Framework

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **next** | 16.0.0 | Framework React com App Router, SSR, SSG |
| **react** | 19.2.0 | Biblioteca UI com React Compiler |
| **react-dom** | 19.2.0 | Renderização React para web |
| **typescript** | ^5 | Type safety e melhor DX |

**Por que estas versões?**
- Next.js 16: Últimas features (Turbopack, Server Actions estáveis)
- React 19: Compiler automático, melhor performance
- TypeScript 5: Features mais recentes (decorators, satisfies)

---

### 🎨 Styling & Design System

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **tailwindcss** | ^4.1.9 | Framework CSS utility-first |
| **@tailwindcss/postcss** | ^4.1.9 | Plugin PostCSS para Tailwind v4 |
| **postcss** | ^8.5 | Processador CSS |
| **autoprefixer** | ^10.4.20 | Vendor prefixes automáticos |
| **tailwindcss-animate** | ^1.0.7 | Animações pré-configuradas |
| **tw-animate-css** | 1.3.3 | Biblioteca de animações CSS |
| **tailwind-merge** | ^2.5.5 | Merge inteligente de classes Tailwind |
| **clsx** | ^2.1.1 | Utility para classes condicionais |
| **class-variance-authority** | ^0.7.1 | API de variantes para componentes |

**Workflow de Styling:**
```tsx
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

const buttonVariants = cva("base-classes", {
  variants: { variant: { default: "...", outline: "..." } }
})

<Button className={cn(buttonVariants({ variant }), "custom-class")} />
```

---

### 🧩 UI Components (Radix UI)

**shadcn/ui** é baseado em Radix UI primitives. Total: **21 pacotes Radix**

| Pacote | Versão | Componente |
|--------|--------|------------|
| @radix-ui/react-accordion | 1.2.2 | Accordion |
| @radix-ui/react-alert-dialog | 1.1.4 | AlertDialog |
| @radix-ui/react-aspect-ratio | 1.1.1 | AspectRatio |
| @radix-ui/react-avatar | 1.1.2 | Avatar |
| @radix-ui/react-checkbox | 1.1.3 | Checkbox |
| @radix-ui/react-collapsible | 1.1.2 | Collapsible |
| @radix-ui/react-context-menu | 2.2.4 | ContextMenu |
| @radix-ui/react-dialog | 1.1.4 | Dialog |
| @radix-ui/react-dropdown-menu | 2.1.4 | DropdownMenu |
| @radix-ui/react-hover-card | 1.1.4 | HoverCard |
| @radix-ui/react-label | 2.1.1 | Label |
| @radix-ui/react-menubar | 1.1.4 | Menubar |
| @radix-ui/react-navigation-menu | 1.2.3 | NavigationMenu |
| @radix-ui/react-popover | 1.1.4 | Popover |
| @radix-ui/react-progress | 1.1.1 | Progress |
| @radix-ui/react-radio-group | 1.2.2 | RadioGroup |
| @radix-ui/react-scroll-area | 1.2.2 | ScrollArea |
| @radix-ui/react-select | 2.1.4 | Select |
| @radix-ui/react-separator | 1.1.1 | Separator |
| @radix-ui/react-slider | 1.2.2 | Slider |
| @radix-ui/react-slot | 1.1.1 | Slot (composição) |
| @radix-ui/react-switch | 1.1.2 | Switch |
| @radix-ui/react-tabs | 1.1.2 | Tabs |
| @radix-ui/react-toast | 1.2.4 | Toast |
| @radix-ui/react-toggle | 1.1.1 | Toggle |
| @radix-ui/react-toggle-group | 1.1.1 | ToggleGroup |
| @radix-ui/react-tooltip | 1.1.6 | Tooltip |

**Por que Radix UI?**
- ✅ Acessibilidade (WAI-ARIA)
- ✅ Unstyled (total controle de design)
- ✅ Composable (compound components)
- ✅ TypeScript first
- ✅ Mantido ativamente

---

### 📝 Forms & Validation

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **react-hook-form** | ^7.60.0 | Gerenciamento de formulários |
| **@hookform/resolvers** | ^3.10.0 | Resolvers para validação |
| **zod** | 3.25.76 | Schema validation TypeScript-first |

**Exemplo de uso:**
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido")
})

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema)
})
```

**Por que esta stack?**
- React Hook Form: Melhor performance (uncontrolled inputs)
- Zod: Type inference automática, melhor DX
- Integração perfeita via @hookform/resolvers

---

### 🎭 UI Enhancement

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **lucide-react** | ^0.454.0 | Biblioteca de ícones (1000+ ícones) |
| **next-themes** | ^0.4.6 | Theme switching (dark/light mode) |
| **sonner** | ^1.7.4 | Toast notifications elegantes |
| **vaul** | ^0.9.9 | Drawer component (mobile-first) |
| **cmdk** | 1.0.4 | Command palette (⌘K) |
| **embla-carousel-react** | 8.5.1 | Carousel/slider acessível |
| **react-resizable-panels** | ^2.1.7 | Painéis redimensionáveis |

**Lucide React:**
```tsx
import { Sparkles, ArrowRight, Zap } from "lucide-react"

<Sparkles className="h-5 w-5" />
```

**Next Themes:**
```tsx
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

**Sonner (Toast):**
```tsx
import { toast } from "sonner"

toast.success("Campanha criada!")
toast.error("Erro ao salvar")
```

---

### 📅 Date & Time

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **date-fns** | 4.1.0 | Manipulação de datas (modern, tree-shakeable) |
| **react-day-picker** | 9.8.0 | Date picker component |

**Exemplo:**
```tsx
import { format, formatDistance } from "date-fns"
import { ptBR } from "date-fns/locale"

format(new Date(), "dd/MM/yyyy", { locale: ptBR })
formatDistance(date, new Date(), { addSuffix: true, locale: ptBR })
// "há 2 horas"
```

---

### 📊 Charts & Visualization

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **recharts** | 2.15.4 | Biblioteca de gráficos React |

**Componentes incluídos:**
- LineChart, BarChart, AreaChart
- PieChart, RadarChart
- Responsive containers
- Tooltips, Legends

**Exemplo:**
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

<LineChart data={data}>
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>
```

---

### 🔐 Input Components

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **input-otp** | 1.4.1 | One-Time Password input |

---

### 📊 Analytics

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **@vercel/analytics** | latest | Vercel Analytics (Web Vitals) |

**Uso:**
```tsx
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## 🔧 DevDependencies

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| **@types/node** | ^22 | Type definitions para Node.js |
| **@types/react** | ^19 | Type definitions para React |
| **@types/react-dom** | ^19 | Type definitions para React DOM |

---

## 📦 Package Manager

**Recomendado:** pnpm (mais rápido, economiza espaço)

**Atual:** npm (compatível, funciona perfeitamente)

**Lock file:** `pnpm-lock.yaml` (mínimo, gerado pelo pnpm)

**Nota:** Projeto foi instalado com `npm install --legacy-peer-deps` devido a conflitos de peer dependencies do React 19.

---

## 🎯 shadcn/ui Configuration

**Arquivo:** `components.json`

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Instalando novos componentes:**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

---

## 🚀 Build & Runtime

### Next.js Configuration

**Arquivo:** `next.config.mjs`

```js
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true  // Para prototipação rápida
  },
  images: {
    unoptimized: true  // Para export estático
  }
}
```

### TypeScript Configuration

**Arquivo:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES6",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 🔮 Futuras Dependências (Backend)

### Autenticação
```json
{
  "next-auth": "^5.0.0",
  "@clerk/nextjs": "^4.0.0"  // Alternativa
}
```

### Database & ORM
```json
{
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "drizzle-orm": "^0.29.0"  // Alternativa
}
```

### API & Data Fetching
```json
{
  "@tanstack/react-query": "^5.0.0",
  "@trpc/server": "^11.0.0",
  "@trpc/client": "^11.0.0",
  "@trpc/react-query": "^11.0.0"
}
```

### File Upload
```json
{
  "uploadthing": "^6.0.0",
  "@aws-sdk/client-s3": "^3.0.0"
}
```

### AI & External APIs
```json
{
  "openai": "^4.0.0",
  "@anthropic-ai/sdk": "^0.9.0",
  "stability-ai": "^1.0.0"
}
```

### Email
```json
{
  "resend": "^2.0.0",
  "react-email": "^2.0.0"
}
```

### Payments
```json
{
  "stripe": "^14.0.0",
  "@stripe/stripe-js": "^2.0.0"
}
```

### Background Jobs
```json
{
  "bullmq": "^5.0.0",
  "inngest": "^3.0.0"
}
```

---

## 📊 Bundle Size Analysis

### Maiores Dependências (Estimativa)

| Pacote | Size (minified) | Nota |
|--------|-----------------|------|
| react + react-dom | ~140KB | Core necessário |
| next/router | ~80KB | Routing automático |
| @radix-ui/* (todos) | ~250KB | Tree-shakeable |
| recharts | ~180KB | Lazy load recomendado |
| lucide-react | ~50KB | Tree-shakeable |
| date-fns | ~20KB | Tree-shakeable |

**Otimizações:**
- Lazy loading de charts: `const Chart = dynamic(() => import('recharts'))`
- Tree-shaking automático do Next.js
- Code splitting por rota

---

## 🔍 Troubleshooting

### Conflito de Peer Dependencies

**Problema:** React 19 não é oficialmente suportado por alguns pacotes

**Solução aplicada:**
```bash
npm install --legacy-peer-deps
```

**Pacotes afetados:**
- `vaul@0.9.9` (espera React 16-18)

**Status:** Funcionando normalmente, aguardando updates dos mantenedores

### TypeScript Errors

**Problema:** Alguns tipos podem não estar atualizados

**Solução temporária:** `typescript.ignoreBuildErrors: true` no next.config.mjs

**Para produção:** Remover este flag e resolver erros

---

## 📚 Referências

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Release](https://react.dev/blog/2024/12/05/react-19)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

**Próximo:** [Estrutura do Projeto](./04-PROJECT-STRUCTURE.md)
