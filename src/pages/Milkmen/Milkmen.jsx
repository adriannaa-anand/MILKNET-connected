import { useState, useEffect, useCallback } from 'react'
import api from '../../utils/api'
import MilkmanCard from '../../Components/MilkmanCard/MilkmanCard.jsx'
import './Milkmen.css'

export default function Milkmen({ navigate }) {
  const [milkmen, setMilkmen] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [sort,    setSort]    = useState('rating')
  const [total,   setTotal]   = useState(0)

  const fetchMilkmen = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ sort })
      if (search) params.append('search', search)
      if (filter === 'available') params.append('available', 'true')
      const { data } = await api.get(`/milkmen?${params}`)
      let results = data.milkmen || []
      // Client-side filter for 'verified' (badge present)
      if (filter === 'verified') results = results.filter(m => m.badge)
      setMilkmen(results)
      setTotal(data.total || results.length)
    } catch (err) {
      setError('Failed to load milkmen. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [search, filter, sort])

  useEffect(() => {
    const t = setTimeout(fetchMilkmen, 300)   // debounce search
    return () => clearTimeout(t)
  }, [fetchMilkmen])

  return (
    <div className="page milkmen fade-up">
      <div className="milkmen__head">
        <h1 className="milkmen__title">Find Milkmen Near You</h1>
        <p className="milkmen__sub">Verified local milkmen · Photos & ID docs stored on AWS S3</p>
      </div>

      <div className="card milkmen__bar">
        <div className="milkmen__search-wrap">
          <span className="milkmen__search-icon">📍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by area, name, or milk type… e.g. Koramangala" className="milkmen__search" />
          {search && (
            <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:18 }}>✕</button>
          )}
        </div>
        <div className="milkmen__filters">
          {[['all','All'],['available','Available'],['verified','Verified']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`milkmen__filter ${filter===v?'milkmen__filter--on':''}`}>{l}</button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="milkmen__sort">
          <option value="rating">Top Rated</option>
          <option value="reviews">Most Reviews</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
        </select>
      </div>

      {error && <div className="milkmen__error">⚠️ {error}</div>}

      {loading ? (
        <div className="milkmen__loading">
          <div className="milkmen__spinner" />
          <p>Loading milkmen from server…</p>
        </div>
      ) : (
        <>
          <p className="milkmen__count">
            {search
              ? `${milkmen.length} milkman${milkmen.length !== 1 ? 'men' : ''} found in "${search}"`
              : `${milkmen.length} milkmen available`}
          </p>
          {milkmen.length > 0 ? (
            <div className="milkmen__grid">
              {milkmen.map(m => (
                <MilkmanCard key={m._id} milkman={m} onClick={mil => navigate('milkman-profile', mil)} />
              ))}
            </div>
          ) : (
            <div className="milkmen__empty">
              <p style={{ fontSize:48 }}>🔍</p>
              <p className="milkmen__empty-title">No milkmen found{search ? ` in "${search}"` : ''}</p>
              <p>{search ? 'Try a nearby area or check the spelling' : 'Try a different filter'}</p>
              {search && <button onClick={() => setSearch('')} style={{ marginTop:12, padding:'8px 20px', borderRadius:20, border:'1.5px solid var(--orange)', background:'none', color:'var(--orange)', cursor:'pointer', fontWeight:600 }}>Clear Search</button>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
