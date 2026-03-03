import { useState } from 'react'
import { GLOBAL_STYLES } from './lib/constants'
import { useAuth } from './hooks/useAuth'
import { useLeads } from './hooks/useLeads'
import { useStages } from './hooks/useStages'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Pipeline from './pages/Pipeline'
import LeadList from './pages/LeadList'
import LeadDetail from './pages/LeadDetail'
import StagesSettings from './pages/StagesSettings'
import StatBar from './components/StatBar'
import AddLeadModal from './components/AddLeadModal'

const MOBILE_STYLES = `
  @media (max-width: 767px) {
    .header-nav { display: none; }
    .header-right { gap: 6px !important; }
    .rep-filter { display: none; }
    .bottom-nav { display: flex !important; }
    .stat-bar-wrapper { padding: 10px 12px !important; gap: 8px !important; }
    .main-content { padding-bottom: 70px; }
  }
  .bottom-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: #0d1321;
    border-top: 1px solid #1e293b;
    z-index: 50;
  }
  .bottom-nav-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 0 12px;
    font-size: 10px;
    font-weight: 600;
    color: #475569;
    background: transparent;
    border: none;
    font-family: inherit;
    cursor: pointer;
    gap: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: color 0.15s;
  }
  .bottom-nav-btn.active { color: #f97316; }
  .bottom-nav-btn .icon { font-size: 20px; }
`

export default function App() {
  const { user, profile, org, loading: authLoading, signIn, signUpAsOwner, signUpAsRep, signOut } = useAuth()
  const { leads, reps, loading: leadsLoading, addLead, updateStage, updateLead, deleteLead } = useLeads(profile)
  const { stages, loading: stagesLoading, addStage, updateStage: updateStageDef, deleteStage, reorderStages } = useStages(profile)

  const [view, setView] = useState('pipeline')
  const [authScreen, setAuthScreen] = useState('login')
  const [selectedLead, setSelectedLead] = useState(null)
  const [filterRep, setFilterRep] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080d18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{GLOBAL_STYLES}</style>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <style>{GLOBAL_STYLES}</style>
        {authScreen === 'login'
          ? <Login signIn={signIn} onSignup={() => setAuthScreen('signup')} />
          : <Signup signUpAsOwner={signUpAsOwner} signUpAsRep={signUpAsRep} onBackToLogin={() => setAuthScreen('login')} />
        }
      </>
    )
  }

  const isManager = ['owner', 'manager'].includes(profile?.role)
  const filtered = filterRep === 'all' ? leads : leads.filter(l => l.rep_id === filterRep)

  const openLead = (lead) => { setSelectedLead(lead); setView('detail') }
  const goTo = (v) => { setView(v); setSelectedLead(null) }

  const handleStageChange = (id, stage) => {
    updateStage(id, stage)
    if (selectedLead?.id === id) setSelectedLead(prev => ({ ...prev, stage }))
  }

  const handleDelete = async (id) => {
    await deleteLead(id)
    setView('pipeline')
    setSelectedLead(null)
  }

  const stageNames = stages.map(s => s.name)
  const stageColorMap = Object.fromEntries(stages.map(s => [s.name, s.color]))

  return (
    <>
      <style>{GLOBAL_STYLES}{MOBILE_STYLES}</style>
      <div style={{ minHeight: '100vh', background: '#080d18', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: '#0d1321', borderBottom: '1px solid #1e293b', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💡</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: '#f1f5f9', letterSpacing: '-0.02em' }}>LumaCRM</span>
          </div>

          <div className="header-nav" style={{ display: 'flex', gap: 4 }}>
            <button className={`nav-tab ${view === 'pipeline' ? 'active' : ''}`} onClick={() => goTo('pipeline')}>Pipeline</button>
            <button className={`nav-tab ${view === 'list' ? 'active' : ''}`} onClick={() => goTo('list')}>All Leads</button>
            {isManager && (
              <button className={`nav-tab ${view === 'stages' ? 'active' : ''}`} onClick={() => goTo('stages')}>⚙ Stages</button>
            )}
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isManager && (
              <select className="input rep-filter" style={{ width: 'auto', fontSize: 13, padding: '6px 10px' }}
                value={filterRep} onChange={e => setFilterRep(e.target.value)}>
                <option value="all">All Reps</option>
                {reps.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
              </select>
            )}
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ whiteSpace: 'nowrap' }}>+ Add Lead</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeft: '1px solid #1e293b' }}>
              {profile?.role === 'owner' && org?.invite_code && (
                <div title="Copy invite code" style={{ background: '#1e293b', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                  onClick={() => { navigator.clipboard.writeText(org.invite_code); alert(`Invite code ${org.invite_code} copied!`) }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Invite:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#f97316', letterSpacing: '0.05em' }}>{org.invite_code}</span>
                  <span style={{ fontSize: 11 }}>📋</span>
                </div>
              )}
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#f97316', flexShrink: 0 }}>
                {profile?.full_name?.split(' ').map(w => w[0]).join('') || '?'}
              </div>
              <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }} onClick={signOut}>Sign out</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatBar leads={filtered} stages={stages} />

        {/* Main content */}
        <div className="main-content" style={{ flex: 1, overflow: 'auto' }}>
          {leadsLoading || stagesLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
              <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            </div>
          ) : (
            <>
              {view === 'pipeline' && (
                <Pipeline leads={filtered} stages={stages} stageColorMap={stageColorMap} onLeadClick={openLead} />
              )}
              {view === 'list' && (
                <LeadList leads={filtered} stageColorMap={stageColorMap} onLeadClick={openLead} />
              )}
              {view === 'detail' && selectedLead && (
                <LeadDetail
                  lead={leads.find(l => l.id === selectedLead.id) || selectedLead}
                  profile={profile}
                  reps={reps}
                  stages={stages}
                  stageColorMap={stageColorMap}
                  onBack={() => goTo('pipeline')}
                  onStageChange={handleStageChange}
                  onUpdate={updateLead}
                  onDelete={handleDelete}
                />
              )}
              {view === 'stages' && isManager && (
                <StagesSettings
                  stages={stages}
                  profile={profile}
                  onAdd={addStage}
                  onUpdate={updateStageDef}
                  onDelete={deleteStage}
                  onReorder={reorderStages}
                  onBack={() => goTo('pipeline')}
                />
              )}
            </>
          )}
        </div>

        {/* Mobile bottom nav */}
        <nav className="bottom-nav">
          <button className={`bottom-nav-btn ${view === 'pipeline' ? 'active' : ''}`} onClick={() => goTo('pipeline')}>
            <span className="icon">📋</span>Pipeline
          </button>
          <button className="bottom-nav-btn" onClick={() => setShowAddModal(true)}>
            <span className="icon" style={{ width: 36, height: 36, background: '#f97316', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginTop: -8 }}>+</span>
            Add
          </button>
          <button className={`bottom-nav-btn ${view === 'list' ? 'active' : ''}`} onClick={() => goTo('list')}>
            <span className="icon">👥</span>Leads
          </button>
        </nav>

        {showAddModal && (
          <AddLeadModal
            reps={reps}
            stages={stages}
            currentProfile={profile}
            onAdd={addLead}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </>
  )
}