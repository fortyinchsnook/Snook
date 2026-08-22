// Supabase Edge Function — deletes the calling user's own account entirely.
// Runs with admin privileges (required — this can't be done safely from
// the browser), but only ever acts on whoever's token called it, never an
// arbitrary user ID passed in from the client.
//
// SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are
// provided automatically by Supabase for every Edge Function — no manual
// secrets setup needed for this one (unlike the flag-email function).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Browsers send a CORS "preflight" OPTIONS request before the real POST
// when calling this from a different origin (your site calling Supabase's
// function domain counts as cross-origin). Without these headers on every
// response — including errors — the browser blocks the request entirely
// before it ever reaches this code.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Missing Authorization header', { status: 401, headers: corsHeaders })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // verify who's actually calling, using their own token
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await callerClient.auth.getUser()
    if (userError || !user) {
      return new Response('Invalid or expired session', { status: 401, headers: corsHeaders })
    }

    // delete with admin privileges — only ever this exact user's own id
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      return new Response(deleteError.message, { status: 500, headers: corsHeaders })
    }

    // profiles.id -> auth.users(id) on delete cascade already handles
    // wiping the profile, and catches/votes/comments/flags all cascade
    // from there — nothing else to clean up manually.

    return new Response('ok', { status: 200, headers: corsHeaders })
  } catch (err) {
    return new Response(`Function error: ${err.message}`, { status: 500, headers: corsHeaders })
  }
})
