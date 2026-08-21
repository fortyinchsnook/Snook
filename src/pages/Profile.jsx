import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { sizeTier, TIERS, FL_COUNTIES, TX_COUNTIES } from '../lib/sizeTier'
import TierBadge from '../components/TierBadge'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Profile({ session, viewUserId, onBack, onOpenCatch }) {
  const targetUserId = viewUserId || session?.user?.id
  const isOwnProfile = !!session && targetUserId === session.user.id

  const [profile, setProfile] = useState(null)
  const [myCatches, setMyCatches] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ handle: '', county: '', ig_url: '', fb_url: '', yt_url: '', tiktok_url: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function loadProfile() {
    if (!targetUserId) return
    setProfile(null)
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single()
    if (p) {
      setProfile(p)
      setForm({
        handle: p.handle || '',
        county: p.county || '',
        ig_url: p.ig_url || '',
        fb_url: p.fb_url || '',
        yt_url: p.yt_url || '',
        tiktok_url: p.tiktok_url || '',
      })
    }

    const { data: catches } = await supabase
      .from('catches')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
    setMyCatches(catches || [])
  }

  useEffect(() => {
    loadProfile()
    setEditing(false)
  }, [targetUserId])

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    const { error } = await supabase.from('profiles').update(form).eq('id', session.user.id)
    setSaving(false)
    if (error) {
      if (error.code === '23505') {
        setSaveError('That handle is already taken — try another.')
      } else {
        setSaveError(error.message)
      }
      return
    }
    setEditing(false)
    loadProfile()
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    setDeleteError('')
    try {
      const { error } = await supabase.functions.invoke('delete-account')
      if (error) throw error
      await supabase.auth.signOut()
    } catch (err) {
      setDeleteError(err.message || 'Something went wrong deleting your account. Try again, or email us.')
      setDeletingAccount(false)
      setConfirmDeleteAccount(false)
    }
  }

  if (!profile) return <section className="page active"><div className="page-sub">Loading profile…</div></section>

  const totalLength = myCatches.reduce((sum, c) => sum + parseFloat(c.length), 0)
  const counties = new Set(myCatches.map((c) => c.county))
  const personalBest = myCatches.reduce((max, c) => Math.max(max, parseFloat(c.length)), 0)

  // a tier badge unlocks if there's at least one CERTIFIED catch whose
  // length falls in that specific tier's range
  const certifiedCatches = myCatches.filter((c) => c.verification === 'certified')
  const unlockedTierKeys = new Set(
    certifiedCatches
      .map((c) => TIERS.find((t) => parseFloat(c.length) >= t.min && parseFloat(c.length) < t.max)?.key)
      .filter(Boolean)
  )

  return (
    <section className="page active">
      <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!isOwnProfile && (
          <button className="back-btn" onClick={onBack}>← Back</button>
        )}
        👤 {isOwnProfile ? 'Profile' : `@${profile.handle}`}
      </div>

      <div className="profile-card">
        {!editing ? (
          <>
            <div className="profile-head">
              <div className="avatar">🎣</div>
              <div>
                <div className="handle">@{profile.handle}</div>
                <div className="profile-county">📍 {profile.county || 'County not set'}</div>
              </div>
            </div>
            <div className="social-row">
              {profile.ig_url && <a href={profile.ig_url} target="_blank" rel="noopener noreferrer" title="Instagram">📷</a>}
              {profile.fb_url && <a href={profile.fb_url} target="_blank" rel="noopener noreferrer" title="Facebook">📘</a>}
              {profile.yt_url && <a href={profile.yt_url} target="_blank" rel="noopener noreferrer" title="YouTube">▶️</a>}
              {profile.tiktok_url && <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" title="TikTok">🎵</a>}
            </div>
            {isOwnProfile && (
              <button className="submit-btn" style={{ marginTop: 16 }} onClick={() => { setSaveError(''); setEditing(true) }}>
                Edit Profile
              </button>
            )}
          </>
        ) : (
          <>
            <div className="field">
              <label>Handle</label>
              <input value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} />
            </div>
            <div className="field">
              <label>County</label>
              <select value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })}>
                <option value="">Select a county…</option>
                <optgroup label="Florida">
                  {FL_COUNTIES.map((c) => <option key={c}>{c}</option>)}
                </optgroup>
                <optgroup label="Texas">
                  {TX_COUNTIES.map((c) => <option key={c}>{c}</option>)}
                </optgroup>
              </select>
            </div>
            <div className="field">
              <label>Instagram URL</label>
              <input value={form.ig_url} onChange={(e) => setForm({ ...form, ig_url: e.target.value })} placeholder="https://instagram.com/you" />
            </div>
            <div className="field">
              <label>Facebook URL</label>
              <input value={form.fb_url} onChange={(e) => setForm({ ...form, fb_url: e.target.value })} placeholder="https://facebook.com/you" />
            </div>
            <div className="field">
              <label>YouTube URL</label>
              <input value={form.yt_url} onChange={(e) => setForm({ ...form, yt_url: e.target.value })} placeholder="https://youtube.com/@you" />
            </div>
            <div className="field">
              <label>TikTok URL</label>
              <input value={form.tiktok_url} onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })} placeholder="https://tiktok.com/@you" />
            </div>
            {saveError && <div className="err-msg" style={{ display: 'block' }}>{saveError}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="submit-btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              <button className="submit-btn" style={{ background: 'var(--panel-2)', color: 'var(--muted)' }} onClick={() => { setSaveError(''); setEditing(false) }}>Cancel</button>
            </div>
          </>
        )}
      </div>

      <div className="section-label" style={{ paddingTop: 0 }}>📊 Stats</div>
      <div className="stats-grid">
        <div className="stat-card"><div className="val">{totalLength.toFixed(2)}"</div><div className="lbl">Combined snook length</div></div>
        <div className="stat-card"><div className="val">{myCatches.length}</div><div className="lbl">Snook caught</div></div>
        <div className="stat-card"><div className="val">{counties.size}</div><div className="lbl">Counties with a snook</div></div>
        <div className="stat-card"><div className="val">{personalBest ? personalBest.toFixed(2) + '"' : '—'}</div><div className="lbl">Personal best</div></div>
        <div className="stat-card"><div className="val">—</div><div className="lbl">Days fished (coming soon)</div></div>
        <div className="stat-card"><div className="val">—</div><div className="lbl">Days skunked (coming soon)</div></div>
      </div>

      <div className="section-label" style={{ paddingTop: 0 }}>🎖️ Tier Badges <small>&nbsp;— earned from Certified catches only</small></div>
      <div className="badge-grid">
        {TIERS.map((t) => (
          <TierBadge key={t.key} tier={t} unlocked={unlockedTierKeys.has(t.key)} size={80} />
        ))}
      </div>

      <div className="section-label" style={{ paddingTop: 0 }}>🗂️ Catch Catalog</div>
      <div className="catalog-grid">
        {myCatches.length === 0 && <div className="empty-state">No catches logged yet.</div>}
        {myCatches.map((c) => {
          const t = sizeTier(c.length)
          return (
            <div className="catalog-item" key={c.id} onClick={() => onOpenCatch?.(c.id)} style={{ cursor: 'pointer' }}>
              <div className="cthumb">
                {c.photo_url ? (
                  <img src={c.photo_url} alt="catch" />
                ) : (
                  c.verification === 'certified' ? '🐠' : '🐟'
                )}
              </div>
              <div className={`clen ${t ? t.cls : ''}`}>{c.length}"</div>
              <div className="cloc">{c.county}</div>
            </div>
          )
        })}
      </div>

      {isOwnProfile && (
        <div style={{ padding: '10px 18px 30px', textAlign: 'center' }}>
          <button
            onClick={() => setConfirmDeleteAccount(true)}
            style={{
              background: 'none', border: 'none', color: 'var(--red)', fontSize: 11,
              fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', opacity: 0.7,
            }}
          >
            Delete my account
          </button>
          {deleteError && <div className="err-msg" style={{ display: 'block', marginTop: 8 }}>{deleteError}</div>}
        </div>
      )}

      {confirmDeleteAccount && (
        <ConfirmDialog
          title="Delete your account?"
          message="This permanently deletes your account, profile, catches, comments, and votes. This cannot be undone."
          confirmLabel={deletingAccount ? 'Deleting…' : 'Delete Account'}
          onCancel={() => setConfirmDeleteAccount(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </section>
  )
}
