import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Reels() {
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    fetchReels()
  }, [])

  const fetchReels = async () => {
    try {
      const res = await axios.get(`${API}/api/posts/explore?type=reel`)
      setReels(res.data.filter(p => p.postType === 'reel'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleScroll = () => {
    if (!containerRef.current) return
    const scrollTop = containerRef.current.scrollTop
    const height = containerRef.current.clientHeight
    const index = Math.round(scrollTop / height)
    setActiveIndex(index)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--color-text-muted)' }}>Loading reels...</p>
    </div>
  )

  if (reels.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-4xl">▶️</p>
      <p className="font-semibold"
        style={{ color: 'var(--color-text)' }}>
        No reels yet
      </p>
      <p className="text-sm"
        style={{ color: 'var(--color-text-muted)' }}>
        Create a post with type Reel to see it here
      </p>
    </div>
  )

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
      {reels.map((reel, index) => (
        <ReelCard
          key={reel._id}
          reel={reel}
          isActive={index === activeIndex}
        />
      ))}
    </div>
  )
}

function ReelCard({ reel, isActive }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(reel.likes?.length || 0)
  const [showCaption, setShowCaption] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!videoRef.current) return
    if (isActive) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [isActive])

  const handleLike = async () => {
    try {
      const res = await axios.patch(`${API}/api/posts/${reel._id}/like`)
      setLiked(res.data.liked)
      setLikeCount(res.data.likes)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="relative w-full h-screen snap-start snap-always flex items-center justify-center"
      style={{ backgroundColor: '#000' }}>

      {/* Video or image */}
      {reel.media?.[0]?.type === 'video' ? (
        <video
          ref={videoRef}
          src={reel.media[0].url}
          loop
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : reel.media?.[0]?.type === 'image' ? (
        <img
          src={reel.media[0].url}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        // Text only reel
        <div className="w-full h-full flex items-center justify-center p-8"
          style={{ backgroundColor: 'var(--color-bg)' }}>
          <p className="text-2xl font-bold text-center leading-relaxed"
            style={{ color: 'var(--color-text)' }}>
            {reel.content}
          </p>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, transparent 70%, rgba(0,0,0,0.3) 100%)'
        }} />

      {/* Right side actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5">

        {/* Author avatar */}
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: 'rgba(255,215,0,0.2)',
            color: 'var(--color-primary)',
            border: '2px solid var(--color-primary)'
          }}>
          {reel.author?.displayName?.[0] || reel.author?.username?.[0]}
        </div>

        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="text-2xl"
            style={{ color: liked ? 'var(--color-primary)' : '#fff' }}>
            {liked ? '♥' : '♡'}
          </span>
          <span className="text-xs font-semibold text-white">{likeCount}</span>
        </button>

        {/* Comments */}
        <button
          className="flex flex-col items-center gap-1"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="text-2xl text-white">💬</span>
          <span className="text-xs font-semibold text-white">
            {reel.comments?.length || 0}
          </span>
        </button>

        {/* Views */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl text-white">👁</span>
          <span className="text-xs font-semibold text-white">
            {reel.views || 0}
          </span>
        </div>

      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-4 right-16">
        <p className="text-sm font-bold text-white mb-1">
          @{reel.author?.username}
        </p>

        {reel.content && (
          <div>
            <p className="text-sm text-white leading-relaxed"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: showCaption ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: showCaption ? 'visible' : 'hidden'
              }}>
              {reel.content}
            </p>
            {reel.content.length > 80 && (
              <button
                onClick={() => setShowCaption(prev => !prev)}
                className="text-xs mt-0.5"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                {showCaption ? 'less' : 'more'}
              </button>
            )}
          </div>
        )}

        {reel.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reel.hashtags.map(tag => (
              <span key={tag} className="text-xs"
                style={{ color: 'var(--color-primary)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}