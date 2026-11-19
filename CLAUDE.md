# Memoir on Skin: notes for every Claude session

A sample-first fragrance journal and discovery app. Live at https://www.memoironskin.com (Railway, behind Cloudflare). Brand name is **Memoir on Skin**, never "sillage" (that word is only the fragrance term, e.g. the Sillage rating and glossary).

## Rules (set by the owner)
1. **Start from the latest `main`.** `git pull` first and read `git log` before touching anything. If a file from a chat differs from main, main wins.
2. **Push straight to `main`.** No pull request. Railway redeploys in 1 to 3 minutes. If a deploy fails with empty logs, push a trivial commit again.
3. Run `npx vite build` (must succeed) and load the app in a browser to check for page errors before pushing. A crash on load once blanked the live site.
4. Commit only the files you changed. Never commit `dist/` or `node_modules/`.
5. In the reply, say what was pushed (commit id) and what was tested.
6. **Never put passwords, API keys or secrets in this repo, in commits or in chat.**
7. Keep replies concise and warm. Nothing note-image related goes beyond what she approved; do not touch `note_image_map` or other Supabase tables beyond what she asked for.

7b. **Dark by default.** Everyone lands on the dark page. The site only goes light when the person chooses Light (or Auto on a light device) in the appearance picker. Never fall back to the device setting by default.

## Layout
- `src/App.jsx`: almost the whole app (single file, inline styles). Theme tokens `T`, helpers `FIELD`, `ctaBtn`, `ghostBtn`, fonts `serif`/`sans`. CSS variables `--cover-w` (tile width) and `--zoom` (desktop fragrance page). `TILE_W = "calc(var(--cover-w) / var(--zoom, 1))"`.
- `src/ingredients/`: Learn ingredient guide data (merged into `INGREDIENTS` in App.jsx; the original eight hand-written entries win).
- `src/perfumers-more.js`: perfumer bios, keyed by title-cased name as the database spells it.
- `public/note-images/<key>.webp`: note photos (white background, 640px). Matched in code through `NOTE_PHOTO_ALIASES` and `notePhotoFor(name)`; `?noteimages=0` turns them off.
- `public/brands/`, `public/beta/`: static pages. `/beta` redirects to `/#beta` and keeps `?src=`.
- `emails/`: the six dark Supabase auth email templates (keep the `{{ ... }}` placeholders).

## Supabase (project ref `kddswbequvdqbhviswlh`)
- Members only: library tables are readable by signed-in users only. Row-level security everywhere.
- **Max Rows is 100.** Any list that can exceed 100 rows must be paged (`.range()` or the `rpcAll(name)` helper).
- `user_fragrances.statuses` is a text[]. Bottle, travel and sample groups hold one status each; the "tried" group can hold both smelled and tried_skin.
- Notes not broken into top/heart/base are stored once with `notes.position = 'all'`, not guessed into tiers.
- The database stores `brand_origin = 'Designer'`; the app displays it as **Heritage**.
- Schema changes go through migrations (apply with the Supabase connector, one approval each).

## Testing recipe
Playwright chromium with the dev server and mocked Supabase routes:
`VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=x npx vite --port 5174 --host 127.0.0.1`
Stop it with `pkill -f "vite --port 5174"`. Mock login needs about 4 seconds. Real-device checks (iPhone, Android, wide screens) still need the owner.

## Voice and copy
- Taglines in use: "Where scent becomes memory.", "Sample first. Remember always.", "We are not here to influence you. Trust your own nose."
- Say "niche & indie", not "niche" alone. No star scores, no like counts, no gender tabs.
- Do not name Parfumo, Basenotes, Fragrantica or Sniff in app copy.
- No Blush background on the notes share card (it represents Fragrantica).
- Full voice guide and the Project Bible live in the claude.ai Project "Memoir on Skin" (`claude/Brand_Voice.md`, `claude/Project_Bible.md`).
