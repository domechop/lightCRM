import { useState } from 'react'
import { BRANDS, EXTRAS, LEAD_SOURCES, getBrand, calcNodes, calcTotal, formatCurrency } from '../lib/constants'

const CHECK = '✓'

export default function Estimator({ onSaveToLead, stages }) {
  const [f, setF] = useState({
    name: '', client: '', address: '', phone: '', email: '',
    brand: 'gemstone', linearFt: 150, controllers: 1, labor: 750,
    extras: [], notes: '', source: 'Referral',
    stage: stages?.[0]?.name || 'Lead',
    date: new Date().toISOString().slice(0, 10),
  })
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setF(f => ({ ...f, [k]: v }))

  const b = getBrand(f.brand)
  const nd = calcNodes(f.brand, f.linearFt)
  const lc = Number(f.linearFt) * b.perFt
  const cc = Number(f.controllers) * b.ctrl
  const lab = Number(f.labor)
  const ec = f.extras.reduce((s, e) => s + (EXTRAS[e] || 0), 0)
  const tot = Math.round(lc + cc + lab + ec)

  const toggleExtra = (e) => set('extras', f.extras.includes(e) ? f.extras.filter(x => x !== e) : [...f.extras, e])

  const handleSave = async () => {
    if (!f.name.trim()) return alert('Enter a project name first')
    setSaving(true)
    await onSaveToLead({
      name: f.name,
      address: f.address,
      phone: f.phone,
      email: f.email,
      value: tot,
      stage: f.stage,
      source: f.source,
      notes: `Brand: ${b.name} | ${f.linearFt}ft | ${nd} nodes | ${f.controllers} controller(s)\n${f.notes}`,
      last_contact: new Date().toISOString().slice(0, 10),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (showPreview) {
    return (
      <div style={{ padding: 20, maxWidth: 500, margin: '0 auto' }} className="fade-in">
        <button className="btn btn-ghost" style={{ marginBottom: 16, fontSize: 12 }} onClick={() => setShowPreview(false)}>← Back</button>

        {/* Quote card */}
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)', letterSpacing: '-.02em' }}>💡 LumaCRM</div>
              <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.06em' }}>Permanent Exterior Lighting</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--sub)' }}>{f.date}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: 14, marginBottom: 14 }}>
            {f.client && <div style={{ fontWeight: 600, marginBottom: 2 }}>{f.client}</div>}
            {f.address && <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 6 }}>{f.address}</div>}
            {f.name && <div style={{ fontSize: 12, color: 'var(--sub)' }}>Re: <span style={{ color: 'var(--text)', fontWeight: 500 }}>{f.name}</span></div>}
          </div>

          <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
              <span>Item</span><span>Amount</span>
            </div>
            <div className="er"><span className="elbl">{b.name} ({f.linearFt} ft)</span><span>{formatCurrency(lc)}</span></div>
            <div className="er" style={{ color: 'var(--dim)', fontSize: 11 }}><span>&nbsp;↳ {nd} nodes @ {b.spacing}"</span><span>—</span></div>
            <div className="er"><span className="elbl">Controller{Number(f.controllers) > 1 ? 's' : ''} ×{f.controllers}</span><span>{formatCurrency(cc)}</span></div>
            <div className="er"><span className="elbl">Labor</span><span>{formatCurrency(lab)}</span></div>
            {f.extras.map(e => <div key={e} className="er"><span className="elbl">{e}</span><span>{formatCurrency(EXTRAS[e])}</span></div>)}
            <div className="etot"><span>Total</span><span>{formatCurrency(tot)}</span></div>
          </div>
        </div>

        <button className="btn btn-green" style={{ width: '100%', padding: 13, fontSize: 15 }} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? `${CHECK} Saved to Pipeline!` : '→ Save to Pipeline'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: '0 auto', paddingBottom: 100 }} className="fade-in">
      {/* Live total */}
      <div className="card2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', marginBottom: 18, borderTop: '2px solid var(--green)' }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Estimate Total</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)', letterSpacing: '-.5px', lineHeight: 1.1 }}>{formatCurrency(tot)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--sub)' }}>{nd} nodes</div>
          <div style={{ fontSize: 11, color: 'var(--sub)' }}>{f.linearFt} linear ft</div>
        </div>
      </div>

      {/* Project details */}
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Project Details</div>
        <div className="fg"><label className="fl">Project Name</label><input className="input" value={f.name} onChange={e => set('name', e.target.value)} placeholder="Smith Residence" /></div>
        <div className="f2">
          <div className="fg"><label className="fl">Client</label><input className="input" value={f.client} onChange={e => set('client', e.target.value)} /></div>
          <div className="fg"><label className="fl">Date</label><input className="input" type="date" value={f.date} onChange={e => set('date', e.target.value)} /></div>
        </div>
        <div className="fg"><label className="fl">Address</label><input className="input" value={f.address} onChange={e => set('address', e.target.value)} /></div>
        <div className="f2">
          <div className="fg"><label className="fl">Phone</label><input className="input" value={f.phone} onChange={e => set('phone', e.target.value)} /></div>
          <div className="fg"><label className="fl">Email</label><input className="input" type="email" value={f.email} onChange={e => set('email', e.target.value)} /></div>
        </div>
        <div className="f2">
          <div className="fg">
            <label className="fl">Lead Source</label>
            <select className="input" value={f.source} onChange={e => set('source', e.target.value)}>
              {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="fl">Pipeline Stage</label>
            <select className="input" value={f.stage} onChange={e => set('stage', e.target.value)}>
              {(stages || []).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* System config */}
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>System Config</div>
        <div className="fg">
          <label className="fl">Brand / System</label>
          <select className="input" value={f.brand} onChange={e => set('brand', e.target.value)}>
            {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name} — ${b.perFt}/ft</option>)}
          </select>
        </div>
        <div className="f2">
          <div className="fg"><label className="fl">Linear Footage</label><input className="input" type="number" value={f.linearFt} onChange={e => set('linearFt', e.target.value)} /></div>
          <div className="fg"><label className="fl">Controllers</label><input className="input" type="number" min="1" value={f.controllers} onChange={e => set('controllers', e.target.value)} /></div>
        </div>
        <div className="fg"><label className="fl">Labor ($)</label><input className="input" type="number" value={f.labor} onChange={e => set('labor', e.target.value)} /></div>
        <div className="card2" style={{ fontSize: 11, color: 'var(--sub)', padding: '8px 12px' }}>
          {b.spacing}" node spacing → <span style={{ color: 'var(--green)', fontWeight: 600 }}>{nd} nodes total</span>
        </div>
      </div>

      {/* Add-ons */}
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Add-ons</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {Object.keys(EXTRAS).map(e => (
            <button key={e} onClick={() => toggleExtra(e)} className={`chip ${f.extras.includes(e) ? 'chip-on' : 'chip-off'}`}>
              {f.extras.includes(e) ? `${CHECK} ` : ''}{e} +{formatCurrency(EXTRAS[e])}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Notes</div>
        <textarea className="fta" placeholder="Scope, HOA notes, access info..." value={f.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      {/* Breakdown */}
      <div className="card2" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Cost Breakdown</div>
        <div className="er"><span className="elbl">Lights ({f.linearFt}ft × ${b.perFt}/ft)</span><span>{formatCurrency(lc)}</span></div>
        <div className="er"><span className="elbl">Nodes ({nd} @ {b.spacing}")</span><span style={{ color: 'var(--sub)' }}>{nd}</span></div>
        <div className="er"><span className="elbl">Controllers ×{f.controllers}</span><span>{formatCurrency(cc)}</span></div>
        <div className="er"><span className="elbl">Labor</span><span>{formatCurrency(lab)}</span></div>
        {f.extras.map(e => <div key={e} className="er"><span className="elbl">{e}</span><span>{formatCurrency(EXTRAS[e])}</span></div>)}
        <div className="etot"><span>Total</span><span>{formatCurrency(tot)}</span></div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-ghost" style={{ width: '100%', padding: 13, fontSize: 14 }} onClick={() => setShowPreview(true)}>Preview Quote</button>
        <button className="btn btn-green" style={{ width: '100%', padding: 13, fontSize: 14 }} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? `${CHECK} Saved to Pipeline!` : '→ Save to Pipeline'}
        </button>
      </div>
    </div>
  )
}