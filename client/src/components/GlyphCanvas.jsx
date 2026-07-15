import { useRef, useState, useEffect } from 'react'

export default function GlyphCanvas({ onSave, existingPath }) {
  const svgRef = useRef(null)
  const [strokes, setStrokes] = useState([])
  const [currentStroke, setCurrentStroke] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    if (existingPath) {
      setStrokes([existingPath])
    } else {
      setStrokes([])
    }
  }, [existingPath])

  const getPoint = (e) => {
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: ((clientX - rect.left) / rect.width) * 200,
      y: ((clientY - rect.top) / rect.height) * 200
    }
  }

  const handleStart = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const point = getPoint(e)
    setCurrentStroke([point])
  }

  const handleMove = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const point = getPoint(e)
    setCurrentStroke(prev => [...prev, point])
  }

  const handleEnd = () => {
    if (currentStroke.length > 1) {
      const pathData = pointsToPath(currentStroke)
      setStrokes(prev => [...prev, pathData])
    }
    setCurrentStroke([])
    setIsDrawing(false)
  }

  const pointsToPath = (points) => {
    if (points.length === 0) return ''
    if (points.length < 3) {
      return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[points.length - 1].x.toFixed(1)} ${points[points.length - 1].y.toFixed(1)}`
    }

    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`

    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2
      const midY = (points[i].y + points[i + 1].y) / 2
      d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`
    }

    const last = points[points.length - 1]
    d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`

    return d
  }

  const clearCanvas = () => {
    setStrokes([])
    setCurrentStroke([])
  }

  const undoStroke = () => {
    setStrokes(prev => prev.slice(0, -1))
  }

  const handleSave = () => {
    const combinedPath = strokes.join(' ')
    onSave(combinedPath)
  }

  return (
    <div className="flex flex-col items-center gap-4">

      <div
        className="rounded-2xl overflow-hidden touch-none"
        style={{
          border: '2px solid var(--color-border)',
          backgroundColor: '#FFFFFF',
          width: '260px',
          height: '260px'
        }}>
        <svg
          ref={svgRef}
          viewBox="0 0 200 200"
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}>

          <line x1="0" y1="160" x2="200" y2="160" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4" />
          <line x1="0" y1="40" x2="200" y2="40" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4" />

          {strokes.map((path, i) => (
            <path
              key={i}
              d={path}
              stroke="#0D0D0D"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}

          {currentStroke.length > 0 && (
            <path
              d={pointsToPath(currentStroke)}
              stroke="#0D0D0D"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </svg>
      </div>

      <div className="flex gap-2">
        <button
          onClick={undoStroke}
          disabled={strokes.length === 0}
          className="px-4 py-2 rounded-xl text-xs font-bold"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            color: strokes.length === 0 ? 'var(--color-text-faint)' : 'var(--color-text)',
            cursor: strokes.length === 0 ? 'not-allowed' : 'pointer'
          }}>
          ↩ Undo
        </button>
        <button
          onClick={clearCanvas}
          disabled={strokes.length === 0}
          className="px-4 py-2 rounded-xl text-xs font-bold"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            color: strokes.length === 0 ? 'var(--color-text-faint)' : 'var(--color-text)',
            cursor: strokes.length === 0 ? 'not-allowed' : 'pointer'
          }}>
          🗑 Clear
        </button>
        <button
          onClick={handleSave}
          disabled={strokes.length === 0}
          className="px-5 py-2 rounded-xl text-xs font-bold"
          style={{
            backgroundColor: strokes.length === 0
              ? 'var(--color-bg-surface)'
              : 'var(--color-primary)',
            color: strokes.length === 0
              ? 'var(--color-text-faint)'
              : 'var(--color-primary-text)',
            border: 'none',
            cursor: strokes.length === 0 ? 'not-allowed' : 'pointer'
          }}>
          Save Character
        </button>
      </div>
    </div>
  )
}