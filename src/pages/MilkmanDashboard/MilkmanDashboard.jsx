import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../utils/api'
import S3Upload from '../../Components/S3Upload/S3Upload.jsx'
import './MilkmanDashboard.css'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const MILK_TYPES = ['Cow Milk','Buffalo Milk','A2 Milk','Organic Milk','Toned Milk','Goat Milk']

export default function MilkmanDashboard({ navigate }) {
  const { user } = useAuth()

  const [profile,    setProfile]    = useState(null)
  const [subscribers,setSubscribers]= useState([])
  const [payments,   setPayments]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [error,      setError]      = useState('')

  // Form fields — initialised from fetched profile
  const [area,       setArea]       = useState('')
  const [price,      setPrice]      = useState('')
  const [about,      setAbout]      = useState('')
  const [delivTime,  setDelivTime]  = useState('')
  const [schedule,   setSchedule]   = useState([])
  const [milkTypes,  setMilkTypes]  = useState([])
  const [available,  setAvailable]  = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [profRes, subRes, payRes] = await Promise.all([
          api.get('/milkmen/me'),
          api.get('/subscriptions/milkman/subscribers'),
          api.get('/payments/milkman'),
        ])
        const p = profRes.data.milkman
        setProfile(p)
        setArea(p.area || '')
        setPrice(p.price || '')
        setAbout(p.about || '')
        setDelivTime(p.deliveryTime || '')
        setSchedule(p.schedule || [])
        setMilkTypes(p.milkType || [])
        setAvailable(p.available ?? true)
        setSubscribers(subRes.data.subscribers || [])
        setPayments(payRes.data.payments || [])
      } catch (err) {
        setError('Failed to load dashboard. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const toggleDay = d => setSchedule(s => s.includes(d) ? s.filter(x => x !== d) : [...s, d])
  const toggleType= t => setMilkTypes(m => m.includes(t) ? m.filter(x => x !== t) : [...m, t])

  const saveProfile = async () => {
    setSaving(true); setError('')
    try {
      const { data } = await api.patch('/milkmen/me', {
        area, price: Number(price), about, deliveryTime: delivTime,
        schedule, milkType: milkTypes, available,
      })
      setProfile(data.milkman)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleAvail = async () => {
    try {
      const { data } = await api.patch('/milkmen/me/availability')
      setAvailable(data.available)
    } catch (err) {
      setError('Failed to toggle availability')
    }
  }

  const thisMonthEarnings = payments
    .filter(p => {
      const d = new Date(p.paidAt || p.createdAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((s, p) => s + p.amount, 0)

  const STATS = [
    { icon:'👥', label:'Active Customers',  value: subscribers.length.toString(),                                    sub:'Right now',           color:'#F5A623' },
    { icon:'💰', label:'This Month',        value: thisMonthEarnings ? `₹${thisMonthEarnings.toLocaleString()}` : '₹0', sub:'Earnings received',color:'#4A9E6B' },
    { icon:'⭐', label:'Rating',            value: profile?.reviewSummary?.averageRating ? String(profile.reviewSummary.averageRating) : 'New', sub:`${profile?.reviewSummary?.reviewCount || 0} reviews`, color:'#7B68C8' },
    { icon:'📦', label:'Total Deliveries',  value: String(payments.length),                                          sub:'All time',            color:'#E8764A' },
  ]

  // Document verification status
  const hasDocs  = (profile?.documents?.length || 0) > 0
  const hasArea  = !!area
  const hasPrice = !!price

  if (loading) return <div className="page mdb"><div style={{ padding:60, textAlign:'center', color:'var(--muted)' }}>⏳ Loading dashboard…</div></div>

  return (
    <div className="page mdb fade-up">

      {/* Header */}
      <div className="mdb__head">
        <div className="mdb__head-left">
          <div className="mdb__avatar">{user?.name?.[0] || 'M'}</div>
          <div>
            <h1 className="mdb__title">Welcome, {user?.name?.split(' ')[0] || 'Milkman'} 🧑‍🌾</h1>
            <p className="mdb__sub">Milkman Dashboard · {available ? '🟢 Accepting customers' : '🔴 Not available'}</p>
          </div>
        </div>
        <div className="mdb__role-badge">🧑‍🌾 Milkman Account</div>
      </div>

      {error && <div className="mdb__error">⚠️ {error}</div>}

      {/* Stats */}
      <div className="mdb__stats">
        {STATS.map(s => (
          <div key={s.label} className="card mdb__stat">
            <div className="mdb__stat-icon">{s.icon}</div>
            <p className="mdb__stat-val" style={{ color:s.color }}>{s.value}</p>
            <p className="mdb__stat-label">{s.label}</p>
            <p className="mdb__stat-sub">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Setup banner if profile incomplete */}
      {(!hasArea || !hasPrice || !hasDocs) && (
        <div className="mdb__setup-banner">
          <span>🚀</span>
          <div>
            <p className="mdb__setup-title">Complete your profile to appear in search results</p>
            <p className="mdb__setup-sub">
              {!hasArea  && '📍 Add delivery area  '}
              {!hasPrice && '💰 Set your price  '}
              {!hasDocs  && '📄 Upload documents'}
            </p>
          </div>
        </div>
      )}

      <div className="mdb__grid">
        {/* Profile form */}
        <div className="card">
          <h3 className="mdb__section-title">Delivery Profile</h3>

          <label className="mdb__label">Delivery Area</label>
          <input className="mdb__input" placeholder="e.g. Koramangala, Bangalore"
            value={area} onChange={e => setArea(e.target.value)} />

          <label className="mdb__label">Price per Litre (₹)</label>
          <input className="mdb__input" type="number" placeholder="e.g. 65"
            value={price} onChange={e => setPrice(e.target.value)} />

          <label className="mdb__label">About You</label>
          <textarea className="mdb__input" rows={3}
            placeholder="Tell customers about your farm and milk quality…"
            value={about} onChange={e => setAbout(e.target.value)}
            style={{ resize:'vertical' }} />

          <label className="mdb__label">Delivery Time Window</label>
          <input className="mdb__input" placeholder="e.g. 5:30 AM – 6:00 AM"
            value={delivTime} onChange={e => setDelivTime(e.target.value)} />

          <label className="mdb__label">Milk Types Offered</label>
          <div className="mdb__milk-types">
            {MILK_TYPES.map(t => (
              <button key={t} type="button"
                className={`mdb__milk-type ${milkTypes.includes(t) ? 'mdb__milk-type--on' : ''}`}
                onClick={() => toggleType(t)}>{t}</button>
            ))}
          </div>

          <label className="mdb__label">Delivery Days</label>
          <div className="mdb__days">
            {DAYS.map(d => (
              <button key={d} type="button"
                className={`mdb__day ${schedule.includes(d) ? 'mdb__day--on' : ''}`}
                onClick={() => toggleDay(d)}>{d}</button>
            ))}
          </div>

          <div className="mdb__availability">
            <div>
              <p className="mdb__avail-title">Available for New Customers</p>
              <p className="mdb__avail-sub">Turn off if you're on leave or not accepting new orders</p>
            </div>
            <div className={`mdb__toggle ${available ? 'mdb__toggle--on' : ''}`} onClick={toggleAvail}>
              <div className="mdb__toggle-knob" />
            </div>
          </div>

          <button className="mdb__save-btn" onClick={saveProfile} disabled={saving}>
            {saving ? '⏳ Saving…' : saved ? '✅ Profile Saved!' : 'Save Profile'}
          </button>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Account status */}
          <div className="card mdb__status-card">
            <h3 className="mdb__section-title">Account Status</h3>
            {[
              ['📍 Delivery Area Set',      hasArea,  hasArea  ? 'Done'    : 'Missing'],
              ['💰 Price Configured',       hasPrice, hasPrice ? 'Done'    : 'Missing'],
              ['📄 Documents Uploaded',     hasDocs,  hasDocs  ? 'Done'    : 'Pending'],
              ['🟢 Visible in Search',      hasArea && hasPrice && hasDocs, hasArea && hasPrice && hasDocs ? 'Active' : 'Incomplete'],
            ].map(([label, done, text]) => (
              <div key={label} className="mdb__status-row">
                <span>{label}</span>
                <span className={`mdb__status-badge ${done ? 'mdb__status-badge--done' : 'mdb__status-badge--pending'}`}>{text}</span>
              </div>
            ))}
            <p className="mdb__status-note">Complete all steps to appear in customer searches.</p>
          </div>

          {/* Subscribers list */}
          {subscribers.length > 0 && (
            <div className="card">
              <h3 className="mdb__section-title">Your Customers ({subscribers.length})</h3>
              {subscribers.map(sub => (
                <div key={sub._id} className="mdb__status-row" style={{ gap:12 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'#FFF3E0', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--orange)', fontSize:14, flexShrink:0 }}>
                    {sub.customer?.name?.[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontWeight:600, fontSize:14 }}>{sub.customer?.name}</p>
                    <p style={{ margin:0, fontSize:12, color:'var(--muted)' }}>{sub.customer?.area || sub.customer?.email}</p>
                  </div>
                  <span className="mdb__status-badge mdb__status-badge--done">Active</span>
                </div>
              ))}
            </div>
          )}

          {/* Document upload */}
          <div className="card">
            <h3 className="mdb__section-title" style={{ marginBottom:14 }}>Upload Verification Docs</h3>
            <p className="mdb__docs-note">Upload your Aadhaar, FSSAI license, or farm photos. Stored securely on AWS S3.</p>
            <S3Upload folder="milkmen" onUploaded={() => window.location.reload()} />
          </div>

        </div>
      </div>

      {/* Quick links */}
      <div className="card mdb__quick-links">
        <h3 className="mdb__section-title">Quick Actions</h3>
        <div className="mdb__links-grid">
          {[
            { icon:'🔍', label:'See How Customers See You', action: () => navigate('milkmen') },
            { icon:'📊', label:'View as Customer',          action: () => navigate('dashboard') },
          ].map(l => (
            <button key={l.label} className="mdb__quick-link" onClick={l.action}>
              <span className="mdb__quick-icon">{l.icon}</span>
              <span>{l.label}</span>
              <span style={{ marginLeft:'auto', color:'var(--muted)' }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
