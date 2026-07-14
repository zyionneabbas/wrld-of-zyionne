import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import GlyphCanvas from '../components/GlyphCanvas'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function FontMaker() {
  const navigate = useNavigate()
  const [step, setStep] = useState('name') // name, drawing, preview
  const [fontName, setFontName] = useState('')
  const [fontId, setFontId] = useState(null)
  const [characters, setCharacters] = useState([])
  const [previewSentence, setPreviewSentence] = useState('')
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [glyphs, setGlyphs] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCharacterSet()
  }, [])

  const fetchCharacterSet = async () => {
    try {
      const res = await axios.get(`${API}/api/fonts/character-set`)
      setCharacters(res.data.characters)
      setPreviewSentence(res.data.previewSentence)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateFont = async () => {
    if (!fontName.trim()) return
    try {
      const res = await axios.post(`${API}/api/fonts`, { name: fontName })
      setFontId(res.data._id)
      setStep('drawing')
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveGlyph = async (svgPath) => {
    const char = characters[currentCharIndex]
    setSaving(true)
    try {
      await axios.patch(`${API}/api/fonts/${fontId}/glyph`, {
        character: char,
        svgPath
      })
      setGlyphs(prev => ({ ...prev, [char]: svgPath }))

      // Auto advance to next character
      if (currentCharIndex < characters.length - 1) {
        setCurrentCharIndex(prev => prev + 1)
      } else {
        setStep('preview')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const skipCharacter = () => {
    if (currentCharIndex < characters.length - 1) {
      setCurrentCharIndex(prev => prev + 1)
    } else {
      setStep('preview')
    }
  }

  const goToPrevChar = () => {
    if (currentCharIndex > 0) {
      setCurrentCharIndex(prev => prev - 1)
    }
  }

  const handlePublish = async () => {
    try {
      await axios.patch(`${API}/api/fonts/${fontId}/publish`)
      navigate('/settings')
    } catch (err) {
      console.error(err)
    }
  }

  const progress = characters.length > 0
    ? Math.round(((currentCharIndex) / characters.length) * 100)
    : 0

  return (
    <div className="max-w-lg mx-auto px-4 py-8">

      {/* STEP 1 — Name your font */}
      {step === 'name' && (
        <div className="flex flex-col gap-5">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Create Your Own Font
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Draw your handwriting, character by character. Use it to write posts, comments, captions, and articles in your own digital handwriting.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'var(--color-text-muted)' }}>
              Font Name
            </label>
            <input
              value={fontName}
              onChange={e => setFontName(e.target.value)}
              placeholder="e.g. Zyionne Script"
              className="px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1.5px solid var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          <button
            onClick={handleCreateFont}
            disabled={!fontName.trim()}
            className="w-full py-3 rounded-xl text-sm font-bold"
            style={{
              backgroundColor: fontName.trim()
                ? 'var(--color-primary)'
                : 'var(--color-bg-surface)',
              color: fontName.trim()
                ? 'var(--color-primary-text)'
                : 'var(--color-text-faint)',
              border: 'none',
              cursor: fontName.trim() ? 'pointer' : 'not-allowed'
            }}>
            Start Drawing
          </button>
        </div>
      )}

      {/* STEP 2 — Draw each character */}
      {step === 'drawing' && characters.length > 0 && (
        <div className="flex flex-col items-center gap-5">

          {/* Progress bar */}
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1"
              style={{ color: 'var(--color-text-muted)' }}>
              <span>{currentCharIndex + 1} of {characters.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg-surface)' }}>
              <div className="h-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: 'var(--color-primary)'
                }} />
            </div>
          </div>

          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Draw this character:
          </p>

          <div className="text-6xl font-black"
            style={{ color: 'var(--color-primary)' }}>
            {characters[currentCharIndex]}
          </div>

          <GlyphCanvas
            key={currentCharIndex}
            onSave={handleSaveGlyph}
            existingPath={glyphs[characters[currentCharIndex]]}
          />

          <div className="flex gap-3 w-full">
            <button
              onClick={goToPrevChar}
              disabled={currentCharIndex === 0}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                color: currentCharIndex === 0
                  ? 'var(--color-text-faint)'
                  : 'var(--color-text-muted)',
                cursor: currentCharIndex === 0 ? 'not-allowed' : 'pointer'
              }}>
              ← Previous
            </button>
            <button
              onClick={skipCharacter}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                cursor: 'pointer'
              }}>
              Skip →
            </button>
          </div>

          <button
            onClick={() => setStep('preview')}
            className="text-xs"
            style={{
              color: 'var(--color-text-faint)',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}>
            Finish early and preview what I have
          </button>

        </div>
      )}

      {/* STEP 3 — Preview and publish */}
      {step === 'preview' && (
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Preview Your Font
          </h2>

          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            You drew {Object.keys(glyphs).length} of {characters.length} characters.
          </p>

          <div className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)'
            }}>
            <div className="flex flex-wrap gap-1 justify-center">
              {previewSentence.split('').map((char, i) => (
                <div key={i} className="flex items-center justify-center"
                  style={{ width: '28px', height: '36px' }}>
                  {glyphs[char] ? (
                    <svg viewBox="0 0 200 200" style={{ width: '28px', height: '28px' }}>
                      <path
                        d={glyphs[char]}
                        stroke="#0D0D0D"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  ) : char === ' ' ? null : (
                    <span style={{ color: '#ccc', fontSize: '14px' }}>{char}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-center"
            style={{ color: 'var(--color-text-faint)' }}>
            Grey characters were not drawn. You can go back and finish them anytime from your fonts list.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('drawing')}
              className="flex-1 py-3 rounded-xl text-sm font-bold"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: 'pointer'
              }}>
              Keep Drawing
            </button>
            <button
              onClick={handlePublish}
              className="flex-1 py-3 rounded-xl text-sm font-bold"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-text)',
                border: 'none',
                cursor: 'pointer'
              }}>
              Publish Font
            </button>
          </div>
        </div>
      )}

    </div>
  )
}