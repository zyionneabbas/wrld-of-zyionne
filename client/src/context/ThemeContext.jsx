import { createContext, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth()

  useEffect(() => {
    const appearance = user?.appearance

    if (!appearance) return

    const root = document.documentElement

    // Apply mode
    if (appearance.mode === 'light') {
      root.setAttribute('data-theme', 'light')
    } else {
      root.removeAttribute('data-theme')
    }

    // Apply custom colors as CSS variable overrides
    if (appearance.primaryColor) {
      root.style.setProperty('--color-primary', appearance.primaryColor)
    }
    if (appearance.backgroundColor) {
      root.style.setProperty('--color-bg', appearance.backgroundColor)
    }
    if (appearance.accentColor) {
      root.style.setProperty('--color-accent', appearance.accentColor)
    }

    // Apply font
    if (appearance.font) {
      root.style.setProperty('--font-primary', `'${appearance.font}', sans-serif`)
    }

    if (appearance.typingFont) {
      root.style.setProperty('--font-typing', `'${appearance.typingFont}', sans-serif`)
    }

  }, [user?.appearance])

  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)