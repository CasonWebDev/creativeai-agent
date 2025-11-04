import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, ArrowLeft } from "lucide-react"

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      description: "Para PMEs e pequenas agências",
      setup: "R$ 17.500",
      monthly: "R$ 6.000",
      pieces: "300 peças/mês",
      support: "Standard",
      brands: "1 marca",
      features: [
        "300 variações por mês",
        "Suporte standard",
        "QA automatizado",
        "Exportação para Google Drive",
        "Analytics básico",
      ],
      popular: false,
    },
    {
      name: "Professional",
      description: "Para agências médias e marcas",
      setup: "R$ 30.000",
      monthly: "R$ 12.500",
      pieces: "750 peças/mês",
      support: "Priority",
      brands: "3 marcas",
      features: [
        "750 variações por mês",
        "Suporte prioritário",
        "QA automatizado avançado",
        "Múltiplas marcas",
        "Analytics completo",
        "Aprendizado de performance",
        "Integrações Meta + Google Ads",
      ],
      popular: true,
    },
    {
      name: "Agency",
      description: "Para agências grandes",
      setup: "R$ 60.000",
      monthly: "R$ 25.000",
      pieces: "2.000 peças/mês",
      support: "Dedicated",
      brands: "10 marcas",
      features: [
        "2.000 variações por mês",
        "Suporte dedicado",
        "QA automatizado premium",
        "Até 10 marcas",
        "Analytics avançado",
        "API access",
        "Onboarding personalizado",
        "Account manager dedicado",
      ],
      popular: false,
    },
    {
      name: "Enterprise",
      description: "Para grupos e holdings",
      setup: "R$ 125.000+",
      monthly: "Custom",
      pieces: "Ilimitado",
      support: "24/7 Dedicated",
      brands: "Ilimitado",
      features: [
        "Variações ilimitadas",
        "Suporte 24/7",
        "White-label disponível",
        "Marcas ilimitadas",
        "SLA customizado",
        "Integrações personalizadas",
        "Treinamento on-site",
        "Consultoria estratégica",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">CreativeAI Agent</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Planos e Preços</h1>
          <p className="text-muted-foreground text-lg">Escolha o plano ideal para escalar sua produção criativa</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <Card key={index} className={tier.popular ? "border-primary shadow-lg" : ""}>
              <CardHeader>
                {tier.popular && <Badge className="w-fit mb-2">Mais Popular</Badge>}
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Setup</div>
                  <div className="text-2xl font-bold">{tier.setup}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Mensalidade</div>
                  <div className="text-3xl font-bold">{tier.monthly}</div>
                  {tier.monthly !== "Custom" && <div className="text-sm text-muted-foreground">/mês</div>}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peças:</span>
                    <span className="font-medium">{tier.pieces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Suporte:</span>
                    <span className="font-medium">{tier.support}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marcas:</span>
                    <span className="font-medium">{tier.brands}</span>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                  {tier.monthly === "Custom" ? "Falar com Vendas" : "Começar Agora"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* ROI Calculator */}
        <div className="max-w-3xl mx-auto mt-20">
          <Card>
            <CardHeader>
              <CardTitle>Calculadora de ROI</CardTitle>
              <CardDescription>Veja quanto você pode economizar com automação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Processo Manual</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo de produção:</span>
                      <span className="font-medium">240h/mês</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custo por hora:</span>
                      <span className="font-medium">R$ 150</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Variações:</span>
                      <span className="font-medium">50/campanha</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-semibold">
                      <span>Custo mensal:</span>
                      <span>R$ 36.000</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Com CreativeAI Agent</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo de produção:</span>
                      <span className="font-medium text-green-600">36h/mês (-85%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custo operacional:</span>
                      <span className="font-medium">R$ 5.400</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Variações:</span>
                      <span className="font-medium text-green-600">300/campanha (+500%)</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-semibold">
                      <span>Economia mensal:</span>
                      <span className="text-green-600">R$ 30.600</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">ROI no Primeiro Ano</div>
                <div className="text-4xl font-bold text-primary">2,539%</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
