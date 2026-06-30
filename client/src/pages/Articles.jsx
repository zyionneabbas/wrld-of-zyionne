import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Articles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const res = await axios.get(`${API}/api/articles`)
      setArticles(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--color-text-muted)' }}>Loading articles...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold"
          style={{ color: 'var(--color-text)' }}>
          Articles
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-full text-sm font-bold"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#0D0D0D',
            border: 'none',
            cursor: 'pointer'
          }}>
          ✍ Write
        </button>
      </div>

      {showCreate && (
        <CreateArticle
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false)
            fetchArticles()
          }}
        />
      )}

      {articles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">✍</p>
          <p className="font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}>
            No articles published yet
          </p>
          <p className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}>
            Be the first to share your story
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {articles.map(article => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}

    </div>
  )
}

function ArticleCard({ article }) {
  return (
    <Link
      to={`/articles/${article.slug}`}
      className="block rounded-2xl overflow-hidden transition-all"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        textDecoration: 'none'
      }}>

      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-5">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: 'rgba(255,215,0,0.15)',
              color: 'var(--color-primary)'
            }}>
            {article.author?.displayName?.[0] || article.author?.username?.[0]}
          </div>
          <span className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}>
            {article.author?.displayName || article.author?.username} ·{' '}
            {new Date(article.createdAt).toLocaleDateString()} ·{' '}
            {article.readTime} min read
          </span>
        </div>

        {/* Title and subtitle */}
        <h2 className="text-lg font-bold mb-1"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-primary)' }}>
          {article.title}
        </h2>
        {article.subtitle && (
          <p className="text-sm mb-3"
            style={{ color: 'var(--color-text-muted)' }}>
            {article.subtitle}
          </p>
        )}

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,215,0,0.08)',
                  color: 'var(--color-primary)'
                }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs"
          style={{ color: 'var(--color-text-faint)' }}>
          <span>♥ {article.likes?.length || 0}</span>
          <span>💬 {article.comments?.length || 0}</span>
          <span>👁 {article.views || 0}</span>
        </div>
      </div>
    </Link>
  )
}

function CreateArticle({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    content: '',
    tags: ''
  })
  const [status, setStatus] = useState('draft')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setSubmitting(true)
    try {
      const res = await axios.post(`${API}/api/articles`, {
        ...form,
        status
      })
      if (status === 'published') {
        await axios.patch(`${API}/api/articles/${res.data._id}/publish`)
      }
      onSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-primary)'
  }

  return (
    <div className="rounded-2xl p-5 mb-8"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)'
      }}>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold"
          style={{ color: 'var(--color-text)' }}>
          Write a new article
        </p>
        <button
          onClick={onClose}
          style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Article title"
          className="px-4 py-3 rounded-xl text-base font-bold outline-none"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />

        <input
          value={form.subtitle}
          onChange={e => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Subtitle (optional)"
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />

        <textarea
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          placeholder="Write your story..."
          rows={10}
          className="px-4 py-3 rounded-xl text-sm outline-none resize-none leading-relaxed"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />

        <input
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
          placeholder="Tags, comma separated"
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            onClick={() => setStatus('draft')}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl text-sm font-bold"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              cursor: 'pointer'
            }}>
            Save as Draft
          </button>
          <button
            type="submit"
            onClick={() => setStatus('published')}
            disabled={submitting || !form.title.trim() || !form.content.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-bold"
            style={{
              backgroundColor: form.title.trim() && form.content.trim()
                ? 'var(--color-primary)'
                : 'var(--color-bg-surface)',
              color: form.title.trim() && form.content.trim()
                ? '#0D0D0D'
                : 'var(--color-text-faint)',
              border: 'none',
              cursor: 'pointer'
            }}>
            {submitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}