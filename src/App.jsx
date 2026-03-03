import { useState } from 'react'
import { GLOBAL_STYLES } from './lib/constants'
import { useAuth } from './hooks/useAuth'
import { useLeads } from './hooks/useLeads'
import { useStages } from './hooks/useStages'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import LeadList from './pages/LeadList'
import LeadDetail from './pages/LeadDetail'
import StagesSettings from './pages/StagesSettings'
import AddLeadModal from './components/AddLeadModal'
import CalendarPage from './pages/CalendarPage'
import Estimator from './pages/Estimator'
import SkyView from './pages/SkyView'

const I = (d, size = 22) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
)

const ICONS = {
  home:     "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  pipeline: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  leads:    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  estimate: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  skyview:  "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  stages:   "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  plus:     "M12 4v16m8-8H4",
  signout:  "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  menu:     "M4 6h16M4 12h16M4 18h16",
}

const NAV_TABS = [
  { id: 'home',     label: 'Home',     icon: 'home'     },
  { id: 'pipeline', label: 'Pipeline', icon: 'pipeline' },
  { id: 'leads',    label: 'Leads',    icon: 'leads'    },
  { id: 'estimate', label: 'Estimate', icon: 'estimate' },
  { id: 'skyview',  label: 'Sky View', icon: 'skyview'  },
]

const MOBILE_STYLES = `
  @media (max-width: 767px) {
    .desktop-nav  { display: none !important; }
    .desktop-only { display: none !important; }
    .main-content { padding-bottom: 70px; }
  }
  @media (min-width: 768px) {
    .bottom-nav  { display: none !important; }
    .mobile-only { display: none !important; }
  }
  .bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: var(--surf); border-top: 1px solid var(--bdr);
    z-index: 50; display: flex; height: var(--navh);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .bottom-nav-btn {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 10px 0 12px; font-size: 9px; font-weight: 700;
    color: var(--dim); background: transparent; border: none; font-family: inherit;
    cursor: pointer; gap: 3px; text-transform: uppercase; letter-spacing: .06em;
    transition: color .15s; position: relative;
  }
  .bottom-nav-btn.active { color: var(--green); }
  .bottom-nav-btn.active::after {
    content: ''; position: absolute; top: 0; left: 25%; right: 25%;
    height: 2px; background: var(--green);
    border-radius: 0 0 3px 3px; box-shadow: 0 0 8px var(--green);
  }
`

