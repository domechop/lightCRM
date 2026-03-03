import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '../lib/constants'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarPage({ leads, stageColorMap, onLeadClick }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Index leads by install_date and appointment_date for this month
  const eventsByDay = {}
  leads.forEach(lead => {
    ['install_date'].forEach(field => {
      if (!lead[field]) return
      const d = new Date(lead[field] + 'T00:00:00')
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!eventsByDay[day]) eventsByDay[day] = []
        eventsByDay[day].push({ lead, type: field })
      }
    })
  })

  // Build grid cells
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }} className="fade-in">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Install Calendar</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={prevMonth}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', minWidth: 160, textAlign: 'center' }}>{MONTHS[month]} {year}</span>
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={nextMonth}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', padding: '6px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => (
          <div key={i} style={{
            minHeight: 90,
            background: day ? '#111827' : 'transparent',
            border: day ? `1px solid ${isToday(day) ? '#f97316' : '#1e293b'}` : 'none',
            borderRadius: 8,
            padding: day ? '8px' : 0,
          }}>
            {day && (
              <>
                <div style={{ fontSize: 12, fontWeight: isToday(day) ? 700 : 500, color: isToday(day) ? '#f97316' : '#475569', marginBottom: 4 }}>{day}</div>
                {(eventsByDay[day] || []).map(({ lead }) => (
                  <div key={lead.id} onClick={() => onLeadClick(lead)}
                    style={{
                      background: (stageColorMap[lead.stage] || '#6b7280') + '22',
                      border: `1px solid ${(stageColorMap[lead.stage] || '#6b7280') + '55'}`,
                      borderLeft: `3px solid ${stageColorMap[lead.stage] || '#6b7280'}`,
                      borderRadius: 5,
                      padding: '4px 6px',
                      marginBottom: 3,
                      cursor: 'pointer',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{formatCurrency(lead.value)}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend / upcoming list */}
      <div className="card" style={{ marginTop: 24, padding: 18 }}>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Installs this month — {Object.values(eventsByDay).flat().length} scheduled
        </div>
        {Object.values(eventsByDay).flat().length === 0 ? (
          <div style={{ fontSize: 13, color: '#334155', textAlign: 'center', padding: '16px 0' }}>No installs scheduled this month</div>
        ) : (
          Object.entries(eventsByDay).sort((a, b) => a[0] - b[0]).map(([day, events]) => (
            events.map(({ lead }) => (
              <div key={lead.id} onClick={() => onLeadClick(lead)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#0f1624', borderRadius: 8, marginBottom: 6, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                onMouseLeave={e => e.currentTarget.style.background = '#0f1624'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'center', minWidth: 36 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{day}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{MONTHS[month].slice(0, 3)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{lead.name}</div>
                    {lead.address && <div style={{ fontSize: 11, color: '#64748b' }}>📍 {lead.address}</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>{formatCurrency(lead.value)}</div>
                  <span className="stage-badge" style={{ background: (stageColorMap[lead.stage] || '#6b7280') + '22', color: stageColorMap[lead.stage] || '#6b7280', fontSize: 10 }}>{lead.stage}</span>
                </div>
              </div>
            ))
          ))
        )}
      </div>
    </div>
  )
}