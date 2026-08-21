// The value ladder — every catch gets colored & labeled by this.
export function sizeTier(lenInput) {
  const n = parseFloat(lenInput)
  if (isNaN(n) || n < 22) return null
  if (n < 25) return { label: 'GOOD JOB', cls: 'tier-neutral' }
  if (n < 28) return { label: 'SOLID', cls: 'tier-green' }
  if (n < 34) return { label: 'GOT EM!', cls: 'tier-green' }
  if (n < 38) return { label: 'LUNKER', cls: 'tier-blue' }
  if (n < 40) return { label: 'BIG MOMMA', cls: 'tier-blue' }
  if (n < 43) return { label: 'CERTIFIED SLOB', cls: 'tier-gold' }
  if (n < 46) return { label: 'INSANE', cls: 'tier-gold' }
  return { label: 'LEGENDARY', cls: 'tier-legendary' }
}

export const tierIcon = {
  'tier-neutral': '🙂',
  'tier-green': '💪',
  'tier-blue': '🔥',
  'tier-gold': '👑',
  'tier-legendary': '⚡️🐊',
}

export const FL_COUNTIES = [
  'Monroe', 'Miami-Dade', 'Broward', 'Palm Beach', 'Martin', 'St. Lucie',
  'Indian River', 'Brevard', 'Lee', 'Collier', 'Charlotte', 'Sarasota',
  'Manatee', 'Pinellas', 'Hillsborough', 'Citrus', 'Levy', 'Franklin',
  'Bay', 'Escambia',
].map((c) => `${c}, FL`)

export const TX_COUNTIES = ['Cameron', 'Willacy', 'Kenedy', 'Kleberg'].map(
  (c) => `${c}, TX`
)

export const SPOT_TYPES = [
  '🌉 Bridge', '🏖️ Beach', '🎣 Pier', '⚓ Dock', '🌀 Spillway',
  '🌿 Mangrove/Backcountry', '🪨 Jetty/Pass', '🩵 Flats', '❓ Other',
]
