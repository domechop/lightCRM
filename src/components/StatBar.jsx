import { formatCurrency } from '../lib/constants'

export default function StatBar({ leads }) {
  const pipeline = leads.filter(l => !['Installed'].includes(l.stage)).reduce((a, b) => a + (b.value || 0), 0)
  const closed = leads.filter(l => ['Sold', 'Installed'].includes(l.stage)).reduce((a, b) => a + (b.value || 0), 0)
  const avg = leads.length ? Math.round(leads.reduce((a, b) => a + (b.value || 0), 0) / leads.length) : 0
  const needFollowUp = leads.filter(l => ['Follow-Up', 'Quoted'].includes(l.stage)).length

  const stats = [
    { label: 'Leads', value: leads.length, icon: '👥' },
    { label: 'Pipeline', value: formatCurrency(pipeline), icon: '📊', accent: true },
    { label: 'Closed', value: formatCurrency(closed), icon: '✅' },
    { label: 'Avg Deal', value: formatCurrency(avg), icon: '💰' },
    { label: 'Follow-Up', value: needFollowUp, icon: '🔔', warn: needFollowUp > 0 },
  ]

  return (
    <div className="stat-bar-wrapper" style={{ padding: '14px 24px', display: 'flex', gap: 10, borderBottom: '1px solid #1e293b', background: '#0d1321', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: '#111827', border: `1px solid ${s.accent ? '#f97316' : s.warn ? '#fbbf2444' : '#1e293b'}`, borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>{s.icon}</span>
          <div>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.accent ? '#f97316' : s.warn ? '#fbbf24' : '#f1f5f9', fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}