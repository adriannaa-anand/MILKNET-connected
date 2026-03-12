import './MilkmanCard.css'

export default function MilkmanCard({ milkman: m, onClick }) {
  // Support both backend (_id, reviewSummary) and legacy (id, rating, reviews) shapes
  const rating  = m.reviewSummary?.averageRating ?? m.rating ?? 0
  const reviews = m.reviewSummary?.reviewCount   ?? m.reviews ?? 0
  const id      = m._id || m.id

  return (
    <div className={`mkcard ${!m.available ? 'mkcard--unavailable' : ''}`}
      onClick={() => m.available && onClick(m)}
      style={{ cursor: m.available ? 'pointer' : 'default' }}>

      {/* Header */}
      <div className="mkcard__head" style={{ background:`${m.color||'#E8A838'}12` }}>
        <div className="mkcard__av"
          style={{ background:`${m.color||'#E8A838'}25`, border:`2.5px solid ${m.color||'#E8A838'}50`, color:m.color||'#E8A838' }}>
          {m.initials || m.name?.[0]}
        </div>
        <div className="mkcard__head-right">
          {m.badge && (
            <span className="mkcard__badge" style={{ background:`${m.color||'#E8A838'}18`, color:m.color||'#E8A838' }}>
              {m.badge}
            </span>
          )}
          <div className={`mkcard__avail ${m.available ? 'mkcard__avail--on' : ''}`}>
            <div className="mkcard__avail-dot" />
            {m.available ? 'Available' : 'Unavailable'}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mkcard__body">
        <h3 className="mkcard__name">{m.name}</h3>
        <p className="mkcard__area">📍 {m.area}</p>

        <div className="mkcard__row">
          <span className="mkcard__price">₹{m.price}<span style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>/litre</span></span>
          <span className="mkcard__rating">
            <span style={{ color:'var(--orange)' }}>★</span> {rating || '—'}
            <span style={{ color:'var(--muted)', fontSize:12, marginLeft:4 }}>({reviews})</span>
          </span>
        </div>

        <div className="mkcard__types">
          {(m.milkType || []).slice(0,2).map(t => (
            <span key={t} className="mkcard__type">{t}</span>
          ))}
          {(m.milkType||[]).length > 2 && (
            <span className="mkcard__type">+{m.milkType.length - 2}</span>
          )}
        </div>

        {m.deliveryTime && <p className="mkcard__time">🕐 {m.deliveryTime}</p>}
      </div>

      {m.available && (
        <div className="mkcard__footer">
          <span>View Profile & Subscribe →</span>
        </div>
      )}
    </div>
  )
}
