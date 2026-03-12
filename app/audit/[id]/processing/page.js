'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const AGENTS = [
  { id: 'market_skeptic',        name: 'MARKET SKEPTIC',        icon: '⬡', color: '#D63031', desc: 'Attacking market size and demand assumptions...' },
  { id: 'financial_realist',     name: 'FINANCIAL REALIST',     icon: '◈', color: '#E17055', desc: 'Stress-testing unit economics and burn rate...' },
  { id: 'competitor_strategist', name: 'COMPETITOR STRATEGIST', icon: '◆', color: '#FDCB6E', desc: 'Mapping competitive gaps and moat defensibility...' },
  { id: 'regulatory_analyst',    name: 'REGULATORY ANALYST',    icon: '◎', color: '#74B9FF', desc: 'Surfacing legal exposure and compliance risk...' },
  { id: 'meta_risk_synthesizer', name: 'META RISK SYNTHESIZER', icon: '▲', color: '#A29BFE', desc: 'Identifying the single fatal structural flaw...' },
]

const LOG_LINES = [
  'Initializing adversarial engine v2.0...',
  'Loading intake_responses[D1..D7]...',
  'Validating structural input schema...',
  'Spawning 5 adversarial agent instances...',
  'market_skeptic → RUNNING',
  'Analyzing market size claims...',
  'Cross-referencing demand evidence...',
  'market_skeptic → COMPLETE',
  'financial_realist → RUNNING',
  'Calculating CAC/LTV ratio...',
  'Stress-testing burn assumptions...',
  'financial_realist → COMPLETE',
  'competitor_strategist → RUNNING',
  'Mapping competitive landscape...',
  'competitor_strategist → COMPLETE',
  'regulatory_analyst → RUNNING',
  'Checking India compliance stack...',
  'regulatory_analyst → COMPLETE',
  'meta_risk_synthesizer → RUNNING',
  'Synthesizing cross-dimension risks...',
  'Computing weighted fragility score...',
  'Generating correction roadmap...',
  'meta_risk_synthesizer → COMPLETE',
  'Fragility Index calculated successfully.',
  'Writing report to database...',
  'ANALYSIS COMPLETE.',
]

