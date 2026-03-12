'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PreviewPage() {
  const params = useParams()
  const auditId = params.id
  const [audit, setAudit] = useState(null)
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    Promise.all([
      supabase.from('audits').select('*').eq('id', auditId).single(),
      supabase.from('agent_outputs').select('*').eq('audit_id', auditId)
    ]).then(([{ data: auditData }, { data: agentData }]) => {
      setAudit(auditData)
      setAgents(agentData || [])
      setLoading(false)
    })
  }, [auditId])

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

  if (!mounted || loading) return (
    <div style={{ minHeight:'100vh', background:'#050609', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Mono',monospace", color:'#D63031', fontSize:13, letterSpacing:'.2em' }}>
      LOADING RESULTS...
    </div>
  )

  const score = audit?.fragility_score
  const color = getRiskColor(score)
  const zone = getRiskZone(score)
  // Show only first agent weakness as teaser
  const teaserAgent = agents[0]
  const teaserWeakness = teaserAgent?.weaknesses?.[0] || 'Analysis complete — unlock full report to view.'

  return (
    <div className="prev-wrap">
      <header className="prev-header">
        <a href="/dashboard" className="prev-back">← DASHBOARD</a>
        <div className="prev-logo">
          <div className="prev-hex">DA</div>
          <span className="prev-logo-text">DEVILS ADVOCATE <span>2.0</span></span>
        </div>
        <div className="prev-badge">FREE PREVIEW</div>
      </header>

      <div className="prev-body">

        {/* SCORE HERO */}
        <div className="prev-hero" style={{ borderColor: `${color}33` }}>
          <div className="prev-hero-top">
            <div>
              <div className="prev-hero-label">STRUCTURAL FRAGILITY INDEX</div>
              <div className="prev-hero-title">{audit?.title || 'Untitled Audit'}</div>
            </div>
            <div className="prev-hero-date">
              {new Date(audit?.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
            </div>
          </div>

          <div className="prev-score-wrap">
            <div className="prev-score" style={{ color, textShadow:`0 0 40px ${color}88` }}>{score}</div>
            <div className="prev-score-denom">/100</div>
          </div>

          <div className="prev-zone" style={{ color, borderColor:`${color}44`, background:`${color}11` }}>
            {zone}
          </div>

          <div className="prev-zone-desc">
            {zone === 'CRITICAL' && 'Multiple fatal structural flaws detected. Immediate correction required before any capital deployment.'}
            {zone === 'HIGH RISK' && 'Significant structural weaknesses identified. High probability of failure without targeted intervention.'}
            {zone === 'MODERATE' && 'Moderate structural risk. Several assumptions need strengthening before investor readiness.'}
            {zone === 'RESILIENT' && 'Strong structural foundation. Minor optimizations recommended for maximum defensibility.'}
          </div>
        </div>

        {/* AGENT SCORES — partially blurred */}
        <div className="prev-section">
          <div className="prev-section-head">
            <span className="prev-section-icon" style={{ color:'#D63031' }}>⬡</span>
            AGENT DIMENSION SCORES
          </div>

          <div className="prev-agents">
            {/* Show first agent score, blur rest */}
            {[
              { name:'MARKET SKEPTIC',        icon:'⬡', color:'#D63031' },
              { name:'FINANCIAL REALIST',      icon:'◈', color:'#E17055' },
              { name:'COMPETITOR STRATEGIST',  icon:'◆', color:'#FDCB6E' },
              { name:'REGULATORY ANALYST',     icon:'◎', color:'#74B9FF' },
              { name:'META RISK SYNTHESIZER',  icon:'▲', color:'#A29BFE' },
            ].map((a, i) => {
              const agentData = agents.find(ag => ag.agent_name === ['market_skeptic','financial_realist','competitor_strategist','regulatory_analyst','meta_risk_synthesizer'][i])
              const agentScore = agentData?.score || '??'
              const isLocked = i > 0

              return (
                <div key={a.name} className={`prev-agent-row ${isLocked ? 'locked' : ''}`}>
                  <span style={{ color: isLocked ? '#2A3A55' : a.color, fontSize:16 }}>{a.icon}</span>
                  <span className="prev-agent-name" style={{ color: isLocked ? '#2A3A55' : '#A0B4CC' }}>{a.name}</span>
                  <div className="prev-agent-bar-wrap">
                    <div className="prev-agent-bar" style={{
                      width: isLocked ? '60%' : `${agentScore}%`,
                      background: isLocked ? '#162035' : a.color,
                      filter: isLocked ? 'blur(3px)' : 'none',
                    }} />
                  </div>
                  <span className="prev-agent-score" style={{ color: isLocked ? '#162035' : a.color }}>
                    {isLocked ? '██' : `${agentScore}/100`}
                  </span>
                  {isLocked && <span className="prev-lock">🔒</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* TEASER WEAKNESS */}
        <div className="prev-section">
          <div className="prev-section-head">
            <span className="prev-section-icon" style={{ color:'#D63031' }}>◈</span>
            STRUCTURAL RISK HIGHLIGHT #1
          </div>
          <div className="prev-teaser">
            <div className="prev-teaser-tag">MARKET SKEPTIC FINDING</div>
            <div className="prev-teaser-text">"{teaserWeakness}"</div>
          </div>
          <div className="prev-teaser-locked">
            <div className="prev-locked-msg">
              🔒 <strong>4 more risk highlights</strong> locked — upgrade to Full Report
            </div>
          </div>
        </div>

        {/* UPGRADE CTA */}
        <div className="prev-upgrade" style={{ borderColor:`${color}33` }}>
          <div className="prev-upgrade-left">
            <div className="prev-upgrade-label">UNLOCK FULL STRUCTURAL REPORT</div>
            <h3 className="prev-upgrade-title">See Everything The Agents Found.</h3>
            <div className="prev-upgrade-features">
              {[
                'All 5 agent dimension scores',
                'Full shock survival matrix',
                'Priority correction roadmap',
                'Fatal flaw identification',
                'Downloadable PDF report',
              ].map(f => (
                <div key={f} className="prev-upgrade-feat">
                  <span style={{ color:'#00B894' }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
          <div className="prev-upgrade-right">
            <div className="prev-price-tag">
              <div className="prev-price-tier">TIER 1</div>
              <div className="prev-price-amt">₹299</div>
              <div className="prev-price-lbl">Full Structural Report</div>
            </div>
            <a href={`/audit/${auditId}/report`} className="prev-upgrade-btn">
              ▸ UNLOCK FULL REPORT →
            </a>
            <div className="prev-upgrade-note">Instant access · One-time payment</div>
          </div>
        </div>

        {/* Actions */}
        <div className="prev-actions">
          <a href="/dashboard" className="prev-act-btn ghost">← BACK TO DASHBOARD</a>
          <a href={`/audit/${auditId}/intake`} className="prev-act-btn ghost">↺ REDO INTAKE</a>
          <a href={`/audit/${auditId}/report`} className="prev-act-btn primary">▸ UNLOCK FULL REPORT →</a>
        </div>

      </div>

      <style>{`
        .prev-wrap { min-height:100vh; background:#050609; color:#F0F4FF; font-family:'Barlow Condensed',sans-serif; }
        .prev-header { height:52px; background:#080B12; border-bottom:1px solid #162035; display:flex; align-items:center; justify-content:space-between; padding:0 28px; position:sticky; top:0; z-index:10; }
        .prev-back { font-family:'DM Mono',monospace; font-size:11px; color:#6B7FA3; text-decoration:none; letter-spacing:.1em; transition:color .2s; }
        .prev-back:hover { color:#D63031; }
        .prev-logo { display:flex; align-items:center; gap:10px; }
        .prev-hex { width:28px; height:28px; background:#D63031; clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display:flex; align-items:center; justify-content:center; font-family:'Orbitron',monospace; font-size:9px; font-weight:900; color:white; }
        .prev-logo-text { font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:.12em; }
        .prev-logo-text span { color:#D63031; font-size:9px; vertical-align:super; }
        .prev-badge { font-family:'DM Mono',monospace; font-size:9px; color:#FDCB6E; border:1px solid rgba(253,203,110,.3); padding:4px 12px; letter-spacing:.2em; }

        .prev-body { max-width:800px; margin:0 auto; padding:40px 24px; display:flex; flex-direction:column; gap:24px; }

        .prev-hero { background:#080B12; border:1px solid; padding:40px; text-align:center; position:relative; overflow:hidden; }
        .prev-hero::before { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:400px; height:300px; background:radial-gradient(ellipse,rgba(214,48,49,.06) 0%,transparent 70%); pointer-events:none; }
        .prev-hero-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:32px; text-align:left; }
        .prev-hero-label { font-family:'DM Mono',monospace; font-size:9px; color:#D63031; letter-spacing:.3em; margin-bottom:6px; }
        .prev-hero-title { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:800; color:#F0F4FF; }
        .prev-hero-date { font-family:'DM Mono',monospace; font-size:10px; color:#2A3A55; }
        .prev-score-wrap { display:flex; align-items:baseline; justify-content:center; gap:8px; margin-bottom:16px; }
        .prev-score { font-family:'Orbitron',monospace; font-size:96px; font-weight:900; line-height:1; transition:color .5s; }
        .prev-score-denom { font-family:'Orbitron',monospace; font-size:28px; color:#2A3A55; }
        .prev-zone { display:inline-block; font-family:'DM Mono',monospace; font-size:12px; letter-spacing:.25em; border:1px solid; padding:6px 20px; margin-bottom:16px; }
        .prev-zone-desc { font-family:'DM Mono',monospace; font-size:12px; color:#6B7FA3; line-height:1.7; max-width:500px; margin:0 auto; }

        .prev-section { background:#080B12; border:1px solid #162035; overflow:hidden; }
        .prev-section-head { padding:14px 24px; background:#0C1020; border-bottom:1px solid #162035; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:.1em; display:flex; align-items:center; gap:10px; }
        .prev-section-icon { font-size:14px; }

        .prev-agents { padding:16px 24px; display:flex; flex-direction:column; gap:12px; }
        .prev-agent-row { display:flex; align-items:center; gap:12px; }
        .prev-agent-row.locked { opacity:.6; }
        .prev-agent-name { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.06em; width:200px; flex-shrink:0; }
        .prev-agent-bar-wrap { flex:1; height:3px; background:#162035; overflow:hidden; }
        .prev-agent-bar { height:100%; transition:width .8s ease; }
        .prev-agent-score { font-family:'Orbitron',monospace; font-size:12px; font-weight:700; width:60px; text-align:right; }
        .prev-lock { font-size:12px; }

        .prev-teaser { padding:20px 24px; border-bottom:1px solid #162035; }
        .prev-teaser-tag { font-family:'DM Mono',monospace; font-size:9px; color:#D63031; letter-spacing:.2em; margin-bottom:10px; }
        .prev-teaser-text { font-family:'DM Mono',monospace; font-size:13px; color:#A0B4CC; line-height:1.7; font-style:italic; }
        .prev-teaser-locked { padding:16px 24px; background:#0C1020; }
        .prev-locked-msg { font-family:'DM Mono',monospace; font-size:12px; color:#6B7FA3; }
        .prev-locked-msg strong { color:#FDCB6E; }

        .prev-upgrade { background:#080B12; border:1px solid; padding:36px; display:grid; grid-template-columns:1fr auto; gap:40px; align-items:center; }
        .prev-upgrade-label { font-family:'DM Mono',monospace; font-size:9px; color:#D63031; letter-spacing:.3em; margin-bottom:10px; }
        .prev-upgrade-title { font-family:'Barlow Condensed',sans-serif; font-size:28px; font-weight:900; margin-bottom:16px; }
        .prev-upgrade-features { display:flex; flex-direction:column; gap:8px; }
        .prev-upgrade-feat { font-family:'DM Mono',monospace; font-size:12px; color:#A0B4CC; display:flex; gap:10px; }
        .prev-upgrade-right { display:flex; flex-direction:column; align-items:center; gap:16px; }
        .prev-price-tag { text-align:center; }
        .prev-price-tier { font-family:'DM Mono',monospace; font-size:9px; color:#2A3A55; letter-spacing:.3em; margin-bottom:6px; }
        .prev-price-amt { font-family:'Orbitron',monospace; font-size:48px; font-weight:900; color:#D63031; text-shadow:0 0 20px rgba(214,48,49,.4); line-height:1; }
        .prev-price-lbl { font-family:'DM Mono',monospace; font-size:10px; color:#6B7FA3; margin-top:4px; }
        .prev-upgrade-btn { background:#D63031; color:white; padding:14px 28px; font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:.12em; text-decoration:none; transition:all .3s; clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px)); white-space:nowrap; display:block; text-align:center; }
        .prev-upgrade-btn:hover { box-shadow:0 0 24px rgba(214,48,49,.5); transform:translateY(-1px); }
        .prev-upgrade-note { font-family:'DM Mono',monospace; font-size:10px; color:#2A3A55; text-align:center; }

        .prev-actions { display:flex; gap:12px; flex-wrap:wrap; }
        .prev-act-btn { padding:12px 20px; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:.1em; text-decoration:none; transition:all .25s; clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px)); }
        .prev-act-btn.ghost { border:1px solid #1E2D45; color:#6B7FA3; }
        .prev-act-btn.ghost:hover { border-color:#D63031; color:#D63031; }
        .prev-act-btn.primary { background:#D63031; color:white; }
        .prev-act-btn.primary:hover { box-shadow:0 0 20px rgba(214,48,49,.4); transform:translateY(-1px); }
      `}</style>
    </div>
  )
}