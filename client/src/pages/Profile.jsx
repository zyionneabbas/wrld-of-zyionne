import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Profile() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('grid')
  const [showFollowMenu, setShowFollowMenu] = useState(false)

  const isOwnProfile = currentUser?.username === username

  useEffect(() => {
    fetchProfile()
  }, [username])

  useEffect(() => {
    const handleClickOutside = () => setShowFollowMenu(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/users/${username}`)
      setProfile(res.data.user)
      setPosts(res.data.posts)
      setFollowing(
        res.data.user.followers?.some(f => {
          const followerId = (f._id || f)?.toString()
          const myId = (currentUser?.id || currentUser?._id)?.toString()
          return followerId === myId
        })
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
    const res = await axios.get(`${API}/api/users/${username}`)
    console.log('am I following?', res.data.user.followers?.some(
    f => (f._id || f)?.toString() === currentUser?.id?.toString()
    ))
    console.log('followers list:', res.data.user.followers)
    console.log('my id:', currentUser?.id)
  
  }

  const handleFollow = async () => {
    try {
      const res = await axios.patch(`${API}/api/users/${profile._id}/follow`)
      setFollowing(res.data.following)
      fetchProfile()
    } catch (err) {
      console.error(err)
    }
  }


  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--color-text-muted)' }}>Loading profile...</p>
    </div>
  )

  if (!profile) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ color: 'var(--color-text-muted)' }}>User not found</p>
    </div>
  )

  const mediaPosts = posts.filter(p => p.media?.length > 0)
  const tweets = posts.filter(p => p.postType === 'tweet')

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Profile header */}
      <div className="flex items-start gap-5 mb-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{
            backgroundColor: 'rgba(255,215,0,0.15)',
            color: 'var(--color-primary)',
            border: '2px solid rgba(255,215,0,0.3)'
          }}>
          {profile.displayName?.[0] || profile.username?.[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-bold"
              style={{ color: 'var(--color-text)' }}>
              {profile.displayName || profile.username}
            </h1>
            {profile.verified && (
              <span style={{ color: 'var(--color-primary)' }}>✓</span>
            )}
          </div>
          <p className="text-sm mb-3"
            style={{ color: 'var(--color-text-muted)' }}>
            @{profile.username}
          </p>

          {profile.bio && (
            <p className="text-sm mb-3"
              style={{ color: 'var(--color-text)' }}>
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex gap-4 mb-3 text-sm">
            <span style={{ color: 'var(--color-text)' }}>
              <strong>{posts.length}</strong>{' '}
              <span style={{ color: 'var(--color-text-muted)' }}>posts</span>
            </span>
            <span style={{ color: 'var(--color-text)' }}>
              <strong>{profile.followers?.length || 0}</strong>{' '}
              <span style={{ color: 'var(--color-text-muted)' }}>followers</span>
            </span>
            <span style={{ color: 'var(--color-text)' }}>
              <strong>{profile.following?.length || 0}</strong>{' '}
              <span style={{ color: 'var(--color-text-muted)' }}>following</span>
            </span>
          </div>

          {/* Action button */}
          {!isOwnProfile && (
            <div className="relative">
            {following ? (
            <div className="relative">
            <button
             onClick={(e) => {
            e.stopPropagation()
            setShowFollowMenu(prev => !prev)
            }}
            className="flex items-center gap-1 px-5 py-2 rounded-full text-sm font-bold transition-all"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              cursor: 'pointer'
          }}>
          Following ▾
        </button>

          {showFollowMenu && (
            <div className="absolute top-10 left-0 rounded-xl overflow-hidden z-20 min-w-44"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }}>
              {[
                { label: '⭐ Add to Favourites', action: () => {} },
                { label: '👥 Add to Close Friends', action: () => {} },
                { label: '🔇 Mute', action: () => {} },
                { label: '⚠️ Restrict', action: () => {} },
                {
                  label: 'Unfollow',
                  action: handleFollow,
                  danger: true
                },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action()
                    setShowFollowMenu(false)
                  }}
                  className="w-full text-left px-4 py-3 text-sm transition-all"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: item.danger ? '#ff5050' : 'var(--color-text)',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--color-border)'
                  }}
                  onMouseEnter={e =>
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)'}
                  onMouseLeave={e =>
                    e.currentTarget.style.backgroundColor = 'transparent'}>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleFollow}
          className="px-5 py-2 rounded-full text-sm font-bold transition-all"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#0D0D0D',
            border: 'none',
            cursor: 'pointer'
          }}>
        Follow
      </button>
      )}
    </div>
  )}
          {isOwnProfile && (
            <button
              className="px-5 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: 'pointer'
              }}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Worlds */}
      {profile.worlds?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {profile.worlds.slice(0, 6).map(world => (
            <span key={world}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                backgroundColor: 'rgba(255,215,0,0.08)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(255,215,0,0.2)'
              }}>
              {world.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl"
        style={{ backgroundColor: 'var(--color-bg-card)' }}>
        {[
          { id: 'grid', label: '⊞ Posts' },
          { id: 'media', label: '🖼 Media' },
          { id: 'tweets', label: '💭 Thoughts' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              backgroundColor: activeTab === tab.id
                ? 'rgba(255,215,0,0.1)'
                : 'transparent',
              color: activeTab === tab.id
                ? 'var(--color-primary)'
                : 'var(--color-text-muted)',
              border: 'none',
              cursor: 'pointer'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid view — Instagram style */}
      {activeTab === 'grid' && (
        posts.length === 0 ? (
          <EmptyTab message="No posts yet" />
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map(post => (
              <div key={post._id}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                {post.media?.[0] ? (
                  <img
                    src={post.media[0].url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3">
                    <p className="text-xs text-center line-clamp-4"
                      style={{ color: 'var(--color-text-muted)' }}>
                      {post.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Media tab */}
      {activeTab === 'media' && (
        mediaPosts.length === 0 ? (
          <EmptyTab message="No media posts yet" />
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {mediaPosts.map(post => (
              <div key={post._id}
                className="aspect-square rounded-lg overflow-hidden"
                style={{ backgroundColor: 'var(--color-bg-surface)' }}>
                <img
                  src={post.media[0].url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )
      )}

      {/* Tweets tab — Twitter style feed */}
      {activeTab === 'tweets' && (
        tweets.length === 0 ? (
          <EmptyTab message="No thoughts shared yet" />
        ) : (
          <div className="flex flex-col gap-3">
            {tweets.map(post => (
              <div key={post._id}
                className="px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)'
                }}>
                <p className="text-sm mb-2"
                  style={{ color: 'var(--color-text)' }}>
                  {post.content}
                </p>
                <p className="text-xs"
                  style={{ color: 'var(--color-text-faint)' }}>
                  {new Date(post.createdAt).toLocaleDateString()} ·{' '}
                  {post.likes?.length || 0} likes
                </p>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  )
}

function EmptyTab({ message }) {
  return (
    <div className="text-center py-16">
      <p className="text-3xl mb-3">📭</p>
      <p className="text-sm"
        style={{ color: 'var(--color-text-muted)' }}>
        {message}
      </p>
    </div>
  )
}
