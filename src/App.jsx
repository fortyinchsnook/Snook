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

  // ---------------------------------------------------------------
  // Real browser history for "drill-down" views (someone else's
  // profile, a catch's detail page, Terms & Privacy, the sign-in
  // screen reached from guest browsing). Without this, the phone's
  // back button has nothing of ours to step back through, so it
  // falls straight through to whatever was open before the site —
  // which looks like the app just exiting.
  //
  // Bottom-nav tab switches (Board/Log Catch/Education/your own
  // Profile) are deliberately NOT pushed here — tab switches aren't
  // normally undo-able via hardware back in any app, and treating
  // every tab tap as a back-stack entry would make the back button
  // annoying to use for completely different reasons.
  // ---------------------------------------------------------------
  useEffect(() => {
    window.history.replaceState({ view: 'base' }, '')

    function onPopState(e) {
      const s = e.state
      if (!s || s.view === 'base') {
        setSelectedCatchId(null)
        setShowLegal(false)
        setForceAuth(false)
        setViewedUserId(null)
      } else if (s.view === 'profile') {
        setSelectedCatchId(null)
        setShowLegal(false)
        setForceAuth(false)
        setViewedUserId(s.userId)
        setPage('profile')
      } else if (s.view === 'detail') {
        setSelectedCatchId(s.catchId)
      } else if (s.view === 'legal') {
        setShowLegal(true)
      } else if (s.view === 'auth') {
        setForceAuth(true)
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function openProfile(userId) {
    window.history.pushState({ view: 'profile', userId }, '')
    setViewedUserId(userId)
    setShowLegal(false)
    setPage('profile')
  }

  function openCatch(catchId) {
    window.history.pushState({ view: 'detail', catchId }, '')
    setSelectedCatchId(catchId)
  }

  function openLegal() {
    window.history.pushState({ view: 'legal' }, '')
    setShowLegal(true)
  }

  function openAuth() {
    window.history.pushState({ view: 'auth' }, '')
    setForceAuth(true)
  }

  // used by every overlay's own "← Back" / "✕" button, so the in-app
  // button and the hardware back button always behave identically
  function closeOverlay() {
    window.history.back()
  }

  if (loadingSession) {
    return <div className="loading-screen">Loading 40" Snook Club…</div>
  }

  if (passwordRecovery) {
    return <ResetPassword onDone={() => setPasswordRecovery(false)} />
  }

  if (forceAuth) {
    return <Auth onCancel={closeOverlay} />
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
      onSignIn={() => { setSignInPromptMsg(null); openAuth() }}
    />
  )

  if (showLegal) {
    return (
      <div className="wrap">
        {headerJsx}
        <Legal onBack={closeOverlay} />
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
          onClose={closeOverlay}
          onChanged={handleDataChanged}
          onRequireAuth={requireAuth}
        />
      )}

      {headerJsx}

      {page === 'board' && (
        <Board
          session={session}
          onSelectUser={openProfile}
          onOpenCatch={openCatch}
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
          onBack={closeOverlay}
          onOpenCatch={openCatch}
        />
      )}

      <div style={{ textAlign: 'center', padding: '0 18px 6px' }}>
        <button
          onClick={openLegal}
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
            onClick={openAuth}
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
