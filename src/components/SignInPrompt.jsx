export default function SignInPrompt({ message, onSignIn, onClose }) {
  return (
    <div className="confirm-overlay show">
      <div className="confirm-card signin-prompt">
        <div className="icon">🎣</div>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--silver)', marginBottom: 18 }}>
          {message}
        </p>
        <div className="confirm-buttons">
          <button className="cancel" onClick={onClose}>Not now</button>
          <button className="signin-cta" onClick={onSignIn}>Sign Up / Sign In</button>
        </div>
      </div>
    </div>
  )
}
