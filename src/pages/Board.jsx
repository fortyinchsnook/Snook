import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { sizeTier } from '../lib/sizeTier'
import CertifiedSeal from '../components/CertifiedSeal'
import Mascot from '../components/Mascot'
import ConfirmDialog from '../components/ConfirmDialog'

const PAGE_SIZE = 10

function CatchRow({ c, rank, votes, myVote, onVote, showAgree, onSelectUser, onFlag, flagged, onOpen, isMine, onRequestDelete }) {
  const t = sizeTier(c.length)
  const agreeCount = votes.filter((v) => v.value === 'agree').length
  const disagreeCount = votes.filter((v) => v.value === 'disagree').length
  const total = agreeCount + disagreeCount
  const agreePct = total ? Math.round((agreeCount / total) * 100) : 0
  const commentCount = c.comments?.[0]?.count || 0

  return (
    <div className="lb-row" onClick={() => onOpen(c.id)}>
      {isMine ? (
        <button
          className="corner-btn delete-btn"
          title="Delete this catch"
          onClick={(e) => { e.stopPropagation(); onRequestDelete(c.id) }}
        >
          🗑️
        </button>
      ) : (
        <button
          className="flag-btn"
          title={flagged ? 'Reported — thanks' : 'Report this post'}
          disabled={flagged}
          onClick={(e) => { e.stopPropagation(); onFlag(c.id) }}
        >
          {flagged ? '✓' : '🚩'}
        </button>
      )}
      <div className={`rank ${rank === 1 ? 'gold' : ''}`}>{rank}</div>
      <div className="thumb">
        {c.photo_url ? (
          <img src={c.photo_url} alt="catch" />
        ) : (
          c.verification === 'certified' ? '🐠' : '🐟'
        )}
      </div>
      <div className="meta">
        <button className="angler-link" onClick={(e) => { e.stopPropagation(); onSelectUser(c.user_id) }}>
          {c.profiles?.handle || 'angler'}
        </button>
        <div className="sub">📍 {c.county} · {new Date(c.created_at).toLocaleDateString()}</div>
        <div className="tags-row">
          {c.verification === 'certified' ? (
            <span className="tier-tag cert">
              <CertifiedSeal size={15} uid={`row-${c.id}`} /> CERTIFIED
            </span>
          ) : (
            <span className="tier-tag alleg">🤥 LIAR</span>
          )}
          {c.spot_type && <span className="meta-tag">{c.spot_type}</span>}
          {c.lure && <span className="meta-tag">🎣 {c.lure}</span>}
          {commentCount > 0 && <span className="meta-tag comment-tag">💬 {commentCount}</span>}
        </div>
      </div>
      <div className="length-num">
        <div className={`num ${t ? t.cls : ''}`}>
          {c.length}<sup>"{c.verification === 'liar' ? '?' : ''}</sup>
        </div>
        {c.verification === 'liar' && showAgree ? (
          <div className="agree-ratio">
            {total ? `${agreePct}% agree` : 'no votes yet'}
          </div>
        ) : (
          t && <div className="tier-label">{t.label}</div>
        )}
        {c.verification === 'liar' && (
          <div className="mini-vote">
            <button
              className={myVote === 'agree' ? 'voted' : ''}
              onClick={(e) => { e.stopPropagation(); onVote(c.id, 'agree') }}
            >
              👍
            </button>
            <button
              className={myVote === 'disagree' ? 'voted' : ''}
              onClick={(e) => { e.stopPropagation(); onVote(c.id, 'disagree') }}
            >
              👎
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Board({ session, onSelectUser, onOpenCatch, refreshKey }) {
  const [view, setView] = useState('certified')
  const [catches, setCatches] = useState([])
  const [votesByCatch, setVotesByCatch] = useState({})
  const [flaggedIds, setFlaggedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  async function loadData() {
    setLoading(true)
    const { data: catchData } = await supabase
      .from('catches')
      .select('*, profiles(handle), comments(count)')
      .order('length', { ascending: false })

    const { data: voteData } = await supabase.from('votes').select('*')

    const grouped = {}
    ;(voteData || []).forEach((v) => {
      if (!grouped[v.catch_id]) grouped[v.catch_id] = []
      grouped[v.catch_id].push(v)
    })

    setCatches(catchData || [])
    setVotesByCatch(grouped)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [refreshKey])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE) // reset pagination whenever the tab changes
  }, [view])

  async function handleVote(catchId, value) {
    const userId = session.user.id
    const existing = (votesByCatch[catchId] || []).find((v) => v.user_id === userId)

    if (existing && existing.value === value) {
      await supabase.from('votes').delete().eq('id', existing.id)
    } else if (existing) {
      await supabase.from('votes').update({ value }).eq('id', existing.id)
    } else {
      await supabase.from('votes').insert({ catch_id: catchId, user_id: userId, value })
    }
    loadData()
  }

  async function handleFlag(catchId) {
    if (flaggedIds.has(catchId)) return
    setFlaggedIds((prev) => new Set(prev).add(catchId))
    await supabase.from('flags').insert({ catch_id: catchId, reporter_id: session.user.id })
  }

  async function handleConfirmDelete() {
    await supabase.from('catches').delete().eq('id', confirmDeleteId)
    setConfirmDeleteId(null)
    loadData()
  }

  const certified = catches.filter((c) => c.verification === 'certified')
  const liars = catches.filter((c) => c.verification === 'liar')
  const combined = [...catches]

  const fullList = view === 'certified' ? certified : view === 'allegedly' ? liars : combined
  const list = fullList.slice(0, visibleCount)
  const hasMore = fullList.length > visibleCount

  return (
    <section className="page active">
      <div className="segwrap">
        <div className="seg">
          <button className={view === 'certified' ? 'active cert' : ''} onClick={() => setView('certified')}>Certified</button>
          <button className={view === 'allegedly' ? 'active alleg' : ''} onClick={() => setView('allegedly')}>Liars</button>
          <button className={view === 'combined' ? 'active combo' : ''} onClick={() => setView('combined')}>Combined</button>
        </div>
      </div>

      <div className="privacy-note">
        🤐 <b>Spots stay secret.</b> We only ever show county-level location — never a pin, a
        name, or a landmark. A gentleman never reveals his honey hole.
      </div>

      <div className="section-label">
        {view === 'certified' && <><CertifiedSeal size={46} uid="sec" /> Certified Leaderboard <small>&nbsp;— bump board or tape in frame</small></>}
        {view === 'allegedly' && <><Mascot variant="skeptical" className="mascot-sm" /> Liars Leaderboard <small>&nbsp;— self-reported, community judged</small></>}
        {view === 'combined' && <><span className="badge-icon">🏆</span> Combined Top Catches <small>&nbsp;— tier badge always shown</small></>}
      </div>

      <div className="board">
        {loading && <div className="empty-state">Loading catches…</div>}
        {!loading && list.length === 0 && (
          <div className="empty-state">Nothing logged yet — be the first to post a catch!</div>
        )}
        {!loading &&
          list.map((c, i) => (
            <CatchRow
              key={c.id}
              c={c}
              rank={i + 1}
              votes={votesByCatch[c.id] || []}
              myVote={(votesByCatch[c.id] || []).find((v) => v.user_id === session.user.id)?.value}
              onVote={handleVote}
              onSelectUser={onSelectUser}
              onFlag={handleFlag}
              flagged={flaggedIds.has(c.id)}
              onOpen={onOpenCatch}
              isMine={c.user_id === session.user.id}
              onRequestDelete={setConfirmDeleteId}
              showAgree
            />
          ))}
        {!loading && hasMore && (
          <button className="load-more-btn" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
            Load More
          </button>
        )}
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete this catch?"
          message="This removes it from every leaderboard along with its votes and comments. This can't be undone."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </section>
  )
}
