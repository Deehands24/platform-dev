"use client"

import type React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Database, Table2, FormInput, GitBranch, Settings, Home } from "lucide-react"
import { cn } from "@/lib/utils"

type NavigationItem = {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
}

interface FuturisticSidebarProps {
  className?: string
  currentSection: string
  onNavigate: (section: string) => void
}

export function FuturisticSidebar({ className, currentSection, onNavigate }: FuturisticSidebarProps) {
  const navItems: NavigationItem[] = [
    {
      icon: Home,
      label: "Dashboard",
      href: "dashboard",
      active: currentSection === "dashboard",
    },
    {
      icon: Database,
      label: "Databases",
      href: "databases",
      active: currentSection === "databases",
    },
    {
      icon: Table2,
      label: "Tables",
      href: "tables",
      active: currentSection === "tables",
    },
    {
      icon: FormInput,
      label: "Forms",
      href: "forms",
      active: currentSection === "forms",
    },
    {
      icon: GitBranch,
      label: "Relationships",
      href: "relationships",
      active: currentSection === "relationships",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "settings",
      active: currentSection === "settings",
    },
  ]

  return (
    <Sidebar className={cn("w-64 border-0", className)} collapsible="icon">
      <SidebarHeader className="p-5">
        <h2 className="text-xl font-bold text-white">Platform Dev</h2>
        <p className="text-xs text-white/70">Dynamic Database Interface</p>
      </SidebarHeader>

      <SidebarContent className="frosted-glass-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/80">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={item.active}
                    onClick={() => onNavigate(item.href)}
                    tooltip={item.label}
                    className={cn("text-white hover:bg-white/10", item.active && "sidebar-active-item")}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
