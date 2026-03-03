import { useState } from 'react'

export default function Login({ signIn, onSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080d18', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16 }}>💡</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: '#f1f5f9', letterSpacing: '-0.03em' }}>LuminaTrack</div>
          <div style={{ fontSize: 14, color: '#475569', marginTop: 6 }}>Permanent Lighting Sales Platform</div>
        </div>

        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && (
            <div style={{ background: '#f8717122', border: '1px solid #f8717144', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', padding: '11px', fontSize: 15 }} onClick={handleSubmit} disabled={loading}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span className="spinner" />Signing in...</span> : 'Sign In'}
          </button>
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: 10 }} onClick={onSignup}>
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  )
}