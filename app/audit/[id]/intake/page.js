'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const DIMENSIONS = [
  {
    id: 'D1', label: 'PROBLEM', title: 'Problem Definition',
    icon: '◈', color: '#D63031',
    questions: [
      { key: 'problem_statement', label: 'What exact problem are you solving?', type: 'textarea', placeholder: 'Describe the core problem in 2-3 sentences. Be specific.' },
      { key: 'problem_evidence', label: 'What evidence do you have that this problem exists?', type: 'textarea', placeholder: 'Customer interviews, surveys, data points, personal experience...' },
      { key: 'problem_frequency', label: 'How often does this problem occur for your target user?', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Occasionally', 'Once'] },
    ]
  },
  {
    id: 'D2', label: 'CUSTOMER', title: 'Customer Definition',
    icon: '⬡', color: '#E17055',
    questions: [
      { key: 'target_customer', label: 'Who exactly is your target customer?', type: 'textarea', placeholder: 'Be specific — age, role, industry, geography, income level...' },
      { key: 'customer_size', label: 'How large is this customer segment in India?', type: 'select', options: ['<10,000', '10K–100K', '100K–1M', '1M–10M', '>10M'] },
      { key: 'customer_pain', label: 'How painful is this problem for them on a scale of 1–10?', type: 'slider' },
    ]
  },
  {
    id: 'D3', label: 'VALUE PROP', title: 'Value Proposition',
    icon: '◆', color: '#FDCB6E',
    questions: [
      { key: 'solution', label: 'What is your solution in one sentence?', type: 'text', placeholder: 'We help [customer] do [outcome] by [method]...' },
      { key: 'differentiation', label: 'Why is your solution better than existing alternatives?', type: 'textarea', placeholder: 'Compare specifically to current solutions — not just "faster/cheaper"...' },
      { key: 'unfair_advantage', label: 'What is your unfair advantage or moat?', type: 'textarea', placeholder: 'IP, network effects, exclusive access, proprietary data, team expertise...' },
    ]
  },
  {
    id: 'D4', label: 'REVENUE', title: 'Revenue Model',
    icon: '◎', color: '#00B894',
    questions: [
      { key: 'revenue_model', label: 'How exactly do you make money?', type: 'select', options: ['Subscription (SaaS)', 'Per-transaction fee', 'Freemium', 'One-time purchase', 'Marketplace commission', 'Advertising', 'Other'] },
      { key: 'price_point', label: 'What is your price point per customer per month (₹)?', type: 'text', placeholder: 'e.g. ₹299, ₹999, ₹4999...' },
      { key: 'unit_economics', label: 'What is your estimated CAC vs LTV?', type: 'textarea', placeholder: 'CAC = cost to acquire one customer. LTV = total revenue per customer lifetime...' },
    ]
  },
  {
    id: 'D5', label: 'DISTRIBUTION', title: 'Go-To-Market',
    icon: '▲', color: '#74B9FF',
    questions: [
      { key: 'gtm_channel', label: 'What is your primary customer acquisition channel?', type: 'select', options: ['Organic/SEO', 'Paid ads', 'Sales outreach', 'Partnerships', 'Word of mouth', 'Social media', 'Community', 'Other'] },
      { key: 'gtm_plan', label: 'How will you get your first 100 customers?', type: 'textarea', placeholder: 'Specific plan — not "social media and SEO". How, who, when...' },
      { key: 'traction', label: 'What traction do you have so far?', type: 'textarea', placeholder: 'Users, revenue, waitlist, pilots, LOIs, partnerships — be specific...' },
    ]
  },
  {
    id: 'D6', label: 'COST', title: 'Cost Structure',
    icon: '⬟', color: '#A29BFE',
    questions: [
      { key: 'monthly_burn', label: 'What is your estimated monthly burn rate (₹)?', type: 'text', placeholder: 'e.g. ₹50,000 / month including infra, team, marketing...' },
      { key: 'runway', label: 'How many months of runway do you have?', type: 'select', options: ['0 months (bootstrapped)', '1–3 months', '3–6 months', '6–12 months', '12+ months'] },
      { key: 'biggest_cost', label: 'What is your single biggest cost driver?', type: 'text', placeholder: 'e.g. AI API costs, salaries, customer acquisition...' },
    ]
  },
  {
    id: 'D7', label: 'FOUNDER', title: 'Founder Profile',
    icon: '★', color: '#FD79A8',
    questions: [
      { key: 'founder_background', label: 'Why are YOU the right person to build this?', type: 'textarea', placeholder: 'Domain expertise, relevant experience, unfair insight, personal connection to problem...' },
      { key: 'team_gaps', label: 'What critical skills are missing in your team?', type: 'textarea', placeholder: 'Be honest — what do you need to hire for or partner on...' },
      { key: 'commitment', label: 'What is your commitment level?', type: 'select', options: ['Full-time, sole focus', 'Full-time, side projects exist', 'Part-time (20-30 hrs/week)', 'Early stage (<20 hrs/week)'] },
    ]
  },
]

