import { createTheme } from "@/lib/create-theme"

export const futuristicTheme = createTheme({
  name: "futuristic",
  colors: {
    background: "220 10% 10%", // Dark gray
    foreground: "0 0% 95%", // Light gray/white
    card: "220 10% 15%", // Slightly lighter gray for cards
    "card-foreground": "0 0% 95%",
    popover: "220 10% 15%",
    "popover-foreground": "0 0% 95%",
    primary: "210 100% 50%", // Bright blue
    "primary-foreground": "0 0% 95%",
    secondary: "220 10% 20%", // Slightly lighter gray for secondary elements
    "secondary-foreground": "0 0% 95%",
    muted: "220 10% 20%",
    "muted-foreground": "0 0% 70%",
    accent: "210 100% 50%", // Bright blue accent
    "accent-foreground": "0 0% 95%",
    destructive: "0 100% 50%", // Bright red
    "destructive-foreground": "0 0% 95%",
    border: "220 10% 30%", // Slightly lighter gray for borders
    input: "220 10% 20%",
    ring: "210 100% 50%", // Bright blue ring
  },
  borderRadius: {
    lg: "0.75rem",
    md: "0.5rem",
    sm: "0.25rem",
  },
})
