import { useState, useRef, useEffect, useCallback } from 'react'
import { BRANDS, EXTRAS, ZONE_COLORS, getBrand, calcNodes, formatCurrency } from '../lib/constants'

const segLen = pts => {
  let l = 0
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y
    l += Math.sqrt(dx*dx + dy*dy)
  }
  return l
}

export default function SkyView({ onSendToEstimator }) {
  const [image, setImage] = useState(null)
  const [imgEl, setImgEl] = useState(null)
  const [zones, setZones] = useState([])
  const [active, setActive] = useState(null)
  const [tool, setTool] = useState('draw')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [brand, setBrand] = useState('gemstone')
  const [scale, setScale] = useState(8)
  const [ctrl, setCtrl] = useState(1)
  const [extras, setExtras] = useState([])
  const [showMats, setShowMats] = useState(false)
  const [isDrag, setIsDrag] = useState(false)

  const canvasRef = useRef(null)
  const panOrigin = useRef(null)
  const lastTap = useRef(0)

  const b = getBrand(brand)
  const totFt = zones.reduce((s, z) => s + Math.round(segLen(z.points) / scale), 0)
  const totNodes = Math.ceil((totFt * 12) / b.spacing)
  const lc = totFt * b.perFt
  const cc = ctrl * b.ctrl
  const ec = extras.reduce((s, e) => s + (EXTRAS[e] || 0), 0)
  const matTot = Math.round(lc + cc + ec)

  const draw = useCallback(() => {
    const cvs = canvasRef.current
    if (!cvs || !imgEl) return
    const ctx = cvs.getContext('2d')
    const wrap = cvs.parentElement
    cvs.width = wrap.clientWidth
    cvs.height = wrap.clientHeight
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)
    ctx.drawImage(imgEl, 0, 0)

    const drawZone = (pts, col, dashed = false) => {
      if (pts.length < 2) return
      ctx.save()
      ctx.shadowColor = col; ctx.shadowBlur = 8
      ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 7 / zoom
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      if (dashed) ctx.setLineDash([8 / zoom, 5 / zoom])
      ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.stroke()
      ctx.strokeStyle = col; ctx.lineWidth = 3 / zoom; ctx.setLineDash([])
      ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.stroke()
      ctx.restore()
    }

    zones.forEach((zone, zi) => {
      const col = ZONE_COLORS[zi % ZONE_COLORS.length]
      const pts = zone.points
      drawZone(pts, col)
      pts.forEach((p, i) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, (i === 0 || i === pts.length - 1 ? 7 : 4) / zoom, 0, Math.PI * 2)
        ctx.fillStyle = (i === 0 || i === pts.length - 1) ? col : 'white'; ctx.fill()
        ctx.strokeStyle = col; ctx.lineWidth = 2 / zoom; ctx.stroke()
      })
      const mid = pts[Math.floor(pts.length / 2)]
      const ft = Math.round(segLen(pts) / scale)
      const nd = Math.ceil((ft * 12) / b.spacing)
      const bw = 84 / zoom, bh = 34 / zoom, bx = mid.x - bw / 2, by = mid.y - bh - 4 / zoom
      ctx.fillStyle = 'rgba(4,7,16,.92)'
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6 / zoom); ctx.fill()
      ctx.strokeStyle = col; ctx.lineWidth = 1.5 / zoom; ctx.stroke()
      ctx.fillStyle = col; ctx.font = `bold ${11 / zoom}px monospace`; ctx.textAlign = 'center'
      ctx.fillText(ft + ' ft', mid.x, by + bh * 0.38)
      ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.font = `${9 / zoom}px monospace`
      ctx.fillText(nd + ' nodes', mid.x, by + bh * 0.75)
    })

    if (active?.points?.length >= 1) {
      const col = ZONE_COLORS[zones.length % ZONE_COLORS.length]
      drawZone(active.points, col, true)
      active.points.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 5 / zoom, 0, Math.PI * 2)
        ctx.fillStyle = col; ctx.globalAlpha = .85; ctx.fill(); ctx.globalAlpha = 1
      })
    }
    ctx.restore()
  }, [imgEl, zones, active, zoom, pan, scale, brand])

  useEffect(() => { draw() }, [draw])

  const toPt = (x, y) => {
    const r = canvasRef.current.getBoundingClientRect()
    return { x: (x - r.left - pan.x) / zoom, y: (y - r.top - pan.y) / zoom }
  }

  const handleCanvasDown = (e) => {
    e.preventDefault()
    const { clientX: x, clientY: y } = e.touches ? e.touches[0] : e
    if (tool === 'pan') { panOrigin.current = { ox: x - pan.x, oy: y - pan.y }; return }
    const now = Date.now()
    const dbl = now - lastTap.current < 350
    lastTap.current = now
    const pt = toPt(x, y)

    if (dbl && tool === 'draw' && active?.points?.length >= 2) {
      setZones(z => [...z, { ...active, name: 'Zone ' + (z.length + 1) }])
      setActive(null); return
    }
    if (tool === 'draw') {
      setActive(a => a ? { ...a, points: [...a.points, pt] } : { id: Date.now(), points: [pt] })
    }
    if (tool === 'erase') {
      let bestD = 40 / zoom, bestI = -1
      zones.forEach((z, zi) => z.points.forEach(p => {
        const d = Math.hypot(pt.x - p.x, pt.y - p.y)
        if (d < bestD) { bestD = d; bestI = zi }
      }))
      if (bestI >= 0) setZones(z => z.filter((_, i) => i !== bestI))
    }
  }

  const handleCanvasMove = (e) => {
    if (tool !== 'pan' || !panOrigin.current) return
    const { clientX: x, clientY: y } = e.touches ? e.touches[0] : e
    setPan({ x: x - panOrigin.current.ox, y: y - panOrigin.current.oy })
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.88 : 1.14
    const r = canvasRef.current.getBoundingClientRect()
    const ox = e.clientX - r.left, oy = e.clientY - r.top
    const nz = Math.max(0.15, Math.min(8, zoom * delta))
    setPan(p => ({ x: ox - (ox - p.x) * (nz / zoom), y: oy - (oy - p.y) * (nz / zoom) }))
    setZoom(nz)
  }

  const loadImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { setImgEl(img); setImage(url); setZones([]); setActive(null); setZoom(1); setPan({ x: 0, y: 0 }) }
    img.src = url
  }

  const makeSample = () => {
    const c = document.createElement('canvas'); c.width = 1200; c.height = 800
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#2d4a2d'; ctx.fillRect(0, 0, 1200, 800)
    ctx.fillStyle = '#8b7355'; ctx.fillRect(250, 180, 420, 300)
    ctx.fillStyle = '#6b5a3e'; ctx.fillRect(260, 190, 400, 280)
    ctx.fillStyle = '#7a6548'; ctx.fillRect(250, 360, 180, 120)
    ctx.fillStyle = '#6b6b6b'; ctx.fillRect(290, 480, 100, 220)
    ctx.fillStyle = '#1a6fa8'; ctx.beginPath(); ctx.ellipse(830, 390, 90, 60, 0, 0, Math.PI * 2); ctx.fill()
    ;[[120,120],[660,140],[710,600],[100,555],[850,195],[180,645]].forEach(([x, y]) => {
      ctx.fillStyle = '#1a3d1a'; ctx.beginPath(); ctx.arc(x, y, 35, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#2d5a2d'; ctx.beginPath(); ctx.arc(x - 5, y - 5, 25, 0, Math.PI * 2); ctx.fill()
    })
    c.toBlob(blob => loadImage(new File([blob], 'sample.png', { type: 'image/png' })))
  }

  if (!image) {
    return (
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }} className="fade-in">
        <div
          onDragOver={e => { e.preventDefault(); setIsDrag(true) }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={e => { e.preventDefault(); setIsDrag(false); loadImage(e.dataTransfer.files[0]) }}
          onClick={() => document.getElementById('sky-file-input').click()}
          style={{
            border: `2px dashed ${isDrag ? 'var(--green)' : 'var(--bdr)'}`,
            background: isDrag ? 'var(--gdim)' : 'transparent',
            borderRadius: 16, padding: '40px 30px', textAlign: 'center',
            cursor: 'pointer', width: '100%', maxWidth: 400, transition: 'all .2s',
            color: isDrag ? 'var(--green)' : 'var(--sub)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛰</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>Drop aerial photo here</div>
          <div style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 16 }}>Upload a satellite or drone image<br />of the property to begin</div>
          <button className="btn btn-primary" onClick={e => { e.stopPropagation(); document.getElementById('sky-file-input').click() }}>Choose Image</button>
        </div>
        <button className="btn btn-ghost" onClick={makeSample}>Use Sample Property</button>
        <input id="sky-file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadImage(e.target.files[0])} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 5, padding: '8px 12px', background: 'var(--surf)', borderBottom: '1px solid var(--bdr)', flexShrink: 0 }}>
        {[['draw','✏️','Draw'],['pan','✋','Pan'],['erase','🗑','Erase']].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTool(id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '7px 4px', borderRadius: 8, fontSize: 9, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '.04em',
            color: tool === id ? 'var(--green)' : 'var(--sub)',
            background: tool === id ? 'var(--gdim)' : 'transparent',
            border: `1px solid ${tool === id ? 'rgba(74,222,128,.2)' : 'transparent'}`,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <span style={{ fontSize: 17 }}>{icon}</span>{label}
          </button>
        ))}
        <button onClick={() => setShowMats(true)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '7px 4px', borderRadius: 8, fontSize: 9, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '.04em',
          color: zones.length > 0 ? 'var(--green)' : 'var(--sub)',
          background: 'transparent', border: '1px solid transparent', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <span style={{ fontSize: 17 }}>📋</span>
          {totFt > 0 ? `${totFt}ft` : 'List'}
        </button>
        <button onClick={() => document.getElementById('sky-file-input').click()} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '7px 4px', borderRadius: 8, fontSize: 9, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--sub)',
          background: 'transparent', border: '1px solid transparent', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <span style={{ fontSize: 17 }}>🖼</span>New
        </button>
        <input id="sky-file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadImage(e.target.files[0])} />
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', background: '#040710', overflow: 'hidden', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, touchAction: 'none' }}
          onMouseDown={handleCanvasDown}
          onMouseMove={handleCanvasMove}
          onMouseUp={() => { panOrigin.current = null }}
          onTouchStart={handleCanvasDown}
          onTouchMove={e => { e.preventDefault(); handleCanvasMove(e) }}
          onTouchEnd={() => { panOrigin.current = null }}
          onWheel={handleWheel}
        />
        {/* HUD */}
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(4,7,16,.88)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '6px 13px', fontSize: 11, color: 'var(--sub)', whiteSpace: 'nowrap', backdropFilter: 'blur(6px)', pointerEvents: 'none' }}>
          {tool === 'draw' && !active && <span><b style={{ color: 'var(--green)' }}>Tap</b> to place points — <b style={{ color: 'var(--green)' }}>double-tap</b> to finish</span>}
          {tool === 'draw' && active && <span><b style={{ color: 'var(--green)' }}>{active.points.length} pts</b> placed — double-tap to finish</span>}
          {tool === 'pan' && <span>Drag to pan · Scroll to zoom</span>}
          {tool === 'erase' && <span>Tap near a zone to <b style={{ color: 'var(--red)' }}>erase</b> it</span>}
        </div>
        {/* Zoom buttons */}
        <div style={{ position: 'absolute', bottom: 14, right: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[['＋', () => setZoom(z => Math.min(8, z * 1.25))], ['fit', () => { setZoom(1); setPan({ x: 0, y: 0 }) }], ['－', () => setZoom(z => Math.max(0.15, z * 0.8))]].map(([lbl, fn]) => (
            <button key={lbl} onClick={fn} style={{ width: 34, height: 34, background: 'rgba(4,7,16,.88)', border: '1px solid var(--bdr)', borderRadius: 7, color: 'var(--text)', fontSize: lbl === 'fit' ? 10 : 17, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Material List Sheet */}
      {showMats && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowMats(false) }}>
          <div style={{ background: 'var(--surf)', borderRadius: '20px 20px 0 0', borderTop: '1px solid var(--bdr)', width: '100%', maxHeight: '90vh', overflowY: 'auto', paddingBottom: 24, position: 'absolute', bottom: 0 }}>
            <div style={{ width: 34, height: 4, background: 'var(--bdr2)', borderRadius: 2, margin: '10px auto 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px' }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>Material List</div>
              <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setShowMats(false)}>✕</button>
            </div>
            <div style={{ padding: '0 18px' }}>
              <div className="f2" style={{ marginBottom: 12 }}>
                <div className="fg"><label className="fl">Brand</label>
                  <select className="input" value={brand} onChange={e => setBrand(e.target.value)}>
                    {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="f2" style={{ gap: 8 }}>
                  <div className="fg"><label className="fl">Scale (px/ft)</label><input className="input" type="number" value={scale} min="1" onChange={e => setScale(Number(e.target.value) || 8)} /></div>
                  <div className="fg"><label className="fl">Controllers</label><input className="input" type="number" value={ctrl} min="1" onChange={e => setCtrl(Number(e.target.value) || 1)} /></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, marginBottom: 14 }}>
                {[['Zones', zones.length, 'var(--green)'], ['Ft', totFt, 'var(--blue)'], ['Nodes', totNodes, 'var(--warn)'], ['Ctrl', ctrl, '#a78bfa']].map(([l, v, c]) => (
                  <div key={l} style={{ background: 'var(--card2)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '8px 6px', borderTop: `2px solid ${c}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.8px' }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              {zones.length > 0 && (
                <div className="card2" style={{ padding: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Zone Breakdown</div>
                  {zones.map((z, i) => {
                    const ft = Math.round(segLen(z.points) / scale)
                    const znd = Math.ceil((ft * 12) / b.spacing)
                    const col = ZONE_COLORS[i % ZONE_COLORS.length]
                    return (
                      <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 0', borderBottom: i < zones.length - 1 ? '1px solid var(--bdr)' : 'none' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{z.name || `Zone ${i + 1}`}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--sub)' }}>{ft}ft · {znd}n</span>
                        <button onClick={() => setZones(z2 => z2.filter((_, j) => j !== i))} style={{ color: 'var(--dim)', fontSize: 17, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="card2" style={{ padding: 14, marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Cost Estimate — {b.name}</div>
                <div className="er"><span className="elbl">Lights ({totFt}ft × ${b.perFt}/ft)</span><span>{formatCurrency(lc)}</span></div>
                <div className="er"><span className="elbl">{b.spacing}" spacing → {totNodes} nodes</span><span style={{ color: 'var(--sub)' }}>{totNodes}</span></div>
                <div className="er"><span className="elbl">Controllers ×{ctrl}</span><span>{formatCurrency(cc)}</span></div>
                {extras.map(e => <div key={e} className="er"><span className="elbl">{e}</span><span>{formatCurrency(EXTRAS[e])}</span></div>)}
                <div className="etot"><span>Subtotal</span><span>{formatCurrency(matTot)}</span></div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 16 }}>* Labor not included — add in Estimator</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {zones.length > 0 && (
                  <button className="btn btn-green" style={{ width: '100%', padding: 13 }} onClick={() => {
                    onSendToEstimator({ linearFt: totFt, nodes: totNodes, brand, controllers: ctrl, extras })
                    setShowMats(false)
                  }}>→ Send to Estimator</button>
                )}
                <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => { setZones([]); setActive(null); setShowMats(false) }}>Clear All Zones</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}