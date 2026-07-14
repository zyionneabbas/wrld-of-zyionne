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

  // ... existing color logic stays the same ...

  // Handle custom drawn fonts
  if (appearance.font === 'custom' && appearance.customFontUrl) {
    const styleId = 'wrld-custom-font'
    let styleTag = document.getElementById(styleId)
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = styleId
      document.head.appendChild(styleTag)
    }
    styleTag.textContent = `
      @font-face {
        font-family: 'WRLDCustomFont';
        src: url('${appearance.customFontUrl}') format('opentype');
      }
    `
    root.style.setProperty('--font-primary', "'WRLDCustomFont', sans-serif")
  } else if (appearance.font) {
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