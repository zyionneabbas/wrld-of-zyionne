import { createContext, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { generatePalette, getContrastText } from '../utils/colorUtils'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth()

  useEffect(() => {
    const appearance = user?.appearance
    if (!appearance) return

    const root = document.documentElement

    if (appearance.mode === 'light') {
      root.setAttribute('data-theme', 'light')
    } else {
      root.removeAttribute('data-theme')
    }

    // Generate a full palette derived from the chosen background
    if (appearance.backgroundColor) {
      const palette = generatePalette(appearance.backgroundColor, appearance.mode)

      root.style.setProperty('--color-bg', palette.bg)
      root.style.setProperty('--color-bg-card', palette.bgCard)
      root.style.setProperty('--color-bg-surface', palette.bgSurface)
      root.style.setProperty('--color-bg-elevated', palette.bgElevated)
      root.style.setProperty('--color-text', palette.text)
      root.style.setProperty('--color-text-muted', palette.textMuted)
      root.style.setProperty('--color-border', palette.border)
    }

    // Primary color stays as the accent — always auto-contrasted for the gold text-on-button case
    if (appearance.primaryColor) {
      root.style.setProperty('--color-primary', appearance.primaryColor)
      root.style.setProperty('--color-primary-text', getContrastText(appearance.primaryColor))
    }

    if (appearance.font) {
      root.style.setProperty('--font-primary', `'${appearance.font}', sans-serif`)
    }

  }, [user?.appearance])

  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)