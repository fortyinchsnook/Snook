import mascotCalm from '../assets/mascot-calm.png'
import mascotHype from '../assets/mascot-hype.png'
import mascotSkeptical from '../assets/mascot-skeptical.png'

const VARIANTS = {
  calm: mascotCalm,           // header, sign-in — steady default presence
  hype: mascotHype,           // celebration modal — big catch energy
  skeptical: mascotSkeptical, // Liars leaderboard — "prove it" side-eye
}

export default function Mascot({ variant = 'calm', className = '' }) {
  return (
    <img
      className={`mascot-img ${className}`}
      src={VARIANTS[variant] || VARIANTS.calm}
      alt="Snook Club mascot"
    />
  )
}
