import { useState, useRef } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function CreatePost({ onSuccess }) {
  const [postType, setPostType] = useState('tweet')
  const [content, setContent] = useState('')
  const [media, setMedia] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('type') // 'type' | 'media' | 'caption'
  const fileRef = useRef(null)

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setMedia(files)
    setPreviews(files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    })))
    setStep('caption')
  }

  const selectType = (type) => {
    setPostType(type)
    if (type === 'tweet') {
      setStep('caption')
    } else {
      setStep('media')
      setTimeout(() => fileRef.current?.click(), 100)
    }
  }

  const reset = () => {
    setPostType('tweet')
    setContent('')
    setMedia([])
    setPreviews([])
    setStep('type')
  }

  const removeMedia = (index) => {
    const newMedia = media.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setMedia(newMedia)
    setPreviews(newPreviews)
    if (newMedia.length === 0) setStep('media')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (postType !== 'tweet' && media.length === 0) return
    if (postType === 'tweet' && !content.trim()) return

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

      reset()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const types = [
    { id: 'tweet', label: 'Thought', emoji: '💭' },
    { id: 'post', label: 'Post', emoji: '📷' },
    { id: 'reel', label: 'Reel', emoji: '▶️' },
  ]

  return (
    <div className="rounded-2xl p-4 mb-6"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)'
      }}>

      {/* STEP: choose type */}
      {step === 'type' && (
        <div className="flex gap-2">
          {types.map(type => (
            <button
              key={type.id}
              onClick={() => selectType(type.id)}
              className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: 'pointer'
              }}>
              <span className="text-xl">{type.emoji}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* STEP: waiting for media picker (post/reel) */}
      {step === 'media' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Select {postType === 'reel' ? 'a video' : 'photos or a video'} to continue
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-text)',
              border: 'none',
              cursor: 'pointer'
            }}>
            Choose Media
          </button>
          <button
            onClick={reset}
            className="text-xs"
            style={{ color: 'var(--color-text-faint)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      )}

      {/* STEP: caption (media preview shown first if post/reel) */}
      {step === 'caption' && (
        <form onSubmit={handleSubmit}>

          {previews.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {previews.map((preview, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden"
                  style={{ width: '90px', height: '90px' }}>
                  {preview.type === 'video' ? (
                    <video src={preview.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={preview.url} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={
              postType === 'tweet'
                ? "What's on your mind?"
                : postType === 'reel'
                ? 'Add a caption to your reel...'
                : 'Write a caption...'
            }
            rows={postType === 'tweet' ? 3 : 2}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none transition-all"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-primary)'
            }}
          />

          {error && <p className="text-xs mt-1" style={{ color: '#ff5050' }}>{error}</p>}

          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={reset}
              className="text-xs"
              style={{ color: 'var(--color-text-faint)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (postType === 'tweet' ? !content.trim() : media.length === 0)}
              className="px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-text)',
                border: 'none',
                cursor: 'pointer'
              }}>
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={postType === 'reel' ? 'video/*' : 'image/*,video/*'}
        multiple={postType === 'post'}
        onChange={handleMediaSelect}
        style={{ display: 'none' }}
      />

    </div>
  )
}