import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import Mascot from '../components/Mascot'

// TODO: replace with your actual applicationId from android/app/build.gradle
// (the `applicationId "..."` line) — it must match exactly or the redirect
// back into the app won't fire.
const NATIVE_AUTH_SCHEME = 'com.fortyinchsnook.app'
const isNative = () => typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

export default function Auth({ onCancel }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const turnstileRef = useRef(null)
  const widgetIdRef = useRef(null)

  // Render the Turnstile widget only when signing up — that's where bots
  // actually cost us (fake accounts), not on every sign-in.
  useEffect(() => {
    if (mode !== 'signup' || !TURNSTILE_SITE_KEY) return
    setCaptchaToken('')

    function render() {
      if (!window.turnstile || !turnstileRef.current) return
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current)
      }
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => setCaptchaToken(token),
        'expired-callback': () => setCaptchaToken(''),
        'error-callback': () => setCaptchaToken(''),
      })
    }

    if (window.turnstile) {
      render()
    } else {
      // Script may still be loading (it's async in index.html) — poll briefly.
      const iv = setInterval(() => {
        if (window.turnstile) {
          clearInterval(iv)
          render()
        }
      }, 150)
      return () => clearInterval(iv)
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
      widgetIdRef.current = null
    }
  }, [mode])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    if (mode === 'signup' && TURNSTILE_SITE_KEY && !captchaToken) {
      setError('Please complete the verification below before creating an account.')
      return
    }
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: captchaToken ? { captchaToken } : undefined,
        })
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
      // Turnstile tokens are single-use — reset the widget so a retry works.
      if (mode === 'signup' && widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
        setCaptchaToken('')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider) {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: isNative()
        ? {
            redirectTo: `${NATIVE_AUTH_SCHEME}://auth-callback`,
            skipBrowserRedirect: false,
          }
        : undefined,
    })
    if (error) setError(error.message)
  }

  // When running inside the native app, Google/Apple sign-in opens the
  // system browser, then hands control back via a custom URL (the scheme
  // above). Capacitor fires 'appUrlOpen' with that URL — we grab the
  // session out of it here instead of letting it fall back to the website.
  useEffect(() => {
    if (!isNative()) return
    let remove
    import('@capacitor/app')
      .then(({ App: CapacitorApp }) => {
        CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
          if (!url || !url.startsWith(`${NATIVE_AUTH_SCHEME}://`)) return
          const { error } = await supabase.auth.exchangeCodeForSession(url)
          if (error) setError(error.message)
        }).then((handle) => { remove = handle })
      })
      .catch(() => {
        // @capacitor/app isn't installed — native OAuth return will silently
        // fail closed instead of bouncing to the website. Run:
        //   npm install @capacitor/app && npx cap sync
        console.warn('@capacitor/app not found; native OAuth redirect will not complete.')
      })
    return () => { remove?.remove() }
  }, [])

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
          {mode === 'signup' && TURNSTILE_SITE_KEY && (
            <div ref={turnstileRef} style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }} />
          )}
          {error && <div className="err-msg" style={{ display: 'block' }}>{error}</div>}
          {info && <div className="hint" style={{ color: 'var(--green)' }}>{info}</div>}
          <button
            className="submit-btn"
            type="submit"
            disabled={loading || (mode === 'signup' && TURNSTILE_SITE_KEY && !captchaToken)}
          >
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
