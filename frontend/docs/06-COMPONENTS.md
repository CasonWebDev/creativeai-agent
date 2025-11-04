# 🧩 Guia de Componentes

## Visão Geral

Este guia documenta os principais componentes UI disponíveis no projeto, baseados em **shadcn/ui** (Radix UI + Tailwind CSS).

---

## 📦 Categorias de Componentes

### 1. Buttons & Actions
### 2. Forms & Inputs
### 3. Layout & Containers
### 4. Overlays & Modals
### 5. Navigation
### 6. Feedback & Status
### 7. Data Display

---

## 1. 🔘 Buttons & Actions

### Button
**Arquivo:** `components/ui/button.tsx`

**Variantes:**
- `default` - Primary button (bg-primary)
- `destructive` - Danger actions (bg-destructive)
- `outline` - Secondary (border)
- `ghost` - Minimal (hover only)
- `link` - Link style

**Sizes:**
- `default` - h-10 px-4
- `sm` - h-9 px-3
- `lg` - h-11 px-8
- `icon` - h-10 w-10 (quadrado)

**Exemplo:**
```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg">
  Clique Aqui
</Button>

<Button variant="outline" size="sm">
  Cancelar
</Button>

<Button variant="ghost" size="icon">
  <X className="h-4 w-4" />
</Button>
```

---

### Toggle / ToggleGroup
**Arquivos:** `components/ui/toggle.tsx`, `toggle-group.tsx`

**Uso:**
```tsx
import { Toggle } from "@/components/ui/toggle"

<Toggle aria-label="Toggle bold">
  <Bold className="h-4 w-4" />
</Toggle>

<ToggleGroup type="single">
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
  <ToggleGroupItem value="center">Center</ToggleGroupItem>
  <ToggleGroupItem value="right">Right</ToggleGroupItem>
</ToggleGroup>
```

---

## 2. 📝 Forms & Inputs

### Input
**Arquivo:** `components/ui/input.tsx`

**Exemplo:**
```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="seu@email.com"
  />
</div>
```

---

### Textarea
**Arquivo:** `components/ui/textarea.tsx`

```tsx
import { Textarea } from "@/components/ui/textarea"

<Textarea
  placeholder="Digite sua mensagem..."
  rows={4}
/>
```

---

### Select
**Arquivo:** `components/ui/select.tsx`

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opção 1</SelectItem>
    <SelectItem value="option2">Opção 2</SelectItem>
  </SelectContent>
</Select>
```

---

### Checkbox
**Arquivo:** `components/ui/checkbox.tsx`

```tsx
import { Checkbox } from "@/components/ui/checkbox"

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms">
    Aceito os termos
  </label>
</div>
```

---

### RadioGroup
**Arquivo:** `components/ui/radio-group.tsx`

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="r1" />
    <Label htmlFor="r1">Opção 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="r2" />
    <Label htmlFor="r2">Opção 2</Label>
  </div>
</RadioGroup>
```

---

### Switch
**Arquivo:** `components/ui/switch.tsx`

```tsx
import { Switch } from "@/components/ui/switch"

<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <Label htmlFor="notifications">
    Notificações
  </Label>
</div>
```

---

### Slider
**Arquivo:** `components/ui/slider.tsx`

```tsx
import { Slider } from "@/components/ui/slider"

<Slider
  defaultValue={[50]}
  max={100}
  step={1}
/>
```

---

## 3. 📦 Layout & Containers

### Card
**Arquivo:** `components/ui/card.tsx`

**Compound Components:**
- CardHeader
- CardTitle
- CardDescription
- CardContent
- CardFooter

**Exemplo:**
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Conteúdo principal aqui</p>
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

---

### Separator
**Arquivo:** `components/ui/separator.tsx`

```tsx
import { Separator } from "@/components/ui/separator"

<div>
  <p>Seção 1</p>
  <Separator className="my-4" />
  <p>Seção 2</p>
</div>
```

---

### ScrollArea
**Arquivo:** `components/ui/scroll-area.tsx`

