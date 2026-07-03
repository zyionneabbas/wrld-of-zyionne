import { useState, useRef } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function CreatePost({ onSuccess }) {
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('post')
  const [media, setMedia] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setMedia(files)

    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }))
    setPreviews(newPreviews)
  }

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && media.length === 0) return
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('postType', postType)
      media.forEach(file => formData.append('media', file))

      await axios.post(`${API}/api/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setContent('')
      setMedia([])
      setPreviews([])
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const types = [
    { id: 'post', label: 'Post', emoji: '📷' },
    { id: 'tweet', label: 'Thought', emoji: '💭' },
    { id: 'reel', label: 'Reel', emoji: '▶️' },
  ]

  return (
    <div className="rounded-2xl p-4 mb-6"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)'
      }}>

      {/* Post type selector */}
      <div className="flex gap-2 mb-3">
        {types.map(type => (
          <button
            key={type.id}
            onClick={() => setPostType(type.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              backgroundColor: postType === type.id
                ? 'rgba(255,215,0,0.15)'
                : 'var(--color-bg-surface)',
              color: postType === type.id
                ? 'var(--color-primary)'
                : 'var(--color-text-muted)',
              border: postType === type.id
                ? '1px solid rgba(255,215,0,0.4)'
                : '1px solid var(--color-border)',
              cursor: 'pointer'
            }}>
            <span>{type.emoji}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>

        {/* Media previews */}
        {previews.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {previews.map((preview, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden"
                style={{ width: '80px', height: '80px' }}>
                {preview.type === 'video' ? (
                  <video
                    src={preview.url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={preview.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text area */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={
            postType === 'tweet'
              ? "What's on your mind?"
              : postType === 'reel'
              ? 'Add a caption to your reel...'
              : 'Share something with your world...'
          }
          rows={3}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-all"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-primary)'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />

        {error && (
          <p className="text-xs mt-1" style={{ color: '#ff5050' }}>{error}</p>
        )}

        <div className="flex items-center justify-between mt-3">

          {/* Media upload button */}
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaSelect}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                cursor: 'pointer'
              }}>
              <span>🖼</span>
              <span>Media</span>
            </button>

            <span className="text-xs"
              style={{
                color: content.length > 400
                  ? '#ff5050'
                  : 'var(--color-text-faint)'
              }}>
              {content.length} chars
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || (!content.trim() && media.length === 0)}
            className="px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all"
            style={{
              backgroundColor: content.trim() || media.length > 0
                ? 'var(--color-primary)'
                : 'var(--color-bg-surface)',
              color: content.trim() || media.length > 0
                ? '#0D0D0D'
                : 'var(--color-text-faint)',
              border: 'none',
              cursor: content.trim() || media.length > 0
                ? 'pointer'
                : 'not-allowed'
            }}>
            {loading ? 'Posting...' : 'Post'}
          </button>

        </div>
      </form>
    </div>
  )
}