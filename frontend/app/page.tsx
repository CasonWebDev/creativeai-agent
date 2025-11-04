import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SkipLink } from "@/components/skip-link"
import { ArrowRight, Zap, Target, TrendingUp, Shield, Sparkles, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Skip Navigation */}
      <SkipLink href="#main-content">Pular para o conteúdo principal</SkipLink>

      {/* Header */}
      <header className="border-b" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center" aria-hidden="true">
              <Sparkles className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="font-semibold text-lg">CreativeAI Agent</span>
          </div>
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#workflow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </nav>
          <Button>Começar Agora</Button>
        </div>
      </header>

      {/* Hero Section */}
      <main id="main-content">
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
            Powered by Multi-AI Orchestration
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            Automatize a Produção de Mídia Digital com IA
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            Produza 300+ variações criativas em horas, não semanas. Mantenha consistência de marca e aumente performance
            em 35%.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/dashboard">
                Agendar Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#workflow">Ver Como Funciona</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold">85%</div>
              <div className="text-sm text-muted-foreground">Redução de Tempo</div>
            </div>
            <div>
              <div className="text-3xl font-bold">2,500%</div>
              <div className="text-sm text-muted-foreground">ROI no Ano 1</div>
            </div>
            <div>
              <div className="text-3xl font-bold">99.5%</div>
              <div className="text-sm text-muted-foreground">Conformidade Técnica</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recursos Principais</h2>
            <p className="text-muted-foreground">Tecnologia de ponta para automatizar seu fluxo criativo</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Orquestração Multi-IA</CardTitle>
                <CardDescription>
                  Coordena múltiplas APIs (OpenAI, Stability AI, Anthropic) selecionando o modelo ideal para cada tarefa
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>QA Visual Automatizado</CardTitle>
                <CardDescription>
                  Detecção de 95% de problemas visuais sem intervenção humana através de visão computacional
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Brand Compliance</CardTitle>
                <CardDescription>
                  Parser inteligente de guidelines com embedding vetorial para garantir consistência de marca
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Aprendizado de Performance</CardTitle>
                <CardDescription>
                  Ingestão automatizada de dados de Meta/Google Ads com recomendações acionáveis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Analytics Avançado</CardTitle>
                <CardDescription>
                  Dashboard em tempo real com métricas de volumetria e performance criativa
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Exportação Inteligente</CardTitle>
                <CardDescription>
                  Organização automática com nomenclatura semântica e integração com Google Drive
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
            <p className="text-muted-foreground">Quatro etapas simples para transformar sua produção criativa</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                step: "01",
                title: "Ingestão de Marca",
                description:
                  "Upload de guidelines, assets e Key Visual aprovado. Sistema estrutura conhecimento de marca com NLP.",
              },
              {
                step: "02",
                title: "Desdobramento Inteligente",
                description:
                  "IA gera 300+ variações adaptadas para múltiplos formatos (Google Ads, Meta Ads, Stories, Reels).",
              },
              {
                step: "03",
                title: "QA Automatizado",
                description:
                  "Validação técnica e visual detecta problemas antes da exportação. Taxa de aprovação de 92%.",
              },
              {
                step: "04",
                title: "Otimização Contínua",
                description:
                  "Analytics de performance alimenta recomendações para próximas campanhas. Melhoria de 35% em CTR.",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Pronto para Transformar sua Produção Criativa?</h2>
            <p className="text-muted-foreground text-lg">
              Junte-se às agências que já economizam 85% do tempo de produção
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="gap-2">
                Começar Teste Gratuito
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Falar com Vendas
              </Button>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8" role="contentinfo">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CreativeAI Agent. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
