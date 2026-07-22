# 🐍 Arcade Portfolio v3.0 — Lydron Mohohlo

A **Snake game** that doubles as an IT & AI portfolio. Press Start, then steer
the snake around a single glossy arena (v1-style: HUD with skill "health" bars
and a data-node log). Eat **data packets** to grow, devour glowing **◆ project
cores** to open their full case studies, snack on **? wisdom orbs** for
inspirational dev quotes, and dodge the **🐛 coding-meme booby-traps**.

> **The first project core is this website itself.** Locked nodes are
> placeholders for future IT/AI projects — you can still eat them for a laugh.

## ✨ Features

- **Grid-based Snake engine** rendered on `<canvas>` with a hand-rolled game loop
  (fixed step + smooth interpolation, wrap-around walls, friendly non-fatal
  self-collision) — no game-engine dependency.
- **Realistic feel** — glossy gradient snake segments with a per-segment scaly
  sheen, a shaded head with tracking eyes and a flicking tongue, drop shadows,
  pulsing/glowing food, a neon grid arena with a center glow, and a vignette.
- **Projects as collectibles** — each project is a data core on the grid; eat one
  to open its briefing. A HUD data-node log lets you jump straight to any of them.
- **Per-project language breakdown** — every project explains *which* language
  was used, *why* it was chosen, and *tips to level up* your skills in it.
- **Funny stuff** 😄 — **🐛 meme booby-trap foods** ("It works on my machine!",
  missing semicolons, `git push --force` on a Friday) that just shrink you a bit,
  plus **? orbs** that dispense inspirational programming quotes.
- **Procedural audio** — 8-bit/synthwave music and SFX generated entirely in the
  browser with the WebAudio API (**zero audio files shipped**).
- **Skill "health" bars**, coins/score, and **achievement-unlocked** toasts.
- **In-game contact terminal** wired to **EmailJS** (graceful `mailto:` fallback).
- **♿ 2D / Accessible document view** — a full WCAG-minded, motion-free,
  screen-reader-friendly rendering of every piece of content (including the
  language breakdowns), toggleable any time.
- **Cookie consent banner** and **zero hardcoded secrets**.

## 🧱 Tech stack

| Layer      | Choice                                                  |
| ---------- | ------------------------------------------------------- |
| Framework  | React 18 + **Vite** + TypeScript (static export)        |
| Game       | Custom `<canvas>` Snake engine (`requestAnimationFrame`, fixed step + interpolation) |
| State      | **zustand**                                             |
| Audio      | WebAudio API (procedural — no assets)                   |
| Email      | **@emailjs/browser**                                    |
| CI/CD      | GitHub Actions → **GitHub Pages**                       |

> **Version history** (see [Releases](../../releases) / git tags):
> - **v1.0.0** — 3D React-Three-Fiber showroom (pilot a drone through kiosks).
> - **v2.0.0** — Mario-style 2D platformer (Worlds = certs, Levels = projects).
> - **v3.0.0** — this Snake game: v1's single-arena HUD layout, Snake movement,
>   a more realistic look, the same funny elements + language breakdowns.

## 🚀 Getting started

```bash
npm install
cp .env.example .env      # optional — fill in EmailJS ids for live email
npm run dev               # → http://localhost:5173
```

Build & preview the production bundle locally:

```bash
npm run build
npm run preview           # → http://localhost:4173
```

## 🔑 Configuration (no secrets in code)

The contact form uses **EmailJS**, whose service/template/public-key are *public
client-side identifiers* (safe to expose in a static site). They are **never**
hardcoded — they come from environment variables:

- **Local dev:** put them in `.env` (git-ignored). See `.env.example`.
- **Production:** set them as **GitHub Actions repository _Variables_** (Settings
  → Secrets and variables → Actions → *Variables*):
  - `VITE_EMAILJS_SERVICE_ID`
  - `VITE_EMAILJS_TEMPLATE_ID`
  - `VITE_EMAILJS_PUBLIC_KEY`
  - `VITE_LINKEDIN_URL` (optional; defaults to `https://linkedin.com`)

If they're absent, the form degrades to opening the visitor's mail client — the
site never ships broken.

> ⚠️ Anything prefixed `VITE_` is inlined into the shipped bundle and is
> world-readable. Only ever put **public** identifiers there — never a private
> API key.

## 🌐 Deploy to GitHub Pages

1. Create a GitHub repo and push this project (see below).
2. In the repo: **Settings → Pages → Build and deployment → Source = GitHub
   Actions**.
3. (Optional) Add the EmailJS **Variables** described above.
4. Push to `main`. The workflow in
   [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds the site
   and publishes it. Your site appears at
   `https://<username>.github.io/<repo>/`.

The workflow sets `VITE_BASE=/<repo>/` automatically so all asset paths resolve
under the project subpath, adds `.nojekyll`, and writes a `404.html` fallback.

### First push

```bash
git init
git add -A
git commit -m "feat: gamified platformer IT & AI portfolio"
git branch -M main
git remote add origin https://github.com/<username>/arcade-portfolio.git
git push -u origin main
```

## 🏛️ AWS Well-Architected alignment

- **Performance Efficiency** — a tiny (~65 KB gzipped) bundle, a fixed-step game
  loop with render interpolation for stable 60 FPS, a retina-aware canvas capped
  at 2× DPR, and procedural audio (no binary assets to download).
- **Security** — zero hardcoded secrets; only public EmailJS ids via env; strict
  `noopener noreferrer` on external links; a cookie consent banner; no
  third-party trackers.
- **Reliability & Accessibility** — a complete **2D accessible fallback**
  (semantic HTML, real headings, `role="meter"` skill bars, keyboard focus
  styles, `prefers-reduced-motion` support) so the portfolio works for everyone,
  including screen-reader and motion-sensitive users; graceful email fallback.
- **Operational Excellence** — fully automated, reproducible deploys via GitHub
  Actions with least-privilege permissions.

## 🗺️ Adding a new project (a new data core)

Edit **`src/data/content.ts`** — it's the single source of truth for both the
game and the 2D view. Find the `World` for the relevant certification, then in
its `levels` array set a level's `status` from `'locked'` to `'building'` /
`'live'` and fill in `summary`, `stack`, `detail`, the `language` breakdown
(`name` / `why` / `tips`), and `repoUrl` / `demoUrl`. A project core for it spawns
on the grid automatically. Commit & push — CI redeploys.

Add coding memes to `MEMES` and inspirational quotes to `QUOTES` in the same
file to expand the booby-trap / `?`-orb pools.

## 📁 Structure

```
src/
  App.tsx                 Orchestrates boot / playing / accessible modes
  store.ts                Global game state (zustand)
  data/content.ts         ← All content: worlds, projects, language tips, memes, quotes
  audio/AudioEngine.ts    Procedural synthwave + SFX (WebAudio)
  game/
    Snake.tsx             The playable arena: input + fixed-step grid loop
    snakeRender.ts        Canvas renderer (glossy snake, glowing food, vignette)
    snakeTypes.ts         Engine types
  components/
    BootScreen.tsx        "Press Start"
    Hud.tsx               Overlay HUD: skill bars + data-node log + links
    ProjectPanel.tsx      Project briefing + language breakdown
    ContactTerminal.tsx   In-game EmailJS contact form
    AccessibleView.tsx    WCAG 2D document fallback (+ AccessibleContact)
    CookieBanner, AchievementToasts
.github/workflows/deploy.yml   GitHub Pages CI/CD
```
