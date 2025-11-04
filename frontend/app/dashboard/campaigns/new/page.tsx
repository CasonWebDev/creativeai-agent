"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Upload, FileText, ImageIcon, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function NewCampaignPage() {
  const [step, setStep] = useState(1)

  const formats = [
    { id: "meta-feed", name: "Meta Feed", specs: "1080x1080" },
    { id: "meta-stories", name: "Meta Stories", specs: "1080x1920" },
    { id: "meta-reels", name: "Meta Reels", specs: "1080x1920" },
    { id: "google-display", name: "Google Display", specs: "300x250, 728x90" },
    { id: "google-search", name: "Google Search", specs: "Texto" },
    { id: "youtube", name: "YouTube", specs: "1920x1080" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Campanha</h1>
          <p className="text-muted-foreground">Configure sua campanha criativa em 4 etapas</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Informações Básicas" },
              { num: 2, label: "Brand Assets" },
              { num: 3, label: "Formatos & Specs" },
              { num: 4, label: "Revisão" },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                  </div>
                  <span className="text-sm font-medium text-center">{s.label}</span>
                </div>
                {index < 3 && <div className={`h-0.5 flex-1 ${step > s.num ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Defina os detalhes principais da campanha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Nome da Campanha</Label>
              <Input id="campaign-name" placeholder="Ex: Campanha Verão 2025" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" placeholder="Selecione ou crie uma marca" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo da Campanha</Label>
              <RadioGroup defaultValue="awareness">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="awareness" id="awareness" />
                  <Label htmlFor="awareness" className="font-normal">
                    Awareness - Aumentar reconhecimento de marca
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="consideration" id="consideration" />
                  <Label htmlFor="consideration" className="font-normal">
                    Consideration - Gerar interesse e engajamento
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="conversion" id="conversion" />
                  <Label htmlFor="conversion" className="font-normal">
                    Conversion - Impulsionar vendas e ações
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brief">Brief da Campanha</Label>
              <Textarea
                id="brief"
                placeholder="Descreva os objetivos, público-alvo, mensagem principal e tom de voz..."
                rows={6}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Brand Assets</CardTitle>
            <CardDescription>Faça upload dos materiais de marca e Key Visual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Brand Guidelines (PDF)</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">Clique para fazer upload ou arraste o arquivo</p>
                <p className="text-xs text-muted-foreground">PDF até 50MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Key Visual Aprovado</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">Clique para fazer upload ou arraste o arquivo</p>
                <p className="text-xs text-muted-foreground">PNG, JPG até 20MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assets Adicionais (Logos, Ícones, etc.)</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">Clique para fazer upload ou arraste os arquivos</p>
                <p className="text-xs text-muted-foreground">Múltiplos arquivos aceitos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Formatos & Especificações</CardTitle>
            <CardDescription>Selecione os formatos de anúncio que deseja gerar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Formatos de Anúncio</Label>
              <div className="grid md:grid-cols-2 gap-4">
                {formats.map((format) => (
                  <div
                    key={format.id}
                    className="flex items-start space-x-3 border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <Checkbox id={format.id} />
                    <div className="flex-1">
                      <Label htmlFor={format.id} className="font-medium cursor-pointer">
                        {format.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{format.specs}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variations">Número de Variações por Formato</Label>
              <Input id="variations" type="number" defaultValue="50" />
              <p className="text-xs text-muted-foreground">Total estimado: 300 variações (6 formatos × 50 variações)</p>
            </div>

            <div className="space-y-2">
              <Label>Opções Avançadas</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="qa-auto" defaultChecked />
                  <Label htmlFor="qa-auto" className="font-normal">
                    Ativar QA automatizado
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="performance" defaultChecked />
                  <Label htmlFor="performance" className="font-normal">
                    Aplicar aprendizados de performance anteriores
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="export" defaultChecked />
                  <Label htmlFor="export" className="font-normal">
                    Exportar automaticamente para Google Drive
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisão Final</CardTitle>
            <CardDescription>Confirme os detalhes antes de iniciar a geração</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Informações da Campanha</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium">Campanha Verão 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marca:</span>
                    <span className="font-medium">Fashion Brand</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Objetivo:</span>
                    <span className="font-medium">Conversion</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Assets</h3>
                <div className="space-y-2">
                  <Badge variant="secondary">Brand Guidelines.pdf</Badge>
                  <Badge variant="secondary">Key Visual.png</Badge>
                  <Badge variant="secondary">+3 assets adicionais</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Formatos Selecionados</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>Meta Feed</Badge>
                  <Badge>Meta Stories</Badge>
                  <Badge>Meta Reels</Badge>
                  <Badge>Google Display</Badge>
                  <Badge>Google Search</Badge>
                  <Badge>YouTube</Badge>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total de Variações</span>
                  <span className="text-2xl font-bold">300</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tempo estimado:</span>
                  <span className="font-medium">3-4 horas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          Voltar
        </Button>
        {step < 4 ? (
          <Button onClick={() => setStep(Math.min(4, step + 1))}>Próximo</Button>
        ) : (
          <Button>Iniciar Geração</Button>
        )}
      </div>
    </div>
  )
}
