import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { sizeTier } from '../lib/sizeTier'
import CertifiedSeal from '../components/CertifiedSeal'
import ConfirmDialog from './ConfirmDialog'

export default function CatchDetail({ catchId, session, onClose, onChanged }) {
  const [c, setC] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [confirmDeleteCatch, setConfirmDeleteCatch] = useState(false)
  const [confirmDeleteComment, setConfirmDeleteComment] = useState(null)

  async function load() {
    setLoading(true)
    const { data: catchData } = await supabase
      .from('catches')
      .select('*, profiles(handle)')
      .eq('id', catchId)
      .single()
    setC(catchData)

    const { data: commentData } = await supabase
      .from('comments')
      .select('*, profiles(handle)')
      .eq('catch_id', catchId)
      .order('created_at', { ascending: true })
    setComments(commentData || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [catchId])

  async function handlePostComment() {
    const text = commentText.trim()
    if (!text) return
    setPosting(true)
    const { error } = await supabase.from('comments').insert({
      catch_id: catchId,
      user_id: session.user.id,
      text,
    })
    setPosting(false)
    if (!error) {
      setCommentText('')
      load()
      onChanged?.()
    }
  }

  async function handleDeleteComment(commentId) {
    await supabase.from('comments').delete().eq('id', commentId)
    setConfirmDeleteComment(null)
    load()
    onChanged?.()
  }

  async function handleDeleteCatch() {
    await supabase.from('catches').delete().eq('id', catchId)
    setConfirmDeleteCatch(false)
    onChanged?.()
    onClose()
  }

  if (loading) {
    return (
      <div className="overlay show">
        <div className="detail-card"><div className="page-sub" style={{ padding: 20 }}>Loading…</div></div>
      </div>
    )
  }
  if (!c) {
    return (
      <div className="overlay show">
        <div className="detail-card">
          <div className="detail-top">
            <button className="back-btn" onClick={onClose}>← Back</button>
            <div className="detail-title">Not found</div>
          </div>
        </div>
      </div>
    )
  }

  const t = sizeTier(c.length)
  const isMine = c.user_id === session.user.id
  const charsLeft = 120 - commentText.length

  return (
    <>
      <div className="overlay show">
        <div className="detail-card">
          <div className="detail-top">
            <button className="back-btn" onClick={onClose}>← Back</button>
            <div className="detail-title">Catch Details</div>
          </div>

          <div className="detail-photo">
            {c.photo_url ? (
              <img src={c.photo_url} alt="catch" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              c.verification === 'certified' ? '🐠' : '🐟'
            )}
          </div>

          <div className="detail-body">
            <div className="detail-head">
              <div>
                <div className="detail-angler">{c.profiles?.handle || 'angler'}</div>
                <div className="detail-sub">📍 {c.county} · {new Date(c.created_at).toLocaleDateString()}</div>
              </div>
              <div className={`detail-len ${t ? t.cls : ''}`}>{c.length}"</div>
            </div>

            <div className="detail-tags">
              {c.verification === 'certified' ? (
                <span className="tier-tag cert">
                  <CertifiedSeal size={15} uid={`detail-${c.id}`} /> CERTIFIED{t ? ` · ${t.label}` : ''}
                </span>
              ) : (
                <span className="tier-tag alleg">🤥 LIAR{t ? ` · ${t.label}` : ''}</span>
              )}
              {c.spot_type && <span className="meta-tag">{c.spot_type}</span>}
              {c.lure && <span className="meta-tag">🎣 {c.lure}</span>}
            </div>

            {c.blurb && <div className="quote" style={{ marginTop: 14 }}>{c.blurb}</div>}

            {isMine && (
              <div className="own-actions">
                <button className="del" onClick={() => setConfirmDeleteCatch(true)}>🗑️ Delete this catch</button>
              </div>
            )}

            <div className="comments-section">
              <div className="comments-head">
                💬 Comments {comments.length > 0 && <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 12 }}>({comments.length})</span>}
              </div>

              {comments.length === 0 && (
                <div className="no-comments">No comments yet — be the first to say something.</div>
              )}
              {comments.map((cm) => (
                <div className="comment" key={cm.id}>
                  {cm.user_id === session.user.id && (
                    <button className="c-del" onClick={() => setConfirmDeleteComment(cm.id)}>✕</button>
                  )}
                  <div className="c-head">
                    <span className="c-handle">@{cm.profiles?.handle || 'angler'}</span>
                    <span className="c-time">{new Date(cm.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="c-text">{cm.text}</div>
                </div>
              ))}

              <div className="composer">
                <textarea
                  placeholder="Say something about this catch..."
                  maxLength={120}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="composer-row">
                  <span className={`char-count ${charsLeft <= 20 ? 'warn' : ''}`}>{commentText.length} / 120</span>
                  <button className="post-comment-btn" disabled={!commentText.trim() || posting} onClick={handlePostComment}>
                    {posting ? 'Posting…' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmDeleteCatch && (
        <ConfirmDialog
          title="Delete this catch?"
          message="This removes it from every leaderboard along with its votes and comments. This can't be undone."
          onCancel={() => setConfirmDeleteCatch(false)}
          onConfirm={handleDeleteCatch}
        />
      )}
      {confirmDeleteComment && (
        <ConfirmDialog
          title="Delete this comment?"
          message="This can't be undone."
          onCancel={() => setConfirmDeleteComment(null)}
          onConfirm={() => handleDeleteComment(confirmDeleteComment)}
        />
      )}
    </>
  )
}
