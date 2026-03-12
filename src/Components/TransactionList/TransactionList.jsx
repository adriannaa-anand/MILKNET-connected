import './TransactionList.css'

const STATUS_MAP = {
  paid:    { label:'Paid',    cls:'txn__status--paid',    icon:'✅' },
  created: { label:'Due',     cls:'txn__status--due',     icon:'⚠️' },
  failed:  { label:'Failed',  cls:'txn__status--failed',  icon:'❌' },
  refunded:{ label:'Refunded',cls:'txn__status--refunded',icon:'↩️' },
}

const METHOD_ICONS = { upi:'📱', card:'💳', netbanking:'🏦', wallet:'👛', other:'💰' }

export default function TransactionList({ transactions = [], onPay }) {
  if (!transactions.length) return null

  return (
    <div className="txn-list">
      {transactions.map((t, i) => {
        const s      = STATUS_MAP[t.status] || STATUS_MAP.created
        const mIcon  = METHOD_ICONS[t.method] || '💰'
        const mm     = t.milkman
        const date   = t.paidAt || t.createdAt
        const dateStr= date ? new Date(date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'

        return (
          <div key={t._id || i} className="txn">
            <div className="txn__left">
              <div className="txn__av"
                style={{ background:`${mm?.color||'#E8A838'}18`, color:mm?.color||'#E8A838' }}>
                {mm?.initials || mm?.name?.[0] || '🥛'}
              </div>
              <div>
                <p className="txn__title">{t.description || `Payment to ${mm?.name || 'Milkman'}`}</p>
                <p className="txn__meta">{dateStr} · {mIcon} {t.method?.toUpperCase() || 'PAYMENT'}</p>
                {t.razorpayPaymentId && (
                  <p className="txn__txnid">Txn: {t.razorpayPaymentId}</p>
                )}
              </div>
            </div>
            <div className="txn__right">
              <p className="txn__amount">₹{t.amount?.toLocaleString()}</p>
              <span className={`txn__status ${s.cls}`}>{s.icon} {s.label}</span>
              {t.status === 'created' && onPay && (
                <button className="txn__pay-btn" onClick={() => onPay(t)}>Pay Now</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
