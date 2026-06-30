import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { getSocket } from '../utils/socket'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Messages() {
  const [conversations, setConversations] = useState([])
  const [activeConvo, setActiveConvo] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchConversations()

    const socket = getSocket()
    if (socket) {
      socket.on('newMessage', handleNewMessage)
    }
    return () => {
      if (socket) socket.off('newMessage', handleNewMessage)
    }
  }, [])

  useEffect(() => {
    if (activeConvo) fetchMessages(activeConvo._id)
  }, [activeConvo])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNewMessage = ({ conversationId, message }) => {
    if (activeConvo?._id === conversationId) {
      setMessages(prev => [...prev, message])
    }
    fetchConversations()
  }

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API}/api/messages/conversations`)
      setConversations(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const res = await axios.get(
        `${API}/api/messages/conversations/${conversationId}/messages`
      )
      setMessages(res.data)
      await axios.patch(
        `${API}/api/messages/conversations/${conversationId}/read`
      )
    } catch (err) {
      console.error(err)
    }
  }

  const getOtherParticipant = (convo) => {
    return convo.participants?.find(p => p._id !== user?.id)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeConvo) return

    try {
      const res = await axios.post(
        `${API}/api/messages/conversations/${activeConvo._id}/messages`,
        { content: text }
      )
      setMessages(prev => [...prev, res.data])
      setText('')
      fetchConversations()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--color-text-muted)' }}>Loading messages...</p>
    </div>
  )

  return (
    <div className="flex h-screen">

      {/* Conversations list */}
      <div className={`w-full md:w-80 flex-shrink-0 flex flex-col ${activeConvo ? 'hidden md:flex' : 'flex'}`}
        style={{ borderRight: '1px solid var(--color-border)' }}>

        <div className="px-4 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h1 className="text-lg font-bold"
            style={{ color: 'var(--color-text)' }}>
            Messages
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-3xl mb-3">✉️</p>
              <p className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}>
                No conversations yet. Add friends to start chatting.
              </p>
            </div>
          ) : (
            conversations.map(convo => {
              const other = getOtherParticipant(convo)
              return (
                <button
                  key={convo._id}
                  onClick={() => setActiveConvo(convo)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                  style={{
                    backgroundColor: activeConvo?._id === convo._id
                      ? 'rgba(255,215,0,0.05)'
                      : 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      backgroundColor: 'rgba(255,215,0,0.15)',
                      color: 'var(--color-primary)',
                      border: '1px solid rgba(255,215,0,0.3)'
                    }}>
                    {other?.displayName?.[0] || other?.username?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate"
                      style={{ color: 'var(--color-text)' }}>
                      {other?.displayName || other?.username}
                    </p>
                    <p className="text-xs truncate"
                      style={{ color: 'var(--color-text-muted)' }}>
                      {convo.lastMessage?.content || 'Start the conversation'}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className={`flex-1 flex flex-col ${activeConvo ? 'flex' : 'hidden md:flex'}`}>
        {activeConvo ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setActiveConvo(null)}
                className="md:hidden text-lg"
                style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                ←
              </button>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: 'rgba(255,215,0,0.15)',
                  color: 'var(--color-primary)'
                }}>
                {getOtherParticipant(activeConvo)?.displayName?.[0] ||
                 getOtherParticipant(activeConvo)?.username?.[0] || '?'}
              </div>
              <p className="text-sm font-semibold"
                style={{ color: 'var(--color-text)' }}>
                {getOtherParticipant(activeConvo)?.displayName ||
                 getOtherParticipant(activeConvo)?.username}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
              {messages.map(msg => {
                const isMine = msg.sender?._id === user?.id
                return (
                  <div key={msg._id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-xs px-4 py-2 rounded-2xl text-sm"
                      style={{
                        backgroundColor: isMine
                          ? 'var(--color-primary)'
                          : 'var(--color-bg-card)',
                        color: isMine ? '#0D0D0D' : 'var(--color-text)',
                        border: isMine
                          ? 'none'
                          : '1px solid var(--color-border)'
                      }}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend}
              className="flex gap-2 px-4 py-3"
              style={{ borderTop: '1px solid var(--color-border)' }}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
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
                disabled={!text.trim()}
                className="px-5 py-2.5 rounded-full text-sm font-bold"
                style={{
                  backgroundColor: text.trim()
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-surface)',
                  color: text.trim() ? '#0D0D0D' : 'var(--color-text-faint)',
                  border: 'none',
                  cursor: text.trim() ? 'pointer' : 'not-allowed'
                }}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p style={{ color: 'var(--color-text-muted)' }}>
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>

    </div>
  )
}