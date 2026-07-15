import { createContext, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { generatePalette, getContrastText, adjustColorForMode } from '../utils/colorUtils'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth()

 useEffect(() => {
  const appearance = user?.appearance
  if (!appearance) return

  const root = document.documentElement

  // ... existing color logic stays the same ...

  // Handle custom drawn fonts
  if (appearance.backgroundColor) {
  const effectiveBg = adjustColorForMode(appearance.backgroundColor, appearance.mode)
  const palette = generatePalette(effectiveBg, appearance.mode)

  root.style.setProperty('--color-bg', palette.bg)
  root.style.setProperty('--color-bg-card', palette.bgCard)
  root.style.setProperty('--color-bg-surface', palette.bgSurface)
  root.style.setProperty('--color-bg-elevated', palette.bgElevated)
  root.style.setProperty('--color-text', palette.text)
  root.style.setProperty('--color-text-muted', palette.textMuted)
  root.style.setProperty('--color-border', palette.border)
  }

}, [user?.appearance])

  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)