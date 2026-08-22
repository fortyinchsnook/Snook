# 40" Snook Club — Setup Walkthrough

This turns the mockup into a real, working app: real accounts, a real database,
real photo uploads. Follow this top to bottom — it's written for someone who's
never touched Supabase before.

**What you'll have at the end:** an app running in your browser at
`localhost:5173` where you can sign up, log a snook, see it on a real
leaderboard, and vote on other people's catches — all backed by a real
database.

Free the entire way through. Nothing in this walkthrough requires a credit card.

---

## Step 1 — Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New Project**.
3. Give it a name (`snook-club` is fine), set a database password (save this
   somewhere — a password manager, a note, wherever you keep things like
   this), pick the region closest to Florida (e.g. `us-east-1`).
4. Click **Create new project**. This takes 1-2 minutes to spin up — go grab
   a coffee.

## Step 2 — Set up the database

1. In your new project, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/schema.sql` from this project (in VS Code), copy
   **all of it**, and paste it into the Supabase SQL editor.
4. Click **Run** (bottom right, or Cmd/Ctrl+Enter).
5. You should see "Success. No rows returned." If you see an error about
   `storage.buckets`, that's fine — skip to Step 3 and create the bucket by
   hand instead.

This creates three tables (`profiles`, `catches`, `votes`), sets up the rule
that locks each user to one vote per catch (with the ability to switch
thumbs), and tries to create the photo storage bucket.

## Step 3 — Check the photo storage bucket

1. Click **Storage** in the left sidebar.
2. You should see a bucket called `catch-photos`. If it's there, you're done
   — skip to Step 4.
3. If it's *not* there: click **New bucket**, name it exactly `catch-photos`,
   toggle **Public bucket** on, and click **Create bucket**.

## Step 4 — Get your API keys

1. Click the **gear icon (Project Settings)** in the left sidebar, then
   **API**.
2. You'll see **Project URL** and an **anon public** key. Keep this tab open.
3. In VS Code, find the file `.env.example` in this project. Make a copy of
   it named `.env` (same folder, just rename `.env.example` → `.env`, or
   duplicate it).
4. Paste your Project URL and anon key into `.env`:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5 — Turn on Google sign-in (free, ~10 min)

1. In Supabase: **Authentication** → **Providers** → find **Google** →
   toggle it on. Keep this tab open, you'll need it in a second.
2. In a new tab, go to
   [console.cloud.google.com](https://console.cloud.google.com), create a
   project (or use an existing one).
3. Go to **APIs & Services** → **OAuth consent screen** → set it up as
   **External**, fill in the required fields (app name, your email) — you
   can leave most of it default for testing.
4. Go to **APIs & Services** → **Credentials** → **Create Credentials** →
   **OAuth client ID** → Application type: **Web application**.
5. Under **Authorized redirect URIs**, paste the callback URL Supabase shows
   you on the Google provider screen from step 1 (it looks like
   `https://xxxxx.supabase.co/auth/v1/callback`).
6. Click **Create**. Copy the **Client ID** and **Client Secret** it gives
   you.
7. Back in the Supabase Google provider screen, paste both in, and save.

Google sign-in now works.

## Step 6 — Apple sign-in (do this later)

Apple requires a paid Apple Developer account ($99/year) to set up Sign in
with Apple — there's no free way around this. Since you'll need that account
anyway when you're ready to submit to the App Store, **just skip this for
now**. The "Continue with Apple" button is already in the code — it just
won't work until you configure it later. Email and Google sign-in are enough
to fully test everything else in the meantime.

## Step 7 — Install and run

In VS Code, open a terminal in this project folder and run:

```bash
npm install
npm run dev
```

Open the URL it gives you (usually `http://localhost:5173`) in your browser.

## Step 8 — Try it out

1. Sign up with an email address (Supabase will send a confirmation email —
   check your inbox, click the link).
