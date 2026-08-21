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
    // synthesized-free — expects a real recording dropped at public/sounds/mascot-pop.mp3.
    // .catch() swallows the error silently if the file isn't there yet, so this
    // never breaks the app even before the sound is added.
    const audio = new Audio('/sounds/mascot-pop.mp3')
    audio.play().catch(() => {})
  }

  if (loadingSession) {
    return <div className="loading-screen">Loading 40" Snook Club…</div>
  }

  if (passwordRecovery) {
    return <ResetPassword onDone={() => setPasswordRecovery(false)} />
  }

  if (!session) {
    return <Auth />
  }

  function handleNavChange(newPage) {
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

  if (showLegal) {
    return (
      <div className="wrap">
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
        <Legal onBack={() => setShowLegal(false)} />
        <BottomNav active={page} onChange={handleNavChange} />
      </div>
    )
  }

  return (
    <div className="wrap">
      {showOnboarding && <OnboardingModal onDismiss={handleOnboardingDismiss} />}
      {selectedCatchId && (
        <CatchDetail
          catchId={selectedCatchId}
          session={session}
          onClose={() => setSelectedCatchId(null)}
          onChanged={handleDataChanged}
        />
      )}

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

      {page === 'board' && (
        <Board
          session={session}
          onSelectUser={handleSelectUser}
          onOpenCatch={setSelectedCatchId}
          refreshKey={boardRefreshKey}
        />
      )}
      {page === 'log' && <LogCatch session={session} />}
      {page === 'edu' && <Education />}
      {page === 'profile' && (
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
      </div>
      <div style={{ textAlign: 'center', padding: '0 18px 10px' }}>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline',
          }}
        >
          Sign out
        </button>
      </div>

      <BottomNav active={page} onChange={handleNavChange} />
    </div>
  )
}
