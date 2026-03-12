export function calculateFragilityIndex(dimensions, shockResults) {

  const weights = {
    D1: 0.18,
    D2: 0.15,
    D3: 0.12,
    D4: 0.14,
    D5: 0.13,
    D6: 0.10,
    D7: 0.10,
  }

  let resilience = 0
  resilience += (dimensions.D1 || 50) * weights.D1
  resilience += (dimensions.D2 || 50) * weights.D2
  resilience += (dimensions.D3 || 50) * weights.D3
  resilience += (dimensions.D4 || 50) * weights.D4
  resilience += (dimensions.D5 || 50) * weights.D5
  resilience += (dimensions.D6 || 50) * weights.D6
  resilience += (dimensions.D7 || 50) * weights.D7

  const shockFails = shockResults.filter(s => s === 'FAIL').length
  const shockPenalty = shockFails * 4
  resilience -= shockPenalty

  const fragility = Math.round(100 - resilience)
  const clamped = Math.max(0, Math.min(100, fragility))

  let zone
  if (clamped >= 75)      zone = 'CRITICAL'
  else if (clamped >= 50) zone = 'HIGH'
  else if (clamped >= 25) zone = 'MODERATE'
  else                    zone = 'RESILIENT'

  return {
    score: clamped,
    zone: zone
  }
}