2. Sign in.
3. Go to **Log Catch**, enter a length (try something under 22" first — you
   should see it get rejected), then a real number like `36.5`.
4. Fill in a county, hit **Post Catch** — you should get the confetti
   celebration.
5. Go to **Board** — your catch should be sitting on the leaderboard.
6. Log a "Liar" catch and try voting 👍/👎 on it — try clicking the same
   thumb twice (it should retract your vote) and switching between thumbs
   (it should swap, not stack).

If all of that works, you have a real, working app.

---

## Troubleshooting

- **"Missing Supabase env vars" warning in the console** — you forgot to
  create `.env`, or the dev server was running before you created it. Stop
  the server (Ctrl+C) and run `npm run dev` again.
- **Sign-up email never arrives** — check spam, or in Supabase go to
  **Authentication** → **Users** and confirm the user manually by clicking
  into them (fine for testing, don't rely on this in production).
- **Photo upload fails** — double check the `catch-photos` bucket exists and
  is set to **Public** (Step 3).
- **"row-level security" errors when posting a catch or vote** — almost
  always means the SQL from Step 2 didn't fully run. Go back to the SQL
  Editor and run it again.

---

## Changelog

- **Fixed: "Certified Slob" showing up on unverified Liar catches.** Turns
  out this was happening in two real spots — the catch detail page's tag
  ("LIAR · CERTIFIED SLOB") and the celebration popup after logging a Liar
  catch — both were pulling the Certified-flavored tier names regardless
  of verification. Liar catches now use their own ladder: Sure, Buddy →
  If You Say So → Suspiciously Specific → Tall Tale Lunker → Big
  Momma...Allegedly → Fish Story Slob → Hard to Swallow → Loch Ness Snook.
  Same size ranges and colors as the Certified ladder, just the naming
  fixed. Also now shown as a small label under the vote verdict on the
  Liars leaderboard itself, so the size context isn't missing there either.
- **Fixed: leaderboard cards collapsing into a vertical stack on some
  phones.** The card's layout is rebuilt to explicitly place every piece
  (rank, thumb, name, tags, length) on its own named grid position instead
  of relying on the browser to figure it out — plus the tag pills now sit
  in their own full-width row below the compact top row instead of being
  squeezed into a narrow middle column, which was the most likely root
  cause. This was confirmed happening identically across two different
  browsers on the same device, so it's fixed at the structural level
  rather than patched for one browser's quirk.
- **Fixed: phone back button exiting the app.** Opening someone else's
  profile, a catch's detail view, or Terms & Privacy now pushes a real
  browser history entry — so the hardware/gesture back button (and every
  in-app "← Back" button, which now goes through the same path) steps back
  within the app instead of falling through to whatever was open before
  the site. Switching between the bottom nav's main tabs (Board/Log
  Catch/Education/your own Profile) intentionally isn't part of this —
  that's standard behavior, not something back-button history usually
  covers in any app.

**No database changes and no new setup steps for this batch** — it's all
front-end code, so `npm install` + push is all that's needed.

- **Vote verdict badges on Liars catches** — instead of just a raw
  percentage, a Liar's catch with at least 5 total votes now shows a
  color-coded verdict: ✅ Community Verified (80%+), 🤔 Mostly Believed
  (60-79%), 😐 Split Decision (40-59%), 🤨 Skeptical Crowd (20-39%), or
  🤥 Nobody's Buying It (under 20%). Under 5 votes, it shows the raw % plus
  "verdict at 5 votes" so people know more votes are needed. No database
  change needed — this is purely computed client-side from votes you
  already have.
- **Board shows a real error if it fails to load** — instead of silently
  looking like there are zero catches, a failed leaderboard fetch now
  shows an actual error message with a "Try Again" button.
- **"Contact Us" link** — next to Terms & Privacy at the bottom of every
  page, opens an email to fortyinchsnook@gmail.com for issues, complaints,
  or suggestions.

