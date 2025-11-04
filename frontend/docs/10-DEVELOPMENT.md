# 💻 Guia de Desenvolvimento

## Workflow de Desenvolvimento

### Ciclo de Desenvolvimento Padrão

1. **Criar branch** para feature/fix
2. **Desenvolver** localmente com hot reload
3. **Testar** funcionalidade
4. **Commit** com mensagens descritivas
5. **Push** e criar Pull Request
6. **Review** e merge

---

## 🌿 Git Workflow

### Branches

```bash
main          # Produção (protegida)
develop       # Desenvolvimento (base)
feature/*     # Novas features
fix/*         # Bug fixes
hotfix/*      # Fixes urgentes em produção
```

### Criar Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-feature
```

### Commit Messages

**Convenção:** Conventional Commits

```bash
feat: adiciona filtro de campanhas por status
fix: corrige bug no wizard de campanha
docs: atualiza documentação de setup
style: ajusta espaçamento no header
refactor: reorganiza componentes de card
test: adiciona testes para Button component
chore: atualiza dependências
```

**Exemplos:**
```bash
git commit -m "feat: implementa busca na biblioteca de assets"
git commit -m "fix: corrige dark mode no sidebar"
git commit -m "docs: adiciona guia de componentes"
```

---

## 📝 Convenções de Código

### Nomenclatura

#### Arquivos
- **Componentes:** `PascalCase.tsx` → `Button.tsx`, `CampaignCard.tsx`
- **Páginas Next.js:** `page.tsx`, `layout.tsx`, `loading.tsx`
- **Utilitários:** `camelCase.ts` → `formatDate.ts`, `api.ts`
- **Hooks:** `use-*.ts` → `use-toast.ts`, `use-mobile.ts`
- **Tipos:** `types.ts` ou inline no componente

#### Variáveis e Funções
```tsx
// camelCase para variáveis e funções
const userName = "João"
function formatCurrency(value: number) {}

// PascalCase para componentes e tipos
function Button() {}
interface UserData {}
type Campaign = {}

// UPPERCASE para constantes
const API_URL = "https://api.example.com"
const MAX_FILE_SIZE = 5 * 1024 * 1024
```

---

### Estrutura de Componentes

#### Server Component (padrão)

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  // Sem "use client"
  // Pode fazer fetch direto
  // Sem hooks de estado

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  )
}
```

#### Client Component

```tsx
// components/campaign-form.tsx
"use client" // Marcar explicitamente

import { useState } from "react"

export function CampaignForm() {
  const [name, setName] = useState("")

  return (
    <form>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </form>
  )
}
```

---

### TypeScript Best Practices

#### Props Typing

```tsx
interface ButtonProps {
  variant?: "default" | "outline"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
  onClick?: () => void
}

export function Button({
  variant = "default",
  size = "md",
  children,
  onClick
}: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

#### Extending HTML Elements

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, ...props }: InputProps) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input {...props} />
    </div>
  )
}
```

#### Type vs Interface

```tsx
// Interface para objetos e componentes
interface User {
  id: string
  name: string
}

// Type para unions, intersections, utilitários
type Status = "active" | "inactive" | "pending"
type UserWithStatus = User & { status: Status }
```

---

## 🎨 Styling Conventions

### Class Organization

```tsx
<div className={cn(
  // Layout
  "flex items-center justify-between",
  // Spacing
  "p-6 gap-4",
  // Visual
  "bg-background border rounded-lg",
  // Typography
  "text-sm font-medium",
  // States
  "hover:bg-accent transition-colors",
  // Conditional
  isActive && "bg-primary text-primary-foreground"
)}>
  Content
</div>
```

### Avoid Inline Styles

❌ **Evitar:**
```tsx
<div style={{ marginTop: "20px", color: "blue" }}>
```

✅ **Preferir:**
```tsx
<div className="mt-5 text-blue-600">
```

---

## 🧩 Criando Novos Componentes

### 1. Criar Arquivo

```bash
# Componente UI
touch components/ui/my-component.tsx

# Componente de app
touch components/my-feature.tsx
```

### 2. Template Básico

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface MyComponentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline"
}

export function MyComponent({
  variant = "default",
  className,
  children,
  ...props
}: MyComponentProps) {
  return (
    <div
      className={cn(
        "base-classes",
        variant === "outline" && "border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

MyComponent.displayName = "MyComponent"
```

### 3. Exportar

```tsx
// components/ui/index.ts (opcional)
export { MyComponent } from "./my-component"
```

---

## 🔧 Debugging

### Console Logs

```tsx
"use client"

useEffect(() => {
  console.log("Component mounted")
  console.log("State:", state)
}, [state])
```

### React DevTools

- Inspecionar component tree
- Ver props e state
- Profiling de performance

### Next.js DevTools

- Ver rotas ativas
- Inspecionar Server Components
- Cache debugging

### VS Code Debugging

**launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

---

## 📦 Adicionando Dependências

### Instalar Package

```bash
npm install package-name --legacy-peer-deps
```

### Remover Package

```bash
npm uninstall package-name
```

### Atualizar Package

```bash
npm update package-name
```

### Verificar Outdated

```bash
npm outdated
```

---

## 🧪 Testing (Futuro)

### Setup Vitest

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Exemplo de Teste

```tsx
// __tests__/components/button.test.tsx
import { render, screen } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("applies variant classes", () => {
    render(<Button variant="outline">Button</Button>)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("border")
  })
})
```

---

## 🚀 Performance Tips

### 1. Lazy Loading

```tsx
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("@/components/chart"), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false
})
```

### 2. Memoization

```tsx
import { memo, useMemo, useCallback } from "react"

const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  const computed = useMemo(() => {
    return data.map(/* expensive operation */)
  }, [data])

  const handleClick = useCallback(() => {
    // handler
  }, [])

  return <div>{/* render */}</div>
})
```

### 3. Image Optimization

```tsx
import Image from "next/image"

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  quality={85}
  loading="lazy"
/>
```

---

## 🔐 Security Best Practices

### 1. Environment Variables

```tsx
// ❌ Não expor secrets no client
const apiKey = process.env.NEXT_PUBLIC_API_KEY

// ✅ Usar no servidor
// app/api/route.ts
const secret = process.env.API_SECRET
```

### 2. Sanitização de Input

```tsx
import DOMPurify from "dompurify"

const sanitized = DOMPurify.sanitize(userInput)
```

### 3. Validação com Zod

```tsx
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const result = schema.safeParse(data)
```

---

## 📚 Recursos de Aprendizado

### Documentações Oficiais
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Comunidades
- [Next.js Discord](https://discord.gg/nextjs)
- [React Brasil (Telegram)](https://t.me/reactbrasil)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## ✅ Checklist de PR

Antes de criar Pull Request:

- [ ] Código segue convenções do projeto
- [ ] TypeScript sem erros
- [ ] Componentes responsivos
- [ ] Dark mode testado
- [ ] Console limpo (sem warnings)
- [ ] Mensagens de commit descritivas
- [ ] Documentação atualizada (se necessário)
- [ ] Testado localmente

---

**Próximo:** [Guia de Integração Backend](./11-INTEGRATION-GUIDE.md)
