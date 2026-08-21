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

## What's *not* built yet (on purpose)

- **Days fished / Days skunked** on the Profile page — these need a separate
  "log a fishing day" feature that wasn't part of what we designed yet. The
  stat cards are there as placeholders.
- **Content moderation** — no report button or admin panel yet. For now,
  you'd remove anything bad directly in the Supabase Table Editor by hand.
  Fine at this size, not fine once strangers are using it.
- **Native app / App Store & Play Store submission** — this is a web app you
  run in a browser right now. Wrapping it with Capacitor and submitting to
  the stores is the next phase, once this is working the way you want.
- **Monetization (ads, raffles, dropshipping, swag)** — noted for later,
  intentionally not touched here. None of it affects the database structure
  we just built, so it can bolt on whenever you're ready.

## Deploying so anyone can use it (not just your computer)

Whenever you're ready to give this a real URL instead of `localhost`: this
is a standard Vite + React app, so it deploys straight to
[Vercel](https://vercel.com) or [Netlify](https://netlify.com) for free —
connect your GitHub repo, add the same two `.env` variables in their
dashboard, done. Just ask and I'll walk you through that step when you get
there.
