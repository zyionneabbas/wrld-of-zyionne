import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { getSocket } from '../utils/socket'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Friends() {
  const [myFriendId, setMyFriendId] = useState('')
  const [inputId, setInputId] = useState('')
  const [accepted, setAccepted] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useAuth()

 useEffect(() => {
  fetchMyId()
  fetchFriends()

  const socket = getSocket()
  if (socket) {
    socket.on('friendRequest', () => {
      fetchFriends()
    })
  }
  return () => {
    if (socket) socket.off('friendRequest')
  }
}, [])

  const fetchMyId = async () => {
    try {
      const res = await axios.get(`${API}/api/friends/my-id`)
      setMyFriendId(res.data.friendId)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchFriends = async () => {
    try {
    const res = await axios.get(`${API}/api/friends`)
    setAccepted(res.data.accepted)
    setPending(res.data.pending)
    } catch (err) {
    console.error(err)
    } finally {
    setLoading(false)
    }
 }

  const copyFriendId = () => {
    navigator.clipboard.writeText(myFriendId)
    setMessage('Copied to clipboard!')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleSendRequest = async (e) => {
    e.preventDefault()
    if (!inputId.trim()) return
    setSending(true)
    setMessage('')
    try {
      const res = await axios.post(`${API}/api/friends/request`, {
        friendId: inputId.trim()
      })
      setMessage(res.data.message)
      setInputId('')
      fetchFriends()
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong')
    } finally {
      setSending(false)
    }
  }

  const handleAccept = async (userId) => {
    try {
      await axios.patch(`${API}/api/friends/accept`, { userId })
      fetchFriends()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDecline = async (userId) => {
    try {
      await axios.patch(`${API}/api/friends/remove`, { userId })
      fetchFriends()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      <h1 className="text-xl font-bold mb-6"
        style={{ color: 'var(--color-text)' }}>
        Friends
      </h1>

      {/* Your Friend ID */}
      <div className="rounded-2xl p-5 mb-6"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)'
        }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-2"
          style={{ color: 'var(--color-text-muted)' }}>
          Your Friend ID
        </p>
        <div className="flex items-center gap-3">
          <span className="flex-1 px-4 py-2.5 rounded-xl text-sm font-mono font-bold"
            style={{
              backgroundColor: 'rgba(255,215,0,0.08)',
              color: 'var(--color-primary)',
              border: '1px solid rgba(255,215,0,0.2)'
            }}>
            {myFriendId || 'Loading...'}
          </span>
          <button
            onClick={copyFriendId}
            className="px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{
              backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-text)',
              border: 'none',
              cursor: 'pointer'
            }}>
            Copy
          </button>
        </div>
        <p className="text-xs mt-2"
          style={{ color: 'var(--color-text-faint)' }}>
          Share this only with people you want to DM with privately
        </p>
      </div>

      {/* Add friend by ID */}
      <form onSubmit={handleSendRequest}
        className="rounded-2xl p-5 mb-6"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)'
        }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-2"
          style={{ color: 'var(--color-text-muted)' }}>
          Add a Friend
        </p>
        <div className="flex gap-2">
          <input
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            placeholder="Enter Friend ID (e.g. WRLD#4821)"
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
            disabled={sending || !inputId.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{
              backgroundColor: inputId.trim()
                ? 'var(--color-primary)'
                : 'var(--color-bg-surface)',
              color: inputId.trim() ? '#0D0D0D' : 'var(--color-text-faint)',
              border: 'none',
              cursor: inputId.trim() ? 'pointer' : 'not-allowed'
            }}>
            Add
          </button>
        </div>
        {message && (
          <p className="text-xs mt-2"
            style={{ color: 'var(--color-primary)' }}>
            {message}
          </p>
        )}
      </form>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: 'var(--color-text-muted)' }}>
            Pending Requests
          </p>
          <div className="flex flex-col gap-2">
            {pending.map(p => (
              <div key={p.user._id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)'
                }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: 'rgba(255,215,0,0.15)',
                    color: 'var(--color-primary)'
                  }}>
                  {p.user.displayName?.[0] || p.user.username?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold"
                    style={{ color: 'var(--color-text)' }}>
                    {p.user.displayName || p.user.username}
                  </p>
                  <p className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}>
                    @{p.user.username}
                  </p>
                </div>
                <button
                  onClick={() => handleAccept(p.user._id)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-primary-text)',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(p.user._id)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer'
                  }}>
                  Decline
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted friends */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: 'var(--color-text-muted)' }}>
          Your Friends ({accepted.length})
        </p>
        {accepted.length === 0 ? (
          <p className="text-sm text-center py-10"
            style={{ color: 'var(--color-text-muted)' }}>
            No friends yet. Share your Friend ID to connect.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {accepted.map(f => (
              <Link
                key={f.user._id}
                to={`/profile/${f.user.username}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  textDecoration: 'none'
                }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: 'rgba(255,215,0,0.15)',
                    color: 'var(--color-primary)'
                  }}>
                  {f.user.displayName?.[0] || f.user.username?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold"
                    style={{ color: 'var(--color-text)' }}>
                    {f.user.displayName || f.user.username}
                  </p>
                  <p className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}>
                    @{f.user.username}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}