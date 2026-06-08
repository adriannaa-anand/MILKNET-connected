import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../utils/api'
import './MilkmanProfile.css'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const TABS  = [
  { id:'about',    label:'📋 About'    },
  { id:'schedule', label:'📅 Schedule' },
  { id:'reviews',  label:'⭐ Reviews'  },
]

export default function MilkmanProfile({ navigate, milkman: propMilkman }) {
  const { user } = useAuth()
  const [milkman,    setMilkman]    = useState(propMilkman || null)
  const [tab,        setTab]        = useState('about')
  const [reviews,    setReviews]    = useState([])
  const [loading,    setLoading]    = useState(!propMilkman)
  const [subLoading, setSubLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [myReview,   setMyReview]   = useState({ rating:0, comment:'' })
  const [submitting, setSubmitting] = useState(false)
  const [revMsg,     setRevMsg]     = useState('')
  const [error,      setError]      = useState('')

  // If no propMilkman passed (direct navigation), fetch from API using _id
  useEffect(() => {
    if (!propMilkman) return
    const milkmanId = propMilkman._id || propMilkman.id
    if (!milkmanId) return

    // Fetch full milkman profile with reviews from backend
    const fetchFull = async () => {
      setLoading(true)
      try {
        const [mRes, rRes] = await Promise.all([
          api.get(`/milkmen/${milkmanId}`),
          api.get(`/reviews/${milkmanId}`),
        ])
        setMilkman(mRes.data.milkman)
        setReviews(rRes.data.reviews || [])
      } catch (err) {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchFull()

    // Check if user is already subscribed to this milkman
    if (user?.role === 'customer') {
      api.get('/subscriptions/my').then(res => {
        if (res.data.subscription?.milkman?._id === milkmanId) setSubscribed(true)
      }).catch(() => {})
    }
  }, [propMilkman, user])

  const handleSubscribe = async () => {
    if (!user) { setError('Please log in to subscribe'); return }
    if (user.role !== 'customer') { setError('Only customers can subscribe'); return }
    setSubLoading(true)
    try {
      await api.post('/subscriptions', { milkmanId: milkman._id })
      setSubscribed(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Subscription failed')
    } finally {
      setSubLoading(false)
    }
  }

  const submitReview = async () => {
    if (!myReview.rating) { setRevMsg('Please select a rating'); return }
    setSubmitting(true); setRevMsg('')
    try {
      const { data } = await api.post(`/reviews/${milkman._id}`, myReview)
      setReviews(prev => [data.review, ...prev.filter(r => r.customer?._id !== user._id)])
      setRevMsg('✅ Review submitted!')
      setMyReview({ rating:0, comment:'' })
    } catch (err) {
      setRevMsg(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`)
      setReviews(prev => prev.filter(r => r._id !== reviewId))
    } catch (err) {
      setRevMsg('Failed to delete review')
    }
  }

  if (loading) return <div className="page mmp"><div style={{ padding:60, textAlign:'center', color:'var(--muted)' }}>⏳ Loading profile…</div></div>
  if (!milkman)  return <div className="page mmp"><div style={{ padding:60, textAlign:'center', color:'var(--muted)' }}>Milkman not found. <button onClick={() => navigate('milkmen')} style={{ color:'var(--orange)', background:'none', border:'none', cursor:'pointer' }}>Go back</button></div></div>

  const m      = milkman
  const rating = m.reviewSummary?.averageRating || 0
  const revCnt = m.reviewSummary?.reviewCount   || reviews.length

  return (
    <div className="page mmp fade-up">
      <button className="mmp__back" onClick={() => navigate('milkmen')}>← Back to Milkmen</button>

      {error && <div className="mmp__error-bar">⚠️ {error}</div>}

      {/* Hero card */}
      <div className="card mmp__hero">
        <div className="mmp__hero-inner">
          <div className="mmp__av-wrap">
            <div className="mmp__av"
              style={{ background:`${m.color||'#E8A838'}20`, border:`3px solid ${m.color||'#E8A838'}50`, color:m.color||'#E8A838' }}>
              {m.initials || m.name?.[0]}
            </div>
            <div className="mmp__dot" style={{ background: m.available ? 'var(--green)' : 'var(--muted)' }} />
          </div>

          <div className="mmp__info">
            <div className="mmp__name-row">
              <h1 className="mmp__name">{m.name}</h1>
              {m.badge && <span className="mmp__badge" style={{ background:`${m.color||'#E8A838'}18`, color:m.color||'#E8A838' }}>{m.badge}</span>}
            </div>
            <p className="mmp__meta">📍 {m.area} · {m.experience || 'Experienced'} · Since {m.joinedYear || m.joined}</p>
            <div className="mmp__quick">
              {[
                ['⭐', `${rating || '—'} Rating`],
                ['💬', `${revCnt} Reviews`],
                ['👥', `${m.customerCount || 0} Customers`],
                ['💰', `₹${m.price}/litre`],
              ].map(([ic,lb]) => (
                <div key={lb} className="mmp__quick-stat"><span>{ic}</span><span>{lb}</span></div>
              ))}
            </div>
          </div>

          <div className="mmp__actions">
            {user?.role === 'customer' && (
              m.available ? (
                <button
                  className={`mmp__sub-btn ${subscribed ? 'mmp__sub-btn--done' : ''}`}
                  onClick={handleSubscribe}
                  disabled={subLoading || subscribed}
                >
                  {subLoading ? '⏳ Subscribing…' : subscribed ? '✅ Subscribed!' : 'Subscribe Now'}
                </button>
              ) : (
                <div className="mmp__leave">Currently on Leave</div>
              )
            )}
            {m.phone && <a className="mmp__contact" href={`tel:${m.phone}`}>📞 {m.phone}</a>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mmp__tabs">
        {TABS.map(({ id, label }) => (
          <button key={id} className={`mmp__tab ${tab===id ? 'mmp__tab--on' : ''}`}
            onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <div className="card mmp__content">
        {/* About tab */}
        {tab === 'about' && (
          <div>
            <h3 className="mmp__ct">About {m.name}</h3>
            <p className="mmp__about">{m.about || 'No description provided.'}</p>
            <h4 className="mmp__types-h">Milk Types Offered</h4>
            <div className="mmp__types">
              {(m.milkType || []).map(t => <span key={t} className="mmp__type">{t}</span>)}
            </div>
          </div>
        )}

        {/* Schedule tab */}
        {tab === 'schedule' && (
          <div>
            <h3 className="mmp__ct">Delivery Schedule</h3>
            <p className="mmp__days-label">DELIVERY DAYS</p>
            <div className="mmp__days">
              {DAYS.map(d => (
                <div key={d} className={`mmp__day ${(m.schedule||[]).includes(d) ? 'mmp__day--on' : ''}`}>{d}</div>
              ))}
            </div>
            <div className="card mmp__sched-card">
              <div className="mmp__sched-row"><span>⏰ Delivery Window</span><span>{m.deliveryTime || 'Morning'}</span></div>
              <div className="mmp__sched-row"><span>💰 Monthly (30L)</span><span className="mmp__monthly">₹{m.price * 30}</span></div>
            </div>
          </div>
        )}

        {/* Reviews tab */}
        {tab === 'reviews' && (
          <div>
            {/* Summary */}
            <div className="mmp__rev-summary">
              <div style={{ textAlign:'center' }}>
                <p className="mmp__big-rating">{rating || '—'}</p>
                <p style={{ fontSize:22, color:'var(--orange)', margin:'6px 0 4px' }}>{'★'.repeat(Math.round(rating))}</p>
                <p style={{ fontSize:13, color:'var(--muted)', margin:0 }}>{revCnt} reviews</p>
              </div>
              <div style={{ flex:1 }}>
                {[5,4,3,2,1].map(s => {
                  const cnt = reviews.filter(r => r.rating === s).length
                  const pct = revCnt ? Math.round((cnt / revCnt) * 100) : 0
                  return (
                    <div key={s} className="mmp__rbar-row">
                      <span style={{ fontSize:12, color:'var(--muted)', width:10 }}>{s}</span>
                      <div className="mmp__rbar-bg"><div className="mmp__rbar-fill" style={{ width:`${pct}%` }} /></div>
                      <span style={{ fontSize:11, color:'var(--muted)', width:28 }}>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Add review — customers only */}
            {user?.role === 'customer' && (
              <div className="mmp__add-review">
                <h4 className="mmp__ct" style={{ marginBottom:12 }}>Leave a Review</h4>
                <div className="mmp__stars">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button"
                      style={{ background:'none', border:'none', cursor:'pointer', fontSize:26, color: s <= myReview.rating ? 'var(--orange)' : 'var(--border)' }}
                      onClick={() => setMyReview(r => ({ ...r, rating:s }))}>★</button>
                  ))}
                </div>
                <textarea
                  className="mmp__rev-input"
                  placeholder="Share your experience…"
                  value={myReview.comment}
                  onChange={e => setMyReview(r => ({ ...r, comment:e.target.value }))}
                  rows={3}
                />
                {revMsg && <p style={{ fontSize:13, color: revMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)', marginBottom:8 }}>{revMsg}</p>}
                <button className="mmp__sub-btn" onClick={submitReview} disabled={submitting}>
                  {submitting ? '⏳ Submitting…' : 'Submit Review'}
                </button>
              </div>
            )}

            {/* Review list */}
            {reviews.length === 0 && <p style={{ color:'var(--muted)', textAlign:'center', padding:24 }}>No reviews yet. Be the first!</p>}
            {reviews.map(r => (
              <div key={r._id} className="mmp__review">
                <div className="mmp__rev-head">
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="mmp__rev-av">{r.customer?.name?.[0] || '?'}</div>
                    <div>
                      <p className="mmp__rev-name">{r.customer?.name || 'Anonymous'}</p>
                      <p className="mmp__rev-date">{new Date(r.createdAt).toLocaleDateString('en-IN', { month:'short', year:'numeric' })}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ color:'var(--orange)' }}>{'★'.repeat(r.rating)}</span>
                    {user && r.customer?._id === user._id && (
                      <button onClick={() => deleteReview(r._id)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:12 }}>🗑</button>
                    )}
                  </div>
                </div>
                <p className="mmp__rev-comment">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
