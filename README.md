# Personal portfolio site

A single-page portfolio built to go on a resume and in job applications. Recruiters can
read about you, **run your projects without leaving the page**, and reach you. Everyone
sees how many people have visited; **only you** can see who they were and what they did.

```
portfolio/
├── index.html                 the page structure
├── assets/
│   ├── css/style.css          all styling (dark + light, 5 accent colours)
│   └── js/
│       ├── config.js  ←────── THE ONLY FILE YOU EDIT
│       ├── main.js            renders the page from config.js
│       └── analytics.js       visitor counter + your private log
├── resume/resume.pdf          your resume (already installed)
└── worker/                    the counter backend
    ├── worker.js              the API
    ├── schema.sql             database tables
    └── wrangler.toml          deploy config
```

---

## Step 1 — What's already filled in

Your resume has been parsed and `assets/js/config.js` is populated with the real thing:
name, role, bio, phone, email, LinkedIn, GitHub, Hugging Face, all 5 skill groups, both
degrees, your Kyndryl role, and **6 projects**. The site is ready to publish.

**Two things are still missing.** Search `config.js` for `TODO`:

> Note: your name, role and summary also appear literally in `index.html`'s `<head>` and
> hero. That is deliberate — LinkedIn, WhatsApp and Slack link previews don't run
> JavaScript, so without it your link previews come out blank. Change both places.

| Line in `config.js`        | What to put there                                    |
|----------------------------|------------------------------------------------------|
| `links.instagram`          | your Instagram URL — or leave `""` and it disappears |
| `index.html` `<head>`      | if you change name/role/summary, update it there too |
| `analytics.goatcounter`    | your GoatCounter code (step 4) — 3 minutes           |

Two projects are already linked to your repos (`satellite-image-change-detection` and
`ClearpassAI`). The other four have `repo: ""` because no matching public repo exists yet —
fill those in and a **Code** button appears on the card automatically.

## Step 2 — Your resume is already installed

`resume/resume.pdf` is your real resume. It renders inline on the page and powers the
Download button.

> ⚠️ **Your PDF's text layer is corrupted** — see "Two things worth knowing" at the bottom
> of this file. This matters for automated resume screening, so read that section.

## Step 3 — Wire up your project demos

This is what makes the site worth linking to. Each project in `config.js` has a `demo` block:

**A Hugging Face Space** — use the `.hf.space` URL, not the `huggingface.co/spaces` one:

```js
demo: { type: "space", url: "https://saahil-doryu-clothing1m.hf.space", height: 620 }
```

The pattern is `https://<username>-<space-name>.hf.space`, all lowercase, with every
underscore turned into a dash. So `huggingface.co/spaces/Saahil-doryu/Lab04_saahil`
becomes `https://saahil-doryu-lab04-saahil.hf.space`.

### The state of your Spaces (checked 7 Sep 2026)

| Space | Status | On your site? |
|---|---|---|
| `Clothing1m` | ✅ Works — wakes in ~60s | **Yes, wired up and verified** |
| `warfarin-dose-predictor` | ❌ **Runtime error** | Wired up, but **fix it first** |
| `Lab04_saahil` | 💤 Sleeping, should work | Not used — coursework |
| `AIProject` | ❌ Configuration error | Not used |
| `Clothpredict` | ❌ Build error | Not used |
| `Nested-Co-teaching` | ❌ Build error | Not used |

**Fix the warfarin Space first — it's the "Live Demo" link on your resume.** Right now it
reports *"Scheduling failure: unable to schedule"*. Go to the Space → **Settings → Factory
reboot**. If that doesn't clear it, check `requirements.txt` pins and the Space logs.

**Any deployed app** (Streamlit, Gradio, Render, Vercel, Fly):

```js
demo: { type: "iframe", url: "https://your-app.streamlit.app/?embed=true", height: 620 }
```

For Streamlit specifically, append `?embed=true` — it strips their menu chrome.

**No demo yet:** `demo: { type: "none" }`. The card still shows with the Code link.

Demos load only when someone clicks **Run demo**, so the page stays fast no matter how
many you add. If a free-tier app is asleep, the loader tells the visitor it's waking up
instead of looking broken.

> One thing to check: a few hosts send `X-Frame-Options: DENY`, which blocks embedding
> anywhere. Hugging Face Spaces, Streamlit Cloud, Render, and Vercel all allow it. If a
> demo stays blank, that header is why — use `live:` for an "Open live" button instead.

## Step 4 — Seeing who visits

Two options. **Take the first one.**

### Easy — GoatCounter (about 3 minutes, no command line)

1. Sign up at **https://www.goatcounter.com/signup** — free, no card.
2. Pick a code, e.g. `saahil`. Your dashboard becomes `saahil.goatcounter.com`.
3. In GoatCounter → **Settings**, tick **“Allow adding visitor counter to your website.”**
   Without this the number on your page stays hidden.
4. Put the code in `config.js`:

   ```js
   analytics: {
     goatcounter: "saahil",
     apiUrl: ""
   }
   ```
5. Publish it:

   ```bash
   cd /Users/saahil/Documents/Claude/portfolio
   git add -A && git commit -m "Enable visitor counter" && git push
   ```

