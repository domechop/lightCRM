import { useState } from 'react'
import { formatCurrency } from '../lib/constants'

function RepChip({ rep }) {
  if (!rep) return null
  const initials = rep.full_name.split(' ').map(w => w[0]).join('')
  return (
    <div className="rep-chip">
      <div className="rep-avatar">{initials}</div>
      {rep.full_name.split(' ')[0]}
    </div>
  )
}

export default function Pipeline({ leads, stages, stageColorMap, onLeadClick }) {
  const [collapsed, setCollapsed] = useState({})
  const isMobile = window.innerWidth < 768

  const toggleCollapse = (stage) => setCollapsed(prev => ({ ...prev, [stage]: !prev[stage] }))

  return (
    <>
      <style>{`
        .pipeline-wrapper { display: flex; flex-direction: row; gap: 14px; overflow-x: auto; padding: 24px; align-items: flex-start; }
        .pipeline-col { min-width: 220px; max-width: 220px; flex-shrink: 0; }
        @media (max-width: 767px) {
          .pipeline-wrapper { flex-direction: column; overflow-x: visible; padding: 16px; gap: 8px; }
          .pipeline-col { min-width: 100%; max-width: 100%; }
        }
      `}</style>
      <div className="pipeline-wrapper">
        {stages.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.name)
          const stageVal = stageLeads.reduce((a, b) => a + (b.value || 0), 0)
          const isCollapsed = collapsed[stage.name]
          const color = stage.color

          return (
            <div key={stage.id} className="pipeline-col">
              <div onClick={() => isMobile && toggleCollapse(stage.name)}
                style={{ marginBottom: isCollapsed ? 0 : 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: isMobile ? 'pointer' : 'default',
                  background: isMobile ? '#111827' : 'transparent',
                  border: isMobile ? '1px solid #1e293b' : 'none',
                  borderRadius: isMobile ? (isCollapsed ? 10 : '10px 10px 0 0') : 0,
                  padding: isMobile ? '12px 14px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage.name}</span>
                  {stageVal > 0 && <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600 }}>{formatCurrency(stageVal)}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#475569', background: '#1e293b', borderRadius: 12, padding: '2px 7px' }}>{stageLeads.length}</span>
                  {isMobile && <span style={{ color: '#475569', fontSize: 12, display: 'inline-block', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>}
                </div>
              </div>

              {!isCollapsed && (
                <div style={{
                  background: isMobile && stageLeads.length > 0 ? '#0f1624' : 'transparent',
                  border: isMobile && stageLeads.length > 0 ? '1px solid #1e293b' : 'none',
                  borderTop: 'none', borderRadius: isMobile ? '0 0 10px 10px' : 0,
                  padding: isMobile && stageLeads.length > 0 ? '10px' : 0,
                }}>
                  {stageLeads.length === 0 && !isMobile && (
                    <div style={{ border: '1px dashed #1e293b', borderRadius: 10, padding: '20px 12px', textAlign: 'center', color: '#334155', fontSize: 12 }}>Empty</div>
                  )}
                  {stageLeads.map(lead => (
                    <div key={lead.id} className="lead-card" onClick={() => onLeadClick(lead)}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9', marginBottom: 4 }}>{lead.name}</div>
                      {lead.address && <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>📍 {lead.address}</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>{formatCurrency(lead.value)}</span>
                        <RepChip rep={lead.rep} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}