import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Forums() {
  const [forums, setForums] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchForums()
  }, [])

  const fetchForums = async () => {
    try {
      const res = await axios.get(`${API}/api/forums`)
      setForums(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      await axios.post(`${API}/api/forums`, { name, description })
      setName('')
      setDescription('')
      setShowCreate(false)
      fetchForums()
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (forumId) => {
    try {
      await axios.patch(`${API}/api/forums/${forumId}/join`)
      fetchForums()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--color-text-muted)' }}>Loading forums...</p>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold"
          style={{ color: 'var(--color-text)' }}>
          Forums
        </h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-full text-sm font-bold"
          style={{
            backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-text)',
            border: 'none',
            cursor: 'pointer'
          }}>
          + New Forum
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate}
          className="rounded-2xl p-5 mb-6 flex flex-col gap-3"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)'
          }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Forum name"
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this forum about?"
            rows={2}
            className="px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
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
            disabled={creating || !name.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{
              backgroundColor: name.trim()
                ? 'var(--color-primary)'
                : 'var(--color-bg-surface)',
              color: name.trim() ? '#0D0D0D' : 'var(--color-text-faint)',
              border: 'none',
              cursor: name.trim() ? 'pointer' : 'not-allowed'
            }}>
            {creating ? 'Creating...' : 'Create Forum'}
          </button>
        </form>
      )}

      {forums.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">💬</p>
          <p className="font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}>
            No forums yet
          </p>
          <p className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}>
            Be the first to start a conversation
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {forums.map(forum => (
            <div key={forum._id}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)'
              }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <Link to={`/forums/${forum.slug}`}
                    className="text-sm font-bold hover:underline"
                    style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
                    {forum.name}
                  </Link>
                  <p className="text-xs mt-0.5"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {forum.members?.length || 0} members ·{' '}
                    {forum.postCount || 0} posts
                  </p>
                </div>
                <button
                  onClick={() => handleJoin(forum._id)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-primary-text)',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                  Join
                </button>
              </div>
              {forum.description && (
                <p className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}>
                  {forum.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}