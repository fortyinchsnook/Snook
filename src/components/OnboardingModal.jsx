import { useState } from 'react'
import Mascot from './Mascot'

const SLIDES = [
  {
    icon: 'calm',
    title: '🎣 Welcome to 40" Snook Club',
    body: "Post your snook, chase the leaderboard, and let the club decide if your buddy's \"38-incher\" is legit.",
  },
  {
    icon: 'calm',
    title: '📏 Certified vs 🤥 Liars',
    body: "Got a bump board or tape in the photo? That's Certified — hard numbers, its own leaderboard. Hand-held with no proof? That's a Liar's claim — still counts, but the community votes on whether they buy it.",
  },
  {
    icon: 'skeptical',
    title: '🤐 We never ask where, exactly',
    body: 'Only your county ever shows — never a pin, a name, or a landmark. Brag about the fish, not the spot.',
  },
  {
    icon: 'hype',
    title: '🏆 Every inch counts',
    body: 'From "Good Job" at 22" to full-on Legendary at 46"+. Log your catch and see where it lands.',
  },
]

export default function OnboardingModal({ onDismiss }) {
  const [index, setIndex] = useState(0)
  const isLast = index === SLIDES.length - 1
  const slide = SLIDES[index]

  return (
    <div className="onboard-overlay show">
      <div className="onboard-card">
        <button className="onboard-skip" onClick={onDismiss}>Skip</button>

        <div className="onboard-mascot">
          <Mascot variant={slide.icon} className="mascot-lg" />
        </div>

        <div className="onboard-title">{slide.title}</div>
        <div className="onboard-body">{slide.body}</div>

        <div className="onboard-dots">
          {SLIDES.map((_, i) => (
            <span key={i} className={`onboard-dot ${i === index ? 'active' : ''}`} />
          ))}
        </div>

        <button
          className="onboard-next"
          onClick={() => (isLast ? onDismiss() : setIndex(index + 1))}
        >
          {isLast ? "Let's fish 🎣" : 'Next'}
        </button>
      </div>
    </div>
  )
}
