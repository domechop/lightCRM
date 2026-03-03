import { formatCurrency } from '../lib/constants'

const svg = (d, size = 20) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
)



export default function Dashboard({ leads, stages, stageColorMap, onLeadClick, onGoTo }) {
  const lastStage = stages[stages.length - 1]?.name
  const active = leads.filter(l => l.stage !== lastStage)
  const done   = leads.filter(l => l.stage === lastStage)
  const pipeVal = active.reduce((s, l) => s + (l.value || 0), 0)
  const rev     = done.reduce((s, l) => s + (l.value || 0), 0)
  const avg     = leads.length ? Math.round(leads.reduce((s, l) => s + (l.value || 0), 0) / leads.length) : 0
  const maxV    = Math.max(...stages.map(s => leads.filter(l => l.stage === s.name).reduce((a, l) => a + (l.value || 0), 0)), 1)

  const recent = [...leads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Topbar */}
      <div style={{ padding: '16px 16px 10px' }}>
        <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.5px' }}>Dashboard</div>
        <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 2 }}>Welcome back, good to see you</div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 14px' }}>
        {[
          { label: 'Pipeline', value: formatCurrency(pipeVal), sub: `${active.length} active`,   color: 'var(--green)' },
          { label: 'Revenue',  value: formatCurrency(rev),     sub: `${done.length} installs`,   color: 'var(--blue)'  },
          { label: 'Leads',    value: leads.length,             sub: 'all time',                  color: 'var(--warn)'  },
          { label: 'Avg Job',  value: formatCurrency(avg),     sub: '',                           color: '#a78bfa'      },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--bdr)', borderRadius: 'var(--r)', padding: 13, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.8px' }}>{label}</div>
            <div style={{ fontSize: 23, fontWeight: 800, marginTop: 4, letterSpacing: '-.5px', lineHeight: 1 }}>{value}</div>
            {sub && <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Pipeline by stage */}
        <div className="card" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Pipeline by Stage</div>
          {stages.map(s => {
            const stageVal = leads.filter(l => l.stage === s.name).reduce((a, l) => a + (l.value || 0), 0)
            const count    = leads.filter(l => l.stage === s.name).length
            return (
              <div key={s.id} style={{ marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: s.color, fontWeight: 600 }}>{s.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--dim)' }}>{count} · {formatCurrency(stageVal)}</span>
                </div>
                <div style={{ height: 5, background: 'var(--card2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: s.color, width: `${(stageVal / maxV) * 100}%`, transition: 'width .5s' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent activity */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Activity</div>
            <button onClick={() => onGoTo('list')} style={{ fontSize: 10, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>View all →</button>
          </div>
          {recent.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--sub)', fontSize: 13 }}>No leads yet — add your first one!</div>
          )}
          {recent.map(lead => (
            <div key={lead.id} onClick={() => onLeadClick(lead)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--bdr)', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: stageColorMap[lead.stage] || '#888', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 2 }}>
                    {lead.rep?.full_name || 'Unassigned'} · {lead.stage}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: 'var(--green)', fontSize: 14 }}>{formatCurrency(lead.value)}</div>
                <div style={{ fontSize: 10, color: stageColorMap[lead.stage] || 'var(--sub)', marginTop: 2 }}>{lead.stage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}