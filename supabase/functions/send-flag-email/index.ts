// Supabase Edge Function — fires when a row is inserted into `flags`.
// Sends you an email with subject "FLAGGED POST" so it's easy to spot
// in your inbox. Uses Resend (resend.com) — free tier is plenty for this.

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record // the new row in the `flags` table

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const ALERT_EMAIL_TO = Deno.env.get('ALERT_EMAIL_TO')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!RESEND_API_KEY || !ALERT_EMAIL_TO) {
      return new Response('Missing RESEND_API_KEY or ALERT_EMAIL_TO secret', { status: 500 })
    }

    // pull a bit of context about the flagged catch so the email is useful,
    // not just a bare ID
    let catchInfo = null
    if (SUPABASE_URL && SERVICE_ROLE_KEY) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/catches?id=eq.${record.catch_id}&select=id,length,verification,county,photo_url`,
        {
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
        }
      )
      const rows = await res.json()
      catchInfo = rows?.[0] || null
    }

    const bodyLines = [
      `A catch was just flagged for review.`,
      ``,
      `Catch ID: ${record.catch_id}`,
      catchInfo ? `Length: ${catchInfo.length}" (${catchInfo.verification})` : '',
      catchInfo ? `County: ${catchInfo.county}` : '',
      catchInfo?.photo_url ? `Photo: ${catchInfo.photo_url}` : '',
      ``,
      `Review it in Supabase: Table Editor → catches (search for the ID above).`,
    ].filter(Boolean).join('\n')

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Snook Club Alerts <onboarding@resend.dev>', // fine for testing; see README to use your own domain later
        to: ALERT_EMAIL_TO,
        subject: 'FLAGGED POST',
        text: bodyLines,
      }),
    })

    if (!emailRes.ok) {
      const errText = await emailRes.text()
      return new Response(`Resend error: ${errText}`, { status: 500 })
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    return new Response(`Function error: ${err.message}`, { status: 500 })
  }
})
