'use client'
import { useState, useEffect, useRef } from 'react'

/* ─── PARTICLE CANVAS ─── */
function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let W = window.innerWidth, H = window.innerHeight
    canvas.width = W; canvas.height = H
    const resize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H }
    window.addEventListener('resize', resize)
    const N = 70
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.4,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(214,48,49,${0.1 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(214,48,49,0.45)'; ctx.fill()
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.55, pointerEvents: 'none' }} />
}

/* ─── CUSTOM CURSOR ─── */
function CustomCursor() {
  const cRef = useRef(null), dRef = useRef(null)
  useEffect(() => {
    const mv = (e) => {
      if (cRef.current) { cRef.current.style.left = e.clientX + 'px'; cRef.current.style.top = e.clientY + 'px' }
      if (dRef.current) { dRef.current.style.left = e.clientX + 'px'; dRef.current.style.top = e.clientY + 'px' }
    }
    window.addEventListener('mousemove', mv)
    return () => window.removeEventListener('mousemove', mv)
  }, [])
  return (
    <>
      <div ref={cRef} style={{ position: 'fixed', width: 22, height: 22, border: '1px solid #D63031', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 99999, transition: 'width 0.15s, height 0.15s', mixBlendMode: 'difference' }} />
      <div ref={dRef} style={{ position: 'fixed', width: 4, height: 4, background: '#D63031', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 99999, borderRadius: '50%' }} />
    </>
  )
}

/* ─── GLITCH ─── */
function GlitchText({ text, style = {} }) {
  return <span className="glitch" data-text={text} style={style}>{text}</span>
}

/* ─── COUNTER ─── */
function useCounter(target, duration = 2400, delay = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 4)
        setVal(Math.round(ease * target))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(t)
  }, [target, duration, delay])
  return val
}

/* ─── IN-VIEW ─── */
function useInView(threshold = 0.1) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

/* ─── TERMINAL ─── */
function Terminal({ lines, trigger }) {
  const [shown, setShown] = useState([])
  const [cl, setCl] = useState(0)
  const [cc, setCc] = useState(0)
  useEffect(() => {
    if (!trigger || cl >= lines.length) return
    if (cc < lines[cl].length) {
      const t = setTimeout(() => {
        setShown(s => { const c = [...s]; c[cl] = (c[cl] || '') + lines[cl][cc]; return c })
        setCc(x => x + 1)
      }, 22)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => { setCl(x => x + 1); setCc(0) }, 160)
      return () => clearTimeout(t)
    }
  }, [trigger, cl, cc, lines])
  return (
    <div style={{ background: '#050810', border: '1px solid #162035', overflow: 'hidden', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
      <div style={{ background: '#0C1020', padding: '10px 16px', borderBottom: '1px solid #162035', fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#D63031', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#D63031', boxShadow: '0 0 6px #D63031', display: 'inline-block', animation: 'blinkAnim 1s ease infinite' }} />
        da2_analysis.exe
      </div>
      <div style={{ padding: '20px', minHeight: 200, fontFamily: "'DM Mono',monospace" }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: '#D63031' }}>{'>'}</span>
            <span style={{ color: i < cl ? '#8AB4F8' : i === cl ? '#8AB4F8' : '#2A3A55' }}>{i <= cl ? (shown[i] || '') : line}</span>
            {i === cl && <span style={{ color: '#D63031', animation: 'blinkAnim 0.8s step-end infinite' }}>█</span>}
            {i < cl && <span style={{ color: '#00B894', fontSize: 10 }}> ✓</span>}
          </div>
        ))}
        {cl >= lines.length && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, fontSize: 12 }}>
            <span style={{ color: '#D63031' }}>{'>'}</span>
            <span style={{ color: '#6B7FA3' }}>FRAGILITY INDEX: <span style={{ color: '#D63031', fontWeight: 700, textShadow: '0 0 8px #D63031' }}>68 / HIGH RISK</span></span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── AGENT FEED ─── */
