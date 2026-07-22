import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function ChildLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/little/auth/login`, {
        username, password
      })
      localStorage.setItem('littleWrldToken', res.data.token)
      localStorage.setItem('littleWrldChild', JSON.stringify(res.data.child))
      navigate('/little-wrld/home')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #FFD700 0%, #FF6B9D 50%, #6B9DFF 100%)'
      }}>

      <div className="w-full max-w-sm rounded-3xl p-8"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}>

        <div className="text-center mb-8">
          <p className="text-5xl mb-2">🌈</p>
          <h1 className="text-2xl font-black" style={{ color: '#2D2D2D' }}>
            Little WRLD
          </h1>
          <p className="text-sm" style={{ color: '#888' }}>
            A safe place to be a kid!
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm text-center"
            style={{ backgroundColor: '#FFE5E5', color: '#D64545' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your username"
            required
            className="px-4 py-3 rounded-2xl text-base outline-none"
            style={{
              backgroundColor: '#F5F5F5',
              border: '2px solid #EEE',
              color: '#2D2D2D'
            }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your password"
            required
            className="px-4 py-3 rounded-2xl text-base outline-none"
            style={{
              backgroundColor: '#F5F5F5',
              border: '2px solid #EEE',
              color: '#2D2D2D'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl text-base font-black"
            style={{
              backgroundColor: '#FFD700',
              color: '#2D2D2D',
              border: 'none',
              cursor: 'pointer'
            }}>
            {loading ? 'Logging in...' : 'Let\'s Go! 🚀'}
          </button>
        </form>

      </div>
    </div>
  )
}