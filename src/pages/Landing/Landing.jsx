import { useState, useEffect } from 'react'
import api from '../../utils/api'
import './Landing.css'

const FEATURES = [
  { icon:'📍', title:'Discover Local Milkmen',  desc:'Find verified milkmen in your area. Compare prices, ratings, and delivery times.' },
  { icon:'☁️', title:'AWS S3 Verification',     desc:'Every milkman uploads ID and farm photos to AWS S3. Verify before subscribing.' },
  { icon:'₹',  title:'Pay via Razorpay',        desc:'Pay monthly subscriptions via UPI, cards, or net banking through Razorpay.' },
  { icon:'📊', title:'Expense Dashboard',       desc:'Track monthly milk spend with charts. Know exactly what you owe.' },
  { icon:'🔔', title:'Smart Reminders',         desc:'Get notified before payments are due. Never miss a payment again.' },
  { icon:'⭐', title:'Ratings & Reviews',       desc:'Community reviews help you choose the best milkman in your area.' },
]

// Static preview cards shown on landing (no auth needed)
const PREVIEW_CARDS = [
  { initials:'RK', name:'Ramesh Kumar',   area:'Koramangala', price:65,  rating:4.8, badge:'Top Rated',  color:'#E8A838' },
  { initials:'SY', name:'Suresh Yadav',   area:'Indiranagar',  price:60,  rating:4.6, badge:'Verified',   color:'#4A9E6B' },
  { initials:'PO', name:'Priya Organics', area:'JP Nagar',     price:85,  rating:4.9, badge:'Premium',    color:'#E85E8A' },
]

export default function Landing({ navigate, onLogin }) {
  const [stats, setStats] = useState({ customers:0, milkmen:0, rating:'4.8' })

  // Fetch live stats from backend (gracefully falls back if backend is down)
  useEffect(() => {
    api.get('/milkmen?limit=1').then(res => {
      if (res.data.total) setStats(s => ({ ...s, milkmen: res.data.total }))
    }).catch(() => {})
  }, [])

  return (
    <div className="landing">
      {/* NAV */}
      <nav className="lnav">
        <div className="lnav__logo"><div className="lnav__icon">🥛</div><span>MilkNet</span></div>
        <div className="lnav__actions">
          <button className="lnav__signin" onClick={onLogin}>Sign In</button>
          <button className="lnav__cta"    onClick={onLogin}>Get Started Free</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero__circle hero__circle--1" />
        <div className="hero__circle hero__circle--2" />
        <div className="hero__inner">
          <div className="hero__left fade-up">
            <div className="hero__pill">🏡 Hyperlocal Milk Delivery Network</div>
            <h1 className="hero__h1">Your trusted <span className="hero__gradient">milkman</span>, now digital.</h1>
            <p className="hero__sub">Discover local milkmen, compare prices, track expenses, and pay digitally — all in one community platform.</p>
            <div className="hero__btns">
              <button className="hero__btn-primary" onClick={onLogin}>Find Milkmen Near You →</button>
              <button className="hero__btn-ghost"   onClick={onLogin}>Register as Milkman</button>
            </div>
            <div className="hero__stats">
              {[
                ['2,400+',                       'Happy Customers'],
                [stats.milkmen ? `${stats.milkmen}+` : '180+', 'Trusted Milkmen'],
                ['4.8★',                         'Avg Rating'],
              ].map(([n,l]) => (
                <div key={l}><p className="hero__stat-n">{n}</p><p className="hero__stat-l">{l}</p></div>
              ))}
            </div>
          </div>

          <div className="hero__right">
            {PREVIEW_CARDS.map((m, i) => (
              <div key={m.initials} className={`hero__card ${i%2===1?'hero__card--offset':''}`} onClick={onLogin}>
                <div className="hero__card-av" style={{ background:`${m.color}20`, color:m.color }}>{m.initials}</div>
                <div className="hero__card-info">
                  <p className="hero__card-name">{m.name}</p>
                  <p className="hero__card-area">📍 {m.area}</p>
                </div>
                <div className="hero__card-price">
                  <p style={{ fontWeight:800, fontSize:15, color:'var(--red)', margin:'0 0 2px' }}>₹{m.price}/L</p>
                  <p style={{ fontSize:12, color:'var(--muted)', margin:0 }}>{m.rating}★</p>
                </div>
                {m.badge && <span className="hero__card-badge" style={{ background:`${m.color}18`, color:m.color }}>{m.badge}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="features__inner">
          <h2 className="features__h2">Everything you need</h2>
          <p className="features__sub">A complete platform for managing your local milk supply.</p>
          <div className="features__grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="features__card">
                <div className="features__icon">{f.icon}</div>
                <h3 className="features__title">{f.title}</h3>
                <p className="features__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lcta">
        <div className="lcta__inner">
          <p style={{ fontSize:48, marginBottom:16 }}>🥛</p>
          <h2 className="lcta__h2">Ready to digitize your milk delivery?</h2>
          <p className="lcta__sub">Join thousands of customers and milkmen on MilkNet.</p>
          <button className="lcta__btn" onClick={onLogin}>Get Started — It's Free</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lfooter">
        <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:17, color:'#fff' }}>🥛 MilkNet</span>
        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, margin:0 }}>© 2025 MilkNet · MERN + AWS S3 + Razorpay</p>
        <div style={{ display:'flex', gap:16 }}>
          {['AWS S3','Razorpay','MongoDB','React'].map(t => (
            <span key={t} style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:600 }}>{t}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}
