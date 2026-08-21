const TIPS = [
  { title: 'Wet your hands first', body: 'Dry hands and towels strip the protective slime coat, leaving the fish open to infection after release.' },
  { title: 'Minimize air exposure', body: "Keep the fish in or over the water. Aim for under 10 seconds out of the water for photos — snook can't breathe air any better than we can breathe water." },
  { title: "Support, don't dangle", body: 'For bigger fish, support the body horizontally with two hands instead of holding vertically by the jaw alone — it protects the jaw and internal organs.' },
  { title: 'Skip the gills and eyes', body: 'Never hook fingers through the gill plate or grab near the eyes — both can cause lasting damage even on a fish you release.' },
  { title: 'Revive before you release', body: "Hold the fish upright facing into the current until it kicks off strong on its own — don't just drop it and hope." },
  { title: 'Use non-offset circle hooks', body: 'They hook cleanly in the jaw instead of deep in the gut, making for a much healthier release.' },
  { title: 'Know before you go', body: 'Slot limits, seasons, and the required snook permit change by region and year — check before you plan to keep one.' },
]

export default function Education() {
  return (
    <section className="page active">
      <div className="page-title">📘 Be a Steward</div>
      <div className="status-pill" style={{ marginLeft: 18 }}>
        <span className="dot"></span> GULF COAST · SARASOTA BAY — OPEN THRU NOV 30
      </div>
      <div className="page-sub" style={{ marginTop: 12 }}>
        Snook are a catch-and-release fishery most of the year for a reason. Handle them right
        so there's a next one to catch.
      </div>

      {TIPS.map((tip, i) => (
        <div className="edu-card" key={i}>
          <div className="num">{i + 1}</div>
          <div>
            <h4>{tip.title}</h4>
            <p>{tip.body}</p>
          </div>
        </div>
      ))}

      <a
        className="fwc-link"
        href="https://myfwc.com/fishing/saltwater/recreational/snook/"
        target="_blank"
        rel="noopener noreferrer"
      >
        📖 Official FWC Snook Regulations →
      </a>
      <footer>REGULATIONS CHANGE — ALWAYS CONFIRM CURRENT RULES WITH FWC BEFORE HARVESTING</footer>
    </section>
  )
}