function AgentFeed({ trigger }) {
  const agents = [
    { name: 'MARKET_SKEPTIC', icon: '⬡', color: '#D63031', delay: 0 },
    { name: 'FINANCIAL_REALIST', icon: '◈', color: '#E17055', delay: 800 },
    { name: 'COMPETITOR_STRATEGIST', icon: '◆', color: '#FDCB6E', delay: 1600 },
    { name: 'REGULATORY_ANALYST', icon: '◎', color: '#74B9FF', delay: 2400 },
    { name: 'META_RISK_SYNTHESIZER', icon: '▲', color: '#A29BFE', delay: 3200 },
  ]
  const scores = [42, 61, 55, 78, 68]
  const [states, setStates] = useState(agents.map(() => 'idle'))
  useEffect(() => {
    if (!trigger) return
    agents.forEach((a, i) => {
      setTimeout(() => {
        setStates(s => { const c = [...s]; c[i] = 'running'; return c })
        setTimeout(() => { setStates(s => { const c = [...s]; c[i] = 'done'; return c }) }, 650)
      }, a.delay)
    })
  }, [trigger])
  return (
    <div style={{ background: '#060910', border: '1px solid #1E2D45', overflow: 'hidden', fontFamily: "'DM Mono',monospace" }}>
      <div style={{ background: '#0C1020', padding: '10px 16px', borderBottom: '1px solid #162035', fontSize: 10, color: '#D63031', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D63031', animation: 'blinkAnim 1s ease infinite', display: 'inline-block' }} />
        ADVERSARIAL ENGINE — LIVE
        <span style={{ marginLeft: 'auto', color: '#2A3A55', fontSize: 9 }}>PID: 44821</span>
      </div>
      {agents.map((a, i) => (
        <div key={a.name} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
          borderBottom: '1px solid #162035',
          background: states[i] === 'running' ? 'rgba(214,48,49,0.04)' : states[i] === 'done' ? 'rgba(0,184,148,0.02)' : 'transparent',
          transition: 'background 0.3s'
        }}>
          <span style={{ fontSize: 16, width: 20, textAlign: 'center', color: states[i] === 'idle' ? '#2A3A55' : a.color }}>{a.icon}</span>
          <span style={{ width: 210, fontSize: 11, letterSpacing: '0.08em', color: states[i] === 'idle' ? '#2A3A55' : a.color, transition: 'color 0.3s' }}>{a.name}</span>
          <div style={{ flex: 1, height: 3, background: '#162035', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: a.color,
              width: states[i] === 'done' ? `${scores[i]}%` : '0%',
              boxShadow: states[i] === 'done' ? `0 0 8px ${a.color}88` : 'none',
              transition: 'width 0.9s cubic-bezier(0.34,1.2,0.64,1)'
            }} />
          </div>
          <span style={{ width: 28, textAlign: 'right', fontSize: 13, fontWeight: 700, color: states[i] === 'done' ? a.color : '#2A3A55', transition: 'color 0.3s' }}>
            {states[i] === 'done' ? scores[i] : states[i] === 'running' ? '···' : '—'}
          </span>
          <span style={{ width: 60, textAlign: 'right', fontSize: 9, letterSpacing: '0.1em', color: states[i] === 'done' ? '#00B894' : states[i] === 'running' ? a.color : '#2A3A55', transition: 'color 0.3s' }}>
            {states[i] === 'done' ? '✓ DONE' : states[i] === 'running' ? '⟳ RUN' : 'WAIT'}
          </span>
        </div>
      ))}
      <div style={{ padding: '10px 16px', fontSize: 11, letterSpacing: '0.08em', fontFamily: "'DM Mono',monospace", color: states[4] === 'done' ? '#00B894' : '#2A3A55', transition: 'color 0.5s' }}>
        {states[4] === 'done' ? '▸ SYNTHESIS COMPLETE — FRAGILITY INDEX: 68 / HIGH RISK' : '▸ AWAITING AGENT COMPLETION...'}
      </div>
    </div>
  )
}

/* ─── GAUGE ─── */
function FragilityGauge({ score }) {
  const r = 90, sw = 10, nr = r - sw / 2
  const half = nr * Math.PI
  const offset = half - (score / 100) * half
  const color = score >= 75 ? '#D63031' : score >= 50 ? '#E17055' : score >= 25 ? '#FDCB6E' : '#00B894'
  const zone = score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH RISK' : score >= 25 ? 'MODERATE' : 'RESILIENT'
  return (
    <div style={{ textAlign: 'center', display: 'inline-block' }}>
      <svg width="220" height="130" viewBox="0 0 220 130">
        <defs>
          <filter id="glow2"><feGaussianBlur stdDeviation="3" result="cb" /><feMerge><feMergeNode in="cb" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="#1A2540" strokeWidth={sw} strokeLinecap="butt" />
        {[0,25,50,75,100].map(v => {
          const a = Math.PI + (v / 100) * Math.PI
          return <line key={v} x1={110 + (nr-14)*Math.cos(a)} y1={110 + (nr-14)*Math.sin(a)} x2={110 + (nr+2)*Math.cos(a)} y2={110 + (nr+2)*Math.sin(a)} stroke="#2A3A55" strokeWidth="1.5" />
        })}
        <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="butt"
          strokeDasharray={`${half} ${half}`} strokeDashoffset={offset} filter="url(#glow2)"
          style={{ transition: 'stroke-dashoffset 2.2s cubic-bezier(0.34,1.2,0.64,1), stroke 0.5s' }} />
        <circle cx="110" cy="110" r="5" fill={color} filter="url(#glow2)" />
      </svg>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 48, fontWeight: 900, color, lineHeight: 1, textShadow: `0 0 24px ${color}88`, marginTop: -16, transition: 'color 0.5s' }}>{score}</div>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '0.25em', color, marginTop: 6, textShadow: `0 0 12px ${color}66` }}>{zone}</div>
    </div>
  )
}

