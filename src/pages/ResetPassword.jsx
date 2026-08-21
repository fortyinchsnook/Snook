import { useState } from 'react'
import { supabase } from '../supabaseClient'
import Mascot from '../components/Mascot'

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) {
      setError(error.message)
    } else {
      onDone()
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand" style={{ textAlign: 'center', marginBottom: 18 }}>
          <Mascot variant="calm" className="mascot-lg" />
          <h1>SET A NEW<br />PASSWORD</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6} required />
          </div>
          {error && <div className="err-msg" style={{ display: 'block' }}>{error}</div>}
          <button className="submit-btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
