export default function Legal({ onBack }) {
  return (
    <section className="page active">
      <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
        📜 Terms &amp; Privacy
      </div>
      <div className="page-sub">
        Last updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. This is a
        plain-language summary written for a small community app — not reviewed by a lawyer, and not a
        substitute for legal advice.
      </div>

      <div className="form-card" style={{ textAlign: 'left', lineHeight: 1.6, fontSize: 13 }}>
        <h4 style={{ marginTop: 0 }}>What we collect</h4>
        <p>
          When you sign up: your email address, and whatever you choose to add to your profile
          (a handle, a county, social media links). When you log a catch: the length, county,
          optional spot type/lure/blurb, and a photo if you upload one. We never ask for or
          display an exact location — only county-level.
        </p>

        <h4>How it's used</h4>
        <p>
          Solely to run the app: showing leaderboards, letting you build a profile and catch
          history, and letting the community vote and comment on posts. We don't sell your data
          or share it with advertisers.
        </p>

        <h4>Public vs. private</h4>
        <p>
          Your handle, county, catches, comments, and votes are visible to other users of the
          app. Your email address is never shown to other users.
        </p>

        <h4>Content moderation</h4>
        <p>
          Any post can be reported by any user. Reported content is reviewed manually and may be
          removed at our discretion.
        </p>

        <h4>Deleting your data</h4>
        <p>
          You can delete any catch or comment you've posted at any time from within the app. To
          request deletion of your entire account and associated data, contact us at the email
          below.
        </p>

        <h4>Changes</h4>
        <p>
          This app is actively being developed, and this page may change as new features are
          added. Meaningful changes will be reflected here.
        </p>

        <h4>Contact</h4>
        <p>
          Questions, privacy requests, or anything else: <a href="mailto:fortyinchsnook@gmail.com">fortyinchsnook@gmail.com</a>
        </p>
      </div>
    </section>
  )
}
