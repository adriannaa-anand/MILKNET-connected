import { useState } from 'react'
import api from '../../utils/api'
import './RazorpayModal.css'

/**
 * RazorpayModal
 * Props:
 *   amount      — amount in ₹
 *   milkmanId   — backend Milkman._id (for creating the order)
 *   payeeName   — display name
 *   description — e.g. "March Subscription"
 *   type        — 'subscription' | 'extra'
 *   month       — e.g. '2025-03'
 *   onClose     — fn()
 *   onSuccess   — fn({ txnId, amount })
 */
export default function RazorpayModal({
  amount, milkmanId, payeeName, description, type = 'subscription', month,
  onClose, onSuccess,
}) {
  const [step,    setStep]    = useState(1)  // 1=form 2=processing 3=success
  const [method,  setMethod]  = useState('upi')
  const [txnId,   setTxnId]   = useState('')
  const [error,   setError]   = useState('')

  const handlePay = async () => {
    setError('')
    setStep(2)

    try {
      // Step 1 — create order in backend
      const { data: orderData } = await api.post('/payments/create-order', {
        milkmanId, amount, description, type, month,
      })

      const keyId   = orderData.keyId
      const orderId = orderData.orderId

      // Step 2 — open Razorpay modal (requires Razorpay JS SDK in index.html)
      if (window.Razorpay) {
        await new Promise((resolve, reject) => {
          const rzp = new window.Razorpay({
            key:         keyId,
            amount:      orderData.amount,
            currency:    'INR',
            name:        'MilkNet',
            description: description || 'Milk Payment',
            order_id:    orderId,
            prefill:     { name: payeeName },
            theme:       { color: '#E8764A' },
            handler: async (response) => {
              try {
                // Step 3 — verify on backend
                const { data: verifyData } = await api.post('/payments/verify', {
                  razorpayOrderId:   response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  method,
                })
                setTxnId(verifyData.txnId || response.razorpay_payment_id)
                setStep(3)
                if (onSuccess) onSuccess({ txnId: verifyData.txnId, amount })
                resolve()
              } catch (err) {
                reject(new Error(err.response?.data?.message || 'Verification failed'))
              }
            },
            modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
          })
          rzp.open()
        })
      } else {
        // Fallback for dev (no Razorpay SDK loaded)
        console.warn('Razorpay SDK not found — using dev mock flow')
        await new Promise(r => setTimeout(r, 2000))
        const mockTxnId = `pay_${Date.now().toString().slice(-10)}`
        // Still call verify with mock values so DB gets updated
        await api.post('/payments/verify', {
          razorpayOrderId:   orderId,
          razorpayPaymentId: mockTxnId,
          razorpaySignature: 'dev_mock_signature',
          method,
        }).catch(() => {})
        setTxnId(mockTxnId)
        setStep(3)
        if (onSuccess) onSuccess({ txnId: mockTxnId, amount })
      }
    } catch (err) {
      setError(err.message || 'Payment failed')
      setStep(1)
    }
  }

  return (
    <div className="rp-overlay" onClick={e => e.target === e.currentTarget && step !== 2 && onClose()}>
      <div className="rp-modal fade-up">
        {step !== 2 && step !== 3 && <button className="rp-close" onClick={onClose}>✕</button>}

        {/* ── STEP 1: Form ── */}
        {step === 1 && (
          <>
            <div className="rp-brand">
              <div className="rp-brand-icon">₹</div>
              <div>
                <p className="rp-brand-name">Razorpay Checkout</p>
                <p className="rp-brand-sub">Secure · Fast · Trusted</p>
              </div>
            </div>
            <div className="rp-summary">
              <p className="rp-payee">Paying to <strong>{payeeName}</strong></p>
              <p className="rp-desc">{description}</p>
              <p className="rp-amount">₹{amount}</p>
            </div>
            <div className="rp-methods">
              {[['upi','📱 UPI'],['card','💳 Card'],['netbanking','🏦 NetBanking']].map(([m,l]) => (
                <button key={m} className={`rp-method ${method===m?'rp-method--active':''}`}
                  onClick={() => setMethod(m)}>{l}</button>
              ))}
            </div>
            {method === 'upi'        && <input className="rp-input" placeholder="Enter UPI ID  e.g. name@upi" />}
            {method === 'card'       && (
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:12 }}>
                <input className="rp-input" placeholder="Card Number" style={{ marginBottom:0 }} />
                <div style={{ display:'flex', gap:10 }}>
                  <input className="rp-input" placeholder="MM / YY" style={{ flex:1, marginBottom:0 }} />
                  <input className="rp-input" placeholder="CVV"      style={{ flex:1, marginBottom:0 }} />
                </div>
              </div>
            )}
            {method === 'netbanking' && (
              <select className="rp-input">
                <option>Select your bank</option>
                <option>SBI</option><option>HDFC</option><option>ICICI</option><option>Axis</option>
              </select>
            )}
            {error && <p className="rp-error">⚠️ {error}</p>}
            <button className="rp-pay-btn" onClick={handlePay}>Pay ₹{amount} Securely</button>
            <div className="rp-trust"><span>🔒 256-bit SSL</span><span>·</span><span>PCI DSS</span><span>·</span><span>Razorpay</span></div>
          </>
        )}

        {/* ── STEP 2: Processing ── */}
        {step === 2 && (
          <div className="rp-processing">
            <div style={{ fontSize:52, marginBottom:14 }}>⏳</div>
            <p className="rp-processing-title">Processing Payment</p>
            <p className="rp-processing-sub">Connecting to Razorpay…<br />Please do not close this window.</p>
            <div className="rp-prog-wrap">
              <div className="rp-prog-bar" style={{ animation:'progressFill 2.5s linear forwards' }} />
            </div>
          </div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 3 && (
          <div className="rp-success">
            <div className="rp-success-icon">✅</div>
            <p className="rp-success-title">Payment Successful!</p>
            <p className="rp-success-amount">₹{amount}</p>
            <p className="rp-success-detail">
              Paid to {payeeName} via Razorpay<br />
              <code>{txnId}</code>
            </p>
            <div className="rp-success-note">🔔 Receipt saved · Milkman notified</div>
            <button className="rp-done-btn" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
