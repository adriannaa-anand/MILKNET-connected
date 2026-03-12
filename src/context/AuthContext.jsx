/**
 * AuthContext.jsx
 * Global auth state — wraps the whole app.
 * Any component can call useAuth() to get user + actions.
 */
import { createContext, useContext, useState, useCallback } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Restore from localStorage on first load
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('milknet_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const saveSession = (token, userData) => {
    localStorage.setItem('milknet_token', token)
    localStorage.setItem('milknet_user',  JSON.stringify(userData))
    setUser(userData)
  }

  const clearSession = () => {
    localStorage.removeItem('milknet_token')
    localStorage.removeItem('milknet_user')
    setUser(null)
  }

  const register = useCallback(async (name, email, password, role) => {
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role })
      saveSession(data.token, data.user)
      return data.user
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      setError(msg); throw new Error(msg)
    } finally { setLoading(false) }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      saveSession(data.token, data.user)
      return data.user
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      setError(msg); throw new Error(msg)
    } finally { setLoading(false) }
  }, [])

  const logout = useCallback(() => {
    clearSession()
  }, [])

  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('milknet_user', JSON.stringify(updated))
    setUser(updated)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
