import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const PURPOSES = [
  { id: 'just_having_fun', label: 'Just having fun', emoji: '🎉' },
  { id: 'building_career', label: 'Building my career', emoji: '💼' },
  { id: 'learning', label: 'Learning something new', emoji: '📖' },
  { id: 'networking', label: 'Networking', emoji: '🤝' },
  { id: 'building_business', label: 'Building a business', emoji: '🏗️' },
  { id: 'creating_content', label: 'Creating content', emoji: '🎥' },
  { id: 'finding_community', label: 'Finding my community', emoji: '👥' },
  { id: 'exploring', label: 'Just exploring', emoji: '🧭' },
  { id: 'mentoring_others', label: 'Mentoring others', emoji: '🌟' },
  { id: 'being_mentored', label: 'Finding a mentor', emoji: '🎯' },
]

const WORLDS = [
  { id: 'stem', label: 'STEM', emoji: '🔬' },
  { id: 'arts_humanities', label: 'Arts & Humanities', emoji: '🎨' },
  { id: 'finance', label: 'Finance', emoji: '📈' },
  { id: 'law', label: 'Law', emoji: '⚖️' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'medicine_health', label: 'Medicine & Health', emoji: '🏥' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'careers', label: 'Careers', emoji: '🚀' },
  { id: 'creative', label: 'Creative Arts', emoji: '✨' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'movies', label: 'Movies & Film', emoji: '🎬' },
  { id: 'anime', label: 'Anime & Manga', emoji: '⛩️' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎭' },
  { id: 'books', label: 'Books & Literature', emoji: '📖' },
  { id: 'photography', label: 'Photography', emoji: '📸' },
  { id: 'design', label: 'Design', emoji: '🖌️' },
  { id: 'fashion', label: 'Fashion & Style', emoji: '👗' },
  { id: 'beauty', label: 'Beauty', emoji: '💄' },
  { id: 'food', label: 'Food & Cooking', emoji: '🍜' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'pets', label: 'Pets & Animals', emoji: '🐾' },
  { id: 'nature', label: 'Nature & Environment', emoji: '🌿' },
  { id: 'home', label: 'Home & Living', emoji: '🏠' },
  { id: 'faith_spirituality', label: 'Faith & Spirituality', emoji: '🕊️' },
  { id: 'mental_health', label: 'Mental Health', emoji: '🧠' },
  { id: 'philosophy', label: 'Philosophy', emoji: '🤔' },
  { id: 'politics_society', label: 'Politics & Society', emoji: '🌍' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'ai_ml', label: 'AI & Machine Learning', emoji: '🤖' },
  { id: 'crypto_web3', label: 'Crypto & Web3', emoji: '🔗' },
  { id: 'space', label: 'Space & Astronomy', emoji: '🪐' },
]

const FONTS = [
  { id: 'Montserrat', label: 'Montserrat' },
  { id: 'Inter', label: 'Inter' },
  { id: 'Poppins', label: 'Poppins' },
  { id: 'Work Sans', label: 'Work Sans' },
  { id: 'Nunito', label: 'Nunito' },
  { id: 'Raleway', label: 'Raleway' },
  { id: 'Quicksand', label: 'Quicksand' },
  { id: 'Comfortaa', label: 'Comfortaa' },
  { id: 'Playfair Display', label: 'Playfair Display' },
  { id: 'DM Serif Display', label: 'DM Serif Display' },
  { id: 'Merriweather', label: 'Merriweather' },
  { id: 'Roboto Slab', label: 'Roboto Slab' },
  { id: 'Space Mono', label: 'Space Mono' },
  { id: 'Fira Code', label: 'Fira Code' },
  { id: 'Bebas Neue', label: 'Bebas Neue' },
  { id: 'Caveat', label: 'Caveat (Handwritten)' },
]

export default function Settings() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('profile')

  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    isPrivate: user?.isPrivate || false
  })

  const [purposes, setPurposes] = useState(user?.purpose || [])
  const [worlds, setWorlds] = useState(user?.worlds || [])

  const [appearance, setAppearance] = useState({
    mode: user?.appearance?.mode || 'dark',
    primaryColor: user?.appearance?.primaryColor || '#FFD700',
    backgroundColor: user?.appearance?.backgroundColor || '#0D0D0D',
    font: user?.appearance?.font || 'Montserrat'
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await axios.patch(`${API}/api/users/profile/update`, profile)
      updateUser(res.data)
      showSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const savePurpose = async () => {
    setSaving(true)
    try {
      await axios.patch(`${API}/api/users/profile/purpose`, {
        purpose: purposes,
        worlds
      })
      updateUser({ purpose: purposes, worlds })
      showSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const saveAppearance = async () => {
    setSaving(true)
    try {
      await axios.patch(`${API}/api/users/profile/appearance`, appearance)
      updateUser({ appearance: { ...user.appearance, ...appearance } })
      showSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const togglePurpose = (id) => {
    setPurposes(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const toggleWorld = (id) => {
    setWorlds(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sections = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'worlds', label: 'My Worlds', icon: '🌍' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'account', label: 'Account', icon: '⚙' },
  ]

  const inputStyle = {
  backgroundColor: 'var(--color-bg-surface)',
  border: '1.5px solid var(--color-border)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-primary)'
  }

  return (
    <div className="flex min-h-screen">

      {/* Settings sidebar */}
      <div className="hidden md:flex flex-col w-52 px-3 py-6 flex-shrink-0"
        style={{ borderRight: '1px solid var(--color-border)' }}>
        <p className="text-xs font-semibold tracking-widest uppercase px-3 mb-4"
          style={{ color: 'var(--color-text-muted)' }}>
          Settings
        </p>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all mb-1"
            style={{
              backgroundColor: activeSection === s.id
                ? 'rgba(255,215,0,0.08)'
                : 'transparent',
              color: activeSection === s.id
                ? 'var(--color-primary)'
                : 'var(--color-text-muted)',
              border: 'none',
              cursor: 'pointer'
            }}>
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile section tabs */}
      <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 w-full"
        style={{ borderBottom: '1px solid var(--color-border)' }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
            style={{
              backgroundColor: activeSection === s.id
                ? 'var(--color-primary)'
                : 'var(--color-bg-surface)',
              color: activeSection === s.id
                ? '#0D0D0D'
                : 'var(--color-text-muted)',
              border: 'none',
              cursor: 'pointer'
            }}>
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-xl px-4 py-6 md:px-8">

        {/* Saved indicator */}
        {saved && (
          <div className="mb-4 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.3)',
              color: 'var(--color-primary)'
            }}>
            ✓ Changes saved
          </div>
        )}

        {/* PROFILE SECTION */}
        {activeSection === 'profile' && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold"
              style={{ color: 'var(--color-text)' }}>
              Edit Profile
            </h2>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                style={{
                  backgroundColor: 'rgba(255,215,0,0.15)',
                  color: 'var(--color-primary)',
                  border: '2px solid rgba(255,215,0,0.3)'
                }}>
                {user?.displayName?.[0] || user?.username?.[0]}
              </div>
              <div>
                <p className="text-sm font-semibold"
                  style={{ color: 'var(--color-text)' }}>
                  {user?.displayName || user?.username}
                </p>
                <p className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}>
                  @{user?.username}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--color-text-muted)' }}>
                Display Name
              </label>
              <input
                value={profile.displayName}
                onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                placeholder="Your display name"
                className="px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--color-text-muted)' }}>
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell your world about yourself..."
                rows={4}
                className="px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)'
              }}>
              <div>
                <p className="text-sm font-semibold"
                  style={{ color: 'var(--color-text)' }}>
                  Private Account
                </p>
                <p className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Only approved followers see your posts
                </p>
              </div>
              <button
                onClick={() => setProfile({
                  ...profile, isPrivate: !profile.isPrivate
                })}
                className="w-11 h-6 rounded-full transition-all relative"
                style={{
                  backgroundColor: profile.isPrivate
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-elevated)',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                <div className="w-4 h-4 rounded-full absolute top-1 transition-all"
                  style={{
                    backgroundColor: '#fff',
                    left: profile.isPrivate ? '24px' : '4px'
                  }} />
              </button>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#0D0D0D',
                border: 'none',
                cursor: 'pointer'
              }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* WORLDS SECTION */}
        {activeSection === 'worlds' && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold"
              style={{ color: 'var(--color-text)' }}>
              My Worlds
            </h2>

            <p className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}>
              Update the worlds you belong to. Your feed and suggestions adjust instantly.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {WORLDS.map(world => (
                <button
                  key={world.id}
                  onClick={() => toggleWorld(world.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: worlds.includes(world.id)
                      ? 'rgba(255,215,0,0.1)'
                      : 'var(--color-bg-surface)',
                    border: worlds.includes(world.id)
                      ? '1px solid rgba(255,215,0,0.5)'
                      : '1px solid var(--color-border)',
                    cursor: 'pointer'
                  }}>
                  <span>{world.emoji}</span>
                  <span className="text-xs font-medium"
                    style={{
                      color: worlds.includes(world.id)
                        ? 'var(--color-primary)'
                        : 'var(--color-text)'
                    }}>
                    {world.label}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-sm font-bold mt-2"
              style={{ color: 'var(--color-text)' }}>
              My Purpose
            </p>

            <div className="grid grid-cols-2 gap-2">
              {PURPOSES.map(purpose => (
                <button
                  key={purpose.id}
                  onClick={() => togglePurpose(purpose.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: purposes.includes(purpose.id)
                      ? 'rgba(255,215,0,0.1)'
                      : 'var(--color-bg-surface)',
                    border: purposes.includes(purpose.id)
                      ? '1px solid rgba(255,215,0,0.5)'
                      : '1px solid var(--color-border)',
                    cursor: 'pointer'
                  }}>
                  <span>{purpose.emoji}</span>
                  <span className="text-xs font-medium"
                    style={{
                      color: purposes.includes(purpose.id)
                        ? 'var(--color-primary)'
                        : 'var(--color-text)'
                    }}>
                    {purpose.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={savePurpose}
              disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#0D0D0D',
                border: 'none',
                cursor: 'pointer'
              }}>
              {saving ? 'Saving...' : 'Save Worlds & Purpose'}
            </button>
          </div>
        )}

        {/* APPEARANCE SECTION */}
        {activeSection === 'appearance' && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold"
              style={{ color: 'var(--color-text)' }}>
              Appearance
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--color-text-muted)' }}>
                Mode
              </label>
              <div className="flex gap-2">
                {['dark', 'light'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setAppearance({ ...appearance, mode })}
                    className="flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all"
                    style={{
                      backgroundColor: appearance.mode === mode
                        ? 'rgba(255,215,0,0.1)'
                        : 'var(--color-bg-surface)',
                      border: appearance.mode === mode
                        ? '1px solid rgba(255,215,0,0.5)'
                        : '1px solid var(--color-border)',
                      color: appearance.mode === mode
                        ? 'var(--color-primary)'
                        : 'var(--color-text-muted)',
                      cursor: 'pointer'
                    }}>
                    {mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--color-text-muted)' }}>
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={appearance.primaryColor}
                  onChange={e => setAppearance({
                    ...appearance, primaryColor: e.target.value
                  })}
                  className="w-12 h-12 rounded-xl cursor-pointer"
                  style={{ border: '1px solid var(--color-border)' }}
                />
                <span className="text-sm font-mono"
                  style={{ color: 'var(--color-text-muted)' }}>
                  {appearance.primaryColor}
                </span>
                <button
                  onClick={() => setAppearance({
                    ...appearance, primaryColor: '#FFD700'
                  })}
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer'
                  }}>
                  Reset to gold
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--color-text-muted)' }}>
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={appearance.backgroundColor}
                  onChange={e => setAppearance({
                    ...appearance, backgroundColor: e.target.value
                  })}
                  className="w-12 h-12 rounded-xl cursor-pointer"
                  style={{ border: '1px solid var(--color-border)' }}
                />
                <span className="text-sm font-mono"
                  style={{ color: 'var(--color-text-muted)' }}>
                  {appearance.backgroundColor}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--color-text-muted)' }}>
                Font
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {FONTS.map(font => (
                  <button
                    key={font.id}
                    onClick={() => setAppearance({ ...appearance, font: font.id })}
                    className="py-3 px-2 rounded-xl text-sm font-semibold transition-all text-center"
                    style={{
                      fontFamily: `'${font.id}', sans-serif`,
                      backgroundColor: appearance.font === font.id
                        ? 'rgba(255,215,0,0.1)'
                        : 'var(--color-bg-surface)',
                      border: appearance.font === font.id
                        ? '1px solid rgba(255,215,0,0.5)'
                        : '1px solid var(--color-border)',
                      color: appearance.font === font.id
                        ? 'var(--color-primary)'
                        : 'var(--color-text)',
                      cursor: 'pointer'
                    }}>
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={saveAppearance}
              disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#0D0D0D',
                border: 'none',
                cursor: 'pointer'
              }}>
              {saving ? 'Saving...' : 'Save Appearance'}
            </button>
          </div>
        )}

        {/* PRIVACY SECTION */}
        {activeSection === 'privacy' && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold"
              style={{ color: 'var(--color-text)' }}>
              Privacy
            </h2>

            {[
              {
                label: 'Private Account',
                description: 'Only approved followers see your posts',
                key: 'isPrivate'
              }
            ].map(item => (
              <div key={item.key}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)'
                }}>
                <div>
                  <p className="text-sm font-semibold"
                    style={{ color: 'var(--color-text)' }}>
                    {item.label}
                  </p>
                  <p className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => setProfile({
                    ...profile, [item.key]: !profile[item.key]
                  })}
                  className="w-11 h-6 rounded-full transition-all relative"
                  style={{
                    backgroundColor: profile[item.key]
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-elevated)',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                  <div className="w-4 h-4 rounded-full absolute top-1 transition-all"
                    style={{
                      backgroundColor: '#fff',
                      left: profile[item.key] ? '24px' : '4px'
                    }} />
                </button>
              </div>
            ))}

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#0D0D0D',
                border: 'none',
                cursor: 'pointer'
              }}>
              {saving ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        )}

        {/* ACCOUNT SECTION */}
        {activeSection === 'account' && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold"
              style={{ color: 'var(--color-text)' }}>
              Account
            </h2>

            <div className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--color-border)' }}>
              <div className="px-4 py-3"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Username
                </p>
                <p className="text-sm"
                  style={{ color: 'var(--color-text)' }}>
                  @{user?.username}
                </p>
              </div>
              <div className="px-4 py-3"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Email
                </p>
                <p className="text-sm"
                  style={{ color: 'var(--color-text)' }}>
                  {user?.email}
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs font-semibold tracking-widest uppercase mb-1"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Friend ID
                </p>
                <p className="text-sm font-mono"
                  style={{ color: 'var(--color-primary)' }}>
                  {user?.friendId || 'Not assigned'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{
                backgroundColor: 'rgba(255,80,80,0.1)',
                border: '1px solid rgba(255,80,80,0.3)',
                color: '#ff5050',
                cursor: 'pointer'
              }}>
              Log Out
            </button>
          </div>
        )}

      </div>
    </div>
  )
}