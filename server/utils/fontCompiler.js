const opentype = require('opentype.js')

// Convert an SVG path string (from browser, Y-down, 200x200 viewbox)
// into an opentype.js Path (font units, Y-up, 1000 unitsPerEm)
function svgPathToGlyphPath(svgPathData, unitsPerEm = 1000, svgSize = 200) {
  const path = new opentype.Path()
  const scale = unitsPerEm / svgSize
  const baseline = svgSize * 0.8

  const commands = svgPathData.match(/[MLQ][^MLQ]*/g) || []
  let currentX = 0, currentY = 0

  commands.forEach(cmd => {
    const type = cmd[0]
    const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number)

    if (type === 'M') {
      const x = nums[0] * scale
      const y = (baseline - nums[1]) * scale
      path.moveTo(x, y)
      currentX = x; currentY = y
    } else if (type === 'L') {
      const x = nums[0] * scale
      const y = (baseline - nums[1]) * scale
      path.lineTo(x, y)
      currentX = x; currentY = y
    } else if (type === 'Q') {
      const cpX = nums[0] * scale
      const cpY = (baseline - nums[1]) * scale
      const x = nums[2] * scale
      const y = (baseline - nums[3]) * scale
      path.quadraticCurveTo(cpX, cpY, x, y)
      currentX = x; currentY = y
    }
  })

  return path
}


// Build a full font from an array of { character, svgPath }
function compileFontFromGlyphs(fontName, glyphData) {
  const unitsPerEm = 1000
  const ascender = 800
  const descender = -200

  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 650,
    path: new opentype.Path()
  })

  const glyphs = [notdefGlyph]

  glyphData.forEach(({ character, svgPath }) => {
    if (!character || !svgPath) return

    const glyphPath = svgPathToGlyphPath(svgPath, unitsPerEm)

    const glyph = new opentype.Glyph({
      name: getGlyphName(character),
      unicode: character.charCodeAt(0),
      advanceWidth: 600,
      path: glyphPath
    })

    glyphs.push(glyph)
  })

  const font = new opentype.Font({
    familyName: fontName,
    styleName: 'Regular',
    unitsPerEm,
    ascender,
    descender,
    glyphs
  })

  return font
}

function getGlyphName(character) {
  const specialNames = {
    ' ': 'space',
    '.': 'period',
    ',': 'comma',
    '!': 'exclam',
    '?': 'question',
    ':': 'colon',
    ';': 'semicolon',
    "'": 'quotesingle',
    '"': 'quotedbl',
    '(': 'parenleft',
    ')': 'parenright',
    '-': 'hyphen'
  }
  return specialNames[character] || character
}

module.exports = { compileFontFromGlyphs }