// Turns a raw agree/disagree vote count into a community "verdict" badge.
// Needs at least MIN_VOTES total before a verdict is shown at all — a
// single early vote at 100% or 0% doesn't mean anything yet.
const MIN_VOTES = 5

export function voteVerdict(agreeCount, disagreeCount) {
  const total = agreeCount + disagreeCount
  if (total < MIN_VOTES) return null

  const pct = Math.round((agreeCount / total) * 100)

  if (pct >= 80) return { label: '✅ Community Verified', cls: 'verdict-verified', pct }
  if (pct >= 60) return { label: '🤔 Mostly Believed', cls: 'verdict-believed', pct }
  if (pct >= 40) return { label: '😐 Split Decision', cls: 'verdict-split', pct }
  if (pct >= 20) return { label: '🤨 Skeptical Crowd', cls: 'verdict-skeptical', pct }
  return { label: "🤥 Nobody's Buying It", cls: 'verdict-rejected', pct }
}

export const VOTES_UNTIL_VERDICT = MIN_VOTES
