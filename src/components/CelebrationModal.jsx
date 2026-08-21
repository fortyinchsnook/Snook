import { useEffect, useState } from 'react'
import Mascot from './Mascot'

const CONFETTI_COLORS = ['#2FE6D9', '#FFC93C', '#B26BFF', '#3ADB7A', '#FF5A36', '#E7EDF2']

export default function CelebrationModal({ result, onClose }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!result) return
    const count = result.tier.cls === 'tier-legendary' ? 46 : 26
    setPieces(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        duration: 1.1 + Math.random() * 0.9,
        delay: Math.random() * 0.35,
        rotate: Math.random() * 360,
      }))
    )
  }, [result])

  if (!result) return null
  const { length, tier } = result

  return (
    <div className={`celebrate-overlay ${result ? 'show' : ''}`}>
      <div className="celebrate-card">
        {pieces.map((p, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              background: p.color,
              animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        ))}
        <div className="icon-row"><Mascot variant="hype" className="mascot-lg" /></div>
        <div className={`slogan ${tier.cls}`}>{tier.label}!</div>
        <div className={`len-big ${tier.cls}`}>{length}"</div>
        <div className="sub">logged to the board</div>
        <button className="celebrate-close" onClick={onClose}>
          Let's gooo 🔥
        </button>
      </div>
    </div>
  )
}
