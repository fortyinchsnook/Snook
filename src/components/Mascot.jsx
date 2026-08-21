export default function Mascot() {
  return (
    <svg className="mascot" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 30 C18 8, 62 6, 86 18 L98 8 L90 30 L98 52 L86 42 C62 54, 18 52, 6 30 Z"
        fill="#0F2226"
        stroke="#2FE6D9"
        strokeWidth="2.5"
      />
      <line x1="20" y1="27" x2="78" y2="30" stroke="#2FE6D9" strokeWidth="1.6" />
      <circle cx="30" cy="22" r="7" fill="#0A0E14" stroke="#2FE6D9" strokeWidth="2" />
      <circle cx="32" cy="22" r="3" fill="#2FE6D9" />
      <path d="M22 40 Q30 46 40 41" stroke="#2FE6D9" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}
