import { useState } from 'react'
import './App.css'
import { useAuth } from './context/AuthContext.jsx'

import Navbar             from './Components/Navbar/Navbar.jsx'
import AuthModal          from './Components/AuthModal/AuthModal.jsx'
import Landing            from './pages/Landing/Landing.jsx'
import Dashboard          from './pages/Dashboard/Dashboard.jsx'
import MilkmanDashboard   from './pages/MilkmanDashboard/MilkmanDashboard.jsx'
import Milkmen            from './pages/Milkmen/Milkmen.jsx'
import MilkmanProfile     from './pages/MilkmanProfile/MilkmanProfile.jsx'
import Payments           from './pages/Payments/Payments.jsx'

export default function App() {
  const { user, logout } = useAuth()
  const [page,            setPage]            = useState('landing')
  const [showAuth,        setShowAuth]        = useState(false)
  const [selectedMilkman, setSelectedMilkman] = useState(null)

  const navigate = (target, data = null) => {
    if (target === 'milkman-profile' && data) setSelectedMilkman(data)
    setPage(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Called by AuthModal after successful login/register
  const handleAuthSuccess = (userData) => {
    setShowAuth(false)
    navigate(userData.role === 'milkman' ? 'milkman-dashboard' : 'dashboard')
  }

  const handleLogout = () => {
    logout()
    navigate('landing')
  }

  return (
    <div className="app-wrapper">
      {page !== 'landing' && (
        <Navbar
          currentPage={page}
          navigate={navigate}
          onLogin={() => setShowAuth(true)}
          onLogout={handleLogout}
        />
      )}

      {page === 'landing'           && <Landing        navigate={navigate} onLogin={() => setShowAuth(true)} />}
      {page === 'dashboard'         && <Dashboard      navigate={navigate} />}
      {page === 'milkman-dashboard' && <MilkmanDashboard navigate={navigate} />}
      {page === 'milkmen'           && <Milkmen        navigate={navigate} />}
      {page === 'milkman-profile'   && <MilkmanProfile navigate={navigate} milkman={selectedMilkman} />}
      {page === 'payments'          && <Payments       navigate={navigate} />}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}
