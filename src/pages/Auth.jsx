import { useState } from 'react'
import { supabase } from '../supabaseClient'
import Mascot from '../components/Mascot'

export default function Auth({ onCancel }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Check your email to confirm your account, then sign in.')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        setInfo("Check your email for a reset link. It'll bring you back here to set a new password.")
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider) {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) setError(error.message)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12,
              fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', marginBottom: 14,
            }}
          >
            ‹ Continue Browsing
          </button>
        )}
        <div className="brand" style={{ textAlign: 'center', marginBottom: 18 }}>
          <Mascot variant="calm" className="mascot-lg" />
          <h1>40" SNOOK<br />CLUB</h1>
          <div className="tagline">🎣 CERTIFIED · LIARS · PROVE IT ON THE WATER</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {mode !== 'forgot' && (
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}
          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(''); setInfo('') }}
              style={{
                background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700,
                fontSize: 12, cursor: 'pointer', textDecoration: 'underline', marginBottom: 14, display: 'block',
              }}
            >
              Forgot password?
            </button>
          )}
          {error && <div className="err-msg" style={{ display: 'block' }}>{error}</div>}
          {info && <div className="hint" style={{ color: 'var(--green)' }}>{info}</div>}
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="auth-divider">or</div>

            <button className="oauth-btn google" onClick={() => handleOAuth('google')}>
              <span>🇬</span> Continue with Google
            </button>
            <button className="oauth-btn apple" onClick={() => handleOAuth('apple')}>
              <span></span> Continue with Apple
            </button>
            <div className="hint" style={{ textAlign: 'center', marginTop: 8 }}>
              Apple sign-in only works once Sign in with Apple is configured in
              your Supabase + Apple Developer account — see the README.
            </div>
          </>
        )}

        <div className="auth-switch">
          {mode === 'signin' && (
            <>New here? <button onClick={() => setMode('signup')}>Create an account</button></>
          )}
          {mode === 'signup' && (
            <>Already have an account? <button onClick={() => setMode('signin')}>Sign in</button></>
          )}
          {mode === 'forgot' && (
            <>Remembered it? <button onClick={() => setMode('signin')}>Back to sign in</button></>
          )}
        </div>
      </div>
    </div>
  )
}
