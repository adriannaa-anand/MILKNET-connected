import './ExpenseChart.css'

export default function ExpenseChart({ data, title='Monthly Expenses' }) {
  const max   = Math.max(...data.map(d=>d.amount))
  const total = data.reduce((a,d)=>a+d.amount,0)
  return(
    <div className="echart">
      <div className="echart__head">
        <h3 className="echart__title">{title}</h3>
        <span className="echart__period">Last {data.length} months</span>
      </div>
      <p className="echart__total">₹{total.toLocaleString()} <span>total</span></p>
      <div className="echart__bars">
        {data.map((d,i)=>{
          const h=(d.amount/max)*100, cur=i===data.length-1
          return(
            <div key={i} className="echart__col">
              <span className="echart__val">₹{(d.amount/1000).toFixed(1)}k</span>
              <div className={`echart__bar ${cur?'echart__bar--cur':''}`} style={{height:`${h}%`}}/>
              <span className={`echart__label ${cur?'echart__label--cur':''}`}>{d.month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
