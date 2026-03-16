'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    setMounted(true)
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false }))
    }
    tick()
    const interval = setInterval(tick, 1000)
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/auth/login'; return }
      setUser(data.user)
      supabase
        .from('audits')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .then(({ data: auditData }) => {
          setAudits(auditData || [])
          setLoading(false)
        })
    })
    return () => clearInterval(interval)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  async function createNewAudit() {
    if (!user) return
    const { data } = await supabase
      .from('audits')
      .insert([{ user_id: user.id, title: 'Untitled Audit', status: 'draft' }])
      .select()
      .single()
    if (data) window.location.href = `/audit/${data.id}/intake`
  }

  const getRiskColor = (score) => {
    if (!score) return '#2A3A55'
    if (score >= 75) return '#D63031'
    if (score >= 50) return '#E17055'
    if (score >= 25) return '#FDCB6E'
    return '#00B894'
  }

  const getRiskZone = (score) => {
    if (!score) return 'PENDING'
    if (score >= 75) return 'CRITICAL'
    if (score >= 50) return 'HIGH RISK'
    if (score >= 25) return 'MODERATE'
    return 'RESILIENT'
  }

  const getStatusColor = (status) => {
    if (status === 'complete') return '#00B894'
    if (status === 'processing') return '#FDCB6E'
    return '#2A3A55'
  }

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'FOUNDER'

  return (
    <div className="db-wrap">
      <header className="db-header">
        <div className="db-header-left">
          <a href="/" className="db-logo">
            <img src="/logo.png" style={{width:'32px',height:'32px',objectFit:'contain'}} />
            <span className="db-logo-text">DEVILS ADVOCATE <span>2.0</span></span>
          </a>
          <div className="db-breadcrumb">
            <span className="db-bc-sep">/</span>
            <span className="db-bc-page">COMMAND CENTER</span>
          </div>
        </div>
        <div className="db-header-right">
          {mounted && <span className="db-clock">{time}</span>}
          <div className="db-user-pill">
            <span className="db-user-dot" />
            <span className="db-user-name">{userName}</span>
          </div>
          <button onClick={handleLogout} className="db-logout">SIGN OUT →</button>
        </div>
      </header>

      <div className="db-body">
        <aside className="db-sidebar">
          <nav className="db-nav">
            {[
              { icon: '◈', label: 'DASHBOARD',    href: '/dashboard',      active: true  },
              { icon: '▸', label: 'NEW AUDIT',     href: '#',               active: false, action: createNewAudit },
              { icon: '⬡', label: 'AUDIT HISTORY', href: '/audit/history',  active: false },
              { icon: '◆', label: 'REPORTS',       href: '#',               active: false },
              { icon: '◎', label: 'SETTINGS',      href: '#',               active: false },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                onClick={item.action ? (e) => { e.preventDefault(); item.action() } : undefined}
                className={`db-nav-item ${item.active ? 'active' : ''}`}
              >
                <span className="db-nav-icon">{item.icon}</span>
                <span className="db-nav-label">{item.label}</span>
                {item.active && <span className="db-nav-indicator" />}
              </a>
            ))}
          </nav>
          <div className="db-sidebar-bottom">
            <div className="db-sys-block">
              <div className="db-sys-title">SYSTEM STATUS</div>
              {[
                { label: 'AI ENGINE',  status: 'ONLINE' },
                { label: 'DATABASE',   status: 'ONLINE' },
                { label: 'PAYMENTS',   status: 'ONLINE' },
              ].map(s => (
                <div key={s.label} className="db-sys-row">
                  <span className="db-sys-label">{s.label}</span>
                  <span className="db-sys-status">
                    <span className="db-sys-dot" />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="db-main">
          <div className="db-welcome">
            <div>
              <div className="db-welcome-label">COMMAND CENTER</div>
              <h1 className="db-welcome-title">
                WELCOME BACK, <span>{userName.toUpperCase()}.</span>
              </h1>
            </div>
            <button onClick={createNewAudit} className="db-new-btn">
              + NEW STRUCTURAL AUDIT
            </button>
          </div>

          <div className="db-stats-row">
            {[
              { label: 'TOTAL AUDITS',  value: audits.length, unit: '', color: '#D63031' },
              { label: 'COMPLETED',     value: audits.filter(a => a.status === 'complete').length, unit: '', color: '#00B894' },
              { label: 'AVG FRAGILITY', value: audits.length ? Math.round(audits.filter(a=>a.fragility_score).reduce((s,a)=>s+(a.fragility_score||0),0) / (audits.filter(a=>a.fragility_score).length||1)) : '—', unit: '/100', color: '#E17055' },
              { label: 'DRAFTS',        value: audits.filter(a => a.status === 'draft').length, unit: '', color: '#FDCB6E' },
            ].map(s => (
              <div key={s.label} className="db-stat-card">
                <div className="db-stat-val" style={{ color: s.color, textShadow: `0 0 12px ${s.color}66` }}>
                  {s.value}<span className="db-stat-unit">{s.unit}</span>
                </div>
                <div className="db-stat-label">{s.label}</div>
                <div className="db-stat-bar" style={{ background: `linear-gradient(90deg, ${s.color}22, transparent)` }} />
              </div>
            ))}
          </div>

          <div className="db-section">
            <div className="db-section-header">
              <div className="db-section-title">
                <span className="db-section-icon">◈</span>
                STRUCTURAL AUDITS
              </div>
              <div className="db-section-count">{audits.length} TOTAL</div>
            </div>

            {loading ? (
              <div className="db-loading">
                <div className="db-loading-dots"><span /><span /><span /></div>
                <span>LOADING AUDIT DATA...</span>
              </div>
            ) : audits.length === 0 ? (
              <div className="db-empty">
                <div className="db-empty-icon">◈</div>
                <div className="db-empty-title">NO AUDITS YET</div>
                <div className="db-empty-desc">Run your first structural stress test to get your Fragility Index.</div>
                <button onClick={createNewAudit} className="db-empty-btn">
                  START FIRST AUDIT
                </button>
              </div>
            ) : (
              <div className="db-table-wrap">
                <div className="db-table-head">
                  <span>AUDIT TITLE</span>
                  <span>STATUS</span>
                  <span>FRAGILITY</span>
                  <span>RISK ZONE</span>
                  <span>DATE</span>
                  <span>ACTION</span>
                </div>
                {audits.map((audit, i) => (
                  <div key={audit.id} className="db-table-row" style={{ animationDelay: `${i * 0.05}s` }}>
                    <span className="db-row-title">
                      <span className="db-row-idx">{String(i + 1).padStart(2, '0')}</span>
                      {audit.title || 'Untitled Audit'}
                    </span>
                    <span className="db-row-status" style={{ color: getStatusColor(audit.status) }}>
                      <span className="db-row-dot" style={{ background: getStatusColor(audit.status) }} />
                      {(audit.status || 'DRAFT').toUpperCase()}
                    </span>
                    <span className="db-row-score" style={{ color: getRiskColor(audit.fragility_score) }}>
                      {audit.fragility_score ? `${audit.fragility_score}/100` : '—'}
                    </span>
                    <span className="db-row-zone" style={{ color: getRiskColor(audit.fragility_score), borderColor: `${getRiskColor(audit.fragility_score)}33` }}>
                      {getRiskZone(audit.fragility_score)}
                    </span>
                    <span className="db-row-date">
                      {new Date(audit.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                    <a
                      href={audit.status === 'complete' ? `/audit/${audit.id}/report` : `/audit/${audit.id}/intake`}
                      className="db-row-btn"
                    >
                      {audit.status === 'complete' ? 'VIEW REPORT' : 'CONTINUE'} →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {audits.length === 0 && !loading && (
            <div className="db-section">
              <div className="db-section-header">
                <div className="db-section-title">
                  <span className="db-section-icon">▲</span>
                  HOW YOUR AUDIT WORKS
                </div>
              </div>
              <div className="db-how-grid">
                {[
                  { n: '01', icon: '◈', title: '7-DIMENSION INTAKE',     desc: 'Fill structured intake across 7 startup dimensions. ~10 mins.' },
                  { n: '02', icon: '⬡', title: '5 ADVERSARIAL AGENTS',   desc: '5 AI agents attack your startup structure simultaneously.' },
                  { n: '03', icon: '▲', title: 'FRAGILITY INDEX OUTPUT', desc: 'Get your 0-100 deterministic score + correction roadmap.' },
                ].map(s => (
                  <div key={s.n} className="db-how-card">
                    <div className="db-how-num">{s.n}</div>
                    <div className="db-how-icon">{s.icon}</div>
                    <div className="db-how-title">{s.title}</div>
                    <div className="db-how-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .db-wrap { min-height:100vh; background:#050609; color:#F0F4FF; font-family:'Barlow Condensed',sans-serif; display:flex; flex-direction:column; }
        .db-header { height:56px; background:rgba(5,6,9,0.95); border-bottom:1px solid #162035; display:flex; align-items:center; justify-content:space-between; padding:0 24px; position:sticky; top:0; z-index:100; flex-shrink:0; }
        .db-header::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#D63031,transparent); opacity:0.4; }
        .db-header-left { display:flex; align-items:center; gap:16px; }
        .db-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
        .db-logo-text { font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:.12em; color:#F0F4FF; }
        .db-logo-text span { color:#D63031; font-size:9px; vertical-align:super; }
        .db-breadcrumb { display:flex; align-items:center; gap:8px; }
        .db-bc-sep { color:#2A3A55; font-size:16px; }
        .db-bc-page { font-family:'DM Mono',monospace; font-size:10px; color:#6B7FA3; letter-spacing:.2em; }
        .db-header-right { display:flex; align-items:center; gap:16px; }
        .db-clock { font-family:'Orbitron',monospace; font-size:12px; color:#D63031; letter-spacing:.1em; min-width:70px; }
        .db-user-pill { display:flex; align-items:center; gap:8px; background:#0C1020; border:1px solid #162035; padding:6px 14px; }
        .db-user-dot { width:6px; height:6px; border-radius:50%; background:#00B894; animation:blinkAnim 2s ease infinite; flex-shrink:0; }
        .db-user-name { font-family:'DM Mono',monospace; font-size:11px; color:#A0B4CC; letter-spacing:.1em; }
        .db-logout { background:transparent; border:1px solid #1E2D45; color:#6B7FA3; padding:6px 14px; font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.1em; cursor:pointer; transition:all .2s; }
        .db-logout:hover { border-color:#D63031; color:#D63031; }
        .db-body { display:flex; flex:1; overflow:hidden; }
        .db-sidebar { width:220px; background:#080B12; border-right:1px solid #162035; display:flex; flex-direction:column; justify-content:space-between; flex-shrink:0; }
        .db-nav { display:flex; flex-direction:column; padding:16px 0; }
        .db-nav-item { display:flex; align-items:center; gap:12px; padding:13px 20px; text-decoration:none; color:#6B7FA3; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.1em; transition:all .2s; position:relative; border-left:2px solid transparent; }
        .db-nav-item:hover { color:#A0B4CC; background:rgba(255,255,255,.02); border-left-color:#2A3A55; }
        .db-nav-item.active { color:#D63031; background:rgba(214,48,49,.05); border-left-color:#D63031; }
        .db-nav-icon { font-size:14px; width:18px; text-align:center; flex-shrink:0; }
        .db-nav-label { flex:1; }
        .db-nav-indicator { width:4px; height:4px; border-radius:50%; background:#D63031; animation:blinkAnim 1.5s ease infinite; }
        .db-sidebar-bottom { padding:16px; border-top:1px solid #162035; }
        .db-sys-block { background:#0C1020; border:1px solid #162035; padding:14px; }
        .db-sys-title { font-family:'DM Mono',monospace; font-size:9px; color:#D63031; letter-spacing:.25em; margin-bottom:12px; }
        .db-sys-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
        .db-sys-row:last-child { margin-bottom:0; }
        .db-sys-label { font-family:'DM Mono',monospace; font-size:10px; color:#6B7FA3; }
        .db-sys-status { display:flex; align-items:center; gap:5px; font-family:'DM Mono',monospace; font-size:10px; color:#00B894; }
        .db-sys-dot { width:5px; height:5px; border-radius:50%; background:#00B894; animation:blinkAnim 2s ease infinite; }
        .db-main { flex:1; overflow-y:auto; padding:32px; display:flex; flex-direction:column; gap:28px; }
        .db-welcome { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .db-welcome-label { font-family:'DM Mono',monospace; font-size:10px; color:#D63031; letter-spacing:.3em; margin-bottom:6px; }
        .db-welcome-title { font-family:'Barlow Condensed',sans-serif; font-size:clamp(28px,3vw,42px); font-weight:900; line-height:.95; letter-spacing:-.01em; }
        .db-welcome-title span { color:#D63031; }
        .db-new-btn { background:#D63031; color:white; border:none; padding:13px 24px; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:.12em; cursor:pointer; transition:all .3s; clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px)); white-space:nowrap; }
        .db-new-btn:hover { box-shadow:0 0 24px rgba(214,48,49,.5); transform:translateY(-1px); }
        .db-stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; }
        .db-stat-card { background:#0C1020; border:1px solid #162035; padding:22px 20px; position:relative; overflow:hidden; transition:border-color .2s; }
        .db-stat-card:hover { border-color:#1E2D45; }
        .db-stat-bar { position:absolute; bottom:0; left:0; right:0; height:2px; }
        .db-stat-val { font-family:'Orbitron',monospace; font-size:32px; font-weight:900; line-height:1; margin-bottom:6px; }
        .db-stat-unit { font-size:14px; opacity:.6; }
        .db-stat-label { font-family:'DM Mono',monospace; font-size:9px; color:#6B7FA3; letter-spacing:.2em; }
        .db-section { background:#080B12; border:1px solid #162035; overflow:hidden; }
        .db-section-header { padding:16px 24px; background:#0C1020; border-bottom:1px solid #162035; display:flex; align-items:center; justify-content:space-between; }
        .db-section-title { display:flex; align-items:center; gap:10px; font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:.1em; color:#F0F4FF; }
        .db-section-icon { color:#D63031; }
        .db-section-count { font-family:'DM Mono',monospace; font-size:10px; color:#2A3A55; letter-spacing:.15em; }
        .db-loading { padding:60px; display:flex; flex-direction:column; align-items:center; gap:16px; font-family:'DM Mono',monospace; font-size:12px; color:#2A3A55; letter-spacing:.15em; }
        .db-loading-dots { display:flex; gap:6px; }
        .db-loading-dots span { width:6px; height:6px; background:#D63031; border-radius:50%; animation:loadDot .8s ease infinite; }
        .db-loading-dots span:nth-child(2){animation-delay:.15s} .db-loading-dots span:nth-child(3){animation-delay:.3s}
        @keyframes loadDot{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        .db-empty { padding:64px 32px; text-align:center; }
        .db-empty-icon { font-size:40px; color:#1E2D45; margin-bottom:16px; }
        .db-empty-title { font-family:'Orbitron',monospace; font-size:18px; font-weight:700; color:#2A3A55; letter-spacing:.1em; margin-bottom:10px; }
        .db-empty-desc { font-family:'DM Mono',monospace; font-size:12px; color:#2A3A55; margin-bottom:28px; line-height:1.7; }
        .db-empty-btn { background:#D63031; color:white; border:none; padding:14px 28px; font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:.12em; cursor:pointer; transition:all .3s; clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px)); }
        .db-empty-btn:hover { box-shadow:0 0 24px rgba(214,48,49,.5); transform:translateY(-1px); }
        .db-table-wrap { display:flex; flex-direction:column; }
        .db-table-head { display:grid; grid-template-columns:2fr 1fr 1fr 1.2fr 1fr 1fr; padding:10px 24px; font-family:'DM Mono',monospace; font-size:9px; color:#2A3A55; letter-spacing:.2em; border-bottom:1px solid #162035; background:#050609; }
        .db-table-row { display:grid; grid-template-columns:2fr 1fr 1fr 1.2fr 1fr 1fr; padding:14px 24px; border-bottom:1px solid #0C1020; align-items:center; transition:background .2s; animation:fadeUp .4s ease both; }
        .db-table-row:hover { background:#0C1020; }
        .db-table-row:last-child { border-bottom:none; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blinkAnim{0%,100%{opacity:1}50%{opacity:0.1}}
        .db-row-title { font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:700; color:#F0F4FF; display:flex; align-items:center; gap:10px; }
        .db-row-idx { font-family:'DM Mono',monospace; font-size:10px; color:#2A3A55; }
        .db-row-status { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.1em; display:flex; align-items:center; gap:6px; }
        .db-row-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
        .db-row-score { font-family:'Orbitron',monospace; font-size:14px; font-weight:700; }
        .db-row-zone { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.1em; border:1px solid; padding:3px 8px; display:inline-block; width:fit-content; }
        .db-row-date { font-family:'DM Mono',monospace; font-size:10px; color:#6B7FA3; }
        .db-row-btn { font-family:'DM Mono',monospace; font-size:10px; color:#D63031; text-decoration:none; letter-spacing:.08em; border:1px solid rgba(214,48,49,.2); padding:6px 12px; transition:all .2s; display:inline-block; width:fit-content; }
        .db-row-btn:hover { background:rgba(214,48,49,.08); border-color:#D63031; }
        .db-how-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; }
        .db-how-card { background:#0C1020; padding:28px 24px; position:relative; overflow:hidden; border:1px solid #162035; transition:border-color .2s; }
        .db-how-card:hover { border-color:#1E2D45; }
        .db-how-num { font-family:'Orbitron',monospace; font-size:52px; font-weight:900; position:absolute; top:8px; right:14px; opacity:.04; color:#D63031; }
        .db-how-icon { font-size:22px; color:#D63031; margin-bottom:14px; }
        .db-how-title { font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:800; color:#D63031; letter-spacing:.05em; margin-bottom:8px; }
        .db-how-desc { font-family:'DM Mono',monospace; font-size:11px; color:#6B7FA3; line-height:1.7; }
        @media(max-width:900px){
          .db-body{flex-direction:column;}
          .db-sidebar{width:100%;flex-direction:row;height:auto;}
          .db-nav{flex-direction:row;padding:0;}
          .db-stats-row{grid-template-columns:repeat(2,1fr);}
          .db-how-grid{grid-template-columns:1fr;}
          .db-table-head,.db-table-row{grid-template-columns:1fr 1fr 1fr;}
        }
      `}</style>
    </div>
  )
}