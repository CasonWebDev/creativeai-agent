"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FolderOpen, ImageIcon, BarChart3, Settings, Sparkles, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campanhas", href: "/dashboard/campaigns", icon: FolderOpen },
  { name: "Biblioteca", href: "/dashboard/library", icon: ImageIcon },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/30">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center" aria-hidden="true">
          <Sparkles className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
        </div>
        <span className="font-semibold text-lg">CreativeAI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4" aria-label="Menu principal do dashboard">
        <Button asChild className="w-full justify-start mb-4">
          <Link href="/dashboard/campaigns/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Nova Campanha
          </Link>
        </Button>

        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">AG</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Agência Demo</div>
            <div className="text-xs text-muted-foreground truncate">Professional Plan</div>
          </div>
        </div>
      </div>
    </div>
  )
}
