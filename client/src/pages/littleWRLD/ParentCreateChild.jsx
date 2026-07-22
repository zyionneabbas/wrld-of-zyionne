import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function ParentCreateChild() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    displayName: '',
    dateOfBirth: '',
    password: '',
    interests: [],
    contentRating: 'all_ages'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const INTERESTS = [
    'art', 'music', 'science', 'math', 'reading', 'sports',
    'gaming', 'animals', 'nature', 'cooking', 'dance', 'coding',
    'history', 'languages', 'movies', 'crafts'
  ]

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/little/auth/create`, form)
      setSuccess(res.data.child)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1.5px solid var(--color-border)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-primary)'
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Little WRLD account created!
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {success.displayName}'s account is ready. Username: <strong>{success.username}</strong>
        </p>
        <button
          onClick={() => navigate('/little-wrld/parent')}
          className="px-6 py-3 rounded-xl text-sm font-bold"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primary-text)',
            border: 'none',
            cursor: 'pointer'
          }}>
          Go to Parent Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        Create a Little WRLD Account
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        A safe, fully supervised space for your child. You control everything they see and do.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(255, 80, 80, 0.1)',
            border: '1px solid rgba(255, 80, 80, 0.3)',
            color: '#ff5050'
          }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-text-muted)' }}>
            Child's Display Name
          </label>
          <input
            value={form.displayName}
            onChange={e => setForm({ ...form, displayName: e.target.value })}
            placeholder="e.g. Little Zy"
            required
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-text-muted)' }}>
            Username
          </label>
          <input
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            placeholder="Choose a username"
            required
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-text-muted)' }}>
            Date of Birth
          </label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
            required
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-text-muted)' }}>
            Password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Create a password for your child"
            required
            className="px-4 py-3 rounded-xl text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-text-muted)' }}>
            Interests
          </label>
          <div className="grid grid-cols-3 gap-2">
            {INTERESTS.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className="py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                style={{
                  backgroundColor: form.interests.includes(interest)
                    ? 'rgba(255,215,0,0.1)'
                    : 'var(--color-bg-surface)',
                  border: form.interests.includes(interest)
                    ? '1px solid rgba(255,215,0,0.5)'
                    : '1px solid var(--color-border)',
                  color: form.interests.includes(interest)
                    ? 'var(--color-primary)'
                    : 'var(--color-text)',
                  cursor: 'pointer'
                }}>
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primary-text)',
            border: 'none',
            cursor: 'pointer'
          }}>
          {loading ? 'Creating...' : 'Create Little WRLD Account'}
        </button>

      </form>
    </div>
  )
}