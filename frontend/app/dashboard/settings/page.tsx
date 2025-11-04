import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie preferências e integrações</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>Dados principais da sua organização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Nome da Empresa</Label>
                <Input id="company" defaultValue="Agência Demo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="contato@agenciademo.com" />
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferências de Geração</CardTitle>
              <CardDescription>Configure o comportamento padrão do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>QA Automatizado</Label>
                  <p className="text-sm text-muted-foreground">Ativar validação automática em todas as campanhas</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aprendizado de Performance</Label>
                  <p className="text-sm text-muted-foreground">Aplicar insights de campanhas anteriores</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exportação Automática</Label>
                  <p className="text-sm text-muted-foreground">Enviar assets para Google Drive automaticamente</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrações Ativas</CardTitle>
              <CardDescription>Conecte suas plataformas de anúncios e armazenamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Meta Ads", status: "connected", description: "Sincronização de performance ativa" },
                { name: "Google Ads", status: "connected", description: "Sincronização de performance ativa" },
                { name: "Google Drive", status: "connected", description: "Exportação automática configurada" },
                { name: "Slack", status: "disconnected", description: "Receba notificações no Slack" },
              ].map((integration, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <div className="font-medium">{integration.name}</div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                      {integration.status === "connected" ? "Conectado" : "Desconectado"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {integration.status === "connected" ? "Configurar" : "Conectar"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Membros da Equipe</CardTitle>
              <CardDescription>Gerencie acesso e permissões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Maria Silva", email: "maria@agenciademo.com", role: "Admin" },
                { name: "João Santos", email: "joao@agenciademo.com", role: "Editor" },
                { name: "Ana Costa", email: "ana@agenciademo.com", role: "Editor" },
              ].map((member, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <div className="font-medium">{member.name}</div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{member.role}</Badge>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
              <Button className="w-full">Convidar Membro</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plano Atual</CardTitle>
              <CardDescription>Professional Plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensalidade:</span>
                  <span className="font-bold">R$ 12.500/mês</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variações usadas:</span>
                  <span className="font-medium">402/750</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Próxima cobrança:</span>
                  <span className="font-medium">15 Fev 2025</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  Alterar Plano
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Ver Faturas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