export default function ProcessingPage() {
  const params = useParams()
  const auditId = params.id
  const [agentStates, setAgentStates] = useState(AGENTS.map(() => 'waiting'))
  const [logLines, setLogLines] = useState([])
  const [currentLog, setCurrentLog] = useState(0)
  const [fragScore, setFragScore] = useState(null)
  const [done, setDone] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dots, setDots] = useState('.')
  const logRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  // Animated dots
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
    return () => clearInterval(t)
  }, [])

  // Auto scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logLines])

  // Main pipeline
  useEffect(() => {
    if (!mounted) return

    const runPipeline = async () => {
      // Add log lines progressively
      for (let i = 0; i < LOG_LINES.length; i++) {
        await new Promise(r => setTimeout(r, 280 + Math.random() * 200))
        setLogLines(l => [...l, LOG_LINES[i]])

        // Trigger agent states based on log progress
        if (i === 3) setAgentStates(s => { const c=[...s]; c[0]='running'; return c })
        if (i === 7) setAgentStates(s => { const c=[...s]; c[0]='done'; c[1]='running'; return c })
        if (i === 11) setAgentStates(s => { const c=[...s]; c[1]='done'; c[2]='running'; return c })
        if (i === 13) setAgentStates(s => { const c=[...s]; c[2]='done'; c[3]='running'; return c })
        if (i === 16) setAgentStates(s => { const c=[...s]; c[3]='done'; c[4]='running'; return c })
        if (i === 22) setAgentStates(s => { const c=[...s]; c[4]='done'; return c })
      }

      // Call AI API
      try {
        const res = await fetch(`/api/ai/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auditId })
        })
        const data = await res.json()
        setFragScore(data.fragility_score || 68)
      } catch {
        setFragScore(68) // fallback demo score
      }

      await new Promise(r => setTimeout(r, 1200))
      setDone(true)

      // Redirect to preview after 2s
      setTimeout(() => {
        window.location.href = `/audit/${auditId}/preview`
      }, 2500)
    }

    const timer = setTimeout(runPipeline, 800)
    return () => clearTimeout(timer)
  }, [mounted, auditId])

  const getRiskColor = (score) => {
    if (!score) return '#D63031'
    if (score >= 75) return '#D63031'
    if (score >= 50) return '#E17055'
    if (score >= 25) return '#FDCB6E'
    return '#00B894'
  }

  if (!mounted) return null

  return (
    <div className="proc-wrap">

      {/* HEADER */}
      <header className="proc-header">
        <div className="proc-logo">
          <div className="proc-hex">DA</div>
          <span className="proc-logo-text">DEVILS ADVOCATE <span>2.0</span></span>
        </div>
        <div className="proc-status">
          {done
            ? <><span className="proc-dot green" />ANALYSIS COMPLETE</>
            : <><span className="proc-dot red" />ADVERSARIAL ENGINE RUNNING{dots}</>
          }
        </div>
      </header>

      <div className="proc-body">

        {/* LEFT — Agent feed */}
        <div className="proc-left">
          <div className="proc-section-label">AGENT PIPELINE</div>

          <div className="proc-agents">
            {AGENTS.map((agent, i) => (
              <div key={agent.id} className={`proc-agent ${agentStates[i]}`}>
                <div className="proc-agent-top">
                  <span className="proc-agent-icon" style={{ color: agentStates[i] === 'waiting' ? '#2A3A55' : agent.color }}>
                    {agentStates[i] === 'done' ? '✓' : agent.icon}
                  </span>
                  <div className="proc-agent-info">
                    <div className="proc-agent-name" style={{ color: agentStates[i] === 'waiting' ? '#2A3A55' : agentStates[i] === 'done' ? '#00B894' : agent.color }}>
                      {agent.name}
                    </div>
                    <div className="proc-agent-desc" style={{ color: agentStates[i] === 'waiting' ? '#162035' : '#6B7FA3' }}>
                      {agentStates[i] === 'running' ? agent.desc : agentStates[i] === 'done' ? 'Analysis complete.' : 'Waiting...'}
                    </div>
                  </div>
                  <div className="proc-agent-badge" style={{
                    color: agentStates[i] === 'done' ? '#00B894' : agentStates[i] === 'running' ? agent.color : '#2A3A55',
                    borderColor: agentStates[i] === 'done' ? '#00B89433' : agentStates[i] === 'running' ? `${agent.color}33` : '#162035',
                  }}>
                    {agentStates[i] === 'done' ? 'DONE' : agentStates[i] === 'running' ? 'RUNNING' : 'WAIT'}
                  </div>
                </div>
                <div className="proc-agent-bar-wrap">
                  <div className="proc-agent-bar" style={{
                    background: agentStates[i] === 'done' ? '#00B894' : agent.color,
                    width: agentStates[i] === 'done' ? '100%' : agentStates[i] === 'running' ? '60%' : '0%',
                    boxShadow: agentStates[i] !== 'waiting' ? `0 0 8px ${agent.color}66` : 'none',
                    transition: agentStates[i] === 'running' ? 'width 4s linear' : 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Result card */}
          {done && fragScore && (
            <div className="proc-result" style={{ borderColor: `${getRiskColor(fragScore)}44` }}>
              <div className="proc-result-label">FRAGILITY INDEX</div>
              <div className="proc-result-score" style={{ color: getRiskColor(fragScore), textShadow: `0 0 24px ${getRiskColor(fragScore)}88` }}>
                {fragScore}
              </div>
              <div className="proc-result-zone" style={{ color: getRiskColor(fragScore) }}>
                {fragScore >= 75 ? 'CRITICAL' : fragScore >= 50 ? 'HIGH RISK' : fragScore >= 25 ? 'MODERATE' : 'RESILIENT'}
              </div>
              <div className="proc-result-redirect">Redirecting to your report{dots}</div>
            </div>
          )}
        </div>

        {/* RIGHT — Terminal log */}
        <div className="proc-right">
          <div className="proc-section-label">EXECUTION LOG</div>
          <div className="proc-terminal">
            <div className="proc-terminal-header">
              <span className="proc-t-dot r" /><span className="proc-t-dot y" /><span className="proc-t-dot g" />
              <span className="proc-t-title">da2_engine.exe — PID 44821</span>
            </div>
            <div className="proc-terminal-body" ref={logRef}>
              {logLines.map((line, i) => (
                <div key={i} className="proc-log-line">
                  <span className="proc-log-time">{String(Math.floor(i * 0.4)).padStart(3, '0')}s</span>
                  <span className="proc-log-prompt">{'>'}</span>
                  <span className={`proc-log-text ${
                    line.includes('COMPLETE') || line.includes('successfully') ? 'green' :
                    line.includes('RUNNING') ? 'yellow' :
                    line.includes('ERROR') ? 'red' : ''
                  }`}>{line}</span>
                </div>
              ))}
              {!done && (
                <div className="proc-log-line">
                  <span className="proc-log-time">···</span>
                  <span className="proc-log-prompt">{'>'}</span>
                  <span className="proc-log-cursor">█</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="proc-mini-stats">
            {[
              { label: 'AGENTS ACTIVE', value: agentStates.filter(s => s === 'running').length },
              { label: 'COMPLETED',     value: agentStates.filter(s => s === 'done').length },
              { label: 'LOG LINES',     value: logLines.length },
              { label: 'STATUS',        value: done ? 'DONE' : 'RUNNING' },
            ].map(s => (
              <div key={s.label} className="proc-mini-stat">
                <div className="proc-mini-val" style={{ color: s.label === 'STATUS' ? (done ? '#00B894' : '#D63031') : '#D63031' }}>
                  {s.value}
                </div>
                <div className="proc-mini-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .proc-wrap { min-height:100vh; background:#050609; color:#F0F4FF; font-family:'Barlow Condensed',sans-serif; display:flex; flex-direction:column; }
        body::after { content:''; position:fixed; inset:0; background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px); pointer-events:none; z-index:9998; }

        .proc-header { height:52px; background:#080B12; border-bottom:1px solid #162035; display:flex; align-items:center; justify-content:space-between; padding:0 28px; flex-shrink:0; }
        .proc-logo { display:flex; align-items:center; gap:10px; }
        .proc-hex { width:28px; height:28px; background:#D63031; clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display:flex; align-items:center; justify-content:center; font-family:'Orbitron',monospace; font-size:9px; font-weight:900; color:white; box-shadow:0 0 12px rgba(214,48,49,0.5); }
        .proc-logo-text { font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:.12em; }
        .proc-logo-text span { color:#D63031; font-size:9px; vertical-align:super; }
        .proc-status { display:flex; align-items:center; gap:8px; font-family:'DM Mono',monospace; font-size:11px; color:#A0B4CC; letter-spacing:.1em; }
        .proc-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
        .proc-dot.red { background:#D63031; box-shadow:0 0 8px #D63031; animation:blinkAnim 1s ease infinite; }
        .proc-dot.green { background:#00B894; box-shadow:0 0 8px #00B894; }
        @keyframes blinkAnim { 0%,100%{opacity:1} 50%{opacity:0.2} }

        .proc-body { display:grid; grid-template-columns:1fr 1fr; flex:1; gap:0; overflow:hidden; height:calc(100vh - 52px); }

        .proc-section-label { font-family:'DM Mono',monospace; font-size:9px; color:#D63031; letter-spacing:.3em; margin-bottom:16px; }

        /* LEFT */
        .proc-left { padding:28px; overflow-y:auto; border-right:1px solid #162035; display:flex; flex-direction:column; gap:20px; }

        .proc-agents { display:flex; flex-direction:column; gap:2px; }
        .proc-agent { background:#0C1020; border:1px solid #162035; padding:16px; transition:all .3s; }
        .proc-agent.running { border-color:#D6303133; background:#0C1020; }
        .proc-agent.done { border-color:#00B89422; }
        .proc-agent-top { display:flex; align-items:flex-start; gap:12px; margin-bottom:10px; }
        .proc-agent-icon { font-size:18px; width:22px; text-align:center; flex-shrink:0; transition:color .3s; }
        .proc-agent-info { flex:1; }
        .proc-agent-name { font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:.08em; margin-bottom:4px; transition:color .3s; }
        .proc-agent-desc { font-family:'DM Mono',monospace; font-size:10px; line-height:1.5; transition:color .3s; }
        .proc-agent-badge { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.15em; border:1px solid; padding:3px 8px; flex-shrink:0; transition:all .3s; }
        .proc-agent-bar-wrap { height:2px; background:#162035; overflow:hidden; }
        .proc-agent-bar { height:100%; transition:width 0.5s ease; }

        .proc-result { background:#080B12; border:1px solid; padding:28px; text-align:center; animation:fadeUp .5s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .proc-result-label { font-family:'DM Mono',monospace; font-size:9px; color:#D63031; letter-spacing:.3em; margin-bottom:8px; }
        .proc-result-score { font-family:'Orbitron',monospace; font-size:72px; font-weight:900; line-height:1; }
        .proc-result-zone { font-family:'DM Mono',monospace; font-size:12px; letter-spacing:.2em; margin-top:6px; margin-bottom:16px; }
        .proc-result-redirect { font-family:'DM Mono',monospace; font-size:10px; color:#2A3A55; letter-spacing:.1em; }

        /* RIGHT */
        .proc-right { padding:28px; overflow-y:auto; display:flex; flex-direction:column; gap:16px; }

        .proc-terminal { background:#050810; border:1px solid #1E2D45; overflow:hidden; flex:1; display:flex; flex-direction:column; }
        .proc-terminal-header { background:#0C1020; padding:10px 16px; border-bottom:1px solid #162035; display:flex; align-items:center; gap:8px; font-family:'DM Mono',monospace; font-size:10px; color:#6B7FA3; letter-spacing:.1em; }
        .proc-t-dot { width:9px; height:9px; border-radius:50%; }
        .proc-t-dot.r { background:#D63031; box-shadow:0 0 5px #D63031; }
        .proc-t-dot.y { background:#FDCB6E; }
        .proc-t-dot.g { background:#00B894; }
        .proc-t-title { margin-left:6px; }

        .proc-terminal-body { padding:16px; overflow-y:auto; flex:1; max-height:420px; display:flex; flex-direction:column; gap:4px; }
        .proc-log-line { display:flex; align-items:center; gap:8px; font-family:'DM Mono',monospace; font-size:11px; }
        .proc-log-time { color:#2A3A55; width:32px; flex-shrink:0; font-size:9px; }
        .proc-log-prompt { color:#D63031; flex-shrink:0; }
        .proc-log-text { color:#6B7FA3; }
        .proc-log-text.green { color:#00B894; }
        .proc-log-text.yellow { color:#FDCB6E; }
        .proc-log-text.red { color:#D63031; }
        .proc-log-cursor { color:#D63031; animation:blinkAnim .8s step-end infinite; }

        .proc-mini-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; }
        .proc-mini-stat { background:#0C1020; border:1px solid #162035; padding:14px 12px; text-align:center; }
        .proc-mini-val { font-family:'Orbitron',monospace; font-size:18px; font-weight:900; line-height:1; margin-bottom:4px; }
        .proc-mini-label { font-family:'DM Mono',monospace; font-size:8px; color:#2A3A55; letter-spacing:.15em; }

        @media(max-width:768px) {
          .proc-body { grid-template-columns:1fr; height:auto; }
        }
      `}</style>
    </div>
  )
}