**Note:** this update is layered on top of the previous batch (guest
browsing, account deletion, tier badges, share-to-image, photo-library
fix) — if you haven't installed that one yet, this zip has everything
from both, all in one. Same setup steps as before apply (the
`delete-account` Edge Function still needs deploying) — nothing new to
run for this specific batch.

- **Guest browsing** — anyone can view the Board and Education pages
  without an account now. Everything stays view-only for guests: tapping
  vote, comment, flag, Log Catch, or the Profile tab shows a tailored
  "sign up to do this" prompt instead of a dead end, with a "Continue
  Browsing" way back out if they're not ready yet.
- **Account deletion** — a "Delete my account" link at the bottom of your
  own profile permanently removes your account, profile, catches, votes,
  and comments. Needs the new `delete-account` Edge Function deployed —
  see below.
- **Tier badges** — a "🎖️ Tier Badges" section on every profile shows all 8
  size tiers using the new gold seal artwork; unlocked ones (earned from at
  least one **Certified** catch in that range) show full color with a
  tier-colored ring, locked ones show grayed out with a 🔒. Liars catches
  don't count toward badges, on purpose.
- **Share to social** — a 📤 button in the catch detail view builds a
  shareable image (photo, length, tier, handle, a small
  "40inchsnook.com" watermark) and opens the device's native share sheet.
  Falls back to a plain image download on browsers that don't support
  sharing files (mostly desktop).
- **Photo upload no longer forces the camera** — removed the setting that
  was skipping straight to the camera on some phones; picking from your
  photo library should work now too.

### One more setup step for this update

Deploy the new Edge Function the same way as the flag-email one:
```bash
supabase functions deploy delete-account
```
No new secrets needed for this one — Supabase provides the required keys
automatically for every Edge Function. (Needs Docker Desktop open, same
requirement as before.)

- **Certified seal now uses the real snook artwork** — the hand-drawn
  line-art fish in the middle of the gold badge is replaced with the calm
  mascot image (the same one in the header). Shows up everywhere the seal
  does: the Certified leaderboard label, each certified card's tag, and the
  catch detail view.

- **Photo is now required to post a catch** — enforced both in the form
  (submit button stays disabled without one) and at the database level (a
  `NOT NULL` constraint on `photo_url`), so it can't be bypassed by
  anything talking directly to the API either. ⚠️ See the note in
  `schema.sql` above the new line — if you've got old test catches with no
  photo, that migration line will fail until those rows are deleted or
  given a photo.

