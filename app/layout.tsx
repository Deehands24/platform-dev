import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./futuristic.css";
import { AuthProvider } from "@/lib/providers/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dynamic Database Builder",
  description: "Build and manage databases, tables, forms, and relationships in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
