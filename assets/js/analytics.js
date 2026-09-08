/* ============================================================================
   analytics.js — visitor counting, and your private visit log.

   Everyone sees:  a number. Views, visitors, countries. Nothing identifying.
   You see:        the full log — who opened the page, where from, what they did.
                   Open your site with ?admin=1 and enter your owner key.

   The key is never in this file. It lives in your browser after you type it
   once, and the server refuses /log without it. Your own visits are not counted.
   ========================================================================= */

const Visits = (() => {
  const cfg = (window.CONFIG && CONFIG.analytics) || {};
  const API = String(cfg.apiUrl || '').replace(/\/+$/, '');
  const GC  = String(cfg.goatcounter || '').trim();   // easy mode

  const K = { owner:'pf_owner_muted', key:'pf_owner_key', sid:'pf_sid', stats:'pf_stats_cache' };

  const state = { active:false, sid:null, stats:null, queue:[] };

  /* ── storage helpers (private browsing can throw) ──────────────────── */
  const S = {
    get:(k,sess)=>{ try{ return (sess?sessionStorage:localStorage).getItem(k); }catch{ return null; } },
    set:(k,v,sess)=>{ try{ (sess?sessionStorage:localStorage).setItem(k,v); }catch{} },
    del:(k)=>{ try{ localStorage.removeItem(k); }catch{} }
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  /* ── who am I ─────────────────────────────────────────────────────── */
  function sessionId(){
    let id = S.get(K.sid, true);
    if (!id) {
      id = (crypto.randomUUID?.() || String(Math.random()).slice(2) + Date.now().toString(36)).slice(0, 36);
      S.set(K.sid, id, true);
    }
    return id;
  }

  const ownerKey = () => S.get(K.key);

  function isOwner(){
    const p = new URLSearchParams(location.search);
    if (p.has('owner')) {
      const on = p.get('owner') !== '0';
      on ? S.set(K.owner,'1') : S.del(K.owner);
      return on;
    }
    // Having the owner key means it's you — never count your own visits.
    return S.get(K.owner) === '1' || !!ownerKey();
  }

  const isBot = () => navigator.webdriver ||
    /bot|crawl|spider|slurp|headless|lighthouse|preview|scrape/i.test(navigator.userAgent);

  /* ── device fingerprint (coarse, non-identifying) ──────────────────── */
  function ua(){
    const s = navigator.userAgent;
    return {
      os:      /iPhone|iPad|iPod/i.test(s) ? 'iOS' : /Android/i.test(s) ? 'Android'
             : /Mac OS X|Macintosh/i.test(s) ? 'macOS' : /Windows/i.test(s) ? 'Windows'
             : /Linux/i.test(s) ? 'Linux' : 'Unknown',
      browser: /Edg\//i.test(s) ? 'Edge' : /OPR\/|Opera/i.test(s) ? 'Opera'
             : /Firefox\//i.test(s) ? 'Firefox' : /Chrome\//i.test(s) ? 'Chrome'
             : /Safari\//i.test(s) ? 'Safari' : 'Other',
      device:  /Mobi|iPhone|iPod|Android.*Mobile/i.test(s) ? 'Phone'
             : /iPad|Tablet/i.test(s) ? 'Tablet' : 'Desktop'
    };
  }

  /* ── network ──────────────────────────────────────────────────────── */
  async function post(path, body){
    if (!API) return null;
    try {
      const r = await fetch(API + path, {
        method:'POST', keepalive:true,
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(body)
      });
      return r.ok ? await r.json() : null;
    } catch { return null; }
  }

  async function getStats(){
    if (!API) return null;
    try {
      const r = await fetch(API + '/stats');
      return r.ok ? await r.json() : null;
    } catch { return null; }
  }

  /* ══════════════════ PUBLIC COUNTER ══════════════════ */
  const nf = new Intl.NumberFormat('en-US');

  function paintStats(s){
    if (!s) return;
    state.stats = s;
    S.set(K.stats, JSON.stringify(s));
    const put = (id, val) => {
      const el = document.getElementById(id);
      if (el) countUp(el, Number(val) || 0);
    };
    put('statUnique',    s.unique);
    put('statTotal',     s.total);
    put('statWeek',      s.week);
    put('statCountries', s.countries);

    const cap = document.querySelector('.stat-cap');
    if (cap) cap.textContent = Number(s.unique) === 1
      ? 'person has visited this page'
      : 'people have visited this page';
    const sec = document.getElementById('visitors');
    if (sec) sec.hidden = false;
  }

  function countUp(el, target){
    const from = Number(String(el.textContent).replace(/[^\d]/g,'')) || 0;
    if (from === target) { el.textContent = nf.format(target); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = nf.format(target); return;
    }
    const t0 = performance.now(), dur = 900;
    (function step(t){
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = nf.format(Math.round(from + (target - from) * eased));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  /* ══════════════════ RECORDING ══════════════════ */
  async function recordVisit(){
    const d = ua();
    const res = await post('/visit', {
      sid:   state.sid,
      ref:   document.referrer && !document.referrer.includes(location.hostname) ? document.referrer : '',
      path:  location.pathname + location.search.replace(/[?&](owner|admin)=[^&]*/g,''),
      ...d
    });
    paintStats(res || await getStats());
  }

  function action(kind, detail = ''){
    if (!state.active) return;
    if (GC) { gcEvent(kind, detail); return; }
    post('/event', { sid: state.sid, kind, detail });
  }

  /* ══════════════════ MESSAGE FORM ══════════════════ */
  function initMessageForm(){
    const form = document.getElementById('msgForm');
    const sec  = document.getElementById('message');
    if (!form || !sec) return;
    if (!API) { sec.hidden = true; return; }   // no backend, no form
    sec.hidden = false;

    const body   = document.getElementById('msgBody');
    const count  = document.getElementById('msgCount');
    const status = document.getElementById('msgStatus');
    const submit = document.getElementById('msgSubmit');

    body?.addEventListener('input', () => {
      if (count) count.textContent = body.value.length;
      body.setAttribute('aria-invalid', 'false');
    });

    const say = (text, kind) => {
      status.textContent = text;
      status.className = 'msg-status' + (kind ? ' ' + kind : '');
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const text  = body.value.trim();
      const email = document.getElementById('msgEmail').value.trim();

      if (text.length < 5) {
        body.setAttribute('aria-invalid', 'true'); body.focus();
        return say('Please write a little more.', 'err');
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        const el = document.getElementById('msgEmail');
        el.setAttribute('aria-invalid', 'true'); el.focus();
        return say("That email address doesn't look right.", 'err');
      }

      submit.disabled = true;
      say('Sending…', '');

      const res = await post('/message', {
        sid:     state.sid || sessionId(),
        name:    document.getElementById('msgName').value.trim(),
        email,
        body:    text,
        website: document.getElementById('msgWebsite').value,   // honeypot
        ref:     document.referrer && !document.referrer.includes(location.hostname) ? document.referrer : ''
      });

      if (res && res.ok) {
        form.classList.add('sent');
        say('Thank you — your message reached me. I read every one.', 'ok');
      } else {
        submit.disabled = false;
        say(res?.error || 'Could not send that. Please try again, or email me directly.', 'err');
      }
    });
  }

  /* ══════════════════ YOUR PRIVATE PANEL ══════════════════ */
  const when = ts => {
    const d = new Date(Number(ts));
    const mins = Math.round((Date.now() - d) / 60000);
    if (mins < 1)    return 'just now';
    if (mins < 60)   return `${mins}m ago`;
    if (mins < 1440) return `${Math.round(mins/60)}h ago`;
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric' }) + ', ' +
           d.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' });
  };

  const flag = cc => !cc ? '🌐' : cc.toUpperCase().replace(/./g,
    c => String.fromCodePoint(127397 + c.charCodeAt(0)));

  const place = v => [v.city, v.region, v.country].filter(Boolean).join(', ') || 'Unknown';

  const HOT = /LinkedIn|Indeed|Glassdoor|Wellfound|Greenhouse|Lever|Workday|Handshake|Naukri/i;

  const EVENT_LABEL = {
    resume:'downloaded your resume', demo:'launched a demo',
    phone:'revealed your phone', email:'copied your email', contact:'opened a link'
  };

  async function loadLog(key, limit = 100){
    try {
      const r = await fetch(`${API}/log?limit=${limit}`, { headers:{ Authorization:'Bearer ' + key } });
      if (r.status === 401) return { error:'That key was rejected.' };
      if (!r.ok)            return { error:'Could not reach the server.' };
      return await r.json();
    } catch { return { error:'Could not reach the server.' }; }
  }

  function renderLog(data){
    const box = document.getElementById('adminBody');
    if (!box) return;
    const { visits = [], events = [], messages = [], stats: s } = data;

    const msgCards = messages.map(m => {
      const loc = [m.city, m.region, m.country].filter(Boolean).join(', ');
      return `
      <div class="msg-card">
        <div class="msg-head">
          <span class="msg-from">${esc(m.name || 'Anonymous')}</span>
          ${m.email ? `<a class="msg-mail" href="mailto:${esc(m.email)}">${esc(m.email)}</a>` : ''}
          <time class="msg-time">${esc(when(m.ts))}</time>
        </div>
        <div class="msg-body">${esc(m.body)}</div>
        <div class="msg-meta">
          ${flag(m.cc)} ${esc(loc || 'Unknown')}${m.org ? ` · ${esc(m.org)}` : ''}${m.source && m.source !== 'Direct' ? ` · via ${esc(m.source)}` : ''}
        </div>
        ${m.email ? `<a class="msg-reply" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: your message on saahil-doryu.github.io')}">Reply →</a>` : ''}
      </div>`;
    }).join('');

    // Attach each action to the person who did it, via their session id.
    const bySid = {};
    visits.forEach(v => { if (v.sid && !bySid[v.sid]) bySid[v.sid] = v; });

    const evByTime = events.slice(0, 40).map(e => {
      const v   = bySid[e.sid];
      const who = v
        ? `${flag(v.cc)} ${esc(place(v))}${v.source && v.source !== 'Direct' ? ` · via ${esc(v.source)}` : ''}`
        : 'visitor no longer in the log';
      const hot = v && HOT.test(v.source || '');
      return `
      <li class="ev${hot ? ' ev-hot' : ''}">
        <span class="ev-dot"></span>
        <span class="ev-txt">
          <b>${hot ? '🔥 ' : ''}${esc(EVENT_LABEL[e.kind] || e.kind)}</b>${e.detail ? ` — ${esc(e.detail)}` : ''}
          <span class="ev-who">${who}</span>
        </span>
        <time>${esc(when(e.ts))}</time>
      </li>`;
    }).join('');

    const rows = visits.map(v => `
      <tr${HOT.test(v.source || '') ? ' class="hot"' : ''}>
        <td class="c-when">${esc(when(v.ts))}</td>
        <td class="c-where"><span class="fl">${flag(v.cc)}</span> ${esc(place(v))}
            ${v.org ? `<span class="org">${esc(v.org)}</span>` : ''}</td>
        <td class="c-src">${HOT.test(v.source || '') ? '🔥 ' : ''}${esc(v.source || 'Direct')}</td>
        <td class="c-dev">${esc([v.device, v.os, v.browser].filter(Boolean).join(' · '))}</td>
      </tr>`).join('');

    box.innerHTML = `
      <div class="admin-kpis">
        <div><b>${nf.format(s?.unique ?? 0)}</b><span>unique visitors</span></div>
        <div><b>${nf.format(s?.total ?? 0)}</b><span>total views</span></div>
        <div><b>${nf.format(s?.today ?? 0)}</b><span>today</span></div>
        <div><b>${nf.format(s?.countries ?? 0)}</b><span>countries</span></div>
      </div>

      <h4 class="admin-h">Messages${messages.length ? ` (${messages.length})` : ''}</h4>
      ${messages.length
        ? `<div class="msgs">${msgCards}</div>`
        : '<p class="admin-empty">No messages yet.</p>'}

      <h4 class="admin-h">What people did</h4>
      ${events.length
        ? `<ul class="ev-list">${evByTime}</ul>`
        : '<p class="admin-empty">No resume downloads or demo launches yet.</p>'}

      <h4 class="admin-h">Who opened your page</h4>
      ${visits.length ? `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>When</th><th>Where</th><th>Came from</th><th>Device</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>` : '<p class="admin-empty">No visits recorded yet.</p>'}

      <p class="admin-foot">
        Rows highlighted 🔥 arrived from LinkedIn or a job board.
        <button class="linklike" id="adminRefresh">Refresh</button> ·
        <button class="linklike" id="adminLock">Lock this panel</button>
      </p>`;

    document.getElementById('adminRefresh')?.addEventListener('click', () => unlock(ownerKey(), true));
    document.getElementById('adminLock')?.addEventListener('click', () => {
      S.del(K.key);
      location.href = location.pathname;
    });
  }

  async function unlock(key, silent){
    const body = document.getElementById('adminBody');
    if (!key) return;
    if (body && !silent) body.innerHTML = '<p class="admin-empty">Loading…</p>';
    const data = await loadLog(key);
    if (data.error) {
      const msg = document.getElementById('adminMsg');
      if (msg) { msg.textContent = data.error; msg.hidden = false; }
      if (data.error.includes('rejected')) S.del(K.key);
      return;
    }
    S.set(K.key, key);
    document.getElementById('adminGate')?.setAttribute('hidden','');
    document.getElementById('adminBody')?.removeAttribute('hidden');
    renderLog(data);
  }

  function initAdmin(){
    const wantsAdmin = new URLSearchParams(location.search).has('admin');
    const panel = document.getElementById('adminPanel');
    if (!panel || !API) return;
    if (!wantsAdmin && !ownerKey()) return;

    panel.hidden = false;

    const saved = ownerKey();
    if (saved) { unlock(saved, true); return; }

    document.getElementById('adminGate')?.removeAttribute('hidden');
    const form = document.getElementById('adminForm');
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const v = document.getElementById('adminKey').value.trim();
      if (v) unlock(v);
    });
  }

  /* ══════════════════ EASY MODE: GOATCOUNTER ══════════════════
     One script tag. Your dashboard lives at https://<code>.goatcounter.com
     and is private to your login. The number below is the only thing
     visitors can see.
     ───────────────────────────────────────────────────────────── */
  const gcOrigin = () => `https://${GC}.goatcounter.com`;

  function loadGoatCounter(){
    // GoatCounter's own opt-out flag — this is how your own visits stay uncounted.
    if (isOwner()) { try { localStorage.setItem('skipgc','t'); } catch {} }

    const sc = document.createElement('script');
    sc.async = true;
    sc.src = 'https://gc.zgo.at/count.js';
    sc.setAttribute('data-goatcounter', gcOrigin() + '/count');
    document.head.appendChild(sc);
  }

  async function paintGoatCount(){
    const sec = document.getElementById('visitors');
    try {
      // The path is the full path including its leading slash, hence "//".
      const r = await fetch(`${gcOrigin()}/counter//.json`);
      if (!r.ok) throw 0;
      const d = await r.json();
      // count_unique = distinct people; count = pageviews. Prefer the former,
      // and note both arrive as formatted strings like "295,424".
      const raw = d.count_unique ?? d.count;
      const n = parseInt(String(raw).replace(/[^\d]/g,''), 10);
      if (!Number.isFinite(n)) throw 0;

      const el = document.getElementById('statUnique');
      if (el) countUp(el, n);
      const cap = document.querySelector('.stat-cap');
      if (cap) cap.textContent = n === 1 ? 'person has visited this page'
                                         : 'people have visited this page';
      // GoatCounter's public endpoint gives one number, so drop the extra tiles.
      document.querySelector('.stat-row')?.remove();
      if (sec) sec.hidden = false;
    } catch {
      // Counter not public yet, or blocked. Hide rather than show a broken zero.
      if (sec) sec.hidden = true;
    }
  }

  function gcEvent(kind, detail){
    try {
      window.goatcounter?.count?.({
        path:  'event-' + kind,
        title: detail || kind,
        event: true
      });
    } catch {}
  }

  /* ══════════════════ BOOT ══════════════════ */
  async function init(){
    if (GC) {                         // easy mode
      state.active = !isOwner() && !isBot();
      loadGoatCounter();
      paintGoatCount();
      return;
    }
    if (!API) {                       // nothing configured — site still works fine.
      const sec = document.getElementById('visitors');
      if (sec) sec.hidden = true;
      return;
    }
    state.sid = sessionId();

    // Show a cached number immediately so the section isn't blank on load.
    try { paintStats(JSON.parse(S.get(K.stats) || 'null')); } catch {}

    initMessageForm();
    initAdmin();

    if (isOwner() || isBot()) {        // your visits and bots: show numbers, record nothing
      state.active = false;
      paintStats(await getStats());
      return;
    }
    state.active = true;
    if ('requestIdleCallback' in window) requestIdleCallback(() => recordVisit(), { timeout: 2000 });
    else setTimeout(recordVisit, 700);
  }

  return { init, action, isMuted: isOwner };
})();
