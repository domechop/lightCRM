import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
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

function LeadCard({ lead, onLeadClick, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id })
  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    opacity: isDragging ? 0.3 : 1,
    zIndex: 1,
    position: 'relative',
  } : {}

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="lead-card"
      onClick={() => onLeadClick(lead)}
    >
      <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9', marginBottom: 4 }}>{lead.name}</div>
      {lead.address && <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>📍 {lead.address}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>{formatCurrency(lead.value)}</span>
        <RepChip rep={lead.rep} />
      </div>
    </div>
  )
}

function LeadCardOverlay({ lead }) {
  return (
    <div className="lead-card" style={{ opacity: 0.95, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', transform: 'rotate(2deg)', cursor: 'grabbing' }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9', marginBottom: 4 }}>{lead.name}</div>
      {lead.address && <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>📍 {lead.address}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>{formatCurrency(lead.value)}</span>
        <RepChip rep={lead.rep} />
      </div>
    </div>
  )
}

function StageColumn({ stage, leads, onLeadClick, activeId, isMobile }) {
  const [collapsed, setCollapsed] = useState(false)
  const { setNodeRef, isOver } = useDroppable({ id: stage.name })

  const stageVal = leads.reduce((a, b) => a + (b.value || 0), 0)
  const color = stage.color

  return (
    <div className="pipeline-col">
      <div
        onClick={() => isMobile && setCollapsed(c => !c)}
        style={{
          marginBottom: collapsed ? 0 : 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: isMobile ? 'pointer' : 'default',
          background: isMobile ? '#111827' : 'transparent',
          border: isMobile ? '1px solid #1e293b' : 'none',
          borderRadius: isMobile ? (collapsed ? 10 : '10px 10px 0 0') : 0,
          padding: isMobile ? '12px 14px' : '0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage.name}</span>
          {stageVal > 0 && <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600 }}>{formatCurrency(stageVal)}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#475569', background: '#1e293b', borderRadius: 12, padding: '2px 7px' }}>{leads.length}</span>
          {isMobile && <span style={{ color: '#475569', fontSize: 12, display: 'inline-block', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>}
        </div>
      </div>

      {!collapsed && (
        <div
          ref={setNodeRef}
          style={{
            minHeight: 80,
            background: isOver ? color + '18' : (isMobile && leads.length > 0 ? '#0f1624' : 'transparent'),
            border: isOver ? `1px dashed ${color}` : (isMobile && leads.length > 0 ? '1px solid #1e293b' : 'none'),
            borderTop: 'none',
            borderRadius: isMobile ? '0 0 10px 10px' : 8,
            padding: isMobile && leads.length > 0 ? '10px' : (isOver ? '10px' : 0),
            transition: 'background 0.15s, border 0.15s',
          }}
        >
          {leads.length === 0 && !isMobile && (
            <div style={{
              border: isOver ? `1px dashed ${color}` : '1px dashed #1e293b',
              borderRadius: 10, padding: '20px 12px', textAlign: 'center',
              color: isOver ? color : '#334155', fontSize: 12,
              transition: 'all 0.15s',
            }}>
              {isOver ? 'Drop here' : 'Empty'}
            </div>
          )}
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onLeadClick={onLeadClick}
              isDragging={activeId === lead.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Pipeline({ leads, stages, stageColorMap, onLeadClick, onStageChange }) {
  const [activeId, setActiveId] = useState(null)
  const isMobile = window.innerWidth < 768

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const activeLead = leads.find(l => l.id === activeId)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || !active) return
    const lead = leads.find(l => l.id === active.id)
    if (!lead || lead.stage === over.id) return
    onStageChange(lead.id, over.id)
  }

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
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="pipeline-wrapper">
          {stages.map(stage => (
            <StageColumn
              key={stage.id}
              stage={stage}
              leads={leads.filter(l => l.stage === stage.name)}
              onLeadClick={onLeadClick}
              activeId={activeId}
              isMobile={isMobile}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <LeadCardOverlay lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  )
}