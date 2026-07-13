// Convert hex to RGB
function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Lighten or darken a hex color by a percentage (-100 to 100)
export function adjustColor(hex, percent) {
  const { r, g, b } = hexToRgb(hex)
  const amount = Math.round(2.55 * percent)
  return rgbToHex(r + amount, g + amount, b + amount)
}

// Calculate relative luminance to decide if text should be black or white
export function getContrastText(hex) {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#0D0D0D' : '#F5F5F5'
}

// Generate a full derived palette from one background color
export function generatePalette(baseBg, mode) {
  const isDark = mode !== 'light'

  if (isDark) {
    return {
      bg: baseBg,
      bgCard: adjustColor(baseBg, 8),
      bgSurface: adjustColor(baseBg, 14),
      bgElevated: adjustColor(baseBg, 20),
      text: getContrastText(baseBg),
      textMuted: adjustColor(getContrastText(baseBg), -35),
      border: getContrastText(baseBg) === '#F5F5F5'
        ? 'rgba(255,255,255,0.12)'
        : 'rgba(0,0,0,0.12)'
    }
  } else {
    return {
      bg: baseBg,
      bgCard: adjustColor(baseBg, -6),
      bgSurface: adjustColor(baseBg, -10),
      bgElevated: adjustColor(baseBg, -16),
      text: getContrastText(baseBg),
      textMuted: adjustColor(getContrastText(baseBg), 35),
      border: getContrastText(baseBg) === '#F5F5F5'
        ? 'rgba(255,255,255,0.12)'
        : 'rgba(0,0,0,0.12)'
    }
  }
}