"use client"

import type * as React from "react"
import { useEffect, useRef } from "react"

interface FocusTrapProps {
  children: React.ReactNode
}

export function FocusTrap({ children }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Find all focusable elements
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Function to handle tab key to trap focus
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        // If shift+tab and focus is on first element, move to last element
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // If tab and focus is on last element, move to first element
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Add event listener
    document.addEventListener("keydown", handleTabKey)

    // Clean up
    return () => {
      document.removeEventListener("keydown", handleTabKey)
    }
  }, [])

  return <div ref={containerRef}>{children}</div>
}
