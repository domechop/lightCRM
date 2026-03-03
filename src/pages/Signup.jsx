import { useState } from 'react'

export default function Signup({ signUpAsOwner, signUpAsRep, onBackToLogin }) {
  const [mode, setMode] = useState(null) // null | 'create' | 'join'
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '', orgName: '', inviteCode: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null) // { inviteCode?, orgName? }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')
    if (!form.fullName || !form.email || !form.password) return setError('All fields are required')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    if (mode === 'create' && !form.orgName) return setError('Company name is required')
    if (mode === 'join' && !form.inviteCode) return setError('Invite code is required')

    setLoading(true)
    if (mode === 'create') {
      const { inviteCode, error } = await signUpAsOwner(form.email, form.password, form.fullName, form.orgName)
      if (error) setError(error.message)
      else setSuccess({ inviteCode, orgName: form.orgName })
    } else {
      const { orgName, error } = await signUpAsRep(form.email, form.password, form.fullName, form.inviteCode)
      if (error) setError(error.message)
      else setSuccess({ orgName })
    }
    setLoading(false)
  }

  // Mode selection screen
  if (!mode) {
    return (
      <div style={{ minHeight: '100vh', background: '#080d18', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16 }}>💡</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: '#f1f5f9', letterSpacing: '-0.03em' }}>LuminaTrack</div>
            <div style={{ fontSize: 14, color: '#475569', marginTop: 6 }}>Get started</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => setMode('create')} style={{
              background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: '22px 24px',
              cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s', fontFamily: 'inherit'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#f97316'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🏢</div>
              <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15, marginBottom: 4 }}>Create a new organization</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>I'm an owner setting up LuminaTrack for my company</div>
            </button>

            <button onClick={() => setMode('join')} style={{
              background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: '22px 24px',
              cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s', fontFamily: 'inherit'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#60a5fa'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔗</div>
              <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15, marginBottom: 4 }}>Join with an invite code</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>My manager gave me a code to join their team</div>
            </button>
          </div>

          <button className="btn btn-ghost" style={{ width: '100%', marginTop: 16 }} onClick={onBackToLogin}>
            Already have an account? Sign in
          </button>
        </div>
      </div>
    )
  }

  // Success screen
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#080d18', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#f1f5f9', fontSize: 20, marginBottom: 8 }}>
              {mode === 'create' ? `${success.orgName} is ready!` : `You've joined ${success.orgName}!`}
            </div>

            {mode === 'create' && success.inviteCode && (
              <div style={{ margin: '20px 0' }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>Share this invite code with your reps:</div>
                <div style={{ background: '#0f1624', border: '1px solid #f97316', borderRadius: 10, padding: '14px 20px', fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: '#f97316', letterSpacing: '0.1em' }}>
                  {success.inviteCode}
                </div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>Save this — you can also find it later in your org settings</div>
              </div>
            )}

            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Check your email for a confirmation link, then sign in.
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onBackToLogin}>Go to Sign In</button>
          </div>
        </div>
      </div>
    )
  }

  // Form screen
  return (
    <div style={{ minHeight: '100vh', background: '#080d18', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>💡</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: '#f1f5f9' }}>
            {mode === 'create' ? 'Create your organization' : 'Join your team'}
          </div>
        </div>

        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {mode === 'create' && (
              <div>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Name</label>
                <input className="input" placeholder="Acme Lighting Co." value={form.orgName} onChange={e => set('orgName', e.target.value)} />
              </div>
            )}

            {mode === 'join' && (
              <div>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invite Code</label>
                <input className="input" placeholder="e.g. LUM-4X2" value={form.inviteCode}
                  onChange={e => set('inviteCode', e.target.value.toUpperCase())}
                  style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.1em', textTransform: 'uppercase' }} />
              </div>
            )}

            {[['fullName', 'Full Name', 'text', 'Jane Smith'], ['email', 'Email', 'email', 'you@company.com'], ['password', 'Password', 'password', '••••••••'], ['confirm', 'Confirm Password', 'password', '••••••••']].map(([k, label, type, placeholder]) => (
              <div key={k}>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                <input className="input" type={type} placeholder={placeholder} value={form[k]}
                  onChange={e => set(k, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>
            ))}

            {error && (
              <div style={{ background: '#f8717122', border: '1px solid #f8717144', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>{error}</div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', padding: 11, fontSize: 15, marginTop: 4 }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating account...' : mode === 'create' ? 'Create Organization' : 'Join Team'}
            </button>

            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => { setMode(null); setError('') }}>← Back</button>
          </div>
        </div>
      </div>
    </div>
  )
}