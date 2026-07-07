import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function ArticleDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchArticle()
  }, [slug])

  const fetchArticle = async () => {
    try {
      const res = await axios.get(`${API}/api/articles/${slug}`)
      setArticle(res.data)
      setLikeCount(res.data.likes?.length || 0)
      setLiked(
        res.data.likes?.some(
          id => id?.toString() === user?.id?.toString()
        )
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      const res = await axios.patch(`${API}/api/articles/${article._id}/like`)
      setLiked(res.data.liked)
      setLikeCount(res.data.likes)
    } catch (err) {
      console.error(err)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      await axios.post(`${API}/api/articles/${article._id}/comment`, {
        content: comment
      })
      setComment('')
      fetchArticle()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--color-text-muted)' }}>Loading article...</p>
    </div>
  )

  if (!article) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--color-text-muted)' }}>Article not found</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Back button */}
      <button
        onClick={() => navigate('/articles')}
        className="flex items-center gap-2 text-sm mb-8 transition-all"
        style={{
          color: 'var(--color-text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer'
        }}>
        ← Back to Articles
      </button>

      {/* Cover image */}
      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-64 object-cover rounded-2xl mb-8"
        />
      )}

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map(tag => (
            <span key={tag}
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{
                backgroundColor: 'rgba(255,215,0,0.08)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(255,215,0,0.2)'
              }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-black mb-3 leading-tight"
        style={{
          color: 'var(--color-text)',
          fontFamily: 'var(--font-primary)'
        }}>
        {article.title}
      </h1>

      {/* Subtitle */}
      {article.subtitle && (
        <p className="text-lg mb-6"
          style={{ color: 'var(--color-text-muted)' }}>
          {article.subtitle}
        </p>
      )}

      {/* Author and meta */}
      <div className="flex items-center gap-3 mb-8 pb-8"
        style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: 'rgba(255,215,0,0.15)',
            color: 'var(--color-primary)',
            border: '1px solid rgba(255,215,0,0.3)'
          }}>
          {article.author?.displayName?.[0] || article.author?.username?.[0]}
        </div>
        <div>
          <p className="text-sm font-semibold"
            style={{ color: 'var(--color-text)' }}>
            {article.author?.displayName || article.author?.username}
          </p>
          <p className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}>
            {new Date(article.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} · {article.readTime} min read · {article.views} views
          </p>
        </div>
      </div>

      {/* Article body */}
      <div className="mb-10 leading-relaxed"
        style={{
          color: 'var(--color-text)',
          fontSize: '1.05rem',
          lineHeight: '1.9',
          whiteSpace: 'pre-wrap'
        }}>
        {article.content}
      </div>

      {/* Like and stats bar */}
      <div className="flex items-center gap-6 py-5 mb-8"
        style={{ borderTop: '1px solid var(--color-border)',
                 borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-sm font-semibold transition-all"
          style={{
            color: liked ? 'var(--color-primary)' : 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}>
          <span className="text-xl">{liked ? '♥' : '♡'}</span>
          <span>{likeCount} likes</span>
        </button>
        <span className="text-sm"
          style={{ color: 'var(--color-text-muted)' }}>
          💬 {article.comments?.length || 0} comments
        </span>
      </div>

      {/* Comments */}
      <div>
        <h3 className="text-base font-bold mb-5"
          style={{ color: 'var(--color-text)' }}>
          Comments ({article.comments?.length || 0})
        </h3>

        {/* Comment form */}
        <form onSubmit={handleComment} className="flex gap-2 mb-6">
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
          />
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{
              backgroundColor: comment.trim()
                ? 'var(--color-primary)'
                : 'var(--color-bg-surface)',
              color: comment.trim() ? '#0D0D0D' : 'var(--color-text-faint)',
              border: 'none',
              cursor: comment.trim() ? 'pointer' : 'not-allowed'
            }}>
            Post
          </button>
        </form>

        {/* Comments list */}
        {article.comments?.length === 0 ? (
          <p className="text-sm text-center py-8"
            style={{ color: 'var(--color-text-muted)' }}>
            No comments yet. Be the first to respond.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {article.comments.map(c => (
              <div key={c._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: 'rgba(255,215,0,0.1)',
                    color: 'var(--color-primary)'
                  }}>
                  {c.author?.displayName?.[0] || c.author?.username?.[0]}
                </div>
                <div className="flex-1 px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)'
                  }}>
                  <p className="text-xs font-semibold mb-1"
                    style={{ color: 'var(--color-text)' }}>
                    {c.author?.displayName || c.author?.username}
                    <span className="font-normal ml-2"
                      style={{ color: 'var(--color-text-faint)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-sm"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {c.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}