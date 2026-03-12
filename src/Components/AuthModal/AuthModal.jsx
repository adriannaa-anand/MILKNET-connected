import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import './AuthModal.css'

export default function AuthModal({ onClose, onSuccess }) {
  const { register, login, loading, error, setError } = useAuth()
  const [tab,  setTab]  = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'customer' })

  const handle     = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const switchTab  = t => { setTab(t); setError(''); setForm(f => ({ ...f, name:'', role:'customer' })) }

  const submit = async () => {
    setError('')
    try {
      let userData
      if (tab === 'login') {
        userData = await login(form.email, form.password)
      } else {
        if (!form.name) { setError('Name is required.'); return }
        userData = await register(form.name, form.email, form.password, form.role)
      }
      onSuccess(userData)
    } catch (err) {
      // error is already set in context
    }
  }

  const handleKey = e => { if (e.key === 'Enter') submit() }

  return (
    <div className="auth-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal fade-up">
        <button className="auth-modal__close" onClick={onClose}>✕</button>

        <div className="auth-modal__header">
          <div className="auth-modal__emoji">🥛</div>
          <h2>Welcome to MilkNet</h2>
          <p>Your local milk delivery network</p>
        </div>

        <div className="auth-modal__tabs">
          {['login','register'].map(t => (
            <button key={t} className={`auth-modal__tab ${tab===t?'auth-modal__tab--active':''}`}
              onClick={() => switchTab(t)}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div className="auth-modal__form">
          {tab === 'register' && (
            <>
              <input name="name" placeholder="Full Name" value={form.name}
                onChange={handle} className="auth-modal__input" autoFocus />
              <div className="auth-modal__role-row">
                {['customer','milkman'].map(r => (
                  <button key={r} type="button"
                    className={`auth-modal__role-btn ${form.role===r?'auth-modal__role-btn--active':''}`}
                    onClick={() => setForm(f => ({ ...f, role: r }))}>
                    {r === 'customer' ? '👤 Customer' : '🧑‍🌾 Milkman'}
                  </button>
                ))}
              </div>
            </>
          )}

          <input name="email" type="email" placeholder="Email Address" value={form.email}
            onChange={handle} onKeyDown={handleKey} className="auth-modal__input" />
          <input name="password" type="password" placeholder="Password (min 6 chars)" value={form.password}
            onChange={handle} onKeyDown={handleKey} className="auth-modal__input" />

          {error && <p className="auth-modal__error">⚠️ {error}</p>}

          <button className="auth-modal__submit" onClick={submit} disabled={loading}>
            {loading
              ? <span className="auth-modal__spinner">⏳ Please wait…</span>
              : tab==='login' ? 'Sign In →' : 'Create Account →'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
