/* ============================================================================
   main.js — renders the whole page from CONFIG. You shouldn't need to edit
   this file; change assets/js/config.js instead.
   ========================================================================= */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const has = v => typeof v === 'string' ? v.trim() !== '' : !!v;

const C = window.CONFIG || {};

/* ── icons ──────────────────────────────────────────────────────── */
const ICON = {
  linkedin:'<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0"/></svg>',
  github:'<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .3"/></svg>',
  instagram:'<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.89 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07c-4.35.2-6.78 2.62-6.98 6.98C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88"/></svg>',
  mail:'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7"/></svg>',
  phone:'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92"/></svg>',
  hf:'<span style="font-size:19px;line-height:1" aria-hidden="true">🤗</span>',
  ext:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>',
  code:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>',
  play:'<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  info:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
};

/* ── toast ──────────────────────────────────────────────────────── */
let toastT;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ── theme ──────────────────────────────────────────────────────── */
function initTheme(){
  const root = document.documentElement;
  const accent = C.site?.accent || 'violet';
  root.setAttribute('data-accent', accent);

  let saved = null;
  try { saved = localStorage.getItem('pf_theme'); } catch {}
  root.setAttribute('data-theme', saved || C.site?.themeDefault || 'dark');

  $('#themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('pf_theme', next); } catch {}
  });
}

/* ── head / SEO ─────────────────────────────────────────────────── */
function initMeta(){
  const s = C.site || {}, id = C.identity || {};
  const title = s.title || `${id.name} — ${id.role}`;
  document.title = title;
  const set = (sel, attr, val) => { const el = $(sel); if (el && has(val)) el.setAttribute(attr, val); };
  set('meta[name="description"]','content', s.description);
  set('meta[name="author"]','content', id.name);
  set('link[rel="canonical"]','href', s.url);
  set('meta[property="og:title"]','content', title);
  set('meta[property="og:description"]','content', s.description);
  set('meta[property="og:url"]','content', s.url);

  // structured data — helps you show up properly when recruiters google you
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context':'https://schema.org', '@type':'Person',
    name: id.name, jobTitle: id.role, description: id.bio, url: s.url,
    email: has(C.links?.email) ? `mailto:${C.links.email}` : undefined,
    sameAs: [C.links?.linkedin, C.links?.github, C.links?.huggingface, C.links?.instagram].filter(has)
  });
  document.head.appendChild(ld);
}

