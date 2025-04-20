import type React from "react"
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import "@/app/globals.css"
import "@/app/futuristic.css"
import "@/app/futuristic-additions.css" // Add our new CSS
import { FuturisticThemeProvider } from "@/components/futuristic-theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><StackProvider app={stackServerApp}><StackTheme>
        <FuturisticThemeProvider>{children}</FuturisticThemeProvider>
      </StackTheme></StackProvider></body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
