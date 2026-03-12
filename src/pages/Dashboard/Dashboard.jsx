import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../utils/api'
import ExpenseChart    from '../../Components/ExpenseChart/ExpenseChart.jsx'
import TransactionList from '../../Components/TransactionList/TransactionList.jsx'
import RazorpayModal   from '../../Components/RazorpayModal/RazorpayModal.jsx'
import './Dashboard.css'

export default function Dashboard({ navigate }) {
  const { user } = useAuth()

  const [subscription, setSubscription] = useState(null)
  const [payments,     setPayments]     = useState([])
  const [monthlyData,  setMonthlyData]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [banner,       setBanner]       = useState(true)
  const [modal,        setModal]        = useState(false)
  const [payTarget,    setPayTarget]    = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [subRes, payRes, sumRes] = await Promise.all([
          api.get('/subscriptions/my'),
          api.get('/payments/my?limit=5'),
          api.get('/payments/summary'),
        ])
        setSubscription(subRes.data.subscription)
        setPayments(payRes.data.payments || [])
        setMonthlyData(sumRes.data.monthlyData || [])
      } catch (err) {
        setError('Failed to load dashboard data. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const mm = subscription?.milkman

  // Compute stats from real data
  const thisMonth = monthlyData.at(-1)?.amount || 0
  const totalPaid = monthlyData.reduce((s, d) => s + d.amount, 0)
  const dueItems  = payments.filter(p => p.status === 'created')

  const STATS = [
    { icon:'📦', label:'This Month',    value: thisMonth ? `₹${thisMonth.toLocaleString()}` : '₹0',   sub: mm ? `via ${mm.name}` : 'No subscription', color:'#F5A623' },
    { icon:'✅', label:'Total Paid',    value: totalPaid ? `₹${totalPaid.toLocaleString()}` : '₹0',  sub: `${monthlyData.length} months`,              color:'#4A9E6B' },
    { icon:'⚠️', label:'Amount Due',   value: dueItems.length ? `₹${dueItems.reduce((s,p)=>s+p.amount,0)}` : '₹0', sub: dueItems.length ? `${dueItems.length} pending` : 'All clear', color:'#E8764A' },
    { icon:'📅', label:'Next Delivery', value: mm ? 'Tomorrow' : 'N/A', sub: mm?.deliveryTime || 'Subscribe to a milkman', color:'#7B68C8' },
  ]

  const openPay = (p) => { setPayTarget(p); setModal(true) }

  if (loading) return <div className="page db"><div className="db__loading">⏳ Loading dashboard…</div></div>

  return (
    <div className="page db fade-up">
      <div className="db__greet">
        <h1 className="db__title">Good morning, {user?.name?.split(' ')[0] || 'there'} 🌅</h1>
        <p className="db__sub">Your milk delivery summary</p>
      </div>

      {error && <div className="db__error">⚠️ {error}</div>}

      {/* Payment reminder */}
      {banner && dueItems.length > 0 && (
        <div className="db__banner">
          <span style={{ fontSize:22 }}>🔔</span>
          <div className="db__banner-text">
            <p className="db__banner-title">Payment Reminder</p>
            <p className="db__banner-sub">₹{dueItems.reduce((s,p)=>s+p.amount,0)} pending payment</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="db__pay-btn"      onClick={() => openPay(dueItems[0])}>Pay Now</button>
            <button className="db__dismiss-btn"  onClick={() => setBanner(false)}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="db__stats">
        {STATS.map(s => (
          <div key={s.label} className="card db__stat">
            <div style={{ fontSize:24, marginBottom:10 }}>{s.icon}</div>
            <p className="db__stat-val" style={{ color:s.color }}>{s.value}</p>
            <p className="db__stat-label">{s.label}</p>
            <p className="db__stat-sub">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="db__grid">
        {/* My Milkman */}
        <div className="card">
          <div className="db__sec-head">
            <h3 className="db__sec-title">My Milkman</h3>
            <button className="db__link" onClick={() => navigate('milkmen')}>
              {mm ? 'Switch' : 'Find One'} →
            </button>
          </div>

          {mm ? (
            <>
              <div className="db__mm-top">
                <div className="db__mm-av"
                  style={{ background:`${mm.color||'#E8A838'}18`, border:`2px solid ${mm.color||'#E8A838'}44`, color:mm.color||'#E8A838' }}>
                  {mm.initials || mm.name?.[0]}
                </div>
                <div>
                  <p className="db__mm-name">{mm.name}</p>
                  <p className="db__mm-area">📍 {mm.area}</p>
                  <div style={{ display:'flex', gap:8, marginTop:6 }}>
                    <span className="db__badge db__badge--orange">{mm.badge || 'Active'}</span>
                    <span className="db__badge db__badge--green">{subscription.status}</span>
                  </div>
                </div>
              </div>
              {[
                ['🕐 Delivery', mm.deliveryTime],
                ['💰 Price',    `₹${mm.price} / litre`],
                ['📅 Days',     subscription.litresPerDay + 'L/day'],
                ['📞 Contact',  mm.phone || 'Not provided'],
              ].map(([k,v]) => (
                <div key={k} className="db__mm-row">
                  <span className="db__mm-key">{k}</span>
                  <span className="db__mm-val">{v}</span>
                </div>
              ))}
              <button className="db__view-btn" onClick={() => navigate('milkman-profile', mm)}>
                View Full Profile
              </button>
            </>
          ) : (
            <div className="db__no-subscription">
              <p style={{ fontSize:42, marginBottom:12 }}>🥛</p>
              <p style={{ fontWeight:700, marginBottom:8 }}>No active subscription</p>
              <p style={{ color:'var(--muted)', fontSize:14, marginBottom:16 }}>
                Browse local milkmen and subscribe to start getting fresh milk delivered daily.
              </p>
              <button className="db__view-btn" onClick={() => navigate('milkmen')}>
                Browse Milkmen →
              </button>
            </div>
          )}
        </div>

        {/* Expense Chart */}
        <div className="card">
          {monthlyData.length > 0
            ? <ExpenseChart data={monthlyData.map(d => ({ month: d.month?.slice(-2) === '01' ? 'Jan' : d.month?.slice(5), amount: d.amount }))} />
            : <div className="db__no-data">📊 No expense data yet.<br />Make your first payment to see charts.</div>
          }
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <div className="db__sec-head">
          <h3 className="db__sec-title">Recent Transactions</h3>
          <button className="db__link" onClick={() => navigate('payments')}>View All →</button>
        </div>
        {payments.length > 0
          ? <TransactionList transactions={payments} onPay={openPay} />
          : <p style={{ color:'var(--muted)', textAlign:'center', padding:24 }}>No transactions yet.</p>
        }
      </div>

      {modal && payTarget && mm && (
        <RazorpayModal
          amount={payTarget.amount}
          milkmanId={mm._id}
          payeeName={mm.name}
          description={payTarget.description}
          type={payTarget.type}
          onClose={() => setModal(false)}
          onSuccess={() => { setModal(false); window.location.reload() }}
        />
      )}
    </div>
  )
}
