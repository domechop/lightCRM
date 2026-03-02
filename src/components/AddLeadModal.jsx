import { useState } from 'react'
import { LEAD_SOURCES } from '../lib/constants'

const EMPTY = { name: '', address: '', phone: '', email: '', value: '', stage: 'Lead', source: 'Referral', rep_id: '', notes: '' }

export default function AddLeadModal({ reps, stages, currentProfile, onAdd, onClose }) {
  const [form, setForm] = useState({ ...EMPTY, rep_id: currentProfile?.id || '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name) return setError('Customer name is required')
    setLoading(true)
    setError('')
    const { error } = await onAdd({
      name: form.name,
      address: form.address,
      phone: form.phone,
      email: form.email,
      value: parseInt(form.value) || 0,
      stage: form.stage,
      source: form.source,
      rep_id: form.rep_id || currentProfile?.id,
      notes: form.notes,
      last_contact: new Date().toISOString().slice(0, 10),
    })
    if (error) setError(error.message)
    else onClose()
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal fade-in">
        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 700, color: '#f9fafb', marginBottom: 20 }}>Add New Lead</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['name','Customer Name *'], ['address','Address'], ['phone','Phone'], ['email','Email']].map(([k, label]) => (
            <div key={k}>
              <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
              <input className="input" value={form[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Est. Value ($)</label>
              <input className="input" type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage</label>
              <select className="input" value={form.stage} onChange={e => set('stage', e.target.value)}>
                {(stages || []).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lead Source</label>
              <select className="input" value={form.source} onChange={e => set('source', e.target.value)}>
                {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Assign Rep</label>
              <select className="input" value={form.rep_id} onChange={e => set('rep_id', e.target.value)}>
                {reps.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Notes</label>
            <textarea className="input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          {error && <div style={{ background: '#f8717122', border: '1px solid #f8717144', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}