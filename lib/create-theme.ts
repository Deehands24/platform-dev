export type Theme = {
  name: string
  colors: Record<string, string>
  borderRadius?: {
    lg: string
    md: string
    sm: string
  }
}

export function createTheme(theme: Theme): Theme {
  return theme
}
