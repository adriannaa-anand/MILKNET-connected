import { useAuth } from '../../context/AuthContext.jsx'
import './Navbar.css'

const CUSTOMER_LINKS = [
  { id: 'dashboard', label: 'Dashboard',    icon: '⊞' },
  { id: 'milkmen',   label: 'Find Milkmen', icon: '🥛' },
  { id: 'payments',  label: 'Payments',     icon: '₹'  },
]
const MILKMAN_LINKS = [
  { id: 'milkman-dashboard', label: 'My Dashboard', icon: '⊞' },
  { id: 'milkmen',           label: 'Browse',       icon: '🥛' },
]

export default function Navbar({ currentPage, navigate, onLogin, onLogout }) {
  const { user } = useAuth()
  const links = user?.role === 'milkman' ? MILKMAN_LINKS : CUSTOMER_LINKS

  return (
    <nav className="navbar">
      <div className="navbar__inner">

        <button className="navbar__logo"
          onClick={() => navigate(user?.role === 'milkman' ? 'milkman-dashboard' : 'dashboard')}>
          <div className="navbar__logo-icon">🥛</div>
          <span className="navbar__logo-text">MilkNet</span>
        </button>

        <div className="navbar__links">
          {links.map(({ id, label, icon }) => (
            <button key={id} onClick={() => navigate(id)}
              className={`navbar__link ${currentPage === id ? 'navbar__link--active' : ''}`}>
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="navbar__auth">
          {user ? (
            <>
              <div className="navbar__avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div>
              <span className="navbar__username">{user.name}</span>
              {user.role === 'milkman' && <span className="navbar__role-badge">🧑‍🌾 Milkman</span>}
              <button className="navbar__logout" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <button className="navbar__signin" onClick={onLogin}>Sign In</button>
          )}
        </div>

      </div>
    </nav>
  )
}
