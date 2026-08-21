import badgeBase from '../assets/tier-badge-base.png'

// Same shared artwork for every tier — the "CERTIFIED [tier]" text is
// rendered on top rather than baked into 8 separate images, with a
// color-coded ring matching the app's existing tier-color system.
export default function TierBadge({ tier, unlocked = true, size = 90 }) {
  return (
    <div
      className={`tier-badge ${tier.cls} ${unlocked ? 'unlocked' : 'locked'}`}
      style={{ width: size }}
    >
      <div className="tier-badge-wrap">
        <img src={badgeBase} alt={`Certified ${tier.label} badge`} />
        <div className="tier-badge-ring" />
        <div className="tier-badge-banner">
          <div className="line1">CERTIFIED</div>
          <div className="line2">{tier.label}</div>
        </div>
        {!unlocked && <div className="tier-badge-lock">🔒</div>}
      </div>
      <div className="tier-badge-name">{tier.label}</div>
    </div>
  )
}
