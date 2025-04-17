"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FuturisticCardProps extends React.ComponentProps<typeof Card> {
  glowEffect?: boolean
  floatingEffect?: boolean
  popEffect?: boolean
  children: React.ReactNode
}

export function FuturisticCard({
  glowEffect = false,
  floatingEffect = false,
  popEffect = false,
  className,
  children,
  ...props
}: FuturisticCardProps) {
  return (
    <Card
      className={cn(
        "glass-card edge-highlight",
        glowEffect && "active-item",
        floatingEffect && "floating-card",
        popEffect && "pop-effect",
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  )
}

export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
