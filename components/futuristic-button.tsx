import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface FuturisticButtonProps extends React.ComponentProps<typeof Button> {
  glowEffect?: boolean
  popEffect?: boolean
}

export const FuturisticButton = forwardRef<HTMLButtonElement, FuturisticButtonProps>(
  ({ glowEffect = false, popEffect = true, className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn("glass-button", glowEffect && "active-item", popEffect && "pop-effect", className)}
        {...props}
      >
        {children}
      </Button>
    )
  },
)

FuturisticButton.displayName = "FuturisticButton"
