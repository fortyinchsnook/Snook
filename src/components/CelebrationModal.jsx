import { useEffect, useState } from 'react'
import Mascot from './Mascot'
import { shareCatch } from '../lib/shareImage'

const CONFETTI_COLORS = ['#2FE6D9', '#FFC93C', '#B26BFF', '#3ADB7A', '#FF5A36', '#E7EDF2']

export default function CelebrationModal({ result, onClose }) {
  const [pieces, setPieces] = useState([])
  const [sharing, setSharing] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

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

  async function handleShare() {
    setSharing(true)
    setShareMsg('')
    let msg = ''
    try {
      const shareResult = await shareCatch({
        photoUrl: result.photoUrl,
        handle: result.handle,
        length: result.length,
        tierLabel: tier.label,
        verification: result.verification,
        catchId: result.catchId,
      })
      if (shareResult === 'downloaded-and-copied') {
        msg = 'Image saved — link copied, paste it into your post!'
      } else if (shareResult === 'downloaded') {
        msg = 'Image saved to your device.'
      }
    } catch (err) {
      if (err?.name !== 'AbortError') console.error(err)
    } finally {
      setSharing(false)
      if (msg) {
        setShareMsg(msg)
        setTimeout(() => setShareMsg(''), 4000)
      }
    }
  }

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
        <button className="celebrate-share" onClick={handleShare} disabled={sharing} style={{
          background: 'none', border: '2px solid var(--teal)', color: 'var(--teal)', fontWeight: 800,
          fontSize: 14, padding: '10px 20px', borderRadius: 12, cursor: 'pointer', marginTop: 10, marginBottom: 4,
        }}>
          {sharing ? 'Preparing…' : '📤 Share this catch'}
        </button>
        {shareMsg && (
          <div className="hint" style={{ color: 'var(--green)', textAlign: 'center', fontSize: 12 }}>
            {shareMsg}
          </div>
        )}
        <button className="celebrate-close" onClick={onClose}>
          Let's gooo 🔥
        </button>
      </div>
    </div>
  )
}