export default function App() {
  const { user, profile, org, loading: authLoading, signIn, signUpAsOwner, signUpAsRep, signOut } = useAuth()
  const { leads, reps, loading: leadsLoading, addLead, updateStage, updateLead, deleteLead } = useLeads(profile)
  const { stages, loading: stagesLoading, addStage, updateStage: updateStageDef, deleteStage, reorderStages } = useStages(profile)

  const [view, setView] = useState('home')
  const [authScreen, setAuthScreen] = useState('login')
  const [selectedLead, setSelectedLead] = useState(null)
  const [filterRep, setFilterRep] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [estimatorPrefill, setEstimatorPrefill] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: '#07090f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{GLOBAL_STYLES}</style>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )

  if (!user) return (
    <>
      <style>{GLOBAL_STYLES}</style>
      {authScreen === 'login'
        ? <Login signIn={signIn} onSignup={() => setAuthScreen('signup')} />
        : <Signup signUpAsOwner={signUpAsOwner} signUpAsRep={signUpAsRep} onBackToLogin={() => setAuthScreen('login')} />
      }
    </>
  )

  const isManager = ['owner', 'manager'].includes(profile?.role)
  const filtered = filterRep === 'all' ? leads : leads.filter(l => l.rep_id === filterRep)
  const stageColorMap = Object.fromEntries(stages.map(s => [s.name, s.color]))

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

  const handleSaveToLead = async (leadData) => {
    await addLead({ ...leadData, rep_id: profile?.id })
  }

  const handleSkyToEstimator = (data) => {
    setEstimatorPrefill(data)
    goTo('estimate')
  }

  const desktopTabs = [
    ...NAV_TABS,
    ...(isManager ? [{ id: 'stages', label: 'Stages', icon: 'stages' }] : []),
  ]

  return (
    <>
      <style>{GLOBAL_STYLES}{MOBILE_STYLES}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: 'var(--surf)', borderBottom: '1px solid var(--bdr)', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, flexShrink: 0 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', letterSpacing: '-0.03em' }}>
              Lumina<span style={{ color: 'var(--orange)' }}>Track</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: 'flex', gap: 3 }}>
            {desktopTabs.map(({ id, label }) => (
              <button key={id} className={`nav-tab ${view === id ? 'active' : ''}`} onClick={() => goTo(id)}>{label}</button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Desktop controls */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isManager && (
                <select className="input" style={{ width: 'auto', fontSize: 12, padding: '6px 28px 6px 10px' }}
                  value={filterRep} onChange={e => setFilterRep(e.target.value)}>
                  <option value="all">All Reps</option>
                  {reps.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
                </select>
              )}
              {profile?.role === 'owner' && org?.invite_code && (
                <div style={{ background: 'var(--card2)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                  onClick={() => { navigator.clipboard.writeText(org.invite_code); alert(`Copied: ${org.invite_code}`) }}>
                  <span style={{ fontSize: 10, color: 'var(--sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Invite</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--orange)', letterSpacing: '.08em' }}>{org.invite_code}</span>
                </div>
              )}
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ fontSize: 12, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                {I(ICONS.plus, 13)} Add
              </button>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--card2)', border: '1px solid var(--bdr)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--orange)' }}>
                {profile?.full_name?.split(' ').map(w => w[0]).join('') || '?'}
              </div>
              <button onClick={signOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', display: 'flex', alignItems: 'center' }} title="Sign out">
                {I(ICONS.signout, 18)}
              </button>
            </div>

            {/* Mobile hamburger */}
            <button className="mobile-only" onClick={() => setShowMenu(m => !m)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', display: 'flex', alignItems: 'center', padding: 4 }}>
              {I(ICONS.menu, 22)}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {showMenu && (
          <>
            <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
            <div style={{
              position: 'fixed', top: 58, right: 12, zIndex: 99,
              background: 'var(--surf)', border: '1px solid var(--bdr)',
              borderRadius: 12, minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,.4)',
              overflow: 'hidden', animation: 'fadeIn .15s ease',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bdr)' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{profile?.full_name || 'User'}</div>
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2, textTransform: 'capitalize' }}>{profile?.role || 'rep'}</div>
              </div>
              <button onClick={() => { setShowMenu(false); setShowAddModal(true) }} style={{
                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                background: 'none', border: 'none', borderBottom: '1px solid var(--bdr)', cursor: 'pointer',
                color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
              }}>
                {I(ICONS.plus, 16)} Add Lead
              </button>
              {profile?.role === 'owner' && org?.invite_code && (
                <button onClick={() => { navigator.clipboard.writeText(org.invite_code); alert(`Copied: ${org.invite_code}`); setShowMenu(false) }} style={{
                  width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', borderBottom: '1px solid var(--bdr)', cursor: 'pointer',
                  color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
                }}>
                  <span style={{ color: 'var(--sub)' }}>Invite Code</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--orange)' }}>{org.invite_code}</span>
                </button>
              )}
              <button onClick={() => { setShowMenu(false); signOut() }} style={{
                width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--red)', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
              }}>
                {I(ICONS.signout, 16)} Sign Out
              </button>
            </div>
          </>
        )}

        {/* Main content */}
        <div className="main-content" style={{ flex: 1, overflow: 'auto' }}>
          {leadsLoading || stagesLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
              <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            </div>
          ) : (
            <>
              {view === 'home'     && <Dashboard leads={filtered} stages={stages} stageColorMap={stageColorMap} onLeadClick={openLead} onGoTo={goTo} />}
              {view === 'pipeline' && <Pipeline leads={filtered} stages={stages} stageColorMap={stageColorMap} onLeadClick={openLead} onStageChange={handleStageChange} />}
              {view === 'leads'    && <LeadList leads={filtered} stageColorMap={stageColorMap} onLeadClick={openLead} />}
              {view === 'calendar' && <CalendarPage leads={filtered} stageColorMap={stageColorMap} onLeadClick={openLead} />}
              {view === 'estimate' && <Estimator stages={stages} prefill={estimatorPrefill} onSaveToLead={handleSaveToLead} />}
              {view === 'skyview'  && <SkyView onSendToEstimator={handleSkyToEstimator} />}
              {view === 'detail' && selectedLead && (
                <LeadDetail
                  lead={leads.find(l => l.id === selectedLead.id) || selectedLead}
                  profile={profile} reps={reps} stages={stages} stageColorMap={stageColorMap}
                  onBack={() => goTo('pipeline')} onStageChange={handleStageChange}
                  onUpdate={updateLead} onDelete={handleDelete}
                />
              )}
              {view === 'stages' && isManager && (
                <StagesSettings stages={stages} profile={profile}
                  onAdd={addStage} onUpdate={updateStageDef} onDelete={deleteStage}
                  onReorder={reorderStages} onBack={() => goTo('pipeline')}
                />
              )}
            </>
          )}
        </div>

        {/* Mobile bottom nav */}
        <nav className="bottom-nav">
          {NAV_TABS.map(({ id, label, icon }) => (
            <button key={id} className={`bottom-nav-btn ${view === id ? 'active' : ''}`} onClick={() => goTo(id)}>
              {I(ICONS[icon], 22)}
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {showAddModal && (
          <AddLeadModal reps={reps} stages={stages} currentProfile={profile} onAdd={addLead} onClose={() => setShowAddModal(false)} />
        )}

      </div>
    </>
  )
}