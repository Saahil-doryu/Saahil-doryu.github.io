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

  /* ══════════════════ NUMBER FORMATTING ══════════════════
     There is deliberately no public counter. Visitors are shown nothing —
     no total, no visitor count, no country list. Every figure lives behind
     the owner key, and the server refuses to hand any of it out without it.
     ───────────────────────────────────────────────────── */
  const nf = new Intl.NumberFormat('en-US');

  /* ══════════════════ RECORDING ══════════════════ */
  async function recordVisit(){
    const d = ua();
    // Fire and forget: the response carries nothing the visitor may see.
    await post('/visit', {
      sid:   state.sid,
      ref:   document.referrer && !document.referrer.includes(location.hostname) ? document.referrer : '',
      path:  location.pathname + location.search.replace(/[?&](owner|admin)=[^&]*/g,''),
      ...d
    });
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

  /* ── day grouping ─────────────────────────────────────────────────
     Days are your local days, so "Today" means today where you are.   */
  const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayKey     = ts => startOfDay(new Date(Number(ts)));

  function dayLabel(ts){
    const d = new Date(Number(ts));
    const diff = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7)   return d.toLocaleDateString(undefined, { weekday:'long' });
    return d.toLocaleDateString(undefined, { weekday:'short', day:'numeric', month:'short' });
  }

  const clockOf = ts => new Date(Number(ts))
    .toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' });

  /* Rows arrive newest-first, so the groups come out in order too. */
  function groupByDay(items){
    const groups = [];
    for (const it of items) {
      const k = dayKey(it.ts);
      let g = groups[groups.length - 1];
      if (!g || g.key !== k) { g = { key:k, label:dayLabel(it.ts), items:[] }; groups.push(g); }
      g.items.push(it);
    }
    return groups;
  }

  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

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

    const msgDays = groupByDay(messages);
    const msgCards = msgDays.map(g => `
      <div class="day-head">
        <span>${esc(g.label)}</span>
        <em>${plural(g.items.length, 'message', 'messages')}</em>
      </div>
      ${g.items.map(m => {
        const loc = [m.city, m.region, m.country].filter(Boolean).join(', ');
        return `
        <div class="msg-card">
          <div class="msg-head">
            <span class="msg-from">${esc(m.name || 'Anonymous')}</span>
            ${m.email ? `<a class="msg-mail" href="mailto:${esc(m.email)}">${esc(m.email)}</a>` : ''}
            <time class="msg-time">${esc(clockOf(m.ts))}</time>
          </div>
          <div class="msg-body">${esc(m.body)}</div>
          <div class="msg-meta">
            ${flag(m.cc)} ${esc(loc || 'Unknown')}${m.org ? ` · ${esc(m.org)}` : ''}${m.source && m.source !== 'Direct' ? ` · via ${esc(m.source)}` : ''}
          </div>
          ${m.email ? `<a class="msg-reply" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: your message on saahil-doryu.github.io')}">Reply →</a>` : ''}
        </div>`;
      }).join('')}`).join('');

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

    const visitDays = groupByDay(visits);
    const rows = visitDays.map(g => `
      <tr class="day-row">
        <td colspan="4">
          <span>${esc(g.label)}</span>
          <em>${plural(g.items.length, 'visit', 'visits')}</em>
        </td>
      </tr>
      ${g.items.map(v => `
      <tr${HOT.test(v.source || '') ? ' class="hot"' : ''}>
        <td class="c-when">${esc(clockOf(v.ts))}</td>
        <td class="c-where"><span class="fl">${flag(v.cc)}</span> ${esc(place(v))}
            ${v.org ? `<span class="org">${esc(v.org)}</span>` : ''}</td>
        <td class="c-src">${HOT.test(v.source || '') ? '🔥 ' : ''}${esc(v.source || 'Direct')}</td>
        <td class="c-dev">${esc([v.device, v.os, v.browser].filter(Boolean).join(' · '))}</td>
      </tr>`).join('')}`).join('');

    box.innerHTML = `
      <div class="admin-kpis">
        <div><b>${nf.format(s?.unique ?? 0)}</b><span>unique visitors</span></div>
        <div><b>${nf.format(s?.total ?? 0)}</b><span>total views</span></div>
        <div><b>${nf.format(s?.today ?? 0)}</b><span>today</span></div>
        <div><b>${nf.format(s?.countries ?? 0)}</b><span>countries</span></div>
      </div>

      <h4 class="admin-h">Messages${messages.length
        ? ` — ${plural(messages.length,'message','messages')} across ${plural(msgDays.length,'day','days')}` : ''}</h4>
      ${messages.length
        ? `<div class="msgs">${msgCards}</div>`
        : '<p class="admin-empty">No messages yet.</p>'}

      <h4 class="admin-h">What people did</h4>
      ${events.length
        ? `<ul class="ev-list">${evByTime}</ul>`
        : '<p class="admin-empty">No resume downloads or demo launches yet.</p>'}

      <h4 class="admin-h">Who opened your page${visits.length
        ? ` — ${plural(visits.length,'visit','visits')} across ${plural(visitDays.length,'day','days')}` : ''}</h4>
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
    const sec   = document.getElementById('visitors');
    if (!panel || !API) return;
    // Without ?admin=1 or a stored key the whole section stays hidden, so an
    // ordinary visitor sees no trace that any of this exists.
    if (!wantsAdmin && !ownerKey()) return;

    if (sec) sec.hidden = false;
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
    if (GC) {                         // easy mode: dashboard only, no on-page number
      state.active = !isOwner() && !isBot();
      loadGoatCounter();
      return;
    }
    if (!API) {                       // nothing configured — site still works fine.
      const sec = document.getElementById('visitors');
      if (sec) sec.hidden = true;
      return;
    }
    state.sid = sessionId();

    initMessageForm();
    initAdmin();

    if (isOwner() || isBot()) {        // you and bots: never recorded
      state.active = false;
      return;
    }
    state.active = true;
    if ('requestIdleCallback' in window) requestIdleCallback(() => recordVisit(), { timeout: 2000 });
    else setTimeout(recordVisit, 700);
  }

  return { init, action, isMuted: isOwner };
})();
