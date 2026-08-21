import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './pages/Auth'
import Board from './pages/Board'
import LogCatch from './pages/LogCatch'
import Education from './pages/Education'
import Profile from './pages/Profile'
import BottomNav from './components/BottomNav'
import Mascot from './components/Mascot'

export default function App() {
  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [page, setPage] = useState('board')
  const [viewedUserId, setViewedUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoadingSession(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loadingSession) {
    return <div className="loading-screen">Loading 40" Snook Club…</div>
  }

  if (!session) {
    return <Auth />
  }

  function handleNavChange(newPage) {
    // clicking the bottom nav's Profile tab directly always means "my own profile"
    if (newPage === 'profile') setViewedUserId(null)
    setPage(newPage)
  }

  function handleSelectUser(userId) {
    setViewedUserId(userId)
    setPage('profile')
  }

  return (
    <div className="wrap">
      <header>
        <div className="brand-row">
          <div className="brand">
            <h1>40" SNOOK<br />CLUB</h1>
            <div className="tagline">🎣 CERTIFIED · LIARS · PROVE IT ON THE WATER</div>
          </div>
          <Mascot />
        </div>
        <div className="wave"></div>
      </header>

      {page === 'board' && <Board session={session} onSelectUser={handleSelectUser} />}
      {page === 'log' && <LogCatch session={session} />}
      {page === 'edu' && <Education />}
      {page === 'profile' && (
        <Profile session={session} viewUserId={viewedUserId} onBack={() => setViewedUserId(null)} />
      )}

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