/* ── hero ───────────────────────────────────────────────────────── */
function initHero(){
  const id = C.identity || {}, L = C.links || {};
  $('#navBrand').textContent = id.name || '';
  $('#heroName').textContent = id.name || '';
  $('#heroRole').textContent = id.role || '';
  $('#heroBio').textContent  = id.bio  || '';
  $('#aboutBio').textContent = id.bio  || '';
  $('#footerName').textContent = `© ${new Date().getFullYear()} ${id.name || ''}`;
  if (has(C.site?.footerNote)) $('#footerNote').textContent = C.site.footerNote;

  const av = id.availability;
  if (av && av.status !== 'hide' && has(av.label)) {
    $('#availLabel').textContent = av.label;
    $('#availPill').hidden = false;
  }
  if (has(id.location)) {
    const el = $('#heroLoc'); el.textContent = `Based in ${id.location}`; el.hidden = false;
  }

  // resume CTA
  if (C.resume?.enabled && has(C.resume.file)) {
    const b = $('#heroResumeBtn');
    b.href = C.resume.file;
    b.setAttribute('download', C.resume.filename || 'resume.pdf');
    b.hidden = false;
    wireResumeDownload(b, C.resume.file, C.resume.filename || 'resume.pdf');
  }

  // social row
  const socials = [
    ['linkedin', L.linkedin, 'LinkedIn'],
    ['github',   L.github,   'GitHub'],
    ['hf',       L.huggingface, 'Hugging Face'],
    ['instagram',L.instagram,'Instagram'],
    ['mail',     has(L.email) ? `mailto:${L.email}` : '', 'Email']
  ].filter(([,url]) => has(url));

  $('#heroSocials').innerHTML = socials.map(([k, url, tip]) =>
    `<a class="social" href="${esc(url)}" data-tip="${esc(tip)}" aria-label="${esc(tip)}"
        ${url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${ICON[k]}</a>`
  ).join('');
  $$('#heroSocials .social').forEach(a =>
    a.addEventListener('click', () => Visits.action('contact', a.dataset.tip)));

  // Rotating "I build ..." line. A quiet cross-fade rather than a typewriter —
  // the typing-and-deleting effect reads as template boilerplate.
  const words = (id.building || []).filter(has);
  if (!words.length) { $('.hero-build').hidden = true; return; }
  const out = $('#rotator');
  out.textContent = words[0];
  if (words.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let w = 0;
  setInterval(() => {
    out.classList.add('fading');
    setTimeout(() => {
      w = (w + 1) % words.length;
      out.textContent = words[w];
      out.classList.remove('fading');
    }, 340);
  }, 3400);
}


/* ── resume download ─────────────────────────────────────────────────
   A bare `download` attribute is unreliable: static hosts can't send a
   Content-Disposition header, so Safari (and iOS in particular) opens the
   PDF instead of saving it. Fetching it as a blob forces a real save and
   guarantees the filename. Falls back to opening the file if that fails.
   ------------------------------------------------------------------ */
function wireResumeDownload(btn, file, filename){
  btn.addEventListener('click', async e => {
    Visits.action('resume');
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;   // let power users open a tab
    e.preventDefault();
    const original = btn.innerHTML;
    try {
      btn.style.pointerEvents = 'none';
      const res = await fetch(file, { cache: 'no-store' });
      if (!res.ok) throw new Error('fetch failed');
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast('Resume downloaded');
    } catch {
      window.open(file, '_blank', 'noopener');           // last resort: just show it
    } finally {
      btn.style.pointerEvents = '';
      btn.innerHTML = original;
    }
  });
}

/* ── projects + live demos ──────────────────────────────────────── */
function initProjects(){
  const list = (C.projects || []).filter(p => has(p.title));
  const host = $('#projectList');
  if (!list.length) { $('#projects').hidden = true; return; }

  // featured first
  const ordered = [...list].sort((a, b) => (b.featured === true) - (a.featured === true));

  host.innerHTML = ordered.map((p, i) => {
    const runnable = p.demo && p.demo.type !== 'none' && has(p.demo.url);
    const tags = (p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');
    const actions = [
      runnable ? `<button class="btn btn-primary" data-demo="${i}">${ICON.play} Run demo</button>` : '',
      has(p.repo) ? `<a class="btn btn-ghost" href="${esc(p.repo)}" target="_blank" rel="noopener noreferrer">${ICON.code} Code</a>` : '',
      has(p.live) ? `<a class="btn btn-ghost" href="${esc(p.live)}" target="_blank" rel="noopener noreferrer">${ICON.ext} Open live</a>` : ''
    ].filter(Boolean).join('');

    return `
    <article class="card reveal${p.featured ? ' featured' : ''}">
      <div class="card-body">
        <div class="card-top">
          <div>
            <h3>${esc(p.title)}</h3>
            ${has(p.tagline) ? `<p class="card-tagline">${esc(p.tagline)}</p>` : ''}
          </div>
          ${runnable ? '<span class="badge">Live demo</span>' : ''}
        </div>
        ${has(p.description) ? `<p class="card-desc">${esc(p.description)}</p>` : ''}
        ${tags ? `<div class="tags">${tags}</div>` : ''}
        ${actions ? `<div class="card-actions">${actions}</div>` : ''}
      </div>
      ${runnable ? `
      <div class="demo">
        <div class="demo-stage" id="stage-${i}" data-title="${esc(p.title)}"
             data-url="${esc(p.demo.url)}" data-h="${Number(p.demo.height) || 620}">
          ${has(p.demo.hint) ? `<div class="demo-hint">${ICON.info}<span>${esc(p.demo.hint)}</span></div>` : ''}
        </div>
      </div>` : ''}
    </article>`;
  }).join('');

  $$('#projectList [data-demo]').forEach(btn => {
    btn.addEventListener('click', () => launchDemo(btn));
  });
}

function launchDemo(btn){
  const i = btn.dataset.demo;
  const stage = $(`#stage-${i}`);
  if (!stage) return;

  // second click collapses it again
  if (stage.classList.contains('on')) {
    stage.classList.remove('on');
    btn.innerHTML = `${ICON.play} Run demo`;
    return;
  }
  stage.classList.add('on');
  btn.innerHTML = `${ICON.play} Hide demo`;

  if (stage.dataset.loaded) return;
  stage.dataset.loaded = '1';

  const title = stage.dataset.title;
  const url   = stage.dataset.url;
  const h     = stage.dataset.h;
  Visits.action('demo', title);

  const wrap = document.createElement('div');
  wrap.style.position = 'relative';
  wrap.innerHTML = `
    <div class="demo-loading" id="load-${i}">
      <div>
        <div class="spinner"></div>
        <p>Starting ${esc(title)}…</p>
        <small id="wake-${i}">This runs the real thing in your browser.</small>
      </div>
    </div>`;

  const frame = document.createElement('iframe');
  frame.src = url;
  frame.title = `${title} — live demo`;
  frame.style.height = h + 'px';
  frame.loading = 'lazy';
  frame.referrerPolicy = 'no-referrer-when-downgrade';
  frame.allow = 'accelerometer; camera; microphone; clipboard-read; clipboard-write; encrypted-media; fullscreen; autoplay; xr-spatial-tracking';
  frame.addEventListener('load', () => {
    const l = $(`#load-${i}`); if (l) l.classList.add('hide');
    clearTimeout(slow);
  });
  wrap.appendChild(frame);

  // free Hugging Face / Render instances sleep — reassure rather than look broken
  const slow = setTimeout(() => {
    const s = $(`#wake-${i}`);
    if (s) s.innerHTML = 'Still waking up — free hosting sleeps when idle. This usually takes 30–60 seconds.';
  }, 8000);

  const bar = document.createElement('div');
  bar.className = 'demo-bar';
  bar.innerHTML = `<span>Running live · embedded from the deployed app</span>
    <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open full screen ${ICON.ext}</a>`;

  stage.appendChild(wrap);
  stage.appendChild(bar);
}

/* ── skills ─────────────────────────────────────────────────────── */
function initSkills(){
  const groups = (C.skills || []).filter(g => g.items?.length);
  if (!groups.length) { $('#skillsBlock').hidden = true; return; }
  $('#skillGroups').innerHTML = groups.map(g => `
    <div class="skill-group">
      <h4>${esc(g.group)}</h4>
      <div class="tags">${g.items.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    </div>`).join('');
}

/* ── experience + education ─────────────────────────────────────── */
function initTimeline(){
  const exp = (C.experience || []).filter(e => has(e.role) || has(e.org));
  const edu = (C.education  || []).filter(e => has(e.degree) || has(e.org));
  if (!exp.length && !edu.length) {
    $('#experience').hidden = true;
    $('[data-nav="experience"]')?.remove();
    return;
  }
  $('#experience').hidden = false;

  $('#expList').innerHTML = exp.map(e => `
    <div class="tl-item reveal">
      <div class="tl-head">
        <span class="tl-role">${esc(e.role)}</span>
        ${has(e.org) ? `<span class="tl-org">${esc(e.org)}</span>` : ''}
        ${has(e.period) ? `<span class="tl-period">${esc(e.period)}</span>` : ''}
      </div>
      ${e.points?.length ? `<ul class="tl-points">${e.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
    </div>`).join('');
  if (!exp.length) $('#expList').hidden = true;

  if (edu.length) {
    $('#eduWrap').hidden = false;
    $('#eduList').innerHTML = edu.map(e => `
      <div class="tl-item reveal">
        <div class="tl-head">
          <span class="tl-role">${esc(e.degree)}</span>
          ${has(e.org) ? `<span class="tl-org">${esc(e.org)}</span>` : ''}
          ${has(e.period) ? `<span class="tl-period">${esc(e.period)}</span>` : ''}
        </div>
        ${has(e.detail) ? `<p class="tl-detail">${esc(e.detail)}</p>` : ''}
      </div>`).join('');
  }
}

/* ── resume ─────────────────────────────────────────────────────── */
function initResume(){
  const r = C.resume || {};
  if (!r.enabled || !has(r.file)) {
    $('#resume').hidden = true;
    $('[data-nav="resume"]')?.remove();
    return;
  }
  $('#resume').hidden = false;

  const dl = $('#resumeDownload');
  dl.href = r.file; dl.setAttribute('download', r.filename || 'resume.pdf');
  wireResumeDownload(dl, r.file, r.filename || 'resume.pdf');
  $('#resumeOpen').href = r.file;
  if (has(r.lastUpdated)) $('#resumeUpdated').textContent = `Last updated ${r.lastUpdated}`;

  if (r.inlineViewer !== false) {
    // iOS/iPadOS Safari renders <object> PDFs as a blank box rather than falling
    // back, so give those devices the explicit card instead of an empty frame.
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    $('#pdfFrame').innerHTML = iOS
      ? `<div class="pdf-fallback">
           <p><strong>Open the resume</strong></p>
           <p style="margin-top:6px;font-size:14px">iPhones and iPads can't preview PDFs inside a page.</p>
           <p style="margin-top:16px">
             <a class="btn btn-primary" href="${esc(r.file)}" target="_blank" rel="noopener">View PDF</a>
           </p>
           <p style="margin-top:12px;font-size:12.5px;color:var(--text-3)">
             To save it: open, then tap Share → Save to Files.
           </p>
         </div>`
      : `<object data="${esc(r.file)}#toolbar=1&navpanes=0&view=FitH" type="application/pdf"
                 style="display:block;width:100%;height:min(78vh,940px)">
           <div class="pdf-fallback">
             <p>Your browser can't display the PDF inline.</p>
             <p style="margin-top:14px"><a class="btn btn-primary" href="${esc(r.file)}" target="_blank" rel="noopener">Open the resume</a></p>
           </div>
         </object>`;
  } else {
    $('#pdfFrame').hidden = true;
  }
}

/* ── contact ────────────────────────────────────────────────────── */
function initContact(){
  const L = C.links || {};
  const cards = [];

  if (has(L.email)) cards.push({
    icon:'mail', label:'Email', value:L.email, href:`mailto:${L.email}`, copy:L.email, kind:'email'
  });

  if (has(L.phone)) cards.push({
    icon:'phone', label:'Phone',
    value:L.phone, href:`tel:${L.phone.replace(/[^\d+]/g,'')}`,
    copy:L.phone, kind:'phone', protect: L.phoneProtected !== false
  });

  if (has(L.linkedin))    cards.push({ icon:'linkedin', label:'LinkedIn', value:'Connect on LinkedIn', href:L.linkedin, kind:'contact' });
  if (has(L.github))      cards.push({ icon:'github', label:'GitHub', value:'See my code', href:L.github, kind:'contact' });
  if (has(L.huggingface)) cards.push({ icon:'hf', label:'Hugging Face', value:'Models & Spaces', href:L.huggingface, kind:'contact' });
  if (has(L.instagram))   cards.push({ icon:'instagram', label:'Instagram', value:'Follow along', href:L.instagram, kind:'contact' });

  $('#contactGrid').innerHTML = cards.map((c, i) => {
    const masked = c.protect;
    const shown  = masked ? 'Tap to reveal' : c.value;
    const inner = `
      <span class="cc-icon">${ICON[c.icon]}</span>
      <span>
        <span class="cc-label">${esc(c.label)}</span>
        <span class="cc-value${masked ? ' masked' : ''}" id="cv-${i}">${esc(shown)}</span>
      </span>`;
    return masked
      ? `<button class="contact-card" type="button" data-reveal="${i}" data-real="${esc(c.value)}"
                 data-href="${esc(c.href)}" data-kind="${esc(c.kind)}">${inner}</button>`
      : `<a class="contact-card" href="${esc(c.href)}" data-kind="${esc(c.kind)}"
            ${c.href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${inner}</a>`;
  }).join('');

  // reveal-then-call for the protected phone number
  $$('#contactGrid [data-reveal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = btn.dataset.reveal, el = $(`#cv-${i}`);
      if (btn.dataset.shown) { location.href = btn.dataset.href; return; }
      btn.dataset.shown = '1';
      el.textContent = btn.dataset.real;
      el.classList.remove('masked');
      Visits.action('phone');
      navigator.clipboard?.writeText(btn.dataset.real)
        .then(() => toast('Number revealed and copied'))
        .catch(() => toast('Number revealed — tap again to call'));
    });
  });

  // one-tap copy for email
  $$('#contactGrid a[data-kind="email"]').forEach(a => {
    a.addEventListener('click', e => {
      if (navigator.clipboard && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigator.clipboard.writeText(C.links.email)
          .then(() => toast('Email copied to clipboard'))
          .catch(() => { location.href = a.href; });
      }
      Visits.action('email');
    });
  });

  $$('#contactGrid a[data-kind="contact"]').forEach(a =>
    a.addEventListener('click', () => Visits.action('contact', a.querySelector('.cc-label').textContent)));
}

/* ── nav behaviour: sticky border, scroll spy, progress, burger ──── */
function initNav(){
  const nav = $('#nav'), bar = $('#scrollProgress'), links = $('#navLinks');

  $('#navBurger').addEventListener('click', e => {
    const open = links.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      $('#navBurger').setAttribute('aria-expanded','false');
    }
  });

  const sections = $$('main section[id]');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle('stuck', y > 8);
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

      let current = '';
      for (const s of sections) {
        if (!s.hidden && s.getBoundingClientRect().top <= 120) current = s.id;
      }
      $$('#navLinks a').forEach(a =>
        a.classList.toggle('active', a.getAttribute('href') === '#' + current));
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── reveal on scroll ───────────────────────────────────────────── */
function initReveal(){
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('in'), i * 70);
      obs.unobserve(e.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px' });
  els.forEach(e => io.observe(e));
}

/* ── boot ───────────────────────────────────────────────────────── */
function boot(){
  initTheme(); initMeta(); initHero();
  initProjects(); initSkills(); initTimeline(); initResume(); initContact();
  initNav(); initReveal();
  Visits.init();
  if (Visits.isMuted()) console.info('[portfolio] Visit notifications muted on this device.');
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', boot)
  : boot();
})();
