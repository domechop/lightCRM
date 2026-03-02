import { useState } from 'react'
import { LEAD_SOURCES, formatCurrency } from '../lib/constants'
import { useNotes } from '../hooks/useNotes'

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
  })
  const { notes, addNote } = useNotes(lead.id)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    const updates = { ...form, value: parseInt(form.value) || 0 }
    console.log('Saving lead updates:', updates)
    console.log('Lead ID:', lead.id)
    console.log('Lead org_id:', lead.org_id)
    const { data, error } = await onUpdate(lead.id, updates)
    if (error) {
      console.error('Save failed:', error.message)
      alert('Save failed: ' + error.message)
    } else {
      console.log('Save succeeded:', data)
      setEditing(false)
    }
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

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }} className="fade-in">

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <div style={{ display: 'flex', gap: 8 }}>
          {!editing && (
            <button className="btn btn-ghost" onClick={() => setEditing(true)}>✏️ Edit</button>
          )}
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 800, color: '#f9fafb', marginBottom: 6, letterSpacing: '-0.02em' }}>
            {lead.name}
          </h1>
          {lead.address && <div style={{ fontSize: 14, color: '#6b7280' }}>📍 {lead.address}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#10b981', fontFamily: "'Manrope', sans-serif" }}>{formatCurrency(lead.value)}</div>
          <span className="stage-badge" style={{ background: (stageColorMap[lead.stage] || '#6b7280') + '22', color: stageColorMap[lead.stage] || '#6b7280', marginTop: 4 }}>{lead.stage}</span>
        </div>
      </div>

      {/* Edit form */}
      {editing ? (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Editing Lead</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['name','Customer Name'], ['address','Address'], ['phone','Phone'], ['email','Email']].map(([k, label]) => (
              <div key={k} style={{ gridColumn: k === 'address' ? 'span 2' : 'span 1' }}>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
                <input className="input" value={form[k]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Est. Value ($)</label>
              <input className="input" type="number" value={form.value} onChange={e => set('value', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lead Source</label>
              <select className="input" value={form.source} onChange={e => set('source', e.target.value)}>
                {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Assigned Rep</label>
              <select className="input" value={form.rep_id} onChange={e => set('rep_id', e.target.value)}>
                <option value="">Unassigned</option>
                {(reps || []).map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        /* Info grid (view mode) */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Contact Info</div>
            <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>📞 {lead.phone || '—'}</div>
            <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>✉️ {lead.email || '—'}</div>
            <div style={{ fontSize: 14, color: '#9ca3af' }}>🏷 {lead.source || '—'}</div>
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Assignment</div>
            <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>👤 {lead.rep?.full_name || '—'}</div>
            <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>📅 Created: {lead.created_at?.slice(0, 10) || '—'}</div>
            <div style={{ fontSize: 14, color: '#9ca3af' }}>🕒 Last contact: {lead.last_contact || '—'}</div>
          </div>
        </div>
      )}

      {/* Stage mover */}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Move Stage</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
        <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Notes</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input className="input" placeholder="Add a note..." value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={handleAddNote} disabled={savingNote}>
            {savingNote ? '...' : 'Add'}
          </button>
        </div>
        {notes.length === 0 && <div style={{ fontSize: 13, color: '#374151', textAlign: 'center', padding: '16px 0' }}>No notes yet</div>}
        {notes.map(note => (
          <div key={note.id} style={{ background: '#161920', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>{note.author?.full_name || 'Unknown'}</span>
              <span style={{ fontSize: 11, color: '#374151' }}>{note.created_at?.slice(0, 10)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>{note.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}