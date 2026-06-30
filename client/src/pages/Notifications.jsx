import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { getSocket } from '../utils/socket'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    markAllRead()

    const socket = getSocket()
    if (socket) {
      socket.on('notification', handleNewNotification)
    }

    return () => {
      if (socket) socket.off('notification', handleNewNotification)
    }
  }, [])

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev])
  }

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/api/notifications`)
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await axios.patch(`${API}/api/notifications/read`)
    } catch (err) {
      console.error(err)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'like': return '♥'
      case 'comment': return '💬'
      case 'follow': return '👤'
      case 'mention': return '@'
      case 'dm': return '✉'
      default: return '🔔'
    }
  }

  const getMessage = (n) => {
    switch (n.type) {
      case 'like': return 'liked your post'
      case 'comment': return 'commented on your post'
      case 'follow': return 'started following you'
      case 'mention': return 'mentioned you'
      default: return n.message || ''
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--color-text-muted)' }}>Loading notifications...</p>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      <h1 className="text-xl font-bold mb-6"
        style={{ color: 'var(--color-text)' }}>
        Notifications
      </h1>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔔</p>
          <p className="font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}>
            No notifications yet
          </p>
          <p className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}>
            When something happens, you'll see it here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(n => (
            <Link
              key={n._id}
              to={`/profile/${n.sender?.username}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              style={{
                backgroundColor: n.read
                  ? 'var(--color-bg-card)'
                  : 'rgba(255,215,0,0.05)',
                border: n.read
                  ? '1px solid var(--color-border)'
                  : '1px solid rgba(255,215,0,0.2)',
                textDecoration: 'none'
              }}>

              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(255,215,0,0.15)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(255,215,0,0.3)'
                }}>
                {n.sender?.displayName?.[0] || n.sender?.username?.[0] || '?'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm"
                  style={{ color: 'var(--color-text)' }}>
                  <strong>{n.sender?.displayName || n.sender?.username}</strong>{' '}
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {getMessage(n)}
                  </span>
                </p>
                <p className="text-xs mt-0.5"
                  style={{ color: 'var(--color-text-faint)' }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>

              <span className="text-lg flex-shrink-0"
                style={{ color: 'var(--color-primary)' }}>
                {getIcon(n.type)}
              </span>

            </Link>
          ))}
        </div>
      )}

    </div>
  )
}