export default function IntakePage() {
  const params = useParams()
  const auditId = params.id
  const [currentDim, setCurrentDim] = useState(0)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const [auditTitle, setAuditTitle] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load existing answers
    supabase.from('intake_responses')
      .select('*')
      .eq('audit_id', auditId)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const loaded = {}
          data.forEach(r => { loaded[r.dimension + '_' + r.response?.key] = r.response?.value })
          setAnswers(loaded)
        }
      })
    supabase.from('audits').select('title').eq('id', auditId).single()
      .then(({ data }) => { if (data) setAuditTitle(data.title) })
  }, [auditId])

  const dim = DIMENSIONS[currentDim]
  const progress = ((currentDim) / DIMENSIONS.length) * 100
  const totalProgress = ((currentDim + 1) / DIMENSIONS.length) * 100

  function getAnswer(key) { return answers[dim.id + '_' + key] || '' }
  function setAnswer(key, value) { setAnswers(a => ({ ...a, [dim.id + '_' + key]: value })) }

  function isDimComplete() {
    return dim.questions.every(q => {
      const val = getAnswer(q.key)
      return val !== '' && val !== undefined
    })
  }

  async function saveAndNext() {
    setSaving(true)
    // Save current dimension answers
    const saves = dim.questions.map(q => ({
      audit_id: auditId,
      dimension: dim.id,
      response: { key: q.key, value: getAnswer(q.key) },
      completed: true,
    }))
    for (const s of saves) {
      await supabase.from('intake_responses').upsert(s, {
        onConflict: 'audit_id,dimension',
        ignoreDuplicates: false
      })
    }
    setSaving(false)
    if (currentDim < DIMENSIONS.length - 1) {
      setCurrentDim(d => d + 1)
    } else {
      // All done — go to processing
      await supabase.from('audits').update({ status: 'processing' }).eq('id', auditId)
      window.location.href = `/audit/${auditId}/processing`
    }
  }

  function goBack() { if (currentDim > 0) setCurrentDim(d => d - 1) }

  if (!mounted) return null

  return (
    <div className="intake-wrap">

      {/* HEADER */}
      <header className="intake-header">
        <a href="/dashboard" className="intake-back">← DASHBOARD</a>
        <div className="intake-title-wrap">
          <span className="intake-title-label">STRUCTURAL AUDIT</span>
          <span className="intake-title">{auditTitle || 'Untitled Audit'}</span>
        </div>
        <div className="intake-progress-text">
          {currentDim + 1} / {DIMENSIONS.length} DIMENSIONS
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="intake-progress-bar-wrap">
        <div className="intake-progress-bar" style={{ width: `${totalProgress}%`, background: dim.color, boxShadow: `0 0 12px ${dim.color}66` }} />
      </div>

      <div className="intake-body">

        {/* SIDEBAR — dimension list */}
        <aside className="intake-sidebar">
          {DIMENSIONS.map((d, i) => (
            <div
              key={d.id}
              className={`intake-dim-item ${i === currentDim ? 'active' : ''} ${i < currentDim ? 'done' : ''} ${i > currentDim ? 'locked' : ''}`}
              onClick={() => i <= currentDim && setCurrentDim(i)}
              style={{ borderLeftColor: i === currentDim ? d.color : i < currentDim ? '#00B894' : '#162035' }}
            >
              <span className="intake-dim-icon" style={{ color: i === currentDim ? d.color : i < currentDim ? '#00B894' : '#2A3A55' }}>
                {i < currentDim ? '✓' : d.icon}
              </span>
              <div>
                <div className="intake-dim-id" style={{ color: i === currentDim ? d.color : i < currentDim ? '#00B894' : '#2A3A55' }}>{d.id}</div>
                <div className="intake-dim-label" style={{ color: i === currentDim ? '#F0F4FF' : i < currentDim ? '#6B7FA3' : '#2A3A55' }}>{d.label}</div>
              </div>
              {i === currentDim && <span className="intake-dim-active-dot" style={{ background: d.color }} />}
            </div>
          ))}
        </aside>

        {/* MAIN FORM */}
        <main className="intake-main">
          <div className="intake-form-wrap">

            {/* Dimension header */}
            <div className="intake-dim-header">
              <div className="intake-dim-tag" style={{ color: dim.color, borderColor: `${dim.color}44` }}>
                <span>{dim.icon}</span>
                {dim.id} — {dim.label}
              </div>
              <h2 className="intake-dim-title" style={{ color: dim.color }}>{dim.title}</h2>
              <p className="intake-dim-desc">
                Answer honestly — adversarial agents will pressure-test every claim you make here.
              </p>
            </div>

            {/* Questions */}
            <div className="intake-questions">
              {dim.questions.map((q, qi) => (
                <div key={q.key} className="intake-question" style={{ animationDelay: `${qi * 0.1}s` }}>
                  <label className="intake-q-label">
                    <span className="intake-q-num" style={{ color: dim.color }}>Q{qi + 1}</span>
                    {q.label}
                  </label>

                  {q.type === 'textarea' && (
                    <textarea
                      className="intake-textarea"
                      placeholder={q.placeholder}
                      value={getAnswer(q.key)}
                      onChange={e => setAnswer(q.key, e.target.value)}
                      rows={4}
                      style={{ '--focus-color': dim.color }}
                    />
                  )}

                  {q.type === 'text' && (
                    <input
                      type="text"
                      className="intake-input"
                      placeholder={q.placeholder}
                      value={getAnswer(q.key)}
                      onChange={e => setAnswer(q.key, e.target.value)}
                      style={{ '--focus-color': dim.color }}
                    />
                  )}

                  {q.type === 'select' && (
                    <div className="intake-options">
                      {q.options.map(opt => (
                        <button
                          key={opt}
                          className={`intake-option ${getAnswer(q.key) === opt ? 'selected' : ''}`}
                          onClick={() => setAnswer(q.key, opt)}
                          style={{
                            borderColor: getAnswer(q.key) === opt ? dim.color : '#1E2D45',
                            color: getAnswer(q.key) === opt ? dim.color : '#6B7FA3',
                            background: getAnswer(q.key) === opt ? `${dim.color}11` : 'transparent',
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'slider' && (
                    <div className="intake-slider-wrap">
                      <input
                        type="range" min="1" max="10"
                        value={getAnswer(q.key) || 5}
                        onChange={e => setAnswer(q.key, e.target.value)}
                        className="intake-slider"
                        style={{ accentColor: dim.color }}
                      />
                      <div className="intake-slider-labels">
                        <span>1 — LOW PAIN</span>
                        <span className="intake-slider-val" style={{ color: dim.color }}>
                          {getAnswer(q.key) || 5} / 10
                        </span>
                        <span>10 — CRITICAL PAIN</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Nav buttons */}
            <div className="intake-nav">
              <button
                onClick={goBack}
                disabled={currentDim === 0}
                className="intake-btn-back"
              >
                ← BACK
              </button>

              <div className="intake-nav-right">
                <span className="intake-complete-check">
                  {isDimComplete()
                    ? <span style={{ color: '#00B894' }}>✓ DIMENSION COMPLETE</span>
                    : <span style={{ color: '#2A3A55' }}>Fill all fields to continue</span>
                  }
                </span>
                <button
                  onClick={saveAndNext}
                  disabled={saving}
                  className="intake-btn-next"
                  style={{ background: dim.color, boxShadow: `0 0 20px ${dim.color}44` }}
                >
                  {saving ? 'SAVING...' : currentDim === DIMENSIONS.length - 1 ? '▸ RUN ANALYSIS →' : `▸ NEXT: ${DIMENSIONS[currentDim + 1]?.label} →`}
                </button>
              </div>
            </div>

          </div>
        </main>

        {/* RIGHT PANEL — context */}
        <aside className="intake-context">
          <div className="intake-ctx-block">
            <div className="intake-ctx-title">DIMENSION WEIGHT</div>
            <div className="intake-ctx-score" style={{ color: dim.color }}>
              {['18%', '15%', '12%', '14%', '13%', '10%', '10%'][currentDim]}
            </div>
            <div className="intake-ctx-sub">of Fragility Index</div>
          </div>

          <div className="intake-ctx-block">
            <div className="intake-ctx-title">AGENT ASSIGNED</div>
            {[
              'Market Skeptic',
              'Financial Realist',
              'Competitor Strategist',
              'Financial Realist',
              'Competitor Strategist',
              'Financial Realist',
              'Meta Synthesizer',
            ].map((a, i) => i === currentDim && (
              <div key={a} className="intake-ctx-agent" style={{ color: dim.color }}>
                {dim.icon} {a.toUpperCase()}
              </div>
            ))}
          </div>

          <div className="intake-ctx-block">
            <div className="intake-ctx-title">WHAT AGENTS LOOK FOR</div>
            <div className="intake-ctx-tips">
              {[
                ['Specificity of problem', 'Evidence quality', 'Urgency signals', 'Problem-market fit'],
                ['Segment size accuracy', 'Willingness to pay', 'Accessibility', 'Customer concentration risk'],
                ['Differentiation clarity', 'Moat defensibility', 'Value clarity', 'Competitive response'],
                ['Revenue model viability', 'Unit economics health', 'Pricing power', 'Monetization timing'],
                ['Channel scalability', 'CAC sustainability', 'GTM realism', 'Distribution moat'],
                ['Burn rate sustainability', 'Runway adequacy', 'Cost structure efficiency', 'Financial discipline'],
                ['Domain expertise', 'Execution capability', 'Team completeness', 'Founder-market fit'],
              ][currentDim].map(tip => (
                <div key={tip} className="intake-ctx-tip">
                  <span style={{ color: dim.color }}>◦</span> {tip}
                </div>
              ))}
            </div>
          </div>

          <div className="intake-ctx-block">
            <div className="intake-ctx-title">PROGRESS</div>
            <div className="intake-progress-mini">
              {DIMENSIONS.map((d, i) => (
                <div
                  key={d.id}
                  className="intake-progress-dot"
                  style={{ background: i < currentDim ? '#00B894' : i === currentDim ? d.color : '#162035', boxShadow: i === currentDim ? `0 0 8px ${d.color}` : 'none' }}
                />
              ))}
            </div>
            <div className="intake-progress-pct" style={{ color: dim.color }}>
              {Math.round(totalProgress)}% COMPLETE
            </div>
          </div>
        </aside>

      </div>

      <style>{`
        .intake-wrap { min-height:100vh; background:#050609; color:#F0F4FF; font-family:'Barlow Condensed',sans-serif; display:flex; flex-direction:column; }

        .intake-header { height:52px; background:#080B12; border-bottom:1px solid #162035; display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0; }
        .intake-back { font-family:'DM Mono',monospace; font-size:11px; color:#6B7FA3; text-decoration:none; letter-spacing:.1em; transition:color .2s; }
        .intake-back:hover { color:#D63031; }
        .intake-title-wrap { display:flex; flex-direction:column; align-items:center; }
        .intake-title-label { font-family:'DM Mono',monospace; font-size:9px; color:#2A3A55; letter-spacing:.25em; }
        .intake-title { font-family:'Orbitron',monospace; font-size:12px; font-weight:700; color:#F0F4FF; letter-spacing:.1em; }
        .intake-progress-text { font-family:'DM Mono',monospace; font-size:11px; color:#6B7FA3; letter-spacing:.1em; }

        .intake-progress-bar-wrap { height:3px; background:#0C1020; flex-shrink:0; }
        .intake-progress-bar { height:100%; transition:width .6s cubic-bezier(0.34,1.2,0.64,1); }

        .intake-body { display:grid; grid-template-columns:200px 1fr 220px; flex:1; overflow:hidden; min-height:calc(100vh - 55px); }

        /* SIDEBAR */
        .intake-sidebar { background:#080B12; border-right:1px solid #162035; overflow-y:auto; padding:16px 0; }
        .intake-dim-item { display:flex; align-items:center; gap:10px; padding:12px 16px; cursor:pointer; border-left:2px solid #162035; transition:all .2s; position:relative; }
        .intake-dim-item.active { background:rgba(214,48,49,.04); }
        .intake-dim-item.done { cursor:pointer; }
        .intake-dim-item.locked { cursor:default; opacity:.5; }
        .intake-dim-icon { font-size:14px; width:18px; text-align:center; flex-shrink:0; transition:color .2s; }
        .intake-dim-id { font-family:'Orbitron',monospace; font-size:9px; font-weight:700; letter-spacing:.1em; }
        .intake-dim-label { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.05em; }
        .intake-dim-active-dot { position:absolute; right:12px; width:5px; height:5px; border-radius:50%; animation:blinkAnim 1.5s ease infinite; }

        /* MAIN */
        .intake-main { overflow-y:auto; padding:32px; }
        .intake-form-wrap { max-width:620px; margin:0 auto; }

        .intake-dim-header { margin-bottom:32px; }
        .intake-dim-tag { display:inline-flex; align-items:center; gap:8px; border:1px solid; padding:5px 14px; margin-bottom:16px; font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.2em; }
        .intake-dim-title { font-family:'Barlow Condensed',sans-serif; font-size:36px; font-weight:900; letter-spacing:-.01em; margin-bottom:8px; }
        .intake-dim-desc { font-family:'DM Mono',monospace; font-size:11px; color:#6B7FA3; line-height:1.7; }

        .intake-questions { display:flex; flex-direction:column; gap:28px; margin-bottom:32px; }
        .intake-question { display:flex; flex-direction:column; gap:10px; animation:fadeUp .4s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blinkAnim { 0%,100%{opacity:1} 50%{opacity:0.1} }

        .intake-q-label { font-family:'DM Mono',monospace; font-size:12px; color:#A0B4CC; line-height:1.6; display:flex; gap:10px; align-items:flex-start; }
        .intake-q-num { font-family:'Orbitron',monospace; font-size:11px; font-weight:700; flex-shrink:0; margin-top:1px; }

        .intake-textarea { width:100%; background:#0C1020; border:1px solid #1E2D45; color:#F0F4FF; padding:14px 16px; font-family:'DM Mono',monospace; font-size:12px; line-height:1.7; outline:none; resize:vertical; min-height:100px; transition:border-color .2s; }
        .intake-textarea::placeholder { color:#2A3A55; }
        .intake-textarea:focus { border-color:var(--focus-color, #D63031); box-shadow:0 0 0 1px rgba(214,48,49,.1); }

        .intake-input { width:100%; background:#0C1020; border:1px solid #1E2D45; color:#F0F4FF; padding:14px 16px; font-family:'DM Mono',monospace; font-size:13px; outline:none; transition:border-color .2s; clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px)); }
        .intake-input::placeholder { color:#2A3A55; }
        .intake-input:focus { border-color:var(--focus-color, #D63031); }

        .intake-options { display:flex; flex-wrap:wrap; gap:8px; }
        .intake-option { padding:9px 16px; border:1px solid #1E2D45; background:transparent; cursor:pointer; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.05em; transition:all .2s; clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px)); }

        .intake-slider-wrap { display:flex; flex-direction:column; gap:10px; }
        .intake-slider { width:100%; height:4px; cursor:pointer; }
        .intake-slider-labels { display:flex; justify-content:space-between; font-family:'DM Mono',monospace; font-size:10px; color:#2A3A55; letter-spacing:.05em; }
        .intake-slider-val { font-weight:700; font-size:13px; }

        /* NAV */
        .intake-nav { display:flex; align-items:center; justify-content:space-between; padding-top:24px; border-top:1px solid #162035; flex-wrap:wrap; gap:16px; }
        .intake-btn-back { background:transparent; border:1px solid #1E2D45; color:#6B7FA3; padding:12px 20px; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.1em; cursor:pointer; transition:all .2s; }
        .intake-btn-back:hover { border-color:#D63031; color:#D63031; }
        .intake-btn-back:disabled { opacity:.3; cursor:not-allowed; }
        .intake-nav-right { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
        .intake-complete-check { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.05em; }
        .intake-btn-next { color:white; border:none; padding:13px 24px; font-family:'Orbitron',monospace; font-size:12px; font-weight:700; letter-spacing:.1em; cursor:pointer; transition:all .3s; clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px)); white-space:nowrap; }
        .intake-btn-next:hover { transform:translateY(-1px); filter:brightness(1.1); }
        .intake-btn-next:disabled { opacity:.5; cursor:not-allowed; transform:none; }

        /* RIGHT CONTEXT */
        .intake-context { background:#080B12; border-left:1px solid #162035; padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:20px; }
        .intake-ctx-block { background:#0C1020; border:1px solid #162035; padding:14px; }
        .intake-ctx-title { font-family:'DM Mono',monospace; font-size:9px; color:#D63031; letter-spacing:.25em; margin-bottom:10px; }
        .intake-ctx-score { font-family:'Orbitron',monospace; font-size:28px; font-weight:900; line-height:1; }
        .intake-ctx-sub { font-family:'DM Mono',monospace; font-size:10px; color:#2A3A55; margin-top:4px; }
        .intake-ctx-agent { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.08em; }
        .intake-ctx-tips { display:flex; flex-direction:column; gap:6px; }
        .intake-ctx-tip { font-family:'DM Mono',monospace; font-size:10px; color:#6B7FA3; display:flex; gap:6px; line-height:1.4; }
        .intake-progress-mini { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
        .intake-progress-dot { width:8px; height:8px; border-radius:50%; transition:all .3s; }
        .intake-progress-pct { font-family:'Orbitron',monospace; font-size:13px; font-weight:700; }

        @media(max-width:900px) {
          .intake-body { grid-template-columns:1fr; }
          .intake-sidebar,.intake-context { display:none; }
        }
      `}</style>
    </div>
  )
}