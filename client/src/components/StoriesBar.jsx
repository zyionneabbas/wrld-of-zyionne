import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function StoriesBar() {
  const [storyGroups, setStoryGroups] = useState([])
  const [viewingGroup, setViewingGroup] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const res = await axios.get(`${API}/api/stories/feed`)
      setStoryGroups(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 mb-2"
      style={{ scrollbarWidth: 'none' }}>

      {/* Your story / add story */}
      <button
        onClick={() => setShowUpload(true)}
        className="flex flex-col items-center gap-1.5 flex-shrink-0"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center relative"
          style={{
            backgroundColor: 'rgba(255,215,0,0.1)',
            border: '2px dashed rgba(255,215,0,0.4)'
          }}>
          <span className="text-2xl" style={{ color: 'var(--color-primary)' }}>+</span>
        </div>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Your Story
        </span>
      </button>

      {/* Story groups from friends */}
      {storyGroups.map(group => (
        <button
          key={group.author._id}
          onClick={() => setViewingGroup(group)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div className="w-16 h-16 rounded-full p-0.5"
            style={{
              background: 'linear-gradient(45deg, var(--color-primary), #B8960C)'
            }}>
            <div className="w-full h-full rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-primary)'
              }}>
              {group.author.displayName?.[0] || group.author.username?.[0]}
            </div>
          </div>
          <span className="text-xs truncate max-w-16"
            style={{ color: 'var(--color-text-muted)' }}>
            {group.author.username}
          </span>
        </button>
      ))}

      {showUpload && (
        <UploadStoryModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false)
            fetchStories()
          }}
        />
      )}

      {viewingGroup && (
        <StoryViewer
          group={viewingGroup}
          onClose={() => setViewingGroup(null)}
        />
      )}

    </div>
  )
}

function UploadStoryModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreview({
      url: URL.createObjectURL(selected),
      type: selected.type.startsWith('video/') ? 'video' : 'image'
    })
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('media', file)
      formData.append('caption', caption)

      await axios.post(`${API}/api/stories`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="rounded-2xl p-5 w-full max-w-sm"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)'
        }}>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            Add to Your Story
          </p>
          <button onClick={onClose}
            style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '2px dashed var(--color-border)',
              cursor: 'pointer'
            }}>
            <span className="text-3xl">📷</span>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Select photo or video
            </span>
          </button>
        ) : (
          <div className="rounded-xl overflow-hidden mb-3" style={{ aspectRatio: '9/16', maxHeight: '300px' }}>
            {preview.type === 'video' ? (
              <video src={preview.url} className="w-full h-full object-cover" controls />
            ) : (
              <img src={preview.url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {preview && (
          <>
            <input
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#0D0D0D',
                border: 'none',
                cursor: 'pointer'
              }}>
              {uploading ? 'Posting...' : 'Share to Story'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function StoryViewer({ group, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)
  const STORY_DURATION = 5000

  const currentStory = group.stories[currentIndex]

  useEffect(() => {
    markViewed(currentStory._id)
    setProgress(0)

    const startTime = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100)
      setProgress(pct)

      if (pct >= 100) {
        goNext()
      }
    }, 50)

    return () => clearInterval(intervalRef.current)
  }, [currentIndex])

  const markViewed = async (storyId) => {
    try {
      await axios.patch(`${API}/api/stories/${storyId}/view`)
    } catch (err) {
      console.error(err)
    }
  }

  const goNext = () => {
    clearInterval(intervalRef.current)
    if (currentIndex < group.stories.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      onClose()
    }
  }

  const goPrev = () => {
    clearInterval(intervalRef.current)
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: '#000' }}>

      <div className="relative w-full h-full max-w-md mx-auto">

        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
              <div className="h-full transition-all"
                style={{
                  backgroundColor: '#fff',
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: 'rgba(255,215,0,0.2)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)'
              }}>
              {group.author.displayName?.[0] || group.author.username?.[0]}
            </div>
            <span className="text-sm font-semibold text-white">
              {group.author.username}
            </span>
          </div>
          <button onClick={onClose}
            className="text-white text-xl"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* Media */}
        <div className="w-full h-full flex items-center justify-center">
          {currentStory.media?.type === 'video' ? (
            <video
              src={currentStory.media.url}
              autoPlay
              muted
              className="w-full h-full object-contain"
            />
          ) : currentStory.media?.type === 'image' ? (
            <img
              src={currentStory.media.url}
              alt=""
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-white text-xl font-bold leading-relaxed">
                {currentStory.caption}
              </p>
            </div>
          )}
        </div>

        {/* Caption if media exists */}
        {currentStory.media?.url && currentStory.caption && (
          <div className="absolute bottom-6 left-3 right-3">
            <p className="text-white text-sm text-center px-4 py-2 rounded-xl"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Tap zones for navigation */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full" onClick={goPrev} style={{ cursor: 'pointer' }} />
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full" onClick={goNext} style={{ cursor: 'pointer' }} />
        </div>

      </div>
    </div>
  )
}