import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const AGENTS = [
  {
    id: 'market_skeptic',
    name: 'Market Skeptic',
    dimensions: ['D1', 'D2'],
    prompt: `You are the Market Skeptic agent for Devils Advocate 2.0. Your job is to ruthlessly attack the market assumptions of a startup.

Analyze the founder's input and respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-100, where 100 = maximum fragility>,
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "fatal_flaw": "The single most critical market assumption failure",
  "verdict": "One sentence adversarial verdict"
}`
  },
  {
    id: 'financial_realist',
    name: 'Financial Realist',
    dimensions: ['D4', 'D6'],
    prompt: `You are the Financial Realist agent for Devils Advocate 2.0. Your job is to stress-test unit economics, pricing, and financial sustainability.

Analyze the founder's input and respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-100, where 100 = maximum fragility>,
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "fatal_flaw": "The single most critical financial assumption failure",
  "verdict": "One sentence adversarial verdict"
}`
  },
  {
    id: 'competitor_strategist',
    name: 'Competitor Strategist',
    dimensions: ['D3', 'D5'],
    prompt: `You are the Competitor Strategist agent for Devils Advocate 2.0. Your job is to expose moat gaps, competitive vulnerabilities, and GTM weaknesses.

Analyze the founder's input and respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-100, where 100 = maximum fragility>,
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "fatal_flaw": "The single most critical competitive assumption failure",
  "verdict": "One sentence adversarial verdict"
}`
  },
  {
    id: 'regulatory_analyst',
    name: 'Regulatory Analyst',
    dimensions: ['D1', 'D4'],
    prompt: `You are the Regulatory Analyst agent for Devils Advocate 2.0. Your job is to surface legal exposure, compliance risks, and regulatory threats specific to India.

Analyze the founder's input and respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-100, where 100 = maximum fragility>,
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "fatal_flaw": "The single most critical regulatory or legal risk",
  "verdict": "One sentence adversarial verdict"
}`
  },
  {
    id: 'meta_risk_synthesizer',
    name: 'Meta Risk Synthesizer',
    dimensions: ['D1','D2','D3','D4','D5','D6','D7'],
    prompt: `You are the Meta Risk Synthesizer agent for Devils Advocate 2.0. Your job is to look across ALL dimensions and identify the single fatal structural flaw that will kill this startup.

Analyze ALL of the founder's input across all 7 dimensions and respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-100, where 100 = maximum fragility>,
  "weaknesses": ["cross-dimension risk 1", "cross-dimension risk 2", "cross-dimension risk 3"],
  "fatal_flaw": "The ONE thing that will kill this startup if not fixed",
  "verdict": "One definitive adversarial verdict on the entire startup structure"
}`
  },
]

const WEIGHTS = { D1: 0.18, D2: 0.15, D3: 0.12, D4: 0.14, D5: 0.13, D6: 0.10, D7: 0.10 }

function calculateFragilityIndex(agentScores) {
  // Average all agent scores
  const avg = agentScores.reduce((s, a) => s + a, 0) / agentScores.length
  // Clamp between 0-100
  return Math.min(100, Math.max(0, Math.round(avg)))
}

function getRiskZone(score) {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 25) return 'MODERATE'
  return 'RESILIENT'
}

async function runAgent(agent, founderInput) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `${agent.prompt}\n\nFOUNDER INPUT:\n${JSON.stringify(founderInput, null, 2)}\n\nRespond with ONLY valid JSON. No preamble, no explanation, no markdown.`
      }]
    })

    const text = response.content[0].text
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (err) {
    // Fallback score if API fails
    return {
      score: 65,
      weaknesses: ['Unable to fully analyze — insufficient data provided', 'Assumptions could not be verified', 'Manual review recommended'],
      fatal_flaw: 'Analysis incomplete due to processing error',
      verdict: 'Insufficient data for complete adversarial analysis.'
    }
  }
}

export async function POST(request) {
  try {
    const { auditId } = await request.json()

    if (!auditId) {
      return Response.json({ error: 'auditId required' }, { status: 400 })
    }

    // 1. Fetch all intake responses for this audit
    const { data: intakeData } = await supabase
      .from('intake_responses')
      .select('*')
      .eq('audit_id', auditId)

    if (!intakeData || intakeData.length === 0) {
      return Response.json({ error: 'No intake data found' }, { status: 400 })
    }

    // 2. Format intake data for agents
    const founderInput = {}
    intakeData.forEach(row => {
      if (!founderInput[row.dimension]) founderInput[row.dimension] = {}
      if (row.response?.key) {
        founderInput[row.dimension][row.response.key] = row.response.value
      }
    })

    // 3. Run all 5 agents
    const agentResults = []
    for (const agent of AGENTS) {
      const result = await runAgent(agent, founderInput)
      agentResults.push({ agent, result })

      // Save agent output to DB
      await supabase.from('agent_outputs').upsert({
        audit_id: auditId,
        agent_name: agent.id,
        score: result.score,
        weaknesses: result.weaknesses,
        raw_output: result,
      }, { onConflict: 'audit_id,agent_name' })
    }

    // 4. Calculate Fragility Index
    const scores = agentResults.map(r => r.result.score)
    const fragilityScore = calculateFragilityIndex(scores)
    const riskZone = getRiskZone(fragilityScore)

    // 5. Update audit record
    await supabase.from('audits').update({
      fragility_score: fragilityScore,
      risk_zone: riskZone,
      status: 'complete',
      updated_at: new Date().toISOString(),
    }).eq('id', auditId)

    return Response.json({
      success: true,
      fragility_score: fragilityScore,
      risk_zone: riskZone,
      agent_results: agentResults.map(r => ({
        agent: r.agent.name,
        score: r.result.score,
        fatal_flaw: r.result.fatal_flaw,
        verdict: r.result.verdict,
      }))
    })

  } catch (err) {
    console.error('Pipeline error:', err)
    return Response.json({ error: 'Pipeline failed', details: err.message }, { status: 500 })
  }
}