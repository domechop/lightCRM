import { formatCurrency } from '../lib/constants'

export default function LeadList({ leads, stageColorMap, onLeadClick }) {
  return (
    <div style={{ padding: '24px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2d3340' }}>
            {['Customer', 'Address', 'Rep', 'Stage', 'Value', 'Source', 'Last Contact'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#374151', fontSize: 14 }}>No leads yet. Add your first one!</td></tr>
          )}
          {leads.map(lead => (
            <tr key={lead.id}
              onClick={() => onLeadClick(lead)}
              style={{ borderBottom: '1px solid #2d3340', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#21252e'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 13, color: '#f9fafb', whiteSpace: 'nowrap' }}>{lead.name}</td>
              <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280' }}>{lead.address || '—'}</td>
              <td style={{ padding: '12px 14px' }}>
                {lead.rep ? (
                  <div className="rep-chip">
                    <div className="rep-avatar">{lead.rep.full_name.split(' ').map(w => w[0]).join('')}</div>
                    {lead.rep.full_name}
                  </div>
                ) : '—'}
              </td>
              <td style={{ padding: '12px 14px' }}>
                <span className="stage-badge" style={{ background: (stageColorMap[lead.stage] || '#6b7280') + '22', color: stageColorMap[lead.stage] || '#6b7280' }}>{lead.stage}</span>
              </td>
              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#10b981', fontSize: 13 }}>{formatCurrency(lead.value)}</td>
              <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280' }}>{lead.source || '—'}</td>
              <td style={{ padding: '12px 14px', fontSize: 12, color: '#6b7280' }}>{lead.last_contact || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}