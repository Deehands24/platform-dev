"use client"

import type React from "react"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect } from "react"

export function FuturisticThemeProvider({ children }: { children: React.ReactNode }) {
  // Force the futuristic theme
  useEffect(() => {
    document.documentElement.classList.add("futuristic")
    document.documentElement.style.setProperty("--radius", "0.5rem")

    // Add the checker pattern to the body
    document.body.classList.add("futuristic-background")

    return () => {
      document.documentElement.classList.remove("futuristic")
      document.body.classList.remove("futuristic-background")
    }
  }, [])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="futuristic"
      enableSystem={false}
      themes={["futuristic"]}
      forcedTheme="futuristic"
    >
      {children}
    </NextThemesProvider>
  )
}
