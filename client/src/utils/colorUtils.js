export { hexToHsl, hslToHex }

function hexToHsl(hex) {
  let { r, g, b } = hexToRgb(hex)
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return rgbToHex(r * 255, g * 255, b * 255)
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16)
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Adjust lightness in HSL space — perceptually consistent, works on any hue
export function adjustLightness(hex, deltaPercent) {
  const { h, s, l } = hexToHsl(hex)
  const newL = Math.max(0, Math.min(100, l + deltaPercent))
  return hslToHex(h, s, newL)
}

export function getContrastText(hex) {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#0D0D0D' : '#F5F5F5'
}

export function generatePalette(baseBg, mode) {
  const { l } = hexToHsl(baseBg)
  const isDarkBase = l < 50

  return {
    bg: baseBg,
    bgCard: adjustLightness(baseBg, isDarkBase ? 6 : -6),
    bgSurface: adjustLightness(baseBg, isDarkBase ? 14 : -14),
    bgElevated: adjustLightness(baseBg, isDarkBase ? 20 : -20),
    text: getContrastText(baseBg),
    textMuted: isDarkBase
      ? adjustLightness(getContrastText(baseBg), -15)
      : adjustLightness(getContrastText(baseBg), 15),
    border: getContrastText(baseBg) === '#F5F5F5'
      ? 'rgba(255,255,255,0.2)'
      : 'rgba(0,0,0,0.2)'
  }
}

// Adjusts a color to fit dark or light mode while preserving its hue identity
export function adjustColorForMode(hex, mode) {
  const { h, s, l } = hexToHsl(hex)

  if (mode === 'light') {
    if (l < 50) {
      // Too dark for light mode — flip to a bright, vivid version of the same hue
      const newL = Math.min(95, (100 - l) + 10)
      const newS = Math.min(100, s + 10)
      return hslToHex(h, newS, newL)
    }
    return hex // Already light — leave it exactly as chosen
  } else {
    if (l >= 50) {
      // Too light for dark mode — flip to a deep, rich version of the same hue
      const newL = Math.max(10, (100 - l) - 10)
      const newS = Math.min(100, s + 10)
      return hslToHex(h, newS, newL)
    }
    return hex // Already dark — leave it exactly as chosen
  }
}