import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './pages/Auth'
import Board from './pages/Board'
import LogCatch from './pages/LogCatch'
import Education from './pages/Education'
import Profile from './pages/Profile'
import Legal from './pages/Legal'
import ResetPassword from './pages/ResetPassword'
import BottomNav from './components/BottomNav'
import Mascot from './components/Mascot'
import OnboardingModal from './components/OnboardingModal'
import CatchDetail from './components/CatchDetail'
import SignInPrompt from './components/SignInPrompt'

export default function App() {
  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [page, setPage] = useState('board')
  const [viewedUserId, setViewedUserId] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [selectedCatchId, setSelectedCatchId] = useState(null)
  const [showLegal, setShowLegal] = useState(false)
  const [boardRefreshKey, setBoardRefreshKey] = useState(0)
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [forceAuth, setForceAuth] = useState(false)
  const [signInPromptMsg, setSignInPromptMsg] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoadingSession(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true)
      }
      if (session) {
        setForceAuth(false) // signed in successfully — drop out of the auth screen
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase
      .from('profiles')
      .select('has_seen_intro')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data || data.has_seen_intro === false) {
          setShowOnboarding(true)
        }
      })
  }, [session])

  async function handleOnboardingDismiss() {
    setShowOnboarding(false)
    if (session) {
      await supabase.from('profiles').update({ has_seen_intro: true }).eq('id', session.user.id)
    }
  }

  function playMascotPop() {
    const audio = new Audio('/sounds/mascot-pop.mp3')
    audio.play().catch(() => {})
  }

  function requireAuth(message) {
    setSignInPromptMsg(message)
  }

  if (loadingSession) {
    return <div className="loading-screen">Loading 40" Snook Club…</div>
  }

  if (passwordRecovery) {
    return <ResetPassword onDone={() => setPasswordRecovery(false)} />
  }

  if (forceAuth) {
    return <Auth onCancel={() => setForceAuth(false)} />
  }

  const isGuest = !session

  function handleNavChange(newPage) {
    if (isGuest && (newPage === 'log' || newPage === 'profile')) {
      requireAuth(
        newPage === 'log'
          ? 'Got a snook of your own? Sign up free and get it on the board.'
          : 'Sign up free to build your profile and track your catches.'
      )
      return
    }
    if (newPage === 'profile') setViewedUserId(null)
    setShowLegal(false)
    setPage(newPage)
  }

  function handleSelectUser(userId) {
    setViewedUserId(userId)
    setShowLegal(false)
    setPage('profile')
  }

  function handleDataChanged() {
    setBoardRefreshKey((k) => k + 1)
  }

  const headerJsx = (
    <header>
      <div className="brand-row">
        <div className="brand">
          <h1>40" SNOOK<br />CLUB</h1>
          <div className="tagline">🎣 CERTIFIED · LIARS · PROVE IT ON THE WATER</div>
        </div>
        <button className="mascot-btn" onClick={playMascotPop} aria-label="snook noise">
          <Mascot className="mascot-header" />
        </button>
      </div>
      <div className="wave"></div>
    </header>
  )

  const signInPromptJsx = signInPromptMsg && (
    <SignInPrompt
      message={signInPromptMsg}
      onClose={() => setSignInPromptMsg(null)}
      onSignIn={() => { setSignInPromptMsg(null); setForceAuth(true) }}
    />
  )

  if (showLegal) {
    return (
      <div className="wrap">
        {headerJsx}
        <Legal onBack={() => setShowLegal(false)} />
        <BottomNav active={page} onChange={handleNavChange} />
      </div>
    )
  }

  return (
    <div className="wrap">
      {showOnboarding && <OnboardingModal onDismiss={handleOnboardingDismiss} />}
      {signInPromptJsx}
      {selectedCatchId && (
        <CatchDetail
          catchId={selectedCatchId}
          session={session}
          onClose={() => setSelectedCatchId(null)}
          onChanged={handleDataChanged}
          onRequireAuth={requireAuth}
        />
      )}

      {headerJsx}

      {page === 'board' && (
        <Board
          session={session}
          onSelectUser={handleSelectUser}
          onOpenCatch={setSelectedCatchId}
          refreshKey={boardRefreshKey}
          onRequireAuth={requireAuth}
        />
      )}
      {page === 'log' && session && <LogCatch session={session} />}
      {page === 'edu' && <Education />}
      {page === 'profile' && (session || viewedUserId) && (
        <Profile
          session={session}
          viewUserId={viewedUserId}
          onBack={() => setViewedUserId(null)}
          onOpenCatch={setSelectedCatchId}
        />
      )}

      <div style={{ textAlign: 'center', padding: '0 18px 6px' }}>
        <button
          onClick={() => setShowLegal(true)}
          style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline',
          }}
        >
          Terms &amp; Privacy
        </button>
        <span style={{ color: 'var(--edge)', margin: '0 8px', fontSize: 11 }}>·</span>
        <a
          href="mailto:fortyinchsnook@gmail.com?subject=40%22%20Snook%20Club%20Feedback"
          style={{
            color: 'var(--muted)', fontSize: 11, fontWeight: 700, textDecoration: 'underline',
          }}
        >
          Contact Us
        </a>
      </div>
      <div style={{ textAlign: 'center', padding: '0 18px 10px' }}>
        {session ? (
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={() => setForceAuth(true)}
            style={{
              background: 'none', border: 'none', color: 'var(--teal)',
              fontSize: 12, fontWeight: 800, cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Sign Up / Sign In
          </button>
        )}
      </div>

      <BottomNav active={page} onChange={handleNavChange} />
    </div>
  )
}
