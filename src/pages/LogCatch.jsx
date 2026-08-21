import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { sizeTier, FL_COUNTIES, TX_COUNTIES, SPOT_TYPES } from '../lib/sizeTier'
import CelebrationModal from '../components/CelebrationModal'

export default function LogCatch({ session }) {
  const [verification, setVerification] = useState('certified')
  const [length, setLength] = useState('')
  const [county, setCounty] = useState('')
  const [spotType, setSpotType] = useState('')
  const [lure, setLure] = useState('')
  const [blurb, setBlurb] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [celebration, setCelebration] = useState(null)

  const tier = sizeTier(length)
  const lengthTouched = length !== ''
  const lengthNum = parseFloat(length)
  const lengthTooBig = lengthTouched && !isNaN(lengthNum) && lengthNum > 55
  const lengthInvalid = lengthTouched && !tier

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function resetForm() {
    setLength('')
    setCounty('')
    setSpotType('')
    setLure('')
    setBlurb('')
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  async function handleSubmit() {
    setError('')
    if (!tier || lengthTooBig) return
    if (!photoFile) {
      setError('A photo is required — no picture, no post.')
      return
    }
    if (!county) {
      setError('Pick a county before posting.')
      return
    }
    setSubmitting(true)

    try {
      let photoUrl = null
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${session.user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('catch-photos')
          .upload(path, photoFile)
        if (uploadError) throw uploadError
        const { data: publicUrlData } = supabase.storage
          .from('catch-photos')
          .getPublicUrl(path)
        photoUrl = publicUrlData.publicUrl
      }

      const { error: insertError } = await supabase.from('catches').insert({
        user_id: session.user.id,
        length: parseFloat(length),
        verification,
        county,
        spot_type: spotType || null,
        lure: lure || null,
        blurb: blurb.trim() || null,
        photo_url: photoUrl,
      })
      if (insertError) throw insertError

      setCelebration({ length, tier })
      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page active">
      <div className="page-title">📋 Log a Catch</div>
      <div className="page-sub">
        Fill in what you've got — snook have to be between 22" and 55" to log here, this board's
        for real keepers, not fingerlings or typos.
      </div>

      <div className="form-card">
        <div className="field">
          <label>Photo <span style={{ fontWeight: 600, color: 'var(--red)' }}>(required)</span></label>
          <div className="photo-upload">
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="catch preview" />
                <span
                  className="remove-photo"
                  onClick={(e) => {
                    e.preventDefault()
                    setPhotoFile(null)
                    setPhotoPreview(null)
                  }}
                >
                  ✕
                </span>
              </>
            ) : (
              <>
                <span className="icon">📷</span>
                <span className="label">Take Photo or Upload</span>
                <span className="sub">Tap to open your camera or photo library</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>
        </div>

        <div className="field">
          <label>Verification</label>
          <div className="toggle-pair">
            <button
              type="button"
              className={verification === 'certified' ? 'sel-cert active' : 'sel-cert'}
              onClick={() => setVerification('certified')}
            >
              📏 Certified (board/tape shown)
            </button>
            <button
              type="button"
              className={verification === 'liar' ? 'sel-liar active' : 'sel-liar'}
              onClick={() => setVerification('liar')}
            >
              🤥 Liar (hand-held, no proof)
            </button>
          </div>
        </div>

        <div className="field">
          <label>Length (inches)</label>
          <input
            type="number"
            step="0.25"
            placeholder="e.g. 36.5"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          />
          {tier && !lengthTooBig && (
            <div className="len-preview" style={{ display: 'flex' }}>
              <span className={`big ${tier.cls}`}>{length}"</span>
              <span className="tag">{tier.label}</span>
            </div>
          )}
          {lengthInvalid && (
            <div className="err-msg" style={{ display: 'block' }}>
              Snook must be at least 22" to log here — this club's for keepers, not
              fingerlings.
            </div>
          )}
          {lengthTooBig && (
            <div className="err-msg" style={{ display: 'block' }}>
              55" is the max we'll take here — if it's genuinely bigger than that, reach out to
              us directly, that's a whole other conversation.
            </div>
          )}
        </div>

        <div className="field">
          <label>County caught</label>
          <select value={county} onChange={(e) => setCounty(e.target.value)}>
            <option value="">Select a county…</option>
            <optgroup label="Florida">
              {FL_COUNTIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </optgroup>
            <optgroup label="Texas">
              {TX_COUNTIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </optgroup>
          </select>
          <div className="hint">County only — we never ask for or show an exact spot.</div>
        </div>

        <div className="field">
          <label>
            Where'd you catch it? <span style={{ fontWeight: 600, color: 'var(--muted)' }}>(optional, general type)</span>
          </label>
          <select value={spotType} onChange={(e) => setSpotType(e.target.value)}>
            <option value="">Select type…</option>
            {SPOT_TYPES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>
            Lure used <span style={{ fontWeight: 600, color: 'var(--muted)' }}>(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. D.O.A. Baitbuster, live pinfish..."
            value={lure}
            onChange={(e) => setLure(e.target.value)}
          />
          <div className="hint">
            Totally optional — brag if you want, but your go-to lure can sometimes tip off your
            spot too. Your call.
          </div>
        </div>

        <div className="field">
          <label>
            Quick blurb <span style={{ fontWeight: 600, color: 'var(--muted)' }}>(optional)</span>
          </label>
          <textarea
            placeholder="Tell the story in a sentence or two..."
            maxLength={120}
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            style={{ height: 60, resize: 'none' }}
          />
          <div className="hint">{blurb.length} / 120 — shows on the catch's detail page</div>
        </div>

        {error && <div className="err-msg" style={{ display: 'block' }}>{error}</div>}

        <button className="submit-btn" disabled={!tier || lengthTooBig || !county || !photoFile || submitting} onClick={handleSubmit}>
          {submitting ? 'Posting…' : 'Post Catch'}
        </button>
      </div>

      <CelebrationModal result={celebration} onClose={() => setCelebration(null)} />
    </section>
  )
}
