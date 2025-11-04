# 🔌 Guia de Integração Backend

## Visão Geral

Este guia fornece um roadmap para integrar o frontend existente com backend, database, e serviços externos.

---

## 📋 Checklist de Integração

### Fase 1: Foundation (Semana 1-2)
- [ ] Setup de autenticação
- [ ] Database schema e migrations
- [ ] API routes básicas
- [ ] Variáveis de ambiente

### Fase 2: Core Features (Semana 3-4)
- [ ] CRUD de campanhas
- [ ] Upload de arquivos
- [ ] Gestão de usuários
- [ ] Sistema de roles/permissões

### Fase 3: External APIs (Semana 5-6)
- [ ] Integração OpenAI
- [ ] Integração Anthropic/Claude
- [ ] Meta Ads API
- [ ] Google Ads API

### Fase 4: Advanced (Semana 7-8)
- [ ] Background jobs
- [ ] Real-time updates
- [ ] Analytics processing
- [ ] Billing (Stripe)

---

## 🔐 1. Autenticação

### Opção A: NextAuth.js (Recomendado)

#### Instalação

```bash
npm install next-auth@beta
npm install @prisma/client @auth/prisma-adapter
```

#### Setup

**app/api/auth/[...nextauth]/route.ts:**
```tsx
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})

export const { GET, POST } = handlers
```

#### Middleware

**middleware.ts:**
```tsx
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

#### Componentes

```tsx
"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export function LoginButton() {
  return <button onClick={() => signIn()}>Login</button>
}

export function LogoutButton() {
  return <button onClick={() => signOut()}>Logout</button>
}

export function UserInfo() {
  const { data: session } = useSession()
  return <div>{session?.user?.name}</div>
}
```

---

## 🗄️ 2. Database

### Setup Prisma

#### Instalação

```bash
npm install prisma @prisma/client
npx prisma init
```

#### Schema

**prisma/schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Auth models
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(MEMBER)
  accounts      Account[]
  sessions      Session[]
  campaigns     Campaign[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// App models
model Campaign {
  id          String   @id @default(cuid())
  name        String
  brand       String
  objective   String
  brief       String?
  status      CampaignStatus @default(DRAFT)
  progress    Int      @default(0)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  assets      Asset[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum CampaignStatus {
  DRAFT
  PROCESSING
  QA
  COMPLETED
}

model Asset {
  id          String   @id @default(cuid())
  name        String
  url         String
  format      String
  platform    String
  width       Int
  height      Int
  fileSize    Int
  performance Int?     // 1-5 rating
  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}
```

#### Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### Client

**lib/db.ts:**
```tsx
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

---

## 🛣️ 3. API Routes

### Campanhas CRUD

**app/api/campaigns/route.ts:**
```tsx
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/campaigns
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    include: { assets: true },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(campaigns)
}

// POST /api/campaigns
export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  const campaign = await prisma.campaign.create({
    data: {
      name: body.name,
      brand: body.brand,
      objective: body.objective,
      brief: body.brief,
      userId: session.user.id,
    }
  })

  return NextResponse.json(campaign)
}
```

**app/api/campaigns/[id]/route.ts:**
```tsx
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/campaigns/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { assets: true }
  })

  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(campaign)
}

// PUT /api/campaigns/:id
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  const campaign = await prisma.campaign.update({
    where: { id: params.id },
    data: body
  })

  return NextResponse.json(campaign)
}

// DELETE /api/campaigns/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.campaign.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
}
```

---

## 📤 4. File Upload

### Setup UploadThing

```bash
npm install uploadthing @uploadthing/react
```

**app/api/uploadthing/core.ts:**
```tsx
import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      const session = await auth()
      if (!session) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      console.log("file url", file.url)
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
```

**Componente:**
```tsx
"use client"

import { UploadButton } from "@/lib/uploadthing"

export function Uploader() {
  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        console.log("Files: ", res)
        alert("Upload Completed")
      }}
      onUploadError={(error: Error) => {
        alert(`ERROR! ${error.message}`)
      }}
    />
  )
}
```

---

## 🤖 5. AI Integrations

### OpenAI

```bash
npm install openai
```

**lib/openai.ts:**
```tsx
import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateCopy(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  })

  return completion.choices[0].message.content
}

export async function generateImage(prompt: string) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
  })

  return response.data[0].url
}
```

### Anthropic Claude

```bash
npm install @anthropic-ai/sdk
```

**lib/anthropic.ts:**
```tsx
import Anthropic from "@anthropic-ai/sdk"

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeBrandCompliance(
  guidelines: string,
  content: string
) {
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Analyze if this content follows brand guidelines:\n\nGuidelines: ${guidelines}\n\nContent: ${content}`
    }],
  })

  return message.content
}
```

---

## 📊 6. Background Jobs

### Setup Inngest

```bash
npm install inngest
```

**lib/inngest.ts:**
```tsx
import { Inngest } from "inngest"

export const inngest = new Inngest({ id: "creativeai" })

export const processCampaign = inngest.createFunction(
  { id: "process-campaign" },
  { event: "campaign.created" },
  async ({ event, step }) => {
    // Step 1: Generate variations
    await step.run("generate-variations", async () => {
      // Call OpenAI/DALL-E
    })

    // Step 2: QA Check
    await step.run("qa-check", async () => {
      // Visual QA
    })

    // Step 3: Export
    await step.run("export-assets", async () => {
      // Upload to Drive
    })
  }
)
```

---

## 💳 7. Payments (Stripe)

```bash
npm install stripe @stripe/stripe-js
```

**lib/stripe.ts:**
```tsx
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function createCheckoutSession(userId: string, priceId: string) {
  const session = await stripe.checkout.sessions.create({
    customer: userId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
  })

  return session.url
}
```

---

## 🔄 8. Data Fetching no Client

### React Query (TanStack Query)

```bash
npm install @tanstack/react-query
```

**Setup:**
```tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

**Uso:**
```tsx
"use client"

import { useQuery, useMutation } from "@tanstack/react-query"

export function CampaignsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns")
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (newCampaign) => {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        body: JSON.stringify(newCampaign),
      })
      return res.json()
    },
  })

  if (isLoading) return <Loading />

  return (
    <div>
      {data?.map(campaign => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  )
}
```

---

## 📚 Recursos

- [NextAuth.js Docs](https://next-auth.js.org)
- [Prisma Docs](https://www.prisma.io/docs)
- [UploadThing Docs](https://docs.uploadthing.com)
- [OpenAI API](https://platform.openai.com/docs)
- [Stripe Docs](https://stripe.com/docs)

---

**Próximo:** [Roadmap](./12-ROADMAP.md)
