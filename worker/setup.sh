#!/usr/bin/env bash
# ============================================================================
#  One-shot setup for the visitor counter.
#
#  Run:   cd portfolio/worker && ./setup.sh
#
#  It logs you into Cloudflare (browser opens once), creates the database,
#  generates your owner key, deploys the API, and writes the resulting URL
#  straight into config.js. Free tier throughout — no card required.
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")"

WR="npx --yes wrangler@3"           # pinned: wrangler 4 needs Node 22, you have 20
say(){ printf "\n\033[1;35m▸ %s\033[0m\n" "$1"; }

# ── 1. Cloudflare login ─────────────────────────────────────────────────
if ! $WR whoami 2>/dev/null | grep -q "You are logged in"; then
  say "Logging in to Cloudflare — a browser window will open."
  echo "  If you don't have an account, create the free one it offers. No card needed."
  $WR login
else
  say "Already logged in to Cloudflare."
fi

# ── 2. Database ─────────────────────────────────────────────────────────
if grep -q "PASTE_YOUR_D1_DATABASE_ID_HERE" wrangler.toml; then
  say "Creating the D1 database…"
  OUT=$($WR d1 create portfolio-visits 2>&1 || true)
  echo "$OUT" | grep -vE "^npm |warn" || true
  DBID=$(echo "$OUT" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
  if [ -z "$DBID" ]; then
    echo
    echo "  Could not read the database id automatically."
    echo "  Copy the database_id from the output above into wrangler.toml, then re-run this script."
    exit 1
  fi
  sed -i '' "s|PASTE_YOUR_D1_DATABASE_ID_HERE|$DBID|" wrangler.toml
  echo "  ✓ database_id written into wrangler.toml"
else
  say "Database already configured in wrangler.toml."
fi

# ── 3. Random salt so IPs are hashed, never stored ──────────────────────
if grep -q "change-this-to-any-random-string" wrangler.toml; then
  SALT=$(openssl rand -hex 16)
  sed -i '' "s|change-this-to-any-random-string|$SALT|" wrangler.toml
  echo "  ✓ generated a random IP_SALT"
fi

# ── 4. Tables ───────────────────────────────────────────────────────────
say "Creating the tables…"
$WR d1 execute portfolio-visits --remote --file=schema.sql -y 2>&1 | grep -vE "^npm |warn" | tail -4

# ── 5. Owner key ────────────────────────────────────────────────────────
say "Generating your owner key…"
KEY=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-28)
echo "$KEY" | $WR secret put OWNER_KEY 2>&1 | grep -vE "^npm |warn" | tail -2

# ── 6. Deploy ───────────────────────────────────────────────────────────
say "Deploying…"
DEPLOY=$($WR deploy 2>&1)
echo "$DEPLOY" | grep -vE "^npm |warn" | tail -6
URL=$(echo "$DEPLOY" | grep -oE 'https://[a-zA-Z0-9._-]+\.workers\.dev' | head -1)

# ── 7. Wire it into the site ────────────────────────────────────────────
if [ -n "$URL" ]; then
  sed -i '' "s|apiUrl: \"\"|apiUrl: \"$URL\"|" ../assets/js/config.js
  echo "  ✓ wrote apiUrl into config.js"
fi

cat <<EOF

────────────────────────────────────────────────────────────────────────
  DONE.

  Your owner key:   $KEY

  ↑ SAVE THIS NOW. It is not stored anywhere and cannot be shown again.
    (If you lose it, just re-run: $WR secret put OWNER_KEY)

  API URL:          ${URL:-"(not detected — check the output above)"}

  Next, publish the change:

      cd ..
      git add -A && git commit -m "Enable visitor counter" && git push

  Then open  https://saahil-doryu.github.io/?admin=1
  and paste the owner key once.
────────────────────────────────────────────────────────────────────────
EOF
