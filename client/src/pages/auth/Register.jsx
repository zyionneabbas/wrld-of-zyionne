import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleStep1 = (e) => {
  e.preventDefault()

  if (form.username.length < 3) {
    setError('Username must be at least 3 characters')
    return
  }

  if (form.username.includes(' ')) {
    setError('Username cannot contain spaces')
    return
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._#^()\-])[A-Za-z\d@$!%*?&._#^()\-]{8,}$/

  if (!passwordRegex.test(form.password)) {
    setError('Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character (e.g. @, !, #)')
    return
  }

  if (form.password !== form.confirmPassword) {
    setError('Passwords do not match')
    return
  }

  setError('')
  setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName || form.username
      })
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-primary)'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Background orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.18) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite reverse'
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-wider mb-2"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-primary)' }}>
            WRLD
          </h1>
          <p className="text-sm tracking-widest uppercase"
            style={{ color: 'var(--color-text-muted)' }}>
            Your world. Unlimited.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            backdropFilter: 'blur(12px)'
          }}>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#0D0D0D'
                }}>
                1
              </div>
              <div className="flex-1 h-px"
                style={{
                  backgroundColor: step === 2
                    ? 'var(--color-primary)'
                    : 'var(--color-border)'
                }} />
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: step === 2
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-surface)',
                  color: step === 2 ? '#0D0D0D' : 'var(--color-text-muted)',
                  border: step === 2
                    ? 'none'
                    : '1px solid var(--color-border)'
                }}>
                2
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-1"
            style={{ color: 'var(--color-text)' }}>
            {step === 1 ? 'Create your account' : 'Almost there'}
          </h2>
          <p className="text-sm mb-6"
            style={{ color: 'var(--color-text-muted)' }}>
            {step === 1
              ? 'Step 1 of 2 — Your credentials'
              : 'Step 2 of 2 — Your identity'}
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

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Username
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                  className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              <p className="text-xs mt-0.5"
                style={{ color: 'var(--color-text-faint)' }}>
                 Min 8 characters · uppercase · lowercase · number · special character
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all mt-2"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#0D0D0D',
                  cursor: 'pointer'
                }}>
                Continue
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Display Name
                  <span className="ml-2 normal-case font-normal tracking-normal"
                    style={{ color: 'var(--color-text-faint)' }}>
                    (optional)
                  </span>
                </label>
                <input
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder={`Defaults to @${form.username}`}
                  className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              {/* Friend ID preview */}
              <div className="px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: 'rgba(255,215,0,0.05)',
                  border: '1px solid rgba(255,215,0,0.15)'
                }}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1"
                  style={{ color: 'var(--color-primary)' }}>
                  Your Friend ID
                </p>
                <p className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}>
                  A unique WRLD# code will be generated for you automatically. Share it only with people you want to connect with privately.
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer'
                  }}>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all"
                  style={{
                    backgroundColor: loading
                      ? 'var(--color-text-faint)'
                      : 'var(--color-primary)',
                    color: '#0D0D0D',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}>
                  {loading ? 'Creating...' : 'Join WRLD'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm mt-6"
            style={{ color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login"
              className="font-semibold"
              style={{ color: 'var(--color-primary)' }}>
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}