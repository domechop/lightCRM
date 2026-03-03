export const LEAD_SOURCES = ["Referral", "Door-to-door", "Facebook Ad", "Website", "Cold call", "Other"]

export const formatCurrency = (n) => "$" + (n || 0).toLocaleString()

export const BRANDS = [
  { id: "gemstone",  name: "Gemstone Lights",    spacing: 12, perFt: 18, ctrl: 299 },
  { id: "jellyfish", name: "Jellyfish Lighting",  spacing: 6,  perFt: 22, ctrl: 349 },
  { id: "govee",     name: "Govee Pro",            spacing: 8,  perFt: 14, ctrl: 199 },
  { id: "trimlight", name: "Trimlight",            spacing: 10, perFt: 20, ctrl: 319 },
  { id: "other",     name: "Custom / Other",       spacing: 12, perFt: 16, ctrl: 249 },
]

export const EXTRAS = {
  "Holiday Color Pack": 149,
  "App Setup": 99,
  "Annual Maintenance": 299,
  "Fascia Mount Kit": 79,
  "WiFi Extender": 59,
}

export const ZONE_COLORS = ["#4ade80","#60a5fa","#f59e0b","#f472b6","#a78bfa","#34d399","#fb923c"]

export const getBrand = (id) => BRANDS.find(b => b.id === id) || BRANDS[0]
export const calcNodes = (bid, ft) => Math.ceil((Number(ft) * 12) / getBrand(bid).spacing)
export const calcTotal = (bid, ft, ctrl, labor, extras) => {
  const b = getBrand(bid)
  return Math.round(
    Number(ft) * b.perFt +
    Number(ctrl) * b.ctrl +
    Number(labor) +
    extras.reduce((s, e) => s + (EXTRAS[e] || 0), 0)
  )
}

