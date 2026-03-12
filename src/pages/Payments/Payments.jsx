import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../utils/api'
import TransactionList from '../../Components/TransactionList/TransactionList.jsx'
import RazorpayModal   from '../../Components/RazorpayModal/RazorpayModal.jsx'
import ExpenseChart    from '../../Components/ExpenseChart/ExpenseChart.jsx'
import './Payments.css'

export default function Payments({ navigate }) {
  const { user } = useAuth()

  const [payments,     setPayments]     = useState([])
  const [monthlyData,  setMonthlyData]  = useState([])
  const [subscription, setSubscription] = useState(null)
  const [totalSpent,   setTotalSpent]   = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [modal,        setModal]        = useState(false)
  const [payTarget,    setPayTarget]    = useState(null)
  const [autoPayId,    setAutoPayId]    = useState(null)
  const [autoPay,      setAutoPay]      = useState(false)
  const [page,         setPage]         = useState(1)
  const [hasMore,      setHasMore]      = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true); setError('')
      try {
        const [payRes, sumRes, subRes] = await Promise.all([
          api.get('/payments/my?limit=10&page=1'),
          api.get('/payments/summary'),
          api.get('/subscriptions/my'),
        ])
        setPayments(payRes.data.payments || [])
        setHasMore(payRes.data.total > 10)
        setMonthlyData(sumRes.data.monthlyData || [])
        setTotalSpent(sumRes.data.totalSpent   || 0)
        const sub = subRes.data.subscription
        setSubscription(sub)
        if (sub) { setAutoPayId(sub._id); setAutoPay(sub.autoPay || false) }
      } catch (err) {
        setError('Failed to load payment data. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const loadMore = async () => {
    const nextPage = page + 1
    try {
      const { data } = await api.get(`/payments/my?limit=10&page=${nextPage}`)
      setPayments(prev => [...prev, ...(data.payments || [])])
      setHasMore(payments.length + (data.payments?.length || 0) < data.total)
      setPage(nextPage)
    } catch {}
  }

  const toggleAutoPay = async () => {
    if (!autoPayId) return
    try {
      const { data } = await api.patch(`/subscriptions/${autoPayId}/autopay`)
      setAutoPay(data.autoPay)
    } catch (err) {
      setError('Failed to toggle auto-pay')
    }
  }

  const openPay = (p) => { setPayTarget(p); setModal(true) }

  const onPaySuccess = async () => {
    setModal(false)
    // Refresh payments list after payment
    const [payRes, sumRes] = await Promise.all([
      api.get('/payments/my?limit=10&page=1'),
      api.get('/payments/summary'),
    ])
    setPayments(payRes.data.payments || [])
    setTotalSpent(sumRes.data.totalSpent || 0)
    setMonthlyData(sumRes.data.monthlyData || [])
  }

  const duePayments   = payments.filter(p => p.status === 'created')
  const totalDue      = duePayments.reduce((s, p) => s + p.amount, 0)
  const paidThisMonth = monthlyData.at(-1)?.amount || 0
  const mm            = subscription?.milkman

  const CARDS = [
    { icon:'💰', label:'Total Spent',      value: totalSpent   ? `₹${totalSpent.toLocaleString()}`    : '₹0', sub:'All time',             color:'var(--red)'    },
    { icon:'✅', label:'Paid This Month',  value: paidThisMonth? `₹${paidThisMonth.toLocaleString()}` : '₹0', sub:'Current month',        color:'var(--green)'  },
    { icon:'⚠️', label:'Amount Due',      value: totalDue      ? `₹${totalDue.toLocaleString()}`      : '₹0', sub: `${duePayments.length} pending`, color:'var(--orange)' },
  ]

  if (loading) return <div className="page pay"><div className="pay__loading">⏳ Loading payments…</div></div>

  return (
    <div className="page pay fade-up">
      <div className="pay__head">
        <h1 className="pay__title">Payment History</h1>
        <p className="pay__sub">Powered by Razorpay · All transactions secured</p>
      </div>

      {error && <div className="pay__error">⚠️ {error}</div>}

      {/* Summary cards */}
      <div className="pay__cards">
        {CARDS.map(c => (
          <div key={c.label} className="card pay__card">
            <span style={{ fontSize:28 }}>{c.icon}</span>
            <p className="pay__card-val" style={{ color:c.color }}>{c.value}</p>
            <p className="pay__card-label">{c.label}</p>
            <p className="pay__card-sub">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Due payment banner */}
      {duePayments.length > 0 && mm && (
        <div className="pay__due-banner">
          <div>
            <p className="pay__due-title">⚠️ Payment Due</p>
            <p className="pay__due-sub">₹{totalDue} pending to {mm.name}</p>
          </div>
          <button className="pay__pay-now" onClick={() => openPay(duePayments[0])}>Pay ₹{totalDue} Now</button>
        </div>
      )}

      <div className="pay__grid">
        {/* Transactions */}
        <div className="card">
          <h3 className="pay__sec-title">Transaction History</h3>
          {payments.length === 0 ? (
            <p style={{ color:'var(--muted)', textAlign:'center', padding:32 }}>
              No transactions yet. Subscribe to a milkman to get started.
            </p>
          ) : (
            <>
              <TransactionList transactions={payments} onPay={openPay} />
              {hasMore && (
                <button className="pay__load-more" onClick={loadMore}>Load More</button>
              )}
            </>
          )}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Quick pay */}
          {mm && (
            <div className="card pay__quick">
              <h3 className="pay__sec-title">Quick Pay</h3>
              <div className="pay__quick-milkman">
                <div className="pay__quick-av" style={{ background:`${mm.color||'#E8A838'}20`, color:mm.color||'#E8A838' }}>
                  {mm.initials || mm.name?.[0]}
                </div>
                <div>
                  <p style={{ fontWeight:700, margin:0 }}>{mm.name}</p>
                  <p style={{ color:'var(--muted)', fontSize:13, margin:0 }}>{mm.area}</p>
                </div>
              </div>
              <button className="pay__razorpay-btn"
                onClick={() => openPay({ amount: mm.price * 30, description: `Monthly payment to ${mm.name}`, type:'subscription' })}>
                💳 Pay ₹{mm.price * 30} via Razorpay
              </button>

              {/* Auto-pay */}
              <div className="pay__autopay">
                <div>
                  <p className="pay__autopay-title">Auto-Pay</p>
                  <p className="pay__autopay-sub">Automatically pay on the 1st of each month</p>
                </div>
                <div className={`pay__toggle ${autoPay ? 'pay__toggle--on' : ''}`} onClick={toggleAutoPay}>
                  <div className="pay__toggle-knob" />
                </div>
              </div>
            </div>
          )}

          {/* Monthly chart */}
          {monthlyData.length > 0 && (
            <div className="card">
              <h3 className="pay__sec-title" style={{ marginBottom:14 }}>Monthly Trend</h3>
              <ExpenseChart data={monthlyData.map(d => ({
                month:  d.month?.slice(5) || d.month,
                amount: d.amount,
              }))} />
            </div>
          )}
        </div>
      </div>

      {modal && (
        <RazorpayModal
          amount={payTarget?.amount || (mm?.price * 30)}
          milkmanId={mm?._id}
          payeeName={mm?.name || ''}
          description={payTarget?.description || 'Monthly Payment'}
          type={payTarget?.type || 'subscription'}
          onClose={() => setModal(false)}
          onSuccess={onPaySuccess}
        />
      )}
    </div>
  )
}
