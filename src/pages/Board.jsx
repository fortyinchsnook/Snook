import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { tierFor } from '../lib/sizeTier'
import { voteVerdict, VOTES_UNTIL_VERDICT } from '../lib/voteVerdict'
import CertifiedSeal from '../components/CertifiedSeal'
import Mascot from '../components/Mascot'
import ConfirmDialog from '../components/ConfirmDialog'

const PAGE_SIZE = 10

function CatchRow({ c, rank, votes, myVote, onVote, showAgree, onSelectUser, onFlag, flagged, onOpen, isMine, onRequestDelete, isGuest, onRequireAuth }) {
  const t = tierFor(c.length, c.verification)
  const agreeCount = votes.filter((v) => v.value === 'agree').length
  const disagreeCount = votes.filter((v) => v.value === 'disagree').length
  const total = agreeCount + disagreeCount
  const agreePct = total ? Math.round((agreeCount / total) * 100) : 0
  const commentCount = c.comments?.[0]?.count || 0
  const verdict = voteVerdict(agreeCount, disagreeCount)

  function guarded(action, msg) {
    return (e) => {
      e.stopPropagation()
      if (isGuest) {
        onRequireAuth(msg)
        return
      }
      action(e)
    }
  }

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
          onClick={guarded(() => onFlag(c.id), 'Sign in to report this post.')}
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
      </div>
      <div className="length-num">
        <div className={`num ${t ? t.cls : ''}`}>
          {c.length}<sup>"{c.verification === 'liar' ? '?' : ''}</sup>
        </div>
        {c.verification === 'liar' && showAgree ? (
          <div className="agree-ratio">
            {verdict ? (
              <>
                <span className={`verdict-badge ${verdict.cls}`}>{verdict.label}</span>
                <div className="verdict-pct">{verdict.pct}% agree</div>
              </>
            ) : total > 0 ? (
              `${agreePct}% agree · verdict at ${VOTES_UNTIL_VERDICT} votes`
            ) : (
              'no votes yet'
            )}
            {t && <div className="tier-label">{t.label}</div>}
          </div>
        ) : (
          t && <div className="tier-label">{t.label}</div>
        )}
        {c.verification === 'liar' && (
          <div className="mini-vote">
            <button
              className={myVote === 'agree' ? 'voted' : ''}
              onClick={guarded(() => onVote(c.id, 'agree'), "Think that's really that big? 🤔 Sign up free and cast your vote.")}
            >
              👍
            </button>
            <button
              className={myVote === 'disagree' ? 'voted' : ''}
              onClick={guarded(() => onVote(c.id, 'disagree'), "Think that's really that big? 🤔 Sign up free and cast your vote.")}
            >
              👎
            </button>
          </div>
        )}
      </div>
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
  )
}

export default function Board({ session, onSelectUser, onOpenCatch, refreshKey, onRequireAuth }) {
  const isGuest = !session
  const [view, setView] = useState('certified')
  const [catches, setCatches] = useState([])
  const [votesByCatch, setVotesByCatch] = useState({})
  const [flaggedIds, setFlaggedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  async function loadData() {
    setLoading(true)
    setLoadError('')
    const { data: catchData, error: catchError } = await supabase
      .from('catches')
      .select('*, profiles(handle), comments(count)')
      .order('length', { ascending: false })

    if (catchError) {
      setLoadError("Couldn't load the leaderboard — check your connection and try again.")
      setLoading(false)
      return
    }

    const { data: voteData, error: voteError } = await supabase.from('votes').select('*')
    if (voteError) {
      setLoadError("Couldn't load votes — try refreshing.")
      setLoading(false)
      return
    }

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
    setVisibleCount(PAGE_SIZE)
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
        {!loading && loadError && (
          <div className="empty-state error">
            {loadError}
            <button className="load-more-btn" style={{ marginTop: 10 }} onClick={loadData}>Try Again</button>
          </div>
        )}
        {!loading && !loadError && list.length === 0 && (
          <div className="empty-state">Nothing logged yet — be the first to post a catch!</div>
        )}
        {!loading &&
          !loadError &&
          list.map((c, i) => (
            <CatchRow
              key={c.id}
              c={c}
              rank={i + 1}
              votes={votesByCatch[c.id] || []}
              myVote={session ? (votesByCatch[c.id] || []).find((v) => v.user_id === session.user.id)?.value : undefined}
              onVote={handleVote}
              onSelectUser={onSelectUser}
              onFlag={handleFlag}
              flagged={flaggedIds.has(c.id)}
              onOpen={onOpenCatch}
              isMine={session ? c.user_id === session.user.id : false}
              onRequestDelete={setConfirmDeleteId}
              isGuest={isGuest}
              onRequireAuth={onRequireAuth}
              showAgree
            />
          ))}
        {!loading && !loadError && hasMore && (
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
