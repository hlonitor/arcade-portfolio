# 🕹️ Arcade Portfolio — Lydron Mohohlo

An interactive **3D gamified IT & AI portfolio**. Press Start, then pilot a
camera-drone through a neon cyberpunk showroom, walk into glowing kiosks to open
project "levels," check your skill health bars on the HUD, and hail the contact
terminal — all with a procedural synthwave soundtrack.

> **Project #1 is this website itself.** Locked levels are placeholders for
> future IT/AI projects.

## ✨ Features

- **3D showroom** built with React Three Fiber + drei, with **cannon-es physics**
  for collisions (you bump into the kiosks).
- **WASD / arrow-key** movement, a smooth chase camera, and an on-screen
  **virtual joystick** on touch devices.
- **RPG HUD** — skill "health" bars, a quest log, floating quest markers, and
  **achievement-unlocked** toasts.
- **Procedural audio** — 8-bit/synthwave background music and UI SFX generated
  entirely in the browser with the WebAudio API (**zero audio files shipped**).
- **In-game contact terminal** wired to **EmailJS** (with a graceful `mailto:`
  fallback when unconfigured).
- **♿ 2D / Accessible view** — a full WCAG-minded, motion-free, screen-reader
  friendly rendering of every piece of content, toggleable at any time and from
  the start screen.
- **Cookie consent banner** and **zero hardcoded secrets**.

## 🧱 Tech stack

| Layer      | Choice                                                  |
| ---------- | ------------------------------------------------------- |
| Framework  | React 18 + **Vite** + TypeScript (static export)        |
| 3D         | **three**, **@react-three/fiber**, **@react-three/drei**|
| Physics    | **@react-three/cannon** (cannon-es)                     |
| State      | **zustand**                                             |
| Audio      | WebAudio API (procedural — no assets)                   |
| Email      | **@emailjs/browser**                                    |
| CI/CD      | GitHub Actions → **GitHub Pages**                       |

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
git commit -m "feat: 3D gamified IT & AI portfolio"
git branch -M main
git remote add origin https://github.com/<username>/arcade-portfolio.git
git push -u origin main
```

## 🏛️ AWS Well-Architected alignment

- **Performance Efficiency** — low-poly geometry, no shadow maps, code-split 3D
  bundle (loads only after Press Start), `AdaptiveDpr` + `PerformanceMonitor`
  that lower pixel density to hold ~60 FPS on weaker GPUs, responsive canvas,
  and procedural audio (no binary assets to download).
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

Edit **`src/data/content.ts`** — it's the single source of truth for both the 3D
world and the 2D view. Change a project's `status` from `'locked'` to
`'building'` / `'live'`, fill in `stack`, `detail`, `repoUrl`, `demoUrl`, and
give it a `worldPos: [x, z]` for its kiosk. Commit & push — CI redeploys.

## 📁 Structure

```
src/
  App.tsx                 Orchestrates boot / playing / accessible modes
  store.ts                Global game state (zustand)
  data/content.ts         ← All portfolio content lives here
  audio/AudioEngine.ts    Procedural synthwave + SFX (WebAudio)
  components/             HUD, panels, contact terminal, cookie banner,
                          accessible view, joystick, boot screen
  three/                  World, Scene, Player, Kiosks, physics, input
.github/workflows/deploy.yml   GitHub Pages CI/CD
```
