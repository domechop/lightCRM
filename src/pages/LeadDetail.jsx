import { useState } from 'react'
import { Phone, Mail, Tag, User, Calendar, Clock, ArrowLeft, Pencil, Trash2, Ruler, ShieldCheck } from 'lucide-react'
import { LEAD_SOURCES, formatCurrency } from '../lib/constants'
import { useNotes } from '../hooks/useNotes'

const Label = ({ children }) => (
  <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{children}</div>
)

const InfoRow = ({ icon: Icon, children }) => (
  <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
    <Icon size={13} color='#475569' style={{ flexShrink: 0 }} />
    {children}
  </div>
)

function addToGoogleCalendar(lead) {
  const title = encodeURIComponent(`Install: ${lead.name}`)
  const details = encodeURIComponent(`Address: ${lead.address || ''}\nValue: ${formatCurrency(lead.value)}\nLinear Footage: ${lead.linear_footage ? lead.linear_footage + ' ft' : '—'}`)
  const location = encodeURIComponent(lead.address || '')

  // Format date as YYYYMMDD for all-day event
  const date = lead.install_date?.replace(/-/g, '') || ''
  const dates = date ? `${date}/${date}` : ''

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${dates ? `&dates=${dates}` : ''}`
  window.open(url, '_blank')
}

export default function LeadDetail({ lead, profile, reps, stages, stageColorMap, onBack, onStageChange, onUpdate, onDelete }) {
  const [noteInput, setNoteInput] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: lead.name || '',
    address: lead.address || '',
    phone: lead.phone || '',
    email: lead.email || '',
    value: lead.value || '',
    source: lead.source || '',
    rep_id: lead.rep_id || '',
    linear_footage: lead.linear_footage || '',
    install_date: lead.install_date || '',
    warranty_expires: lead.warranty_expires || '',
  })
  const { notes, addNote } = useNotes(lead.id)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    const updates = {
      ...form,
      value: parseInt(form.value) || 0,
      linear_footage: form.linear_footage ? parseInt(form.linear_footage) : null,
      install_date: form.install_date || null,
      warranty_expires: form.warranty_expires || null,
    }
    const { error } = await onUpdate(lead.id, updates)
    if (error) alert('Save failed: ' + error.message)
    else setEditing(false)
    setSaving(false)
  }

  const handleCancel = () => {
    setForm({
      name: lead.name || '',
      address: lead.address || '',
      phone: lead.phone || '',
      email: lead.email || '',
      value: lead.value || '',
      source: lead.source || '',
      rep_id: lead.rep_id || '',
      linear_footage: lead.linear_footage || '',
      install_date: lead.install_date || '',
      warranty_expires: lead.warranty_expires || '',
    })
    setEditing(false)
  }

  const handleAddNote = async () => {
    if (!noteInput.trim()) return
    setSavingNote(true)
    await addNote(lead.id, profile.id, noteInput.trim(), lead.org_id)
    setNoteInput('')
    setSavingNote(false)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${lead.name}? This cannot be undone.`)) return
    await onDelete(lead.id)
    onBack()
  }

  const warrantyColor = (() => {
    if (!lead.warranty_expires) return '#9ca3af'
    const days = (new Date(lead.warranty_expires) - new Date()) / (1000 * 60 * 60 * 24)
    if (days < 0) return '#ef4444'
    if (days < 30) return '#f59e0b'
    return '#10b981'
  })()

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }} className="fade-in">

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={14} />Back</button>
        <div style={{ display: 'flex', gap: 8 }}>
          {!editing && (
            <button className="btn btn-ghost" onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Pencil size={13} />Edit</button>
          )}
          <button className="btn btn-danger" onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Trash2 size={13} />Delete</button>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-0.02em' }}>{lead.name}</h1>
          {lead.address && <div style={{ fontSize: 14, color: '#64748b' }}>{lead.address}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#10b981', fontFamily: "'Inter', sans-serif" }}>{formatCurrency(lead.value)}</div>
          <span className="stage-badge" style={{ background: (stageColorMap[lead.stage] || '#6b7280') + '22', color: stageColorMap[lead.stage] || '#6b7280', marginTop: 4 }}>{lead.stage}</span>
        </div>
      </div>

      {/* Edit form */}
      {editing ? (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#f97316', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Editing Lead</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

            {[['name','Customer Name'], ['address','Address'], ['phone','Phone'], ['email','Email']].map(([k, label]) => (
              <div key={k} style={{ gridColumn: k === 'address' ? 'span 2' : 'span 1' }}>
                <Label>{label}</Label>
                <input className="input" value={form[k]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
            <div>
              <Label>Est. Value ($)</Label>
              <input className="input" type="number" value={form.value} onChange={e => set('value', e.target.value)} />
            </div>
            <div>
              <Label>Lead Source</Label>
              <select className="input" value={form.source} onChange={e => set('source', e.target.value)}>
                {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <Label>Assigned Rep</Label>
              <select className="input" value={form.rep_id} onChange={e => set('rep_id', e.target.value)}>
                <option value="">Unassigned</option>
                {(reps || []).map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: 'span 2', borderTop: '1px solid #1e293b', margin: '4px 0' }} />
            <div style={{ gridColumn: 'span 2', fontSize: 11, color: '#f97316', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Install Details</div>

            <div>
              <Label>Linear Footage</Label>
              <input className="input" type="number" placeholder="e.g. 120" value={form.linear_footage} onChange={e => set('linear_footage', e.target.value)} />
            </div>
            <div>
              <Label>Install Date</Label>
              <input className="input" type="date" value={form.install_date} onChange={e => set('install_date', e.target.value)} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <Label>Warranty Expiration</Label>
              <input className="input" type="date" value={form.warranty_expires} onChange={e => set('warranty_expires', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          {/* Contact Info */}
          <div className="card" style={{ padding: 18 }}>
            <Label>Contact Info</Label>
            <InfoRow icon={Phone}>{lead.phone || '—'}</InfoRow>
            <InfoRow icon={Mail}>{lead.email || '—'}</InfoRow>
            <InfoRow icon={Tag}>{lead.source || '—'}</InfoRow>
          </div>

          {/* Assignment */}
          <div className="card" style={{ padding: 18 }}>
            <Label>Assignment</Label>
            <InfoRow icon={User}>{lead.rep?.full_name || '—'}</InfoRow>
            <InfoRow icon={Calendar}>Created: {lead.created_at?.slice(0, 10) || '—'}</InfoRow>
            <InfoRow icon={Clock}>Last contact: {lead.last_contact || '—'}</InfoRow>
          </div>

          {/* Install Details */}
          <div className="card" style={{ padding: 18, gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Label>Install Details</Label>
              {lead.install_date && (
                <button
                  onClick={() => addToGoogleCalendar(lead)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#94a3b8', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4285f4'; e.currentTarget.style.color = '#4285f4' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8' }}
                >
                  <span style={{ fontSize: 14 }}>📅</span> Add to Google Calendar
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#475569', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Ruler size={11} color='#475569' /> Linear Footage
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: lead.linear_footage ? '#f1f5f9' : '#334155', fontFamily: "'Inter', sans-serif" }}>
                  {lead.linear_footage ? `${lead.linear_footage} ft` : '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#475569', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={11} color='#475569' /> Install Date
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: lead.install_date ? '#f1f5f9' : '#334155' }}>
                  {lead.install_date || '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#475569', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ShieldCheck size={11} color='#475569' /> Warranty Expires
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: warrantyColor }}>
                  {lead.warranty_expires || '—'}
                </div>
                {lead.warranty_expires && warrantyColor === '#ef4444' && (
                  <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>Expired</div>
                )}
                {lead.warranty_expires && warrantyColor === '#f59e0b' && (
                  <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>Expiring soon</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage mover */}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <Label>Move Stage</Label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {(stages || []).map(s => (
            <button key={s.id} onClick={() => onStageChange(lead.id, s.name)}
              style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', fontFamily: 'inherit', transition: 'all 0.15s',
                background: lead.stage === s.name ? s.color : 'transparent',
                color: lead.stage === s.name ? 'white' : s.color,
                borderColor: s.color }}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="card" style={{ padding: 18 }}>
        <Label>Notes</Label>
        <div style={{ display: 'flex', gap: 10, margin: '10px 0 16px' }}>
          <input className="input" placeholder="Add a note..." value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={handleAddNote} disabled={savingNote}>
            {savingNote ? '...' : 'Add'}
          </button>
        </div>
        {notes.length === 0 && <div style={{ fontSize: 13, color: '#334155', textAlign: 'center', padding: '16px 0' }}>No notes yet</div>}
        {notes.map(note => (
          <div key={note.id} style={{ background: '#0f1624', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316' }}>{note.author?.full_name || 'Unknown'}</span>
              <span style={{ fontSize: 11, color: '#334155' }}>{note.created_at?.slice(0, 10)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{note.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}