- **Delete your own catches** — a 🗑️ icon shows on your own leaderboard rows
  (instead of the 🚩 flag icon everyone else's rows show), and inside the
  new catch detail view too. Both ask for confirmation before actually
  deleting. Deleting a catch also removes its votes and comments.
- **Comments** — tap any leaderboard card to open a detail view showing the
  full catch plus a comment thread. 120-character limit, live counter, and
  you can delete your own comments (also with confirmation). Each
  leaderboard row shows a small "💬 N" tag once a catch has comments.
- **Poster's blurb** — a new optional field on Log Catch, 120 characters,
  shown on the catch's detail page under its tags.
- **Forgot password** — a link on the sign-in screen sends a reset email;
  clicking it brings you back to the app to set a new password.
- **Profile save errors are no longer silent** — a failed save (e.g. a
  handle that's already taken) now shows a real error and keeps your edits
  on screen instead of quietly closing like it worked.
- **Terms & Privacy page** — a plain-language summary, linked from the
  bottom of every screen. Not lawyer-reviewed — see the page itself for
  that disclaimer.
- **22"–55" range enforced** — Log Catch now blocks anything over 55" the
  same way it already blocked anything under 22".
- **"Load More" pagination** — leaderboards load 10 at a time now instead
  of dumping every row at once.
- **Header polish** — bigger mascot, tighter title alignment, and tapping
  the mascot plays a short sound. ⚠️ The sound only plays once you've
  added a real audio file — see below.

### One more setup step for this update

1. **Run the new bottom section of `schema.sql`** in Supabase's SQL editor
   — adds the `comments` table and the catch length/blurb changes. Same
   "destructive operation" warning as before on the `drop constraint` line
   — safe to click through, it's just replacing the old length rule with
   the new 22"–55" one.
2. **Add the mascot pop sound** (whenever you've got it) — drop the file at
   exactly `public/sounds/mascot-pop.mp3`. Nothing breaks if it's not
   there yet; tapping the mascot just won't make noise until it is.

- **First-time intro popup** — new accounts see a 4-slide walkthrough
  (what the app is, Certified vs Liars, the county-only privacy rule, the
  size-tier ladder) the first time they log in. It's tracked per-account in
  the database (a new `has_seen_intro` column on `profiles`), not just on
  the device — so it won't reappear if someone logs in on a different
  phone, and it only shows once, ever, per account. Skippable at any point.
  ⚠️ Needs the schema update below run in Supabase before this will work.

- **Content moderation + email alerts** — a small 🚩 icon on every
  leaderboard card lets anyone report a post; you get an email titled
  "FLAGGED POST" so it's easy to spot, then remove it yourself in Supabase.
  Requires a one-time setup — see the "Content moderation" section below.
- **Deployment guide** — full step-by-step for putting this on a real
  `https://` URL via Vercel and pointing Supabase/Google at it — see "Going
  live" below.
- **Skeptical mascot now properly transparent** — replaced
  `mascot-skeptical.png` with a version that actually has a real alpha
  channel, verified pixel-by-pixel this time, not just by how it looked in
  a chat preview.

- **Real mascot artwork** — the old hand-drawn SVG fish is replaced with your
  actual "Snooky" artwork, in three expressions: calm (header + sign-in
  screen), hype (celebration modal), and skeptical side-eye (Liars
  leaderboard). ⚠️ The skeptical image still has a solid white background —
  it'll show a white box behind the fish until you re-export it with a truly
  transparent background (a checkered preview in a chat window isn't proof of
  real transparency — the file has to actually have an alpha channel). Swap
  `src/assets/mascot-skeptical.png` for a properly transparent version
  whenever you have one; nothing else needs to change.

- **Leaderboard photos + tappable profiles** — each leaderboard row now shows
  the actual uploaded catch photo (falls back to the fish emoji if no photo
  was attached, same in the profile's Catch Catalog). Tapping an angler's
  name opens their profile — their real stats and catch catalog, not just
  yours. The "Edit Profile" button and form only show up when you're viewing
  your own profile.

## What's *not* built yet (on purpose)

- **Days fished / Days skunked** on the Profile page — these need a separate
  "log a fishing day" feature that wasn't part of what we designed yet. The
  stat cards are there as placeholders.
- **Native app / App Store & Play Store submission** — this is a web app you
  run in a browser right now. Wrapping it with Capacitor and submitting to
  the stores is the next phase, once this is working the way you want.
- **Monetization (ads, raffles, dropshipping, swag)** — noted for later,
  intentionally not touched here. None of it affects the database structure
  we just built, so it can bolt on whenever you're ready.

## Content moderation — flagging + email alerts

Every catch now has a small, quiet 🚩 icon in the top-right corner of its
card (leaderboard only, not the featured post). Tap it and it silently logs
a report — no popup, no confirmation dialog, just the icon turning into a ✓.
You get an email with the subject line **"FLAGGED POST"** so it's easy to
spot, then go remove the bad content yourself in Supabase's Table Editor
(delete the row from the `catches` table). One flag per person per catch —
the database enforces that, so nobody can spam-flag the same post.

**This needs one extra piece of setup that isn't automatic — the email
sending.** Here's how to turn it on:

### 1. Get a free Resend account (for sending the email)

1. Go to [resend.com](https://resend.com) and sign up (free tier: 100
   emails/day, way more than you need for flagging).
2. Go to **API Keys** → **Create API Key** → copy it somewhere safe.

### 2. Install the Supabase CLI (one-time)

In your project's terminal:
```bash
npm install -g supabase
```

### 3. Log in and link your project

```bash
supabase login
```
This opens a browser to authenticate. Then:
```bash
supabase link --project-ref jdingysplusmpuqspnay
```
(replace `jdingysplusmpuqspnay` with your actual project ref — it's the
subdomain part of your Project URL from `.env`)

### 4. Set the Edge Function's secrets

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
supabase secrets set ALERT_EMAIL_TO=your_own_email@example.com
```
(`ALERT_EMAIL_TO` is where the "FLAGGED POST" emails get sent — almost
certainly your own inbox)

### 5. Deploy the Edge Function

```bash
supabase functions deploy send-flag-email
```

### 6. Connect it with a Database Webhook

1. In Supabase: **Database** → **Webhooks** → **Create a new webhook**.
2. Name it anything (e.g. `flag-alert`).
3. Table: `flags`. Events: check only **Insert**.
4. Type: **Supabase Edge Functions**. Select `send-flag-email`.
5. Save.

That's it — flag something in the app and an email should land in your
inbox within a few seconds.

**If the email never shows up:** check **Database** → **Webhooks** in
Supabase for a log of whether it fired and what the Edge Function returned;
that'll tell you whether the problem is the webhook, the function, or Resend
itself.

## Going live — deploying so other people can use it

This gets you a real `https://` URL you can text to your 10 testers, instead
of `localhost` which only works on your computer.

### 1. Push the project to GitHub

If it's not already a git repo:
```bash
git init
git add .
git commit -m "initial commit"
```
Create a new repo on [github.com](https://github.com) (empty, no README),
then follow the "push an existing repository" instructions it shows you.

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (free) — signing up
   with your GitHub account makes the next step easier.
2. **Add New Project** → select your `snook-club-app` repo → **Import**.
3. Vercel auto-detects it's a Vite project — you shouldn't need to change
   any build settings.
4. Before clicking Deploy, expand **Environment Variables** and add the
   same two from your `.env`:
   ```
   VITE_SUPABASE_URL=https://jdingysplusmpuqspnay.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_...
   ```
5. Click **Deploy**. In about a minute you'll get a live URL like
   `snook-club-app.vercel.app`.

### 3. Point Supabase at your new live URL

Right now Supabase only trusts `localhost` for auth redirects — your live
site needs to be added too, or sign-in will break for anyone but you.

1. In Supabase: **Authentication** → **URL Configuration**.
2. Set **Site URL** to your Vercel URL (e.g. `https://snook-club-app.vercel.app`).
3. Under **Redirect URLs**, add that same URL (and keep the `localhost:5173`
   one too, so local testing still works).
4. Save.

### 4. Update the Google OAuth redirect URI

1. Back in [Google Cloud Console](https://console.cloud.google.com) →
   **Google Auth Platform** → **Clients** → your web client.
2. Under **Authorized redirect URIs**, the Supabase callback URL you added
   before should still work as-is — Google OAuth goes through Supabase's
   domain, not your Vercel domain directly, so **this step usually needs no
   changes.** Only revisit it if Google sign-in breaks on the live site.

### 5. Send it to your 10 testers

Just share the Vercel URL. A couple of things worth telling them up front:
- It's a website, not an app-store app yet — "add to home screen" from
  their phone's browser share menu makes it behave a lot more like a real
  app (full-screen, its own icon).
- Ask them to actually try flagging something and voting, not just log a
  catch — that's the stuff most likely to surface bugs.

### Reminder for later

The Google sign-in screen showing the raw `.supabase.co` domain instead of
a clean one — noted earlier as a cosmetic thing to fix before a wider public
launch (needs Supabase's paid custom domain feature). Doesn't block your 10
testers at all, just flagging it's still on the list.

