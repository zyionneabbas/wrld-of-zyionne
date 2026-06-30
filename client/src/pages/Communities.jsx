import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Communities() {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [joinMessage, setJoinMessage] = useState('')

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const res = await axios.get(`${API}/api/communities`)
      setCommunities(res.data)
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
      await axios.post(`${API}/api/communities`, {
        name,
        description,
        isPublic: true
      })
      setName('')
      setDescription('')
      setShowCreate(false)
      fetchCommunities()
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleJoinByInvite = async (e) => {
    e.preventDefault()
    if (!inviteCode.trim()) return
    try {
      const res = await axios.post(`${API}/api/communities/join/${inviteCode.trim()}`)
      setJoinMessage(res.data.message)
      setInviteCode('')
      fetchCommunities()
      setTimeout(() => setJoinMessage(''), 3000)
    } catch (err) {
      setJoinMessage(err.response?.data?.error || 'Could not join')
      setTimeout(() => setJoinMessage(''), 3000)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--color-text-muted)' }}>Loading communities...</p>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold"
          style={{ color: 'var(--color-text)' }}>
          Communities
        </h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-full text-sm font-bold"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#0D0D0D',
            border: 'none',
            cursor: 'pointer'
          }}>
          + New Community
        </button>
      </div>

      {/* Join via invite code */}
      <form onSubmit={handleJoinByInvite}
        className="rounded-2xl p-4 mb-6 flex gap-2"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)'
        }}>
        <input
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          placeholder="Enter invite code..."
          className="flex-1 px-4 py-2 rounded-xl text-sm outline-none"
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
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer'
          }}>
          Join
        </button>
      </form>
      {joinMessage && (
        <p className="text-xs mb-4 -mt-3"
          style={{ color: 'var(--color-primary)' }}>
          {joinMessage}
        </p>
      )}

      {/* Create community form */}
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
            placeholder="Community name"
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
            placeholder="What is this community about?"
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
            {creating ? 'Creating...' : 'Create Community'}
          </button>
        </form>
      )}

      {/* Communities list */}
      {communities.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">⬡</p>
          <p className="font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}>
            No communities yet
          </p>
          <p className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}>
            Start one and build your space
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {communities.map(community => (
            <Link
              key={community._id}
              to={`/communities/${community.slug}`}
              className="flex items-center gap-3 rounded-2xl p-4 transition-all"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                textDecoration: 'none'
              }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(255,215,0,0.15)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(255,215,0,0.3)'
                }}>
                {community.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate"
                  style={{ color: 'var(--color-text)' }}>
                  {community.name}
                </p>
                <p className="text-xs truncate"
                  style={{ color: 'var(--color-text-muted)' }}>
                  {community.memberCount || 0} members ·{' '}
                  {community.channels?.length || 0} channels
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  )
}