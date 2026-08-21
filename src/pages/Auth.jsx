import { useState } from 'react'
import { supabase } from '../supabaseClient'
import Mascot from '../components/Mascot'

export default function Auth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
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
          {error && <div className="err-msg" style={{ display: 'block' }}>{error}</div>}
          {info && <div className="hint" style={{ color: 'var(--green)' }}>{info}</div>}
          <button className="submit-btn" type="submit" disabled={loading}>
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

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

        <div className="auth-switch">
          {mode === 'signin' ? (
            <>New here? <button onClick={() => setMode('signup')}>Create an account</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode('signin')}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  )
}
