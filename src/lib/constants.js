export const STAGES = ["Lead", "Contacted", "Site Visit", "Quoted", "Follow-Up", "Sold", "Installed"]

export const STAGE_COLORS = {
  "Lead": "#94a3b8",
  "Contacted": "#60a5fa",
  "Site Visit": "#a78bfa",
  "Quoted": "#fb923c",
  "Follow-Up": "#fbbf24",
  "Sold": "#34d399",
  "Installed": "#10b981",
}

export const LEAD_SOURCES = ["Referral", "Door-to-door", "Facebook Ad", "Website", "Cold call", "Other"]

export const formatCurrency = (n) => "$" + (n || 0).toLocaleString()

export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080d18; color: #e2e8f0; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #0f1624; }
  ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 3px; }
  .card { background: #111827; border: 1px solid #1e293b; border-radius: 12px; }
  .btn { cursor: pointer; border: none; border-radius: 8px; font-family: inherit; font-weight: 500; transition: all 0.15s; }
  .btn-primary { background: #f97316; color: white; padding: 9px 18px; font-size: 14px; }
  .btn-primary:hover { background: #ea6c0a; }
  .btn-ghost { background: transparent; color: #94a3b8; padding: 8px 14px; font-size: 13px; border: 1px solid #1e293b; }
  .btn-ghost:hover { background: #1e293b; color: #e2e8f0; }
  .btn-danger { background: transparent; color: #f87171; padding: 8px 14px; font-size: 13px; border: 1px solid #f8717133; }
  .btn-danger:hover { background: #f8717122; }
  .input { background: #0f1624; border: 1px solid #1e293b; border-radius: 8px; color: #e2e8f0; padding: 9px 12px; font-size: 14px; font-family: inherit; width: 100%; outline: none; transition: border 0.15s; }
  .input:focus { border-color: #f97316; }
  .input::placeholder { color: #334155; }
  .stage-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.03em; }
  .nav-tab { cursor: pointer; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; color: #64748b; transition: all 0.15s; background: transparent; border: none; font-family: inherit; }
  .nav-tab.active { background: #1e293b; color: #f97316; }
  .nav-tab:hover:not(.active) { color: #94a3b8; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; backdrop-filter: blur(4px); }
  .modal { background: #111827; border: 1px solid #1e293b; border-radius: 16px; padding: 28px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
  .rep-chip { display: inline-flex; align-items: center; gap: 6px; background: #1e293b; border-radius: 20px; padding: 4px 10px; font-size: 12px; color: #94a3b8; }
  .rep-avatar { width: 20px; height: 20px; border-radius: 50%; background: #f97316; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: white; flex-shrink: 0; }
  .lead-card { background: #111827; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.15s; margin-bottom: 8px; }
  .lead-card:hover { border-color: #f97316; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(249,115,22,0.1); }
  select.input { appearance: none; }
  .spinner { width: 20px; height: 20px; border: 2px solid #1e293b; border-top-color: #f97316; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-in { animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
`