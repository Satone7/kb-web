import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import api from '../api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
  }

  const openLoginModal = useCallback(() => setShowLoginModal(true), [])
  const closeLoginModal = useCallback(() => setShowLoginModal(false), [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, showLoginModal, openLoginModal, closeLoginModal }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
