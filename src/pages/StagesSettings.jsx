import { useState } from 'react'

const PRESET_COLORS = [
  '#6b7280','#3b82f6','#8b5cf6','#f59e0b',
  '#ef4444','#10b981','#059669','#ec4899',
  '#f97316','#06b6d4','#84cc16','#a855f7'
]

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {PRESET_COLORS.map(c => (
        <div key={c} onClick={() => onChange(c)} style={{
          width: 22, height: 22, borderRadius: 5, background: c, cursor: 'pointer',
          border: value === c ? '2px solid white' : '2px solid transparent',
          boxShadow: value === c ? '0 0 0 2px ' + c : 'none',
          transition: 'all 0.1s', flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

export default function StagesSettings({ stages, profile, onAdd, onUpdate, onDelete, onReorder, onBack }) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#3b82f6')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canEdit = ['owner', 'manager'].includes(profile?.role)

  const handleAdd = async () => {
    if (!newName.trim()) return setError('Stage name is required')
    setSaving(true)
    const { error } = await onAdd(newName.trim(), newColor)
    if (error) setError(error.message)
    else { setNewName(''); setNewColor('#3b82f6') }
    setSaving(false)
  }

  const startEdit = (stage) => {
    setEditingId(stage.id)
    setEditName(stage.name)
    setEditColor(stage.color)
  }

  const handleSave = async (id) => {
    setSaving(true)
    await onUpdate(id, { name: editName, color: editColor })
    setEditingId(null)
    setSaving(false)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" stage? Leads in this stage will keep the stage name but it won't appear in the pipeline.`)) return
    await onDelete(id)
  }

  const move = (index, dir) => {
    const reordered = [...stages]
    const target = index + dir
    if (target < 0 || target >= reordered.length) return
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    onReorder(reordered)
  }

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Pipeline Stages</h1>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Customize your sales pipeline stages</div>
        </div>
      </div>

      {/* Current stages */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Current Stages</div>

        {stages.map((stage, i) => (
          <div key={stage.id} style={{ marginBottom: 8 }}>
            {editingId === stage.id ? (
              <div style={{ background: '#0f1624', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                <div style={{ marginBottom: 10 }}>
                  <input className="input" value={editName} onChange={e => setEditName(e.target.value)}
                    style={{ marginBottom: 10 }} placeholder="Stage name" />
                  <ColorPicker value={editColor} onChange={setEditColor} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}
                    onClick={() => handleSave(stage.id)} disabled={saving}>Save</button>
                  <button className="btn btn-ghost" style={{ fontSize: 13, padding: '7px 14px' }}
                    onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0f1624', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 14px' }}>
                {/* Reorder buttons */}
                {canEdit && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button onClick={() => move(i, -1)} disabled={i === 0}
                      style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? '#1e293b' : '#475569', fontSize: 10, lineHeight: 1, padding: '1px 3px' }}>▲</button>
                    <button onClick={() => move(i, 1)} disabled={i === stages.length - 1}
                      style={{ background: 'none', border: 'none', cursor: i === stages.length - 1 ? 'default' : 'pointer', color: i === stages.length - 1 ? '#1e293b' : '#475569', fontSize: 10, lineHeight: 1, padding: '1px 3px' }}>▼</button>
                  </div>
                )}
                {/* Color dot */}
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                {/* Name */}
                <span style={{ fontSize: 14, fontWeight: 500, color: '#d1d5db', flex: 1 }}>{stage.name}</span>
                {/* Position badge */}
                <span style={{ fontSize: 11, color: '#475569', background: '#1e293b', borderRadius: 5, padding: '2px 7px' }}>{i + 1}</span>
                {/* Actions */}
                {canEdit && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => startEdit(stage)}>Edit</button>
                    <button className="btn btn-danger" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => handleDelete(stage.id, stage.name)}>✕</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new stage */}
      {canEdit && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Add New Stage</div>
          <input className="input" placeholder="Stage name (e.g. Contract Sent)" value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{ marginBottom: 12 }} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Pick a color</div>
            <ColorPicker value={newColor} onChange={setNewColor} />
          </div>
          {error && <div style={{ fontSize: 13, color: '#f87171', marginBottom: 10 }}>{error}</div>}
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !newName.trim()}>
            {saving ? 'Adding...' : '+ Add Stage'}
          </button>
        </div>
      )}
    </div>
  )
}