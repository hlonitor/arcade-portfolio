# 🕹️ Arcade Portfolio v2.0 — Lydron Mohohlo

A **Mario-style 2D platformer** that doubles as an IT & AI portfolio. Press
Start, pick a **World** (each World is an AWS certification), then run and jump
through its **Levels** (each Level is a project in that area). Headbutt `?`-blocks
for inspirational dev quotes, dodge the coding-meme **booby-traps**, grab coins,
and reach the 🚩 flag to unlock a project's full case study.

> **Level 1-1 is this website itself.** Locked levels are placeholders for future
> IT/AI projects — you can still walk them for a laugh.

## ✨ Features

- **Side-scrolling platformer** rendered on `<canvas>` with a hand-rolled,
  fixed-timestep physics engine (gravity, jumping, AABB collisions, patrolling
  enemies) — no game-engine dependency.
- **Realistic, layered visuals** — gradient skies, a glowing sun, multi-layer
  **parallax** hills/clouds, shaded & glossy sprites, drop shadows, and a
  vignette for depth. Each World has its own biome (grassy plains, sky heights,
  neon caverns).
- **Mario-style structure** — **Worlds = certifications**, **Levels = projects**.
  A World Map lets you pick any stage.
- **Per-project language breakdown** — every level explains *which* language was
  used, *why* it was chosen, and *tips to level up* your skills in it.
- **Funny stuff** 😄 — meme **booby-traps** ("It works on my machine!", missing
  semicolons, `git push --force` on a Friday) that bounce you (no real damage),
  plus `?`-blocks that dispense inspirational programming quotes.
- **Procedural audio** — 8-bit/synthwave music and SFX generated entirely in the
  browser with the WebAudio API (**zero audio files shipped**).
- **Skill "health" bars**, coins, and **achievement-unlocked** toasts.
- **In-game contact terminal** wired to **EmailJS** (graceful `mailto:` fallback).
- **♿ 2D / Accessible document view** — a full WCAG-minded, motion-free,
  screen-reader-friendly rendering of every piece of content (including the
  language breakdowns), toggleable any time.
- **Cookie consent banner** and **zero hardcoded secrets**.

## 🧱 Tech stack

| Layer      | Choice                                                  |
| ---------- | ------------------------------------------------------- |
| Framework  | React 18 + **Vite** + TypeScript (static export)        |
| Game       | Custom `<canvas>` platformer engine (`requestAnimationFrame`, fixed timestep) |
| State      | **zustand**                                             |
| Audio      | WebAudio API (procedural — no assets)                   |
| Email      | **@emailjs/browser**                                    |
| CI/CD      | GitHub Actions → **GitHub Pages**                       |

> **v1.0 → v2.0:** v1 was a 3D React-Three-Fiber showroom. v2 replaces it with a
> lighter, more playful 2D platformer (the whole bundle is now ~67 KB gzipped,
> down from ~450 KB). See the [`v1.0.0` git tag](../../releases) for the original.

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

- **Performance Efficiency** — a tiny (~67 KB gzipped) bundle, a fixed-timestep
  physics loop decoupled from render for stable 60 FPS, a retina-aware canvas
  capped at 2× DPR, off-screen culling of world objects, and procedural audio
  (no binary assets to download).
- **Security** — zero hardcoded secrets; only public EmailJS ids via env; strict
  `noopener noreferrer` on external links; a cookie consent banner; no
  third-party trackers.
- **Reliability & Accessibility** — a complete **2D accessible fallback**
  (semantic HTML, real headings, `role="meter"` skill bars, keyboard focus
  styles, `prefers-reduced-motion` support) so the portfolio works for everyone,
  including screen-reader and motion-sensitive users; graceful email fallback.
- **Operational Excellence** — fully automated, reproducible deploys via GitHub
  Actions with least-privilege permissions.

## 🗺️ Adding a new project (unlocking a level)

Edit **`src/data/content.ts`** — it's the single source of truth for both the
game and the 2D view. Find the `World` for the relevant certification, then in
its `levels` array set a level's `status` from `'locked'` to `'building'` /
`'live'` and fill in `summary`, `stack`, `detail`, the `language` breakdown
(`name` / `why` / `tips`), and `repoUrl` / `demoUrl`. The platformer stage for
that level is generated automatically. Commit & push — CI redeploys.

Add coding memes to `MEMES` and inspirational quotes to `QUOTES` in the same
file to expand the booby-trap / `?`-block pools.

## 📁 Structure

```
src/
  App.tsx                 Orchestrates boot / worldmap / playing / accessible modes
  store.ts                Global game state (zustand)
  data/content.ts         ← All content: worlds, levels, language tips, memes, quotes
  audio/AudioEngine.ts    Procedural synthwave + SFX (WebAudio)
  game/
    Platformer.tsx        The playable stage: input + fixed-timestep physics loop
    render.ts             Canvas renderer (parallax, shaded sprites, vignette)
    buildLevel.ts         Procedurally lays out a stage from a Level definition
    types.ts              Engine types
  components/
    BootScreen.tsx        "Press Start"
    WorldMap.tsx          Mario-style world/level select + skill bars
    ProjectPanel.tsx      Level briefing + language breakdown
    ContactTerminal.tsx   In-game EmailJS contact form
    AccessibleView.tsx    WCAG 2D document fallback (+ AccessibleContact)
    CookieBanner, AchievementToasts
.github/workflows/deploy.yml   GitHub Pages CI/CD
```