Done. Your page shows a live visitor number, and **https://saahil.goatcounter.com** —
private to your login — shows each visit: country, referrer (so you can tell a LinkedIn
click from a Google search), browser, screen size and time. Resume downloads and demo
launches appear there as events named `event-resume` and `event-demo`.

Your own visits aren't counted, because the site sets GoatCounter's `skipgc` opt-out for
you whenever you've marked yourself as owner with `?owner=1`.

> **What this can't do:** no analytics tool can tell you a visitor's *name* or email. You
> get city/country, where they came from, and what they clicked. "Someone in Chicago came
> from LinkedIn and downloaded your resume" is the level of detail available — from any
> tool, not just this one.

### Advanced — self-hosted on Cloudflare (optional)

Only worth it if you want the full visitor log **on your own page**, behind an owner key,
instead of on GoatCounter's dashboard. It costs nothing but needs a Cloudflare account and
five minutes in a terminal:

```bash
cd portfolio/worker && ./setup.sh
```

The script logs you in, creates the database, generates your owner key, deploys, and writes
the URL into `config.js`. Then open `your-site/?admin=1` and paste the key. If
`goatcounter` is set, this is ignored — pick one.

## Step 5 — Publish to GitHub Pages

```bash
cd portfolio
git init
git add -A
git commit -m "Personal portfolio site"
git branch -M main
git remote add origin https://github.com/Saahil-doryu/Saahil-doryu.github.io.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.**

Name the repo **`Saahil-doryu.github.io`** and your URL becomes simply
**`https://saahil-doryu.github.io`** — much better on a resume than a `/portfolio/` path.
That URL is already set in `config.js` → `site.url`.

It goes live within a minute or two.

### Your own domain (optional, ~₹800/year)

Buy a domain, add a `CNAME` file containing just `yourdomain.com`, then point your DNS
`A` records at `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`. Set it under
Settings → Pages → Custom domain and tick **Enforce HTTPS**. `saahil.dev` on a resume
reads considerably better than a github.io URL.

---

## Running it locally

```bash
python3 -m http.server 8747
```

Then open `http://localhost:8747`. Note that opening `index.html` directly as a `file://`
URL will *not* work properly — use the server.

### If you edit a file and don't see the change

The CSS and JS in `index.html` carry a version stamp:

```html
<link rel="stylesheet" href="assets/css/style.css?v=20260908a">
<script src="assets/js/config.js?v=20260908a"></script>
```

**Whenever you change a CSS or JS file, bump that string** (any new value works —
`20260908b`, `v2`, today's date). Browsers treat a different URL as a different file
and fetch it immediately.

Without bumping it, GitHub Pages sends `cache-control: max-age=600`, so returning
visitors can keep the old stylesheet for up to ten minutes — and Safari sometimes holds
it considerably longer. That is almost always the cause when a change "didn't apply".

---

## Two things worth knowing

**Your resume's text layer is broken.** This is the most important thing in this file.

Your PDF displays correctly to a human, but the embedded text is mis-encoded — every
`ti` ligature extracts as `N`, `ft` as `e`, and `tti` as `C`. Two independent PDF parsers
agree. What a machine reads from your resume:

| You wrote | A parser reads |
|---|---|
| Artificial Intelligence | ArNﬁcial Intelligence |
| Change Detection | Change DetecNon |
| Warfarin Dose Prediction | Warfarin Dose PredicNon |
| Microsoft Planetary Computer | Microsoe Planetary Computer |
| Image Classification | Image Classifica**K**on |
| https://linkedin.com/... | hCps://linkedin.com/... |

Most companies screen resumes with an ATS that searches this text layer. A recruiter
filtering for "Artificial Intelligence", "Classification", "Detection" or "Microsoft" would
not match your resume — including for the degree you are currently doing.

**The fix:** re-export the PDF. This is a font-embedding fault from whatever produced it
(commonly Pages, or Word with certain fonts). In order of reliability:

1. Open the source document, **File → Print → PDF → Save as PDF** (re-rasterises the text
   encoding correctly) — then re-check.
2. Or paste the content into Google Docs and **File → Download → PDF**. Google Docs
   embeds clean encodings.
3. Or switch the document font to a standard one (Calibri, Helvetica, Arial, Times) and
   re-export.

**Verify the fix** before you send it anywhere — open the PDF, select all the text, copy it,
and paste into a plain text editor. If you see `ArNficial`, it's still broken. If you see
`Artificial`, you're good. Then drop the new file over `resume/resume.pdf`.

**On the phone number.** It's hidden behind a "tap to reveal" button by default
(`links.phoneProtected`). This stops casual scraping but is not real protection — anything
on a public page can be harvested. If you'd rather not publish it at all, set
`links.phone: ""` and let email and LinkedIn carry the contact load. Plenty of strong
portfolios do exactly that.

**On visitor tracking.** The site records approximate city-level location from IP, referrer,
and device type — the same things any analytics tool collects, and no cookies are set. If
you ever point this at EU visitors at scale you'd want a consent banner; for a personal
portfolio in India it's well within normal practice. If you want to collect less, set
`notifications.includeLocation: false`.
