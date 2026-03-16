'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

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
    const N = 50
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.2 + 0.4,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 140) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(214,48,49,${0.08 * (1 - dist / 140)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(214,48,49,0.4)'; ctx.fill()
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }} />
}

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
      <div ref={cRef} style={{ position: 'fixed', width: 22, height: 22, border: '1px solid #D63031', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 99999, mixBlendMode: 'difference' }} />
      <div ref={dRef} style={{ position: 'fixed', width: 4, height: 4, background: '#D63031', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 99999, borderRadius: '50%' }} />
    </>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false) }
      else { window.location.href = '/dashboard' }
    } catch { setError('Something went wrong. Try again.'); setLoading(false) }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  return (
    <div className="auth-wrap">
      {mounted && <ParticleCanvas />}
      {mounted && <CustomCursor />}

      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-scan" />

        <a href="/" className="auth-logo">
<img src="/logo.png" style={{width:'32px',height:'32px',objectFit:'contain'}} />          <span className="auth-logo-text">DEVILS ADVOCATE <span>2.0</span></span>
        </a>

        <div className="auth-left-content">
          <div className="auth-eyebrow">
            <span className="auth-eyebrow-dot" />
            STRUCTURAL STRESS ENGINE
          </div>

          <h2 className="auth-heading">
            WELCOME<br />
            <span>BACK,</span>
            FOUNDER.
          </h2>

          <p className="auth-desc">
            Your startup's fragility score is waiting. Sign in to access your audit history, resume drafts, and track structural improvements over time.
          </p>

          <div className="auth-stats">
            {[
              ['7',    'INPUT DIMENSIONS'],
              ['5',    'ADVERSARIAL AGENTS'],
              ['0–100','FRAGILITY INDEX'],
              ['₹0',   'TO GET STARTED'],
            ].map(([n, l]) => (
              <div key={l} className="auth-stat">
                <div className="auth-stat-num">{n}</div>
                <div className="auth-stat-lbl">{l}</div>
              </div>
            ))}
          </div>

          <div className="auth-list">
            {[
              'Deterministic scoring — not AI opinion',
              'Version history saved automatically',
              'Audit data encrypted at rest',
            ].map(t => (
              <div key={t} className="auth-list-item">
                <span className="auth-list-dot" />
                <span className="auth-list-desc">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="auth-tagline">"Expose fragility before capital does."</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          <h1 className="auth-form-title">SIGN IN<br /><span>TO DA 2.0</span></h1>
          <p className="auth-form-sub">
            No account? <a href="/auth/signup">Create one free →</a>
          </p>

          <div className="auth-fields">

            {error && (
              <div className="auth-error">
                <span>⚠</span><span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">EMAIL ADDRESS</label>
              <div className="auth-input-wrap">
                <input
                  type="email" required placeholder="founder@startup.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">
                <span>PASSWORD</span>
                <a href="/auth/forgot">FORGOT?</a>
              </label>
              <div className="auth-input-wrap">
                <input
                  type={showPass ? 'text' : 'password'} required
                  placeholder="••••••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="auth-input"
                  style={{ paddingRight: 60 }}
                />
                <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button onClick={handleLogin} disabled={loading} className="auth-btn-primary">
              {loading ? (
                <span className="btn-loading">
                  AUTHENTICATING
                  <span className="loading-dots"><span /><span /><span /></span>
                </span>
              ) : '▸ SIGN IN →'}
            </button>

            <div className="auth-or">
              <div className="auth-or-line" />
              <span>OR</span>
              <div className="auth-or-line" />
            </div>

            <button disabled style={{opacity:0.35,cursor:"not-allowed"}} className="auth-btn-google">
              <span>G</span> GOOGLE (COMING SOON)
            </button>

          </div>

          <div className="auth-footer">
            Don't have an account? <a href="/auth/signup">Create one free →</a>
            <br /><br />
            <span style={{ fontSize: 10 }}>
              By signing in you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>
            </span>
          </div>

        </div>

        <div className="sys-status">
          <span className="sys-dot" />
          ALL SYSTEMS OPERATIONAL
        </div>
      </div>
    </div>
  )
}