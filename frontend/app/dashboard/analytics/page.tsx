import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Zap, Eye, MousePointerClick } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Análise detalhada de performance e insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Impressões Totais</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+18%</span> vs. período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CTR Médio</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.8%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+1.2%</span> vs. baseline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-red-600">-0.3%</span> vs. período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CPA Médio</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 24,50</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">-12%</span> vs. período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="creative">Análise Criativa</TabsTrigger>
          <TabsTrigger value="audience">Audiência</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Variações com melhor performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Variação #127", ctr: "5.2%", conversions: 847, format: "Meta Stories" },
                  { name: "Variação #89", ctr: "4.8%", conversions: 723, format: "Meta Reels" },
                  { name: "Variação #203", ctr: "4.5%", conversions: 691, format: "Meta Feed" },
                  { name: "Variação #45", ctr: "4.3%", conversions: 654, format: "Google Display" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <Badge variant="secondary" className="text-xs">
                        {item.format}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{item.ctr}</div>
                      <div className="text-xs text-muted-foreground">{item.conversions} conversões</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance por Plataforma</CardTitle>
                <CardDescription>Comparativo entre canais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { platform: "Meta Ads", impressions: "1.2M", ctr: "4.1%", cpa: "R$ 22,30" },
                  { platform: "Google Ads", impressions: "980K", ctr: "3.5%", cpa: "R$ 26,80" },
                  { platform: "YouTube", impressions: "220K", ctr: "2.8%", cpa: "R$ 31,50" },
                ].map((item, index) => (
                  <div key={index} className="space-y-2 border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.platform}</span>
                      <Badge>{item.ctr} CTR</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Impressões</div>
                        <div className="font-medium">{item.impressions}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">CPA</div>
                        <div className="font-medium">{item.cpa}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="creative">
          <Card>
            <CardHeader>
              <CardTitle>Insights Criativos</CardTitle>
              <CardDescription>Padrões identificados pela IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  insight: "Cores quentes aumentam engajamento",
                  detail: "Variações com paleta quente (vermelho, laranja) têm CTR 23% superior",
                  confidence: "Alta",
                },
                {
                  insight: "Faces humanas melhoram performance",
                  detail: "Assets com rostos humanos convertem 18% mais que produtos isolados",
                  confidence: "Alta",
                },
                {
                  insight: "CTAs diretos funcionam melhor",
                  detail: 'Textos com ação clara ("Compre Agora", "Saiba Mais") superam CTAs genéricos em 15%',
                  confidence: "Média",
                },
              ].map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="font-medium">{item.insight}</div>
                    <Badge variant={item.confidence === "Alta" ? "default" : "secondary"}>{item.confidence}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Audiência</CardTitle>
              <CardDescription>Performance por segmento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { segment: "18-24 anos", ctr: "4.5%", conversions: "2.3%", size: "35%" },
                { segment: "25-34 anos", ctr: "3.9%", conversions: "2.8%", size: "42%" },
                { segment: "35-44 anos", ctr: "3.2%", conversions: "1.9%", size: "18%" },
                { segment: "45+ anos", ctr: "2.1%", conversions: "1.2%", size: "5%" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <div className="font-medium">{item.segment}</div>
                    <div className="text-sm text-muted-foreground">{item.size} da audiência</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">{item.ctr}</span> CTR
                    </div>
                    <div className="text-sm text-muted-foreground">{item.conversions} conversão</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
