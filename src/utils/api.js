/**
 * api.js — Central Axios instance
 * All API calls go through here. JWT is auto-attached.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('milknet_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-redirect on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('milknet_token')
      localStorage.removeItem('milknet_user')
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

export default api
