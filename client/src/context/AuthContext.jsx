import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { connectSocket, disconnectSocket } from '../utils/socket'

const AuthContext = createContext()

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('wrldToken'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (user?.id) {
      connectSocket(user.id)
    }
    return () => {
      if (!user) disconnectSocket()
    }
  }, [user])

  const fetchCurrentUser = async () => {
  try {
    const res = await axios.get(`${API}/api/auth/me`)
    const userData = res.data
    setUser({ ...userData, id: userData.id || userData._id })
  } catch (err) {
    logout()
  } finally {
    setLoading(false)
  }
}

  const login = async (emailOrUsername, password) => {
    const res = await axios.post(`${API}/api/auth/login`, {
      emailOrUsername,
      password
    })
    const { token, user } = res.data
    localStorage.setItem('wrldToken', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setToken(token)
    // Make sure id is always available
    setUser({ ...user, id: user.id || user._id })
    return user
  }

  const register = async (userData) => {
    const res = await axios.post(`${API}/api/auth/register`, {
    emailOrUsername,
    password
  })
    const { token, user } = res.data
    localStorage.setItem('wrldToken', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setToken(token)
    // Make sure id is always available
    setUser({ ...user, id: user.id || user._id })
    return user
  }

  const logout = () => {
    disconnectSocket()
    localStorage.removeItem('wrldToken')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider value={{
      user, loading, token, login, register, logout, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}