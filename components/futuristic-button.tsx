import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { buttonVariants } from "@/components/ui/button"

interface FuturisticButtonProps extends React.ComponentProps<typeof Button> {
  glowEffect?: boolean
  popEffect?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export const FuturisticButton = forwardRef<HTMLButtonElement, FuturisticButtonProps>(
  ({ glowEffect = false, popEffect = true, className, children, variant, size, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center px-4 py-2 text-white font-medium rounded-md border border-transparent",
          "bg-blue-600 hover:bg-blue-700", // Light blue background by default
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          "transition-all duration-150 ease-in-out",
          "shadow-[0_0_15px_rgba(66,153,225,0.5)]",
          "hover:shadow-[0_0_25px_rgba(66,153,225,0.8)]",
          "active:shadow-[0_0_5px_rgba(66,153,225,0.3)]",
          glowEffect && "active-item",
          popEffect && "pop-effect",
          buttonVariants({ variant, size, className }),
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    )
  },
)

FuturisticButton.displayName = "FuturisticButton"
