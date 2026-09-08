/* ============================================================================
   Visitor counter + private visit log for the portfolio.

   Public endpoints (anyone, including your site's visitors):
     POST /visit   record a visit, returns the running total
     POST /event   record a resume download / demo launch / contact reveal
     GET  /stats   { total, today, week, countries } — just numbers, nothing personal

   Private endpoint (you only — requires the OWNER_KEY secret):
     GET  /log     the full visit list: who, where from, what they did

   Nobody can read /log without the key. Raw IP addresses are never stored —
   only a salted hash, used to count unique visitors.

   Setup is in README.md → "Step 4".
   ========================================================================= */

const ALLOWED_ORIGINS = [
  'https://saahil-doryu.github.io',
  'http://localhost:8747',
  'http://127.0.0.1:8747'
];

const corsHeaders = origin => ({
  'Access-Control-Allow-Origin':  ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age':       '86400',
  'Vary':                         'Origin'
});

const json = (data, origin, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });

/* Salted hash of the IP — lets us count unique people without keeping the address. */
async function hashIP(ip, salt) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`));
  return [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* Turn a raw referrer into something readable. */
function friendlySource(ref) {
  if (!ref) return 'Direct';
  let host;
  try { host = new URL(ref).hostname.replace(/^www\./, ''); } catch { return 'Unknown'; }
  const known = {
    'linkedin.com':'LinkedIn', 'lnkd.in':'LinkedIn', 'github.com':'GitHub',
    'huggingface.co':'Hugging Face', 'instagram.com':'Instagram',
    'x.com':'X', 'twitter.com':'X', 't.co':'X',
    'google.com':'Google', 'bing.com':'Bing', 'duckduckgo.com':'DuckDuckGo',
    'mail.google.com':'Gmail', 'outlook.com':'Outlook', 'outlook.live.com':'Outlook',
    'indeed.com':'Indeed', 'glassdoor.com':'Glassdoor', 'wellfound.com':'Wellfound',
    'greenhouse.io':'Greenhouse', 'lever.co':'Lever', 'myworkdayjobs.com':'Workday',
    'handshake.com':'Handshake', 'joinhandshake.com':'Handshake',
    'slu.edu':'SLU', 'naukri.com':'Naukri'
  };
  for (const [k, v] of Object.entries(known))
    if (host === k || host.endsWith('.' + k)) return v;
  return host;
}

const isBot = ua => !ua ||
  /bot|crawl|spider|slurp|headless|lighthouse|preview|scrape|facebookexternalhit|whatsapp|telegrambot|embedly|python-requests|curl|wget|go-http|axios|okhttp/i.test(ua);

const DAY = 86400000;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url    = new URL(request.url);
    const path   = url.pathname.replace(/\/+$/, '') || '/';

    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: corsHeaders(origin) });

    if (!env.DB)
      return json({ error: 'Database not bound. Run the D1 setup in README step 4.' }, origin, 500);

    try {
      /* ───────────── POST /visit ───────────── */
      if (path === '/visit' && request.method === 'POST') {
        const ua = request.headers.get('User-Agent') || '';
        const body = await request.json().catch(() => ({}));

        // Bots never count.
        if (isBot(ua)) return json({ ok: true, counted: false, ...(await stats(env)) }, origin);

        const sid = String(body.sid || '').slice(0, 40);
        const now = Date.now();

        // One row per session — refreshes don't inflate the number.
        if (sid) {
          const seen = await env.DB.prepare(
            'SELECT 1 FROM visits WHERE sid = ?1 AND ts > ?2 LIMIT 1'
          ).bind(sid, now - 6 * 3600000).first();
          if (seen) return json({ ok: true, counted: false, ...(await stats(env)) }, origin);
        }

        const cf = request.cf || {};
        const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';

        await env.DB.prepare(`
          INSERT INTO visits (ts,sid,iphash,city,region,country,cc,org,source,ref,device,os,browser,path)
          VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14)
        `).bind(
          now, sid,
          await hashIP(ip, env.IP_SALT || 'portfolio'),
          cf.city || null, cf.region || null, cf.country ? countryName(cf.country) : null,
          cf.country || null, cf.asOrganization || null,
          friendlySource(body.ref), String(body.ref || '').slice(0, 300),
          String(body.device || '').slice(0, 20),
          String(body.os || '').slice(0, 20),
          String(body.browser || '').slice(0, 20),
          String(body.path || '/').slice(0, 120)
        ).run();

        return json({ ok: true, counted: true, ...(await stats(env)) }, origin);
      }

      /* ───────────── POST /event ───────────── */
      if (path === '/event' && request.method === 'POST') {
        if (isBot(request.headers.get('User-Agent') || ''))
          return json({ ok: true }, origin);
        const b = await request.json().catch(() => ({}));
        const kind = String(b.kind || '').slice(0, 20);
        if (!['resume','demo','phone','email','contact'].includes(kind))
          return json({ ok: false }, origin, 400);
        await env.DB.prepare('INSERT INTO events (ts,sid,kind,detail) VALUES (?1,?2,?3,?4)')
          .bind(Date.now(), String(b.sid || '').slice(0, 40), kind, String(b.detail || '').slice(0, 120))
          .run();
        return json({ ok: true }, origin);
      }

      /* ───────────── POST /message ─────────────
         A form on a public page will attract spam, so this is guarded by a
         honeypot field, length limits, and a per-IP hourly cap.            */
      if (path === '/message' && request.method === 'POST') {
        const b = await request.json().catch(() => ({}));

        // Honeypot: a field hidden from people. Anything that fills it is a
        // bot. Answer "ok" so it doesn't learn, but store nothing.
        if (String(b.website || '').trim() !== '')
          return json({ ok: true }, origin);

        const body = String(b.body || '').trim();
        if (body.length < 5)    return json({ ok: false, error: 'Message is too short.' }, origin, 400);
        if (body.length > 2000) return json({ ok: false, error: 'Message is too long (2000 characters max).' }, origin, 400);

        const name  = String(b.name  || '').trim().slice(0, 80);
        const email = String(b.email || '').trim().slice(0, 120);
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
          return json({ ok: false, error: "That email address doesn't look right." }, origin, 400);

        const ip     = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
        const iphash = await hashIP(ip, env.IP_SALT || 'portfolio');

        const recent = await env.DB.prepare(
          'SELECT COUNT(*) AS n FROM messages WHERE iphash = ?1 AND ts > ?2'
        ).bind(iphash, Date.now() - 3600000).first();
        if ((recent?.n ?? 0) >= 5)
          return json({ ok: false, error: 'Too many messages just now. Try again in an hour.' }, origin, 429);

        const cf = request.cf || {};
        await env.DB.prepare(`
          INSERT INTO messages (ts,sid,iphash,name,email,body,city,region,country,cc,org,source)
          VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)
        `).bind(
          Date.now(), String(b.sid || '').slice(0, 40), iphash,
          name || null, email || null, body,
          cf.city || null, cf.region || null,
          cf.country ? countryName(cf.country) : null,
          cf.country || null, cf.asOrganization || null,
          friendlySource(b.ref)
        ).run();

        return json({ ok: true }, origin);
      }

      /* ───────────── GET /stats  (public — numbers only) ───────────── */
      if (path === '/stats' && request.method === 'GET')
        return json(await stats(env), origin);

      /* ───────────── GET /log  (private — needs your key) ───────────── */
      if (path === '/log' && request.method === 'GET') {
        const auth = request.headers.get('Authorization') || '';
        const key  = auth.replace(/^Bearer\s+/i, '');
        if (!env.OWNER_KEY || !timingSafeEqual(key, env.OWNER_KEY))
          return json({ error: 'Not authorised' }, origin, 401);

        const limit = Math.min(Number(url.searchParams.get('limit')) || 100, 500);
        const [visits, events, messages, s] = await Promise.all([
          env.DB.prepare('SELECT ts,sid,city,region,country,cc,org,source,ref,device,os,browser,path FROM visits ORDER BY ts DESC LIMIT ?1').bind(limit).all(),
          env.DB.prepare('SELECT ts,kind,detail,sid FROM events ORDER BY ts DESC LIMIT ?1').bind(limit).all(),
          env.DB.prepare('SELECT id,ts,name,email,body,city,region,country,cc,org,source FROM messages ORDER BY ts DESC LIMIT ?1').bind(limit).all(),
          stats(env)
        ]);
        return json({
          ok: true, stats: s,
          visits:   visits.results   || [],
          events:   events.results   || [],
          messages: messages.results || []
        }, origin);
      }

      return json({ error: 'Not found' }, origin, 404);

    } catch (err) {
      return json({ error: 'Server error', detail: String(err).slice(0, 200) }, origin, 500);
    }
  }
};

/* Public numbers. Deliberately contains nothing that identifies anyone. */
async function stats(env) {
  const now = Date.now();
  const row = await env.DB.prepare(`
    SELECT
      (SELECT COUNT(*)             FROM visits)               AS total,
      (SELECT COUNT(DISTINCT iphash) FROM visits)             AS unique_people,
      (SELECT COUNT(*) FROM visits WHERE ts > ?1)             AS today,
      (SELECT COUNT(*) FROM visits WHERE ts > ?2)             AS week,
      (SELECT COUNT(DISTINCT cc) FROM visits WHERE cc IS NOT NULL) AS countries
  `).bind(now - DAY, now - 7 * DAY).first();
  return {
    total:     row?.total         ?? 0,
    unique:    row?.unique_people ?? 0,
    today:     row?.today         ?? 0,
    week:      row?.week          ?? 0,
    countries: row?.countries     ?? 0
  };
}

/* Constant-time compare so the key can't be guessed by timing the response. */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* Cloudflare gives us a 2-letter code; turn it into something readable. */
function countryName(cc) {
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(cc) || cc; }
  catch { return cc; }
}
