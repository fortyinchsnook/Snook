const TABS = [
  { key: 'board', icon: '🏆', label: 'Board' },
  { key: 'log', icon: '➕', label: 'Log Catch' },
  { key: 'edu', icon: '📘', label: 'Education' },
  { key: 'profile', icon: '👤', label: 'Profile' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottomnav">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={active === t.key ? 'active' : ''}
          onClick={() => onChange(t.key)}
        >
          <span className="ic">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
