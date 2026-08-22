// The value ladder — every catch gets colored & labeled by this.
export const TIERS = [
  { key: 'good-job',       label: 'GOOD JOB',       min: 22, max: 25, cls: 'tier-neutral' },
  { key: 'solid',          label: 'SOLID',          min: 25, max: 28, cls: 'tier-green' },
  { key: 'got-em',         label: 'GOT EM!',        min: 28, max: 34, cls: 'tier-green' },
  { key: 'lunker',         label: 'LUNKER',         min: 34, max: 38, cls: 'tier-blue' },
  { key: 'big-momma',      label: 'BIG MOMMA',      min: 38, max: 40, cls: 'tier-blue' },
  { key: 'certified-slob', label: 'CERTIFIED SLOB', min: 40, max: 43, cls: 'tier-gold' },
  { key: 'insane',         label: 'INSANE',         min: 43, max: 46, cls: 'tier-gold' },
  { key: 'legendary',      label: 'LEGENDARY',      min: 46, max: Infinity, cls: 'tier-legendary' },
]

export function sizeTier(lenInput) {
  const n = parseFloat(lenInput)
  if (isNaN(n) || n < 22) return null
  const t = TIERS.find((t) => n >= t.min && n < t.max)
  return t ? { label: t.label, cls: t.cls } : TIERS[TIERS.length - 1]
}

// Same size boundaries and colors as the Certified ladder, but the Liars
// board shouldn't ever say "Certified" on an unverified catch — these
// names carry the same escalating doubt as the vote-verdict badges.
export const LIAR_TIERS = [
  { key: 'good-job',       label: 'SURE, BUDDY',              min: 22, max: 25, cls: 'tier-neutral' },
  { key: 'solid',          label: 'IF YOU SAY SO',             min: 25, max: 28, cls: 'tier-green' },
  { key: 'got-em',         label: 'SUSPICIOUSLY SPECIFIC',     min: 28, max: 34, cls: 'tier-green' },
  { key: 'lunker',         label: 'TALL TALE LUNKER',          min: 34, max: 38, cls: 'tier-blue' },
  { key: 'big-momma',      label: 'BIG MOMMA... ALLEGEDLY',    min: 38, max: 40, cls: 'tier-blue' },
  { key: 'certified-slob', label: 'FISH STORY SLOB',           min: 40, max: 43, cls: 'tier-gold' },
  { key: 'insane',         label: 'HARD TO SWALLOW',           min: 43, max: 46, cls: 'tier-gold' },
  { key: 'legendary',      label: 'LOCH NESS SNOOK',           min: 46, max: Infinity, cls: 'tier-legendary' },
]

export function liarTier(lenInput) {
  const n = parseFloat(lenInput)
  if (isNaN(n) || n < 22) return null
  const t = LIAR_TIERS.find((t) => n >= t.min && n < t.max)
  return t ? { label: t.label, cls: t.cls } : LIAR_TIERS[LIAR_TIERS.length - 1]
}

// Picks the right ladder based on whether the catch is verified —
// use this anywhere a tier label is shown next to a catch's length,
// instead of calling sizeTier directly.
export function tierFor(lenInput, verification) {
  return verification === 'liar' ? liarTier(lenInput) : sizeTier(lenInput)
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
