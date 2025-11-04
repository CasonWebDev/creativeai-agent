"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function AppHeader() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <label htmlFor="global-search" className="sr-only">
            Buscar campanhas e assets
          </label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="global-search"
            placeholder="Buscar campanhas, assets..."
            className="pl-9"
            aria-label="Buscar campanhas e assets"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificações (3 não lidas)"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            aria-hidden="true"
          >
            3
          </Badge>
        </Button>
      </div>
    </header>
  )
}
