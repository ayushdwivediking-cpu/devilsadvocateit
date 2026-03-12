'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ReportPage() {
  const params = useParams()
  const auditId = params.id
  const [audit, setAudit] = useState(null)
  const [agents, setAgents] = useState([])
  const [intake, setIntake] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    Promise.all([
      supabase.from('audits').select('*').eq('id', auditId).single(),
      supabase.from('agent_outputs').select('*').eq('audit_id', auditId),
      supabase.from('intake_responses').select('*').eq('audit_id', auditId),
    ]).then(([{ data: a }, { data: ag }, { data: ir }]) => {
      setAudit(a)
      setAgents(ag || [])
      setIntake(ir || [])
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

  const AGENT_META = [
    { id:'market_skeptic',        name:'MARKET SKEPTIC',        icon:'⬡', color:'#D63031', dim:'D1 + D2' },
    { id:'financial_realist',     name:'FINANCIAL REALIST',     icon:'◈', color:'#E17055', dim:'D4 + D6' },
    { id:'competitor_strategist', name:'COMPETITOR STRATEGIST', icon:'◆', color:'#FDCB6E', dim:'D3 + D5' },
    { id:'regulatory_analyst',    name:'REGULATORY ANALYST',    icon:'◎', color:'#74B9FF', dim:'D1 + D4' },
    { id:'meta_risk_synthesizer', name:'META RISK SYNTHESIZER', icon:'▲', color:'#A29BFE', dim:'ALL DIMS' },
  ]

  if (!mounted || loading) return (
    <div style={{ minHeight:'100vh', background:'#050609', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Mono',monospace", color:'#D63031', fontSize:13, letterSpacing:'.2em' }}>
      LOADING REPORT...
    </div>
  )

  const score = audit?.fragility_score
  const color = getRiskColor(score)
  const zone = getRiskZone(score)
  const metaAgent = agents.find(a => a.agent_name === 'meta_risk_synthesizer')
  const fatalFlaw = metaAgent?.raw_output?.fatal_flaw || 'Analysis complete.'
  const metaVerdict = metaAgent?.raw_output?.verdict || ''

  return (
    <div className="rep-wrap">

      {/* HEADER */}
      <header className="rep-header">
        <a href="/dashboard" className="rep-back">← DASHBOARD</a>
        <div className="rep-logo">
          <div className="rep-hex">DA</div>
          <span className="rep-logo-text">DEVILS ADVOCATE <span>2.0</span></span>
        </div>
        <div className="rep-badge" style={{ color:'#00B894', borderColor:'rgba(0,184,148,.3)' }}>FULL REPORT</div>
      </header>

      <div className="rep-body">

        {/* HERO SCORE */}
        <div className="rep-hero" style={{ borderColor:`${color}44` }}>
          <div className="rep-hero-bg" style={{ background:`radial-gradient(ellipse at center, ${color}08 0%, transparent 70%)` }} />
          <div className="rep-hero-content">
            <div className="rep-hero-left">
              <div className="rep-hero-label">STRUCTURAL FRAGILITY INDEX — FULL REPORT</div>
              <h1 className="rep-hero-title">{audit?.title || 'Untitled Audit'}</h1>
              <div className="rep-hero-meta">
                <span>Analyzed: {new Date(audit?.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}</span>
                <span className="rep-sep">·</span>
                <span>{agents.length} agents deployed</span>
                <span className="rep-sep">·</span>
                <span>7 dimensions assessed</span>
              </div>
            </div>
            <div className="rep-hero-right">
              <div className="rep-score" style={{ color, textShadow:`0 0 40px ${color}88` }}>{score}</div>
              <div className="rep-score-label">/100 FRAGILITY</div>
              <div className="rep-zone" style={{ color, borderColor:`${color}44`, background:`${color}11` }}>{zone}</div>
            </div>
          </div>
        </div>

        {/* FATAL FLAW */}
        {fatalFlaw && (
          <div className="rep-fatal" style={{ borderColor:`${color}44` }}>
            <div className="rep-fatal-label">▲ FATAL STRUCTURAL FLAW — META SYNTHESIS</div>
            <div className="rep-fatal-text">"{fatalFlaw}"</div>
            {metaVerdict && <div className="rep-fatal-verdict">META VERDICT: {metaVerdict}</div>}
          </div>
        )}

        {/* ALL AGENT SCORES */}
        <div className="rep-section">
          <div className="rep-section-head">
            <span style={{ color:'#D63031' }}>⬡</span> ADVERSARIAL AGENT BREAKDOWN
          </div>
          <div className="rep-agents">
            {AGENT_META.map(meta => {
              const agentData = agents.find(a => a.agent_name === meta.id)
              const agentScore = agentData?.score || 0
              const weaknesses = agentData?.weaknesses || []
              const flaw = agentData?.raw_output?.fatal_flaw || ''
              const verdict = agentData?.raw_output?.verdict || ''
              const aColor = getRiskColor(agentScore)

              return (
                <div key={meta.id} className="rep-agent-card" style={{ borderLeftColor: meta.color }}>
                  <div className="rep-agent-header">
                    <div className="rep-agent-left">
                      <span style={{ color:meta.color, fontSize:20 }}>{meta.icon}</span>
                      <div>
                        <div className="rep-agent-name" style={{ color:meta.color }}>{meta.name}</div>
                        <div className="rep-agent-dim">DIMENSIONS: {meta.dim}</div>
                      </div>
                    </div>
                    <div className="rep-agent-score-wrap">
                      <div className="rep-agent-score" style={{ color:aColor, textShadow:`0 0 12px ${aColor}66` }}>{agentScore}</div>
                      <div className="rep-agent-score-lbl" style={{ color:aColor }}>{getRiskZone(agentScore)}</div>
                    </div>
                  </div>

                  <div className="rep-agent-bar-wrap">
                    <div className="rep-agent-bar" style={{ width:`${agentScore}%`, background:aColor, boxShadow:`0 0 8px ${aColor}44` }} />
                  </div>

                  {weaknesses.length > 0 && (
                    <div className="rep-agent-weaknesses">
                      {weaknesses.map((w, i) => (
                        <div key={i} className="rep-weakness">
                          <span style={{ color:meta.color }}>◦</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {flaw && (
                    <div className="rep-agent-flaw">
                      <span className="rep-flaw-label" style={{ color:meta.color }}>FATAL FLAW:</span>
                      <span className="rep-flaw-text">{flaw}</span>
                    </div>
                  )}

                  {verdict && (
                    <div className="rep-agent-verdict">"{verdict}"</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* CORRECTION ROADMAP */}
        <div className="rep-section">
          <div className="rep-section-head">
            <span style={{ color:'#D63031' }}>◆</span> PRIORITY CORRECTION ROADMAP
          </div>
          <div className="rep-roadmap">
            {agents
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .slice(0, 5)
              .map((ag, i) => {
                const meta = AGENT_META.find(m => m.id === ag.agent_name)
                if (!meta) return null
                const flaw = ag.raw_output?.fatal_flaw || ag.weaknesses?.[0] || ''
                const priority = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OPTIONAL'][i] || 'LOW'
                const pColor = ['#D63031','#E17055','#FDCB6E','#74B9FF','#A29BFE'][i]
                return (
                  <div key={ag.agent_name} className="rep-roadmap-item">
                    <div className="rep-roadmap-num" style={{ color:pColor, borderColor:`${pColor}33` }}>{String(i+1).padStart(2,'0')}</div>
                    <div className="rep-roadmap-content">
                      <div className="rep-roadmap-priority" style={{ color:pColor }}>{priority} PRIORITY — {meta.name}</div>
                      <div className="rep-roadmap-action">{flaw}</div>
                    </div>
                    <div className="rep-roadmap-score" style={{ color:getRiskColor(ag.score) }}>{ag.score}</div>
                  </div>
                )
              })
            }
          </div>
        </div>

        {/* ACTIONS */}
        <div className="rep-actions">
          <a href="/dashboard" className="rep-act-btn ghost">← DASHBOARD</a>
          <a href={`/audit/${auditId}/intake`} className="rep-act-btn ghost">↺ REDO INTAKE</a>
          <button onClick={() => window.print()} className="rep-act-btn primary">⬇ DOWNLOAD PDF</button>
        </div>

      </div>

      <style>{`
        .rep-wrap { min-height:100vh; background:#050609; color:#F0F4FF; font-family:'Barlow Condensed',sans-serif; }
        .rep-header { height:52px; background:#080B12; border-bottom:1px solid #162035; display:flex; align-items:center; justify-content:space-between; padding:0 28px; position:sticky; top:0; z-index:10; }
        .rep-back { font-family:'DM Mono',monospace; font-size:11px; color:#6B7FA3; text-decoration:none; letter-spacing:.1em; }
        .rep-back:hover { color:#D63031; }
        .rep-logo { display:flex; align-items:center; gap:10px; }
        .rep-hex { width:28px; height:28px; background:#D63031; clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display:flex; align-items:center; justify-content:center; font-family:'Orbitron',monospace; font-size:9px; font-weight:900; color:white; }
        .rep-logo-text { font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:.12em; }
        .rep-logo-text span { color:#D63031; font-size:9px; vertical-align:super; }
        .rep-badge { font-family:'DM Mono',monospace; font-size:9px; border:1px solid; padding:4px 12px; letter-spacing:.2em; }

        .rep-body { max-width:900px; margin:0 auto; padding:40px 24px; display:flex; flex-direction:column; gap:24px; }

        .rep-hero { background:#080B12; border:1px solid; padding:40px; position:relative; overflow:hidden; }
        .rep-hero-bg { position:absolute; inset:0; pointer-events:none; }
        .rep-hero-content { position:relative; display:flex; justify-content:space-between; align-items:center; gap:32px; flex-wrap:wrap; }
        .rep-hero-label { font-family:'DM Mono',monospace; font-size:9px; color:#D63031; letter-spacing:.25em; margin-bottom:10px; }
        .rep-hero-title { font-family:'Barlow Condensed',sans-serif; font-size:clamp(24px,3vw,36px); font-weight:900; margin-bottom:12px; }
        .rep-hero-meta { font-family:'DM Mono',monospace; font-size:11px; color:#6B7FA3; display:flex; gap:8px; flex-wrap:wrap; }
        .rep-sep { color:#2A3A55; }
        .rep-hero-right { text-align:center; flex-shrink:0; }
        .rep-score { font-family:'Orbitron',monospace; font-size:80px; font-weight:900; line-height:1; }
        .rep-score-label { font-family:'DM Mono',monospace; font-size:11px; color:#2A3A55; letter-spacing:.2em; margin-bottom:10px; }
        .rep-zone { display:inline-block; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.2em; border:1px solid; padding:5px 16px; }

        .rep-fatal { background:#080B12; border:1px solid; padding:28px; }
        .rep-fatal-label { font-family:'DM Mono',monospace; font-size:9px; color:#D63031; letter-spacing:.25em; margin-bottom:14px; }
        .rep-fatal-text { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:700; color:#F0F4FF; line-height:1.5; margin-bottom:12px; font-style:italic; }
        .rep-fatal-verdict { font-family:'DM Mono',monospace; font-size:12px; color:#6B7FA3; line-height:1.7; border-top:1px solid #162035; padding-top:12px; }

        .rep-section { background:#080B12; border:1px solid #162035; overflow:hidden; }
        .rep-section-head { padding:14px 24px; background:#0C1020; border-bottom:1px solid #162035; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:.1em; display:flex; align-items:center; gap:10px; }

        .rep-agents { padding:16px; display:flex; flex-direction:column; gap:2px; }
        .rep-agent-card { background:#0C1020; border:1px solid #162035; border-left:3px solid; padding:20px; transition:border-color .2s; }
        .rep-agent-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
        .rep-agent-left { display:flex; align-items:center; gap:12px; }
        .rep-agent-name { font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:.08em; margin-bottom:4px; }
        .rep-agent-dim { font-family:'DM Mono',monospace; font-size:9px; color:#2A3A55; letter-spacing:.15em; }
        .rep-agent-score-wrap { text-align:right; }
        .rep-agent-score { font-family:'Orbitron',monospace; font-size:32px; font-weight:900; line-height:1; }
        .rep-agent-score-lbl { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.15em; margin-top:2px; }
        .rep-agent-bar-wrap { height:2px; background:#162035; margin-bottom:14px; overflow:hidden; }
        .rep-agent-bar { height:100%; transition:width 1s ease; }
        .rep-agent-weaknesses { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
        .rep-weakness { display:flex; gap:8px; font-family:'DM Mono',monospace; font-size:11px; color:#6B7FA3; line-height:1.5; }
        .rep-agent-flaw { background:#050609; border:1px solid #162035; padding:10px 14px; margin-bottom:10px; }
        .rep-flaw-label { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.15em; margin-right:10px; }
        .rep-flaw-text { font-family:'DM Mono',monospace; font-size:11px; color:#A0B4CC; }
        .rep-agent-verdict { font-family:'DM Mono',monospace; font-size:11px; color:#2A3A55; font-style:italic; border-top:1px solid #162035; padding-top:10px; }

        .rep-roadmap { padding:16px 24px; display:flex; flex-direction:column; gap:2px; }
        .rep-roadmap-item { display:flex; align-items:flex-start; gap:16px; padding:16px; background:#0C1020; border:1px solid #162035; }
        .rep-roadmap-num { font-family:'Orbitron',monospace; font-size:22px; font-weight:900; border:1px solid; padding:6px 10px; line-height:1; flex-shrink:0; }
        .rep-roadmap-content { flex:1; }
        .rep-roadmap-priority { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.15em; margin-bottom:6px; }
        .rep-roadmap-action { font-family:'DM Mono',monospace; font-size:12px; color:#A0B4CC; line-height:1.6; }
        .rep-roadmap-score { font-family:'Orbitron',monospace; font-size:24px; font-weight:900; flex-shrink:0; }

        .rep-actions { display:flex; gap:12px; flex-wrap:wrap; }
        .rep-act-btn { padding:12px 20px; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:.1em; text-decoration:none; transition:all .25s; cursor:pointer; clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px)); }
        .rep-act-btn.ghost { border:1px solid #1E2D45; color:#6B7FA3; background:transparent; }
        .rep-act-btn.ghost:hover { border-color:#D63031; color:#D63031; }
        .rep-act-btn.primary { background:#D63031; color:white; border:none; }
        .rep-act-btn.primary:hover { box-shadow:0 0 20px rgba(214,48,49,.4); }

        @media print {
          .rep-header, .rep-actions { display:none; }
          .rep-body { padding:20px; }
          .rep-wrap { background:white; color:black; }
        }
      `}</style>
    </div>
  )
}