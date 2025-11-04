import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  ImageIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Zap,
  Plus,
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da produção criativa e performance</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Link>
        </Button>
      </div>

      <div className="p-6 space-y-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Variações Geradas</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+23%</span> vs. mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+2.1%</span> vs. mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tempo Economizado</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">187h</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-muted-foreground">Este mês</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CTR Médio</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.8%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+1.2%</span> vs. baseline
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campaigns">Campanhas Recentes</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights de IA</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas em Produção</CardTitle>
                <CardDescription>Status das campanhas ativas no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      name: "Campanha Verão 2025 - E-commerce Fashion",
                      brand: "Fashion Brand",
                      status: "processing",
                      progress: 67,
                      variations: "402/600",
                      eta: "2h 15min",
                    },
                    {
                      name: "Black Friday - Eletrônicos",
                      brand: "Tech Store",
                      status: "qa",
                      progress: 100,
                      variations: "850/850",
                      eta: "Em revisão",
                    },
                    {
                      name: "Lançamento Produto - SaaS B2B",
                      brand: "SaaS Company",
                      status: "completed",
                      progress: 100,
                      variations: "300/300",
                      eta: "Concluído",
                    },
                  ].map((campaign, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">{campaign.brand}</div>
                        </div>
                        <Badge
                          variant={
                            campaign.status === "completed"
                              ? "default"
                              : campaign.status === "qa"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {campaign.status === "completed" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Concluído
                            </>
                          ) : campaign.status === "qa" ? (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" /> QA
                            </>
                          ) : (
                            <>
                              <Zap className="h-3 w-3 mr-1" /> Processando
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{campaign.variations} variações</span>
                        </div>
                        <Progress value={campaign.progress} />
                        <div className="text-xs text-muted-foreground">{campaign.eta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Formato</CardTitle>
                  <CardDescription>CTR médio por tipo de anúncio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { format: "Meta Stories", ctr: "4.2%", change: "+15%", positive: true },
                    { format: "Meta Feed", ctr: "3.8%", change: "+8%", positive: true },
                    { format: "Google Display", ctr: "2.9%", change: "-3%", positive: false },
                    { format: "Meta Reels", ctr: "5.1%", change: "+22%", positive: true },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{item.format}</div>
                        <div className="text-2xl font-bold">{item.ctr}</div>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm ${item.positive ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {item.change}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conformidade Técnica</CardTitle>
                  <CardDescription>Últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de Conformidade</span>
                      <span className="font-bold text-green-600">99.7%</span>
                    </div>
                    <Progress value={99.7} className="h-2" />
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peças aprovadas:</span>
                      <span className="font-medium">2,839</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rejeitadas (specs):</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Em revisão:</span>
                      <span className="font-medium">23</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recomendações de IA</CardTitle>
                <CardDescription>Insights baseados em análise de performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "Imagens com faces humanas têm melhor performance",
                    description:
                      "Anúncios com rostos humanos mostraram CTR 23% superior (p<0.01). Recomendamos aumentar uso em próximas campanhas.",
                    impact: "Alto",
                    confidence: "95%",
                  },
                  {
                    title: "CTAs com urgência convertem mais",
                    description:
                      'Textos com senso de urgência ("Últimas unidades", "Oferta por tempo limitado") aumentaram conversão em 18%.',
                    impact: "Médio",
                    confidence: "89%",
                  },
                  {
                    title: "Paleta de cores quentes supera cores frias",
                    description:
                      "Variações com tons quentes (vermelho, laranja, amarelo) tiveram engajamento 12% maior no público 25-34 anos.",
                    impact: "Médio",
                    confidence: "82%",
                  },
                ].map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">{insight.title}</div>
                        <div className="text-sm text-muted-foreground">{insight.description}</div>
                      </div>
                      <Badge variant={insight.impact === "Alto" ? "default" : "secondary"}>{insight.impact}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Confiança: {insight.confidence}</span>
                      <Button size="sm" variant="outline" className="ml-auto bg-transparent">
                        Aplicar Recomendação
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
