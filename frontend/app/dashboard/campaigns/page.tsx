import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, MoreVertical, CheckCircle2, Clock, AlertCircle, Zap, Plus, Calendar, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function CampaignsPage() {
  const campaigns = [
    {
      id: 1,
      name: "Campanha Verão 2025 - E-commerce Fashion",
      brand: "Fashion Brand",
      status: "processing",
      progress: 67,
      variations: 402,
      total: 600,
      created: "15 Jan 2025",
      owner: "Maria Silva",
    },
    {
      id: 2,
      name: "Black Friday - Eletrônicos",
      brand: "Tech Store",
      status: "qa",
      progress: 100,
      variations: 850,
      total: 850,
      created: "12 Jan 2025",
      owner: "João Santos",
    },
    {
      id: 3,
      name: "Lançamento Produto - SaaS B2B",
      brand: "SaaS Company",
      status: "completed",
      progress: 100,
      variations: 300,
      total: 300,
      created: "08 Jan 2025",
      owner: "Ana Costa",
    },
    {
      id: 4,
      name: "Natal 2024 - Varejo Alimentício",
      brand: "Food Retail",
      status: "completed",
      progress: 100,
      variations: 450,
      total: 450,
      created: "20 Dez 2024",
      owner: "Pedro Lima",
    },
    {
      id: 5,
      name: "Campanha Institucional Q1",
      brand: "Corporate Brand",
      status: "draft",
      progress: 0,
      variations: 0,
      total: 200,
      created: "18 Jan 2025",
      owner: "Maria Silva",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default">
            <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" /> Concluído
          </Badge>
        )
      case "qa":
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" aria-hidden="true" /> QA
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline">
            <Zap className="h-3 w-3 mr-1" aria-hidden="true" /> Processando
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" aria-hidden="true" /> Rascunho
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campanhas</h1>
          <p className="text-muted-foreground">Gerencie todas as suas campanhas criativas</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/campaigns/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Nova Campanha
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <label htmlFor="search-campaigns" className="sr-only">
                Buscar campanhas
              </label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="search-campaigns"
                placeholder="Buscar campanhas..."
                className="pl-9"
                aria-label="Buscar campanhas por nome ou marca"
              />
            </div>
            <Button variant="outline" className="gap-2 bg-transparent" aria-label="Abrir filtros de campanhas">
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas (5)</TabsTrigger>
          <TabsTrigger value="active">Ativas (2)</TabsTrigger>
          <TabsTrigger value="completed">Concluídas (2)</TabsTrigger>
          <TabsTrigger value="draft">Rascunhos (1)</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span>{campaign.brand}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {campaign.created}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" aria-hidden="true" />
                        {campaign.owner}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(campaign.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Ações para ${campaign.name}`}>
                          <MoreVertical className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Variações</span>
                    <span className="font-medium">
                      {campaign.variations}/{campaign.total}
                    </span>
                  </div>
                  {campaign.status !== "draft" && (
                    <div
                      role="progressbar"
                      aria-label={`Progresso da geração de variações: ${campaign.progress}% completo`}
                      aria-valuenow={campaign.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="h-2 bg-muted rounded-full overflow-hidden"
                    >
                      <div className="h-full bg-primary transition-all" style={{ width: `${campaign.progress}%` }} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active">
          <p className="text-center text-muted-foreground py-8">Filtro de campanhas ativas</p>
        </TabsContent>

        <TabsContent value="completed">
          <p className="text-center text-muted-foreground py-8">Filtro de campanhas concluídas</p>
        </TabsContent>

        <TabsContent value="draft">
          <p className="text-center text-muted-foreground py-8">Filtro de rascunhos</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