export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  :root {
    --bg:    #07090f;
    --surf:  #0d1120;
    --card:  #131926;
    --card2: #18202f;
    --bdr:   #1c2840;
    --bdr2:  #243350;
    --green: #4ade80;
    --gdim:  rgba(74,222,128,.1);
    --blue:  #38bdf8;
    --text:  #e4eaf5;
    --sub:   #6b84a8;
    --dim:   #3a4f6e;
    --red:   #f43f5e;
    --warn:  #f59e0b;
    --orange:#f97316;
    --r:     13px;
    --rsm:   8px;
    --navh:  62px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    font-size: 14px;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--bdr2); border-radius: 4px; }

  .card  { background: var(--card);  border: 1px solid var(--bdr); border-radius: var(--r); }
  .card2 { background: var(--card2); border: 1px solid var(--bdr); border-radius: var(--rsm); }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    border: none; border-radius: var(--rsm);
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px;
    cursor: pointer; transition: opacity .15s; padding: 9px 16px;
  }
  .btn:active { opacity: .75; }
  .btn-primary  { background: var(--orange); color: #fff; }
  .btn-primary:hover { background: #ea6c0a; }
  .btn-green    { background: var(--green); color: #07090f; }
  .btn-green:hover { opacity: .88; }
  .btn-ghost    { background: transparent; color: var(--sub); border: 1px solid var(--bdr); padding: 8px 14px; }
  .btn-ghost:hover { background: var(--card2); color: var(--text); }
  .btn-danger   { background: rgba(244,63,94,.1); color: var(--red); border: 1px solid rgba(244,63,94,.25); padding: 8px 14px; }
  .btn-danger:hover { background: rgba(244,63,94,.2); }

  .input {
    background: var(--card2); border: 1px solid var(--bdr); border-radius: var(--rsm);
    color: var(--text); padding: 10px 12px; font-size: 14px;
    font-family: 'Inter', sans-serif; width: 100%; outline: none;
    transition: border-color .15s; -webkit-appearance: none; appearance: none; display: block;
  }
  .input:focus { border-color: var(--orange); }
  .input::placeholder { color: var(--dim); }
  select.input {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='none' stroke='%236b84a8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 11px center; background-size: 10px; padding-right: 30px;
  }
  select.input option { background: var(--card); }

  .nav-tab {
    cursor: pointer; padding: 7px 13px; border-radius: var(--rsm);
    font-size: 11px; font-weight: 700; color: var(--sub);
    transition: all .15s; background: transparent; border: 1px solid transparent;
    font-family: 'Inter', sans-serif; letter-spacing: .04em; text-transform: uppercase;
  }
  .nav-tab.active { background: var(--gdim); color: var(--green); border-color: rgba(74,222,128,.2); }
  .nav-tab:hover:not(.active) { color: var(--text); background: var(--card2); }

  .stage-badge {
    display: inline-flex; align-items: center; padding: 2px 8px;
    border-radius: 20px; font-size: 10px; font-weight: 700;
    letter-spacing: .04em; border: 1px solid; text-transform: uppercase;
  }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.72);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 20px; backdrop-filter: blur(6px);
  }
  .modal {
    background: var(--surf); border: 1px solid var(--bdr); border-radius: 20px;
    padding: 28px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;
  }

  .rep-chip {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--card2); border: 1px solid var(--bdr);
    border-radius: 20px; padding: 3px 9px; font-size: 11px; color: var(--sub); font-weight: 500;
  }
  .rep-avatar {
    width: 18px; height: 18px; border-radius: 50%; background: var(--orange);
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 8px; font-weight: 700; color: white; flex-shrink: 0;
  }

  .lead-card {
    background: var(--card); border: 1px solid var(--bdr); border-radius: 10px;
    padding: 13px; cursor: pointer; transition: border-color .15s, transform .15s, box-shadow .15s;
    margin-bottom: 7px;
  }
  .lead-card:hover { border-color: var(--orange); transform: translateY(-1px); box-shadow: 0 4px 24px rgba(249,115,22,.12); }

  /* Stat tiles */
  .stat-tile {
    background: var(--card); border: 1px solid var(--bdr); border-radius: var(--r);
    padding: 13px; position: relative; overflow: hidden;
  }
  .stat-lbl { font-size: 9px; font-weight: 700; color: var(--sub); text-transform: uppercase; letter-spacing: .8px; }
  .stat-val { font-size: 22px; font-weight: 800; margin-top: 4px; letter-spacing: -.5px; line-height: 1; }
  .stat-sub { font-size: 10px; color: var(--dim); margin-top: 2px; }

  /* Form helpers */
  .fg { display: flex; flex-direction: column; gap: 5px; margin-bottom: 13px; }
  .fl { font-size: 9px; font-weight: 700; color: var(--sub); text-transform: uppercase; letter-spacing: .8px; }
  .f2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .fta {
    background: var(--card2); border: 1px solid var(--bdr); border-radius: var(--rsm);
    color: var(--text); padding: 10px 12px; font-family: 'Inter', sans-serif;
    font-size: 14px; width: 100%; outline: none; resize: none; min-height: 76px;
    line-height: 1.5; transition: border-color .15s;
  }
  .fta:focus { border-color: var(--orange); }

  /* Chips */
  .chip {
    padding: 5px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
    cursor: pointer; border: 1px solid; transition: all .12s;
    display: inline-flex; align-items: center; gap: 4px; user-select: none;
  }
  .chip-on  { background: var(--gdim); border-color: var(--green); color: var(--green); }
  .chip-off { background: transparent; border-color: var(--bdr); color: var(--sub); }

  /* Estimate rows */
  .er { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; border-bottom: 1px solid var(--bdr); }
  .er:last-child { border-bottom: none; }
  .elbl { color: var(--sub); }
  .etot { font-size: 18px; font-weight: 800; color: var(--green); display: flex; justify-content: space-between; padding-top: 10px; margin-top: 4px; border-top: 1px solid var(--bdr); }

  .spinner {
    width: 20px; height: 20px; border: 2px solid var(--bdr2);
    border-top-color: var(--orange); border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-in { animation: fadeIn .2s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
`