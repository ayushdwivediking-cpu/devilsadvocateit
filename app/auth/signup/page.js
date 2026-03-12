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

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [strength, setStrength] = useState(0)

  useEffect(() => { setMounted(true) }, [])

  function checkStrength(p) {
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    setStrength(s)
  }

  async function handleSignup(e) {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').insert([{ id: data.user.id, full_name: name }])
        setSuccess(true)
      }
    } catch { setError('Something went wrong. Try again.') }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  const strengthColors = ['#2A3A55', '#D63031', '#FDCB6E', '#74B9FF', '#00B894']
  const strengthLabels = ['', 'WEAK', 'FAIR', 'GOOD', 'STRONG']

  return (
    <div className="auth-wrap">
      {mounted && <ParticleCanvas />}
      {mounted && <CustomCursor />}

      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-scan" />

        <a href="/" className="auth-logo">
          <div className="auth-logo-hex">DA</div>
          <span className="auth-logo-text">DEVILS ADVOCATE <span>2.0</span></span>
        </a>

        <div className="auth-left-content">
          <div className="auth-eyebrow">
            <span className="auth-eyebrow-dot" />
            CREATE YOUR ACCOUNT
          </div>

          <h2 className="auth-heading">
            START YOUR<br />
            <span>STRESS</span>
            TEST.
          </h2>

          <p className="auth-desc">
            Create your free account and run your first structural audit in under 10 minutes. No credit card required to start.
          </p>

          <div className="auth-list">
            {[
              { n: '01', t: 'Create Free Account',    d: 'Email signup or Google — instant access, no card needed.' },
              { n: '02', t: 'Run 7-Dimension Intake', d: 'Answer structured questions across 7 startup dimensions.' },
              { n: '03', t: 'Get Fragility Index',    d: 'Receive your 0–100 score with free preview instantly.' },
              { n: '04', t: 'Unlock Full Report',     d: 'Pay ₹299 to unlock complete analysis and correction roadmap.' },
            ].map(s => (
              <div key={s.n} className="auth-list-item">
                <span className="auth-list-num">{s.n}</span>
                <div>
                  <div className="auth-list-title">{s.t}</div>
                  <div className="auth-list-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="auth-tagline">"Expose fragility before capital does."</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {success ? (
            <div className="auth-success">
              <div className="auth-success-icon">✓</div>
              <h2 className="auth-success-title">ACCOUNT<br /><span>CREATED.</span></h2>
              <p className="auth-success-desc">
                Check your email to verify your account. Once verified, sign in and run your first structural audit.
              </p>
              <a href="/auth/login" className="auth-success-btn">▸ GO TO LOGIN →</a>
            </div>
          ) : (
            <>
              <h1 className="auth-form-title">CREATE<br /><span>ACCOUNT</span></h1>
              <p className="auth-form-sub">Already have one? <a href="/auth/login">Sign in →</a></p>

              <div className="auth-fields">

                {error && (
                  <div className="auth-error"><span>⚠</span><span>{error}</span></div>
                )}

                {/* Name */}
                <div className="auth-field">
                  <label className="auth-label">FULL NAME</label>
                  <input
                    type="text" required placeholder="Your full name"
                    value={name} onChange={e => setName(e.target.value)}
                    className="auth-input"
                  />
                </div>

                {/* Email */}
                <div className="auth-field">
                  <label className="auth-label">EMAIL ADDRESS</label>
                  <input
                    type="email" required placeholder="founder@startup.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label className="auth-label">PASSWORD</label>
                  <div className="auth-input-wrap">
                    <input
                      type={showPass ? 'text' : 'password'} required
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={e => { setPassword(e.target.value); checkStrength(e.target.value) }}
                      className="auth-input"
                      style={{ paddingRight: 60 }}
                    />
                    <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(!showPass)}>
                      {showPass ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                  {password && (
                    <div className="strength-wrap">
                      <div className="strength-bars">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="strength-bar"
                            style={{ background: i <= strength ? strengthColors[strength] : '#162035' }} />
                        ))}
                      </div>
                      <span className="strength-label" style={{ color: strengthColors[strength] }}>
                        {strengthLabels[strength]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="auth-field">
                  <label className="auth-label">CONFIRM PASSWORD</label>
                  <input
                    type="password" required placeholder="Repeat password"
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    className={`auth-input ${confirm && confirm !== password ? 'input-error' : confirm && confirm === password ? 'input-ok' : ''}`}
                  />
                  {confirm && confirm === password && confirm.length > 0 && (
                    <span className="match-ok">✓ PASSWORDS MATCH</span>
                  )}
                </div>

                {/* Submit */}
                <button onClick={handleSignup} disabled={loading} className="auth-btn-primary">
                  {loading ? (
                    <span className="btn-loading">
                      CREATING ACCOUNT
                      <span className="loading-dots"><span /><span /><span /></span>
                    </span>
                  ) : '▸ CREATE ACCOUNT →'}
                </button>

                <div className="auth-or">
                  <div className="auth-or-line" /><span>OR</span><div className="auth-or-line" />
                </div>

                <button disabled style={{opacity:0.35,cursor:"not-allowed"}} className="auth-btn-google">
                  <span>G</span> GOOGLE (COMING SOON)
                </button>

              </div>

              <div className="auth-footer">
                Already have an account? <a href="/auth/login">Sign in →</a>
                <br /><br />
                <span style={{ fontSize: 10 }}>
                  By creating an account you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>
                </span>
              </div>
            </>
          )}

        </div>

        <div className="sys-status">
          <span className="sys-dot" />
          ALL SYSTEMS OPERATIONAL
        </div>
      </div>
    </div>
  )
}