/* ─── MAIN ─── */
export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fragScore = useCounter(68, 2400, 1500)

  const [gaugeRef, gaugeInView] = useInView(0.2)
  const [termRef, termInView] = useInView(0.2)
  const [agentRef, agentInView] = useInView(0.2)
  const [howRef, howInView] = useInView(0.1)
  const [notRef, notInView] = useInView(0.1)
  const [priceRef, priceInView] = useInView(0.1)
  const [wlRef, wlInView] = useInView(0.2)

  useEffect(() => setMounted(true), [])

  async function handleWaitlist(e) {
    e.preventDefault(); setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setSubmitted(true); setLoading(false)
  }

  const R = ({ children, ref: r, inV, delay = 0 }) => (
    <div ref={r} style={{ opacity: inV ? 1 : 0, transform: inV ? 'translateY(0)' : 'translateY(40px)', transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s` }}>
      {children}
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Barlow+Condensed:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #050609; color: #F0F4FF; font-family: 'Barlow Condensed', sans-serif; overflow-x: hidden; cursor: none; }
        /* Scanlines */
        body::after { content: ''; position: fixed; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px); pointer-events: none; z-index: 9998; }
        /* Vignette */
        body::before { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%); pointer-events: none; z-index: 9997; }

        /* GLITCH */
        .glitch { position: relative; display: inline-block; }
        .glitch::before, .glitch::after { content: attr(data-text); position: absolute; inset: 0; }
        .glitch::before { color: #FF4444; animation: g1 3.5s infinite; clip-path: polygon(0 15%, 100% 15%, 100% 35%, 0 35%); transform: translateX(-2px); }
        .glitch::after { color: #74B9FF; animation: g2 3.5s infinite; clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); transform: translateX(2px); }
        @keyframes g1 { 0%,88%,100%{opacity:0;transform:translateX(-2px)} 89%{opacity:.8;transform:translateX(-4px)} 91%{opacity:0} 93%{opacity:.5;transform:translateX(2px)} 95%{opacity:0} }
        @keyframes g2 { 0%,86%,100%{opacity:0;transform:translateX(2px)} 87%{opacity:.6;transform:translateX(4px)} 89%{opacity:0} 92%{opacity:.4;transform:translateX(-2px)} 94%{opacity:0} }

        @keyframes blinkAnim { 0%,100%{opacity:1} 50%{opacity:0.1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hexPulse { 0%,100%{box-shadow:0 0 20px rgba(214,48,49,.4)} 50%{box-shadow:0 0 40px rgba(214,48,49,.9),0 0 80px rgba(214,48,49,.3)} }
        @keyframes scanLine { 0%{top:-5%} 100%{top:105%} }
        @keyframes borderGlow { 0%,100%{opacity:.3} 50%{opacity:1} }

        /* NAV */
        .nav { position:fixed; top:0; left:0; right:0; z-index:1000; display:flex; align-items:center; justify-content:space-between; padding:0 48px; height:60px; background:rgba(5,6,9,0.92); backdrop-filter:blur(24px); border-bottom:1px solid #162035; }
        .nav::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#D63031,transparent); animation:borderGlow 4s ease-in-out infinite; }
        .nav-logo { display:flex; align-items:center; gap:12px; text-decoration:none; }
        .logo-hex { width:34px; height:34px; background:#D63031; clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display:flex; align-items:center; justify-content:center; font-family:'Orbitron',monospace; font-size:10px; font-weight:900; color:white; animation:hexPulse 2.5s ease-in-out infinite; flex-shrink:0; }
        .nav-wm { font-family:'Orbitron',monospace; font-size:13px; font-weight:700; letter-spacing:.15em; color:#F0F4FF; }
        .nav-wm .v { color:#D63031; font-size:10px; vertical-align:super; }
        .nav-links { display:flex; align-items:center; gap:28px; }
        .nav-links a { font-family:'DM Mono',monospace; font-size:11px; color:#6B7FA3; text-decoration:none; letter-spacing:.1em; transition:color .2s; }
        .nav-links a:hover { color:#D63031; }
        .nav-cta { color:#D63031 !important; border:1px solid #D63031 !important; padding:7px 18px !important; font-family:'Orbitron',monospace !important; font-size:10px !important; font-weight:700 !important; letter-spacing:.15em !important; transition:all .25s !important; position:relative; overflow:hidden; }
        .nav-cta::before { content:''; position:absolute; inset:0; background:#D63031; transform:translateX(-100%); transition:transform .25s; z-index:-1; }
        .nav-cta:hover::before { transform:translateX(0) !important; }
        .nav-cta:hover { color:white !important; }

        /* HERO */
        .hero { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; align-items:center; padding:80px 48px 60px; position:relative; overflow:hidden; gap:48px; }
        .hero-eyebrow { display:inline-flex; align-items:center; gap:10px; border:1px solid rgba(214,48,49,.3); padding:6px 16px; margin-bottom:32px; font-family:'DM Mono',monospace; font-size:10px; color:#D63031; letter-spacing:.25em; position:relative; opacity:0; animation:fadeUp .8s ease forwards .2s; }
        .hero-eyebrow::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#D63031; }
        .hero-h1 { font-family:'Barlow Condensed',sans-serif; font-size:clamp(72px,7.5vw,116px); font-weight:900; line-height:.88; letter-spacing:-.01em; margin-bottom:24px; opacity:0; animation:fadeUp .8s ease forwards .4s; }
        .line-red { color:#D63031; text-shadow:0 0 40px rgba(214,48,49,.35); display:block; }
        .line-dim { color:rgba(240,244,255,.3); display:block; }
        .hero-sub { font-family:'DM Mono',monospace; font-size:13px; color:#6B7FA3; max-width:460px; line-height:1.8; margin-bottom:36px; opacity:0; animation:fadeUp .8s ease forwards .6s; }
        .hero-ctas { display:flex; gap:14px; flex-wrap:wrap; opacity:0; animation:fadeUp .8s ease forwards .8s; }
        .btn-p { display:inline-flex; align-items:center; gap:8px; background:#D63031; color:white; padding:14px 30px; font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:.12em; text-decoration:none; clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px)); transition:all .3s; position:relative; overflow:hidden; }
        .btn-p::before { content:''; position:absolute; inset:0; background:linear-gradient(45deg,transparent 30%,rgba(255,255,255,.15) 50%,transparent 70%); transform:translateX(-100%); transition:transform .5s; }
        .btn-p:hover::before { transform:translateX(100%); }
        .btn-p:hover { box-shadow:0 0 32px rgba(214,48,49,.6),0 0 64px rgba(214,48,49,.2); transform:translateY(-2px); }
        .btn-g { display:inline-flex; align-items:center; gap:8px; border:1px solid #1E2D45; color:#6B7FA3; padding:14px 26px; font-family:'Orbitron',monospace; font-size:11px; font-weight:600; letter-spacing:.1em; text-decoration:none; transition:all .3s; clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px)); }
        .btn-g:hover { border-color:#D63031; color:#D63031; background:rgba(214,48,49,.05); }

        /* Hero panel */
        .hero-panel { background:#0C1020; border:1px solid #162035; position:relative; overflow:hidden; opacity:0; animation:fadeUp 1s ease forwards .6s; }
        .hero-panel::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#D63031,#E17055,#FDCB6E); }
        .hp-header { padding:13px 20px; background:#111827; border-bottom:1px solid #162035; font-family:'DM Mono',monospace; font-size:10px; color:#D63031; letter-spacing:.2em; display:flex; align-items:center; gap:10px; }
        .hp-gauge { padding:32px; display:flex; flex-direction:column; align-items:center; border-bottom:1px solid #162035; }
        .hp-stats { display:grid; grid-template-columns:repeat(4,1fr); }
        .hps-item { padding:14px; text-align:center; border-right:1px solid #162035; }
        .hps-item:last-child { border-right:none; }
        .hps-n { font-family:'Orbitron',monospace; font-size:22px; font-weight:900; color:#D63031; text-shadow:0 0 12px rgba(214,48,49,.4); }
        .hps-l { font-family:'DM Mono',monospace; font-size:8px; color:#2A3A55; letter-spacing:.15em; margin-top:4px; }

        /* Section base */
        .sw { padding:100px 48px; max-width:1280px; margin:0 auto; }
        .sec-label { font-family:'DM Mono',monospace; font-size:10px; color:#D63031; letter-spacing:.35em; margin-bottom:14px; display:flex; align-items:center; gap:12px; }
        .sec-label::before { content:''; display:inline-block; width:28px; height:1px; background:#D63031; }
        .sec-title { font-family:'Barlow Condensed',sans-serif; font-size:clamp(40px,5vw,70px); font-weight:900; line-height:.95; letter-spacing:-.01em; margin-bottom:52px; }

        /* Divider */
        .div { width:100%; height:1px; background:linear-gradient(90deg,transparent,#1E2D45 20%,#1E2D45 80%,transparent); position:relative; }
        .div::after { content:'◆'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#D63031; font-size:8px; background:#050609; padding:0 8px; }

        /* How cards */
        .how-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; }
        .how-card { background:#0C1020; border:1px solid #162035; padding:40px 32px; position:relative; overflow:hidden; transition:border-color .3s,transform .3s; cursor:default; }
        .how-card:hover { transform:translateY(-6px); }
        .how-num { font-family:'Orbitron',monospace; font-size:70px; font-weight:900; position:absolute; top:12px; right:16px; opacity:.05; line-height:1; }
        .how-icon { font-size:30px; margin-bottom:20px; }
        .how-title { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:800; letter-spacing:.05em; margin-bottom:10px; }
        .how-desc { font-size:14px; color:#6B7FA3; line-height:1.75; font-family:'DM Mono',monospace; }

        /* Agents layout */
        .agents-bg { background:#080B12; border-top:1px solid #162035; border-bottom:1px solid #162035; padding:100px 48px; }
        .agents-inner { max-width:1280px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
        .ali { display:flex; align-items:flex-start; gap:16px; padding:16px 0; border-bottom:1px solid #162035; }
        .ali-bar { width:3px; height:44px; flex-shrink:0; border-radius:2px; }
        .ali-name { font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:.1em; margin-bottom:5px; }
        .ali-desc { font-family:'DM Mono',monospace; font-size:11px; color:#2A3A55; }

        /* IS/NOT */
        .ni-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px; }
        .ni-col { border:1px solid #162035; overflow:hidden; }
        .ni-head { padding:18px 28px; font-family:'Orbitron',monospace; font-size:13px; font-weight:700; letter-spacing:.1em; border-bottom:1px solid #162035; }
        .ni-row { display:flex; align-items:flex-start; gap:14px; padding:16px 28px; border-bottom:1px solid #162035; transition:background .2s; }
        .ni-row:hover { background:rgba(255,255,255,.02); }
        .ni-icon { font-size:14px; margin-top:2px; flex-shrink:0; }
        .ni-t { font-size:15px; font-weight:800; margin-bottom:3px; font-family:'Barlow Condensed',sans-serif; letter-spacing:.05em; }
        .ni-d { font-family:'DM Mono',monospace; font-size:10px; color:#2A3A55; line-height:1.5; }

        /* Pricing */
        .pc-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; }
        .pc { background:#0C1020; border:1px solid #162035; padding:40px 32px; position:relative; overflow:hidden; transition:all .3s; }
        .pc.ft { border-color:#D63031; background:linear-gradient(160deg,#0C1020 0%,rgba(214,48,49,.05) 100%); }
        .pc.ft::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#D63031,#E17055); }
        .pc.ft::after { content:'MOST POPULAR'; position:absolute; top:16px; right:-22px; background:#D63031; color:white; font-family:'DM Mono',monospace; font-size:8px; letter-spacing:.2em; padding:5px 32px; transform:rotate(45deg); }
        .pc:not(.ft):hover { border-color:#1E2D45; transform:translateY(-4px); }
        .pc-tier { font-family:'DM Mono',monospace; font-size:10px; color:#2A3A55; letter-spacing:.3em; margin-bottom:10px; }
        .pc-amt { font-family:'Orbitron',monospace; font-size:46px; font-weight:900; line-height:1; margin-bottom:6px; }
        .pc-lbl { font-family:'DM Mono',monospace; font-size:11px; color:#6B7FA3; margin-bottom:24px; }
        .pc-div { width:100%; height:1px; background:#162035; margin-bottom:20px; }
        .pc-f { display:flex; align-items:flex-start; gap:10px; padding:8px 0; font-size:13px; color:#6B7FA3; border-bottom:1px solid rgba(22,32,53,.5); font-family:'DM Mono',monospace; }
        .pc-f.lk { opacity:.35; }
        .pc-fs { margin-bottom:28px; }
        .pc-btn { display:block; text-align:center; padding:13px; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:.15em; text-decoration:none; transition:all .25s; clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%); }
        .pc-btn.r { background:#D63031; color:white; }
        .pc-btn.r:hover { background:#b71c1c; box-shadow:0 0 24px rgba(214,48,49,.4); }
        .pc-btn.o { border:1px solid #1E2D45; color:#6B7FA3; }
        .pc-btn.o:hover { border-color:#D63031; color:#D63031; }

        /* Waitlist */
        .wl-wrap { padding:100px 48px; text-align:center; position:relative; overflow:hidden; }
        .wl-wrap::before { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:700px; height:400px; background:radial-gradient(ellipse,rgba(214,48,49,.07) 0%,transparent 70%); pointer-events:none; }
        .wl-t { font-family:'Barlow Condensed',sans-serif; font-size:clamp(48px,7vw,96px); font-weight:900; line-height:.9; margin-bottom:18px; position:relative; }
        .wl-s { font-family:'DM Mono',monospace; font-size:13px; color:#6B7FA3; margin-bottom:36px; position:relative; }
        .wl-form { display:flex; max-width:500px; margin:0 auto; position:relative; }
        .wl-in { flex:1; background:#0C1020; border:1px solid #1E2D45; border-right:none; color:white; padding:16px 20px; font-family:'DM Mono',monospace; font-size:13px; outline:none; transition:border-color .2s; }
        .wl-in:focus { border-color:#D63031; }
        .wl-in::placeholder { color:#2A3A55; }
        .wl-btn { background:#D63031; color:white; border:none; padding:16px 28px; cursor:pointer; font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:.1em; transition:background .2s; white-space:nowrap; }
        .wl-btn:hover { background:#b71c1c; }
        .wl-btn:disabled { opacity:.5; cursor:not-allowed; }
        .wl-ok { display:inline-flex; align-items:center; gap:12px; border:1px solid #00B894; color:#00B894; padding:16px 32px; font-family:'DM Mono',monospace; font-size:12px; letter-spacing:.1em; box-shadow:0 0 24px rgba(0,184,148,.15); }

        footer { border-top:1px solid #162035; padding:36px 48px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; background:#080B12; }
        .ft-logo { display:flex; align-items:center; gap:10px; }
        .ft-hex { width:28px; height:28px; background:#D63031; clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display:flex; align-items:center; justify-content:center; font-family:'Orbitron',monospace; font-size:9px; font-weight:900; color:white; }
        .ft-nm { font-family:'Orbitron',monospace; font-size:13px; font-weight:700; letter-spacing:.1em; }
        .ft-nm span { color:#D63031; }
        .ft-tag { font-family:'DM Mono',monospace; font-size:11px; color:#2A3A55; font-style:italic; }
        .ft-copy { font-family:'DM Mono',monospace; font-size:11px; color:#2A3A55; }

        @media(max-width:900px){
          .nav{padding:0 20px;} .nav-links{display:none;}
          .hero{grid-template-columns:1fr;padding:100px 20px 60px;gap:40px;}
          .hero-panel{display:none;}
          .sw{padding:60px 20px;}
          .how-grid,.ni-grid,.pc-grid,.agents-inner{grid-template-columns:1fr;}
          .agents-bg{padding:60px 20px;}
          .wl-wrap{padding:60px 20px;}
          .wl-form{flex-direction:column;}
          .wl-in{border-right:1px solid #1E2D45;}
          footer{flex-direction:column;align-items:flex-start;padding:32px 20px;}
        }
      `}</style>

      {mounted && <CustomCursor />}
      {mounted && <ParticleCanvas />}

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo">
          <div className="logo-hex">DA</div>
          <span className="nav-wm">DEVILS ADVOCATE <span className="v">2.0</span></span>
        </a>
        <div className="nav-links">
          <a href="#how">HOW IT WORKS</a>
          <a href="#agents">AGENTS</a>
          <a href="#pricing">PRICING</a>
          <a href="/auth/login">LOGIN</a>
          <a href="/auth/signup" className="nav-cta">GET STARTED →</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-eyebrow">
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#D63031', display: 'inline-block', animation: 'blinkAnim 1.2s ease infinite' }} />
            PRE-INVESTMENT STRUCTURAL STRESS ENGINE
          </div>
          <h1 className="hero-h1">
            <GlitchText text="EXPOSE" />
            <span className="line-red">FRAGILITY</span>
            <span className="line-dim">BEFORE</span>
            CAPITAL DOES.
          </h1>
          <p className="hero-sub">
            A deterministic AI engine that deploys 5 adversarial agents against your startup structure — outputs a 0–100 Fragility Index before investors find the cracks themselves.
          </p>
          <div className="hero-ctas">
            <a href="/auth/signup" className="btn-p">▸ START STRUCTURAL AUDIT</a>
            <a href="#how" className="btn-g">VIEW SAMPLE REPORT</a>
          </div>
        </div>

        <div className="hero-panel" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hp-header">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D63031', display: 'inline-block', animation: 'blinkAnim 1s ease infinite' }} />
            FRAGILITY INDEX — LIVE DEMO
          </div>
          <div className="hp-gauge">
            {mounted && <FragilityGauge score={fragScore} />}
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#2A3A55', marginTop: 14, letterSpacing: '0.1em' }}>
              SAMPLE AUDIT · HEALTHTECH STARTUP · v1
            </div>
          </div>
          <div className="hp-stats">
            {[['7','DIMENSIONS'],['5','AGENTS'],['5','SHOCKS'],['0','CHAT UI']].map(([n,l]) => (
              <div key={l} className="hps-item">
                <div className="hps-n">{n}</div>
                <div className="hps-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="div" />

      {/* TERMINAL */}
      <div ref={termRef} style={{ opacity: termInView ? 1 : 0, transform: termInView ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity .8s ease, transform .8s ease', background: '#080B12', borderTop: '1px solid #162035', borderBottom: '1px solid #162035' }}>
        <div className="sw" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <p className="sec-label">UNDER THE HOOD</p>
          <h2 className="sec-title" style={{ marginBottom: 36 }}>NOT A CHATBOT.<br /><span style={{ color: '#D63031' }}>A PIPELINE.</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <Terminal trigger={termInView} lines={['Loading intake_response[D1..D7]...','Initializing adversarial_engine v2.0...','Running Market_Skeptic_Agent...','Running Financial_Realist_Agent...','Running Competitor_Strategist_Agent...','Running Regulatory_Analyst_Agent...','Running Meta_Risk_Synthesizer...','Calculating weighted_fragility_score...']} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
              {[
                ['INPUT TYPE','STRUCTURED JSON — NOT FREE TEXT'],
                ['PROCESSING','SEQUENTIAL AGENT PIPELINE'],
                ['SCORING','DETERMINISTIC WEIGHTED FORMULA'],
                ['OUTPUT','FRAGILITY INDEX 0–100'],
                ['VARIATION','ZERO — SAME INPUT = SAME SCORE'],
              ].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #162035' }}>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#2A3A55', letterSpacing: '.15em' }}>{k}</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#D63031', letterSpacing: '.08em' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="div" />

      {/* HOW IT WORKS */}
      <div ref={howRef} style={{ opacity: howInView ? 1 : 0, transform: howInView ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity .8s ease, transform .8s ease' }}>
        <div className="sw" id="how">
          <p className="sec-label">THE PROCESS</p>
          <h2 className="sec-title">HOW DA 2.0<br /><span style={{ color: '#D63031' }}>WORKS</span></h2>
          <div className="how-grid">
            {[
              { n:'01', icon:'◈', title:'7-DIMENSION INTAKE', desc:'Structured input across Problem, Customer, Value Prop, Revenue, Distribution, Cost, and Founder Profile. No vague answers accepted.', c:'#D63031' },
              { n:'02', icon:'⬡', title:'5 ADVERSARIAL AGENTS', desc:'Five specialist agents independently attack every structural assumption. Market Skeptic, Financial Realist, Competitor Strategist, Regulatory Analyst, Meta Synthesizer.', c:'#FDCB6E' },
              { n:'03', icon:'▲', title:'FRAGILITY INDEX OUTPUT', desc:'Deterministic 0–100 score from weighted agent outputs. Not an AI opinion — a structural quantification. Same input always yields comparable output.', c:'#00B894' },
            ].map(s => (
              <div key={s.n} className="how-card" style={{ borderColor: '#162035' }} onMouseEnter={e => e.currentTarget.style.borderColor = s.c} onMouseLeave={e => e.currentTarget.style.borderColor = '#162035'}>
                <span className="how-num" style={{ color: s.c }}>{s.n}</span>
                <div className="how-icon" style={{ color: s.c, textShadow: `0 0 16px ${s.c}88` }}>{s.icon}</div>
                <div className="how-title" style={{ color: s.c }}>{s.title}</div>
                <p className="how-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="div" />

      {/* AGENTS */}
      <div ref={agentRef} style={{ opacity: agentInView ? 1 : 0, transform: agentInView ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity .8s ease, transform .8s ease' }}>
        <section className="agents-bg" id="agents">
          <div className="agents-inner">
            <div>
              <p className="sec-label">THE ENGINE</p>
              <h2 className="sec-title">5 AGENTS.<br /><span style={{ color: '#D63031' }}>ONE VERDICT.</span></h2>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: '#6B7FA3', lineHeight: 1.8, marginBottom: 28 }}>
                Each agent is an adversarial specialist. They find the exact structural weakness in your dimension and quantify it deterministically.
              </p>
              {[
                { n:'MARKET SKEPTIC', d:'Attacks market size, demand validity, timing assumptions', c:'#D63031' },
                { n:'FINANCIAL REALIST', d:'Stress-tests unit economics, burn rate, CAC/LTV ratio', c:'#E17055' },
                { n:'COMPETITOR STRATEGIST', d:'Maps moat gaps, competitive threats, defensibility holes', c:'#FDCB6E' },
                { n:'REGULATORY ANALYST', d:'Surfaces legal exposure, compliance risk, India-specific', c:'#74B9FF' },
                { n:'META RISK SYNTHESIZER', d:'Identifies the single fatal structural flaw across all dimensions', c:'#A29BFE' },
              ].map(a => (
                <div key={a.n} className="ali">
                  <div className="ali-bar" style={{ background: a.c, boxShadow: `0 0 8px ${a.c}66` }} />
                  <div>
                    <div className="ali-name" style={{ color: a.c }}>{a.n}</div>
                    <div className="ali-desc">{a.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <AgentFeed trigger={agentInView} />
          </div>
        </section>
      </div>

      <div className="div" />

      {/* IS / IS NOT */}
      <div ref={notRef} style={{ opacity: notInView ? 1 : 0, transform: notInView ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity .8s ease, transform .8s ease' }}>
        <div className="sw">
          <p className="sec-label">POSITIONING</p>
          <h2 className="sec-title">WHAT DA 2.0<br /><span style={{ color: '#D63031' }}>IS — AND IS NOT</span></h2>
          <div className="ni-grid">
            <div className="ni-col" style={{ borderColor: 'rgba(214,48,49,.2)' }}>
              <div className="ni-head" style={{ color: '#D63031', borderColor: 'rgba(214,48,49,.2)', background: 'rgba(214,48,49,.04)' }}>✗ IS NOT</div>
              {[
                ['A Chat Assistant','No conversations, no back-and-forth, no ChatGPT interface anywhere.'],
                ['A Funding Predictor','Does not predict success or failure — measures structural fragility.'],
                ['A GPT Wrapper','Not a prompt layer. A deterministic pipeline with fixed weighted logic.'],
                ['A Motivational Tool','No encouragement. No optimism bias. Adversarial by core design.'],
                ['An Idea Validator','Does not judge ideas. Measures structural assumption risk underneath.'],
              ].map(([t,d]) => (
                <div key={t} className="ni-row">
                  <span className="ni-icon" style={{ color: '#D63031' }}>✗</span>
                  <div><div className="ni-t" style={{ color: '#F0F4FF' }}>{t}</div><div className="ni-d">{d}</div></div>
                </div>
              ))}
            </div>
            <div className="ni-col" style={{ borderColor: 'rgba(0,184,148,.2)' }}>
              <div className="ni-head" style={{ color: '#00B894', borderColor: 'rgba(0,184,148,.2)', background: 'rgba(0,184,148,.04)' }}>✓ IS</div>
              {[
                ['Structured Audit Platform','Fixed pipeline. Defined 7-dimension inputs. Reproducible scored outputs.'],
                ['Deterministic Scoring Engine','Same input always produces a comparable fragility output. No randomness.'],
                ['Version-Controlled Analyzer','Tracks fragility score changes across startup iterations over time.'],
                ['Pre-Investment Pressure Test','Designed for the exact moment before capital is deployed or sought.'],
                ['Data Dashboard Product','Charts, scores, shock matrices, correction maps — not a chat interface.'],
              ].map(([t,d]) => (
                <div key={t} className="ni-row">
                  <span className="ni-icon" style={{ color: '#00B894' }}>✓</span>
                  <div><div className="ni-t" style={{ color: '#F0F4FF' }}>{t}</div><div className="ni-d">{d}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="div" />

      {/* PRICING */}
      <div ref={priceRef} style={{ opacity: priceInView ? 1 : 0, transform: priceInView ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity .8s ease, transform .8s ease', background: '#080B12', borderTop: '1px solid #162035', borderBottom: '1px solid #162035' }}>
        <div className="sw" id="pricing">
          <p className="sec-label">PRICING</p>
          <h2 className="sec-title">SIMPLE.<br /><span style={{ color: '#D63031' }}>TRANSPARENT.</span></h2>
          <div className="pc-grid">
            {[
              { tier:'TIER 0', price:'FREE', lbl:'Acquisition Entry Point', features:['Risk Zone Classification','3 Structural Risk Highlights','1 Shock Simulation Result','Weakest Assumption Teaser'], locked:['Full Fragility Index Score','Priority Correction Roadmap'], cta:'START FREE', href:'/auth/signup', ft:false },
              { tier:'TIER 1', price:'₹299', lbl:'Full Structural Report', features:['Exact Fragility Index 0–100','Full Shock Survival Matrix','All 5 Agent Dimension Scores','Priority Correction Roadmap','Downloadable PDF Report'], locked:[], cta:'GET FULL REPORT', href:'/auth/signup', ft:true },
              { tier:'TIER 2', price:'₹799', lbl:'Deep Structural Diagnosis', features:['Everything in Tier 1','Sensitivity Analysis Module','Dependency Chain Mapping','Capital Runway Simulation','Deep Market Research Layer'], locked:[], cta:'GET DEEP DIAGNOSIS', href:'/auth/signup', ft:false },
            ].map(p => (
              <div key={p.tier} className={`pc ${p.ft ? 'ft' : ''}`}>
                <div className="pc-tier">{p.tier}</div>
                <div className="pc-amt" style={{ color: p.ft ? '#D63031' : '#F0F4FF', textShadow: p.ft ? '0 0 24px rgba(214,48,49,.4)' : 'none' }}>{p.price}</div>
                <div className="pc-lbl">{p.lbl}</div>
                <div className="pc-div" />
                <div className="pc-fs">
                  {p.features.map(f => <div key={f} className="pc-f"><span style={{ color: '#00B894' }}>✓</span><span>{f}</span></div>)}
                  {p.locked.map(f => <div key={f} className="pc-f lk"><span style={{ color: '#2A3A55' }}>⊘</span><span>{f}</span></div>)}
                </div>
                <a href={p.href} className={`pc-btn ${p.ft ? 'r' : 'o'}`}>{p.cta} →</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="div" />

      {/* WAITLIST */}
      <div ref={wlRef} style={{ opacity: wlInView ? 1 : 0, transform: wlInView ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity .8s ease, transform .8s ease' }}>
        <section className="wl-wrap">
          <p className="sec-label" style={{ justifyContent: 'center', marginBottom: 18 }}>EARLY ACCESS</p>
          <h2 className="wl-t">BE FIRST<br /><span style={{ color: '#D63031' }}>IN LINE.</span></h2>
          <p className="wl-s">Join founders getting early access before public launch.</p>
          {submitted ? (
            <div className="wl-ok"><span>✓</span>YOU ARE ON THE LIST — WE WILL REACH OUT SOON</div>
          ) : (
            <form onSubmit={handleWaitlist} className="wl-form">
              <input type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="wl-in" />
              <button type="submit" disabled={loading} className="wl-btn">{loading ? 'JOINING...' : 'JOIN →'}</button>
            </form>
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="ft-logo">
          <div className="ft-hex">DA</div>
          <span className="ft-nm">DEVILS ADVOCATE <span>2.0</span></span>
        </div>
        <span className="ft-tag">"Expose fragility before capital does."</span>
        <span className="ft-copy">© 2025 Devils Advocate 2.0 · devilsadvocateai.in</span>
      </footer>
    </>
  )
}