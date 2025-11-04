import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Download, Share2, MoreVertical, Grid3x3, List } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function LibraryPage() {
  const assets = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Variação ${i + 1}`,
    campaign: "Campanha Verão 2025",
    format: i % 3 === 0 ? "Meta Feed" : i % 3 === 1 ? "Meta Stories" : "Google Display",
    date: "15 Jan 2025",
    performance: Math.floor(Math.random() * 5) + 1,
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Assets</h1>
          <p className="text-muted-foreground">Todos os assets gerados organizados em um só lugar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Selecionados
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar assets..." className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <div className="flex border rounded-lg">
              <Button variant="ghost" size="icon" className="rounded-r-none">
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-l-none border-l">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos (2,847)</TabsTrigger>
          <TabsTrigger value="meta">Meta Ads (1,523)</TabsTrigger>
          <TabsTrigger value="google">Google Ads (1,124)</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos (47)</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="group overflow-hidden hover:border-primary/50 transition-colors">
                <div className="aspect-square bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl text-muted-foreground/20">
                      {asset.format === "Meta Feed" ? "1:1" : asset.format === "Meta Stories" ? "9:16" : "16:9"}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Compartilhar</DropdownMenuItem>
                        <DropdownMenuItem>Adicionar aos Favoritos</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="font-medium text-sm truncate">{asset.name}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{asset.campaign}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {asset.format}
                    </Badge>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-1 rounded-full ${i < asset.performance ? "bg-primary" : "bg-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meta">
          <p className="text-center text-muted-foreground py-8">Assets do Meta Ads</p>
        </TabsContent>

        <TabsContent value="google">
          <p className="text-center text-muted-foreground py-8">Assets do Google Ads</p>
        </TabsContent>

        <TabsContent value="favorites">
          <p className="text-center text-muted-foreground py-8">Assets favoritos</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