```tsx
import { ScrollArea } from "@/components/ui/scroll-area"

<ScrollArea className="h-72 w-48">
  <div className="p-4">
    {/* Conteúdo longo */}
  </div>
</ScrollArea>
```

---

## 4. 🪟 Overlays & Modals

### Dialog
**Arquivo:** `components/ui/dialog.tsx`

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>
        Descrição do modal
      </DialogDescription>
    </DialogHeader>
    <div>
      {/* Conteúdo */}
    </div>
  </DialogContent>
</Dialog>
```

---

### AlertDialog
**Arquivo:** `components/ui/alert-dialog.tsx`

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Deletar</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction>Confirmar</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### Popover
**Arquivo:** `components/ui/popover.tsx`

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Mais Info</Button>
  </PopoverTrigger>
  <PopoverContent>
    <p>Conteúdo do popover</p>
  </PopoverContent>
</Popover>
```

---

### Tooltip
**Arquivo:** `components/ui/tooltip.tsx`

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <Info className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Informação adicional</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### DropdownMenu
**Arquivo:** `components/ui/dropdown-menu.tsx`

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Ações</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Editar</DropdownMenuItem>
    <DropdownMenuItem>Duplicar</DropdownMenuItem>
    <DropdownMenuItem className="text-destructive">
      Deletar
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 5. 🧭 Navigation

### Tabs
**Arquivo:** `components/ui/tabs.tsx`

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    <p>Conteúdo Tab 1</p>
  </TabsContent>
  <TabsContent value="tab2">
    <p>Conteúdo Tab 2</p>
  </TabsContent>
</Tabs>
```

---

### Accordion
**Arquivo:** `components/ui/accordion.tsx`

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Pergunta 1?</AccordionTrigger>
    <AccordionContent>
      Resposta 1
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Pergunta 2?</AccordionTrigger>
    <AccordionContent>
      Resposta 2
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## 6. 💬 Feedback & Status

### Badge
**Arquivo:** `components/ui/badge.tsx`

**Variantes:**
- `default` - Primary
- `secondary` - Neutral
- `destructive` - Error/Warning
- `outline` - Bordered

```tsx
import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

---

### Progress
**Arquivo:** `components/ui/progress.tsx`

```tsx
import { Progress } from "@/components/ui/progress"

<Progress value={75} />
```

---

### Toast (Sonner)
**Arquivo:** `components/ui/sonner.tsx`

```tsx
import { toast } from "sonner"

// Success
toast.success("Campanha criada com sucesso!")

// Error
toast.error("Erro ao salvar")

// Loading
toast.loading("Processando...")

// Custom
toast("Notificação", {
  description: "Descrição adicional",
  action: {
    label: "Desfazer",
    onClick: () => console.log("Undo")
  }
})
```

---

### Alert
**Arquivo:** `components/ui/alert.tsx`

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Atenção!</AlertTitle>
  <AlertDescription>
    Mensagem de alerta importante.
  </AlertDescription>
</Alert>
```

---

### Skeleton
**Arquivo:** `components/ui/skeleton.tsx`

```tsx
import { Skeleton } from "@/components/ui/skeleton"

<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
  <Skeleton className="h-4 w-[150px]" />
</div>
```

---

## 7. 📊 Data Display

### Table
**Arquivo:** `components/ui/table.tsx`

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>Ativo</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### Avatar
**Arquivo:** `components/ui/avatar.tsx`

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="/user.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

## 🎨 Customização

### Usando cn() Utility

```tsx
import { cn } from "@/lib/utils"

<Button className={cn(
  "custom-class",
  isActive && "bg-green-500",
  isDisabled && "opacity-50"
)}>
  Botão
</Button>
```

### Criando Variantes

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const customVariants = cva(
  "base-classes",
  {
    variants: {
      size: {
        small: "text-sm",
        large: "text-lg"
      }
    }
  }
)

type Props = VariantProps<typeof customVariants>
```

---

## 📚 Referências

- [shadcn/ui Docs](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- Localização: `components/ui/*`

---

**Próximo:** [Sistema de Rotas](./07-ROUTING.md)
