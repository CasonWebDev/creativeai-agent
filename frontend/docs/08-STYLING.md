# 🎨 Guia de Estilização

## Sistema de Design

CreativeAI Agent usa **Tailwind CSS v4** com design system baseado em CSS Variables (OKLCH color space).

---

## 🎨 Tokens CSS

### Core Variables (`app/globals.css`)

```css
:root {
  /* Base colors */
  --background: oklch(100% 0 0);  /* White */
  --foreground: oklch(10% 0 0);   /* Near black */

  /* UI colors */
  --card: oklch(100% 0 0);
  --card-foreground: oklch(10% 0 0);
  --popover: oklch(100% 0 0);
  --popover-foreground: oklch(10% 0 0);

  /* Primary brand color */
  --primary: oklch(47.68% 0.246 264.4);  /* Purple/Blue */
  --primary-foreground: oklch(98% 0 0);

  /* Secondary */
  --secondary: oklch(96.85% 0 0);  /* Light gray */
  --secondary-foreground: oklch(14.37% 0 0);

  /* Muted */
  --muted: oklch(96.85% 0 0);
  --muted-foreground: oklch(53.57% 0.019 258.55);

  /* Accent */
  --accent: oklch(96.85% 0 0);
  --accent-foreground: oklch(14.37% 0 0);

  /* Destructive */
  --destructive: oklch(57.87% 0.237 27.33);  /* Red */
  --destructive-foreground: oklch(98% 0 0);

  /* Borders & inputs */
  --border: oklch(91.36% 0.005 286.32);
  --input: oklch(91.36% 0.005 286.32);
  --ring: oklch(47.68% 0.246 264.4);

  /* Border radius */
  --radius: 0.625rem;  /* 10px */
}
```

### Dark Mode

```css
.dark {
  --background: oklch(10% 0 0);  /* Dark */
  --foreground: oklch(98% 0 0);  /* Light */

  --card: oklch(10% 0 0);
  --card-foreground: oklch(98% 0 0);

  --primary: oklch(62.42% 0.264 264.53);  /* Lighter purple */
  --primary-foreground: oklch(14.37% 0 0);

  /* ... outras cores adaptadas */
}
```

---

## 🎯 Usando Tokens

### Via Tailwind Classes

```tsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    Button
  </button>

  <div className="bg-muted text-muted-foreground">
    Muted content
  </div>

  <div className="border border-border">
    Card with border
  </div>
</div>
```

### Cores Semânticas

| Token | Uso | Exemplo |
|-------|-----|---------|
| `background` / `foreground` | Cores base da página | Body text |
| `card` / `card-foreground` | Cards e containers | Card components |
| `primary` / `primary-foreground` | Ações principais | CTA buttons |
| `secondary` / `secondary-foreground` | Ações secundárias | Outline buttons |
| `muted` / `muted-foreground` | Conteúdo secundário | Descriptions |
| `accent` / `accent-foreground` | Highlights | Badges |
| `destructive` / `destructive-foreground` | Ações destrutivas | Delete buttons |

---

## 🖌️ Utility Classes

### Spacing

```tsx
<div className="p-4">Padding 1rem</div>
<div className="px-6 py-4">Padding horizontal/vertical</div>
<div className="m-4">Margin 1rem</div>
<div className="space-y-4">Gap vertical entre children</div>
<div className="gap-4">Gap em flex/grid</div>
```

### Typography

```tsx
<h1 className="text-4xl font-bold">Heading 1</h1>
<h2 className="text-3xl font-semibold">Heading 2</h2>
<p className="text-base">Body text</p>
<p className="text-sm text-muted-foreground">Small text</p>
```

### Layout

```tsx
<div className="flex items-center justify-between">
  Flexbox
</div>

<div className="grid grid-cols-3 gap-4">
  Grid 3 colunas
</div>

<div className="container mx-auto px-4">
  Container centralizado
</div>
```

### Borders & Radius

```tsx
<div className="border rounded-lg">
  Border com radius
</div>

<div className="border-b">
  Border bottom only
</div>

<div className="rounded-full">
  Completamente redondo
</div>
```

---

## 🌓 Dark Mode

### ThemeProvider

**Setup:** `app/layout.tsx`

```tsx
import { ThemeProvider } from "@/components/theme-provider"

<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

### Toggle Theme

```tsx
"use client"

import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  )
}
```

### Classes Dark Mode

```tsx
<div className="bg-white dark:bg-slate-900">
  Adapta ao tema
</div>
```

---

## 📐 Breakpoints Responsivos

```tsx
<div className="
  text-sm          /* mobile */
  md:text-base     /* tablet (768px+) */
  lg:text-lg       /* desktop (1024px+) */
">
  Responsive text
</div>

<div className="
  grid-cols-1      /* mobile: 1 coluna */
  md:grid-cols-2   /* tablet: 2 colunas */
  lg:grid-cols-4   /* desktop: 4 colunas */
">
  Responsive grid
</div>
```

**Breakpoints Tailwind:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🎭 States & Variants

### Hover, Focus, Active

```tsx
<button className="
  bg-primary
  hover:bg-primary/90    /* 90% opacity on hover */
  focus:ring-2           /* Focus ring */
  focus:ring-ring
  active:scale-95        /* Slightly smaller on click */
  transition-all         /* Smooth transitions */
">
  Interactive Button
</button>
```

### Conditional Classes

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "bg-primary",
  isDisabled && "opacity-50 pointer-events-none"
)}>
  Conditional styling
</div>
```

---

## 🧩 Component Variants (CVA)

### Definir Variantes

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Usar Variantes

```tsx
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

---

## 🎨 Animações

### Tailwind Animate

```tsx
<div className="animate-in fade-in duration-500">
  Fade in animation
</div>

<div className="animate-spin">
  Spinning loader
</div>

<div className="animate-pulse">
  Pulse effect
</div>
```

### Custom Animations

**globals.css:**
```css
@keyframes slide-in {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```

---

## 📏 Spacing Scale

| Class | Size | Pixels |
|-------|------|--------|
| `p-1` | 0.25rem | 4px |
| `p-2` | 0.5rem | 8px |
| `p-4` | 1rem | 16px |
| `p-6` | 1.5rem | 24px |
| `p-8` | 2rem | 32px |
| `p-12` | 3rem | 48px |

---

## 🔤 Tipografia

### Font Families

**Geist Sans (default):**
```tsx
<p className="font-sans">Regular text</p>
```

**Geist Mono (code):**
```tsx
<code className="font-mono">Code text</code>
```

### Font Sizes

```tsx
<p className="text-xs">12px</p>
<p className="text-sm">14px</p>
<p className="text-base">16px</p>
<p className="text-lg">18px</p>
<p className="text-xl">20px</p>
<p className="text-2xl">24px</p>
<p className="text-4xl">36px</p>
```

---

## 🎯 Best Practices

### 1. Use Semantic Tokens

✅ **Bom:**
```tsx
<div className="bg-primary text-primary-foreground">
```

❌ **Evitar:**
```tsx
<div className="bg-blue-500 text-white">
```

### 2. Componha com cn()

✅ **Bom:**
```tsx
<Button className={cn("w-full", isPending && "opacity-50")} />
```

❌ **Evitar:**
```tsx
<Button className={`w-full ${isPending ? "opacity-50" : ""}`} />
```

### 3. Use Variantes para Componentes

✅ **Bom:** Criar variantes com CVA

❌ **Evitar:** Condicionais inline complexas

---

## 📚 Referências

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [OKLCH Color](https://oklch.com)
- [CVA Docs](https://cva.style)

---

**Próximo:** [Setup e Instalação](./09-SETUP.md)
