// ---------------------------------------------------------------------------
// Single source of truth for the whole game.
//
// Structure (Mario-style):
//   WORLD  = an AWS certification (a "stage" on the world map)
//   LEVEL  = a project that falls under that certification (a side-stage you
//            actually play as a platformer level)
//
// Edit this file to add worlds, levels, language breakdowns, memes or quotes.
// ---------------------------------------------------------------------------

export const PROFILE = {
  name: 'Lydron Mohohlo',
  title: 'IT & AI Engineer',
  tagline: 'Cloud • Artificial Intelligence • Software Engineering',
  bio: `IT and AI engineer focused on cloud-native systems, generative AI, and
  building things that ship. Currently deep in an AWS certification journey and
  turning study into real, deployed applications.`,
  linkedin: import.meta.env.VITE_LINKEDIN_URL ?? 'https://linkedin.com',
};

export type Skill = {
  name: string;
  level: number; // 0..100 — rendered as an RPG "health / XP" bar
  color: string;
};

export const SKILLS: Skill[] = [
  { name: 'AWS Cloud', level: 82, color: '#ff9900' },
  { name: 'Generative AI / LLMs', level: 78, color: '#22d3ee' },
  { name: 'Python', level: 85, color: '#3b82f6' },
  { name: 'TypeScript / React', level: 74, color: '#f472b6' },
  { name: 'Infrastructure as Code', level: 70, color: '#a78bfa' },
  { name: 'Serverless Architecture', level: 76, color: '#34d399' },
];

// A per-project breakdown of the primary language: what it was, why it was
// chosen, and concrete tips for levelling up in it.
export type LanguageBreakdown = {
  name: string;
  why: string;
  tips: string[];
};

export type Level = {
  id: string;
  index: number; // level number within its world (e.g. 1-1, 1-2)
  title: string;
  status: 'live' | 'building' | 'locked';
  summary: string;
  tags: string[];
  stack: string[];
  detail: string;
  language: LanguageBreakdown;
  repoUrl?: string;
  demoUrl?: string;
  color: string;
};

// A "biome" gives each world its own realistic sky/ground palette.
export type Biome = {
  skyTop: string;
  skyBottom: string;
  sun: string;
  hills: string;
  hillsFar: string;
  ground: string;
  groundDark: string;
};

export type World = {
  id: string;
  index: number;
  cert: string; // the certification this world represents
  certStatus: 'earned' | 'in-progress' | 'planned';
  name: string; // fun world name
  blurb: string;
  color: string;
  biome: Biome;
  levels: Level[];
};

const TS_TIPS = [
  'Turn on `strict` mode and never use `any` — let the compiler catch bugs before your users do.',
  'Learn utility types (Partial, Pick, Omit, Record) — they remove huge amounts of boilerplate.',
  'Model your domain with discriminated unions instead of optional-flag soup; the compiler then forces you to handle every case.',
  'Read the types of the libraries you use — the .d.ts files are the best docs you never open.',
];

const PY_TIPS = [
  'Use type hints + `mypy`/`pyright` — Python is dynamic, but your future self wants the guardrails.',
  'Master list/dict comprehensions and generators before reaching for a framework.',
  'Learn the standard library deeply (itertools, collections, dataclasses) — it replaces most "utility" packages.',
  'Profile before you optimise: `cProfile` and `timeit` beat guessing every time.',
];

export const WORLDS: World[] = [
  {
    id: 'w-foundations',
    index: 1,
    cert: 'AWS Cloud Practitioner',
    certStatus: 'earned',
    name: 'World 1 — Cloud Foundations',
    blurb: 'Grassy plains where every cloud journey begins. Certification: earned ✅',
    color: '#34d399',
    biome: {
      skyTop: '#4aa3e0',
      skyBottom: '#bfe6ff',
      sun: '#fff6d5',
      hills: '#4caf50',
      hillsFar: '#7cc47f',
      ground: '#7b4a24',
      groundDark: '#5b3417',
    },
    levels: [
      {
        id: 'this-site',
        index: 1,
        title: 'This Arcade Portfolio',
        status: 'live',
        summary:
          'The game you are playing right now — a Snake-style arcade portfolio built with React, a hand-rolled grid game loop, and a procedural synthwave soundtrack, auto-deployed to the cloud.',
        tags: ['React', 'CI/CD', 'GitHub Pages', 'WebAudio'],
        stack: [
          'React + Vite + TypeScript',
          'Custom grid-based Snake engine (requestAnimationFrame)',
          'WebAudio API (procedural music/SFX)',
          'GitHub Actions → GitHub Pages',
        ],
        detail: `This node is the website itself. It's a Snake game: steer the snake around the grid
to devour data packets and grow, eat a glowing project node to open its case study, headbutt
? -pellets for dev wisdom, and dodge the meme booby-trap foods.

Engineered against the AWS Well-Architected pillars: a tiny asset footprint and a smooth
interpolated grid loop for 60 FPS, zero hardcoded secrets, and a full 2D accessible fallback.
Deployed automatically via GitHub Actions to GitHub Pages on every push to main.`,
        language: {
          name: 'TypeScript',
          why: 'A component-heavy game with lots of interacting state (physics, input, audio, UI) is exactly where TypeScript pays off — the compiler catches an entire class of "undefined is not a function" bugs before the browser ever runs the code, and the editor autocomplete makes refactoring the engine safe.',
          tips: TS_TIPS,
        },
        repoUrl: 'https://github.com/hlonitor/arcade-portfolio',
        color: '#22d3ee',
      },
    ],
  },
  {
    id: 'w-architect',
    index: 2,
    cert: 'AWS Solutions Architect – Associate',
    certStatus: 'in-progress',
    name: 'World 2 — Architect Heights',
    blurb: 'Sky-high platforms and floating infra. Certification: in progress ⏳',
    color: '#a78bfa',
    biome: {
      skyTop: '#3a2f7a',
      skyBottom: '#8f7fd6',
      sun: '#ffe08a',
      hills: '#5b4b9e',
      hillsFar: '#7c6bc0',
      ground: '#4a3f6b',
      groundDark: '#332b4d',
    },
    levels: [
      {
        id: 'locked-observability',
        index: 1,
        title: 'Cloud Observability (Locked)',
        status: 'locked',
        summary:
          'A future quest. Full-stack observability and cost-guardrails for serverless fleets.',
        tags: ['Observability', 'FinOps'],
        stack: ['Coming soon'],
        detail: 'This level is locked. A new IT/AI project will be dropped here soon.',
        language: {
          name: 'Go',
          why: 'Planned in Go for its tiny static binaries and first-class concurrency — ideal for a metrics collector that must be cheap to run and fan out across many services.',
          tips: [
            'Embrace goroutines + channels, but always guard shared state with the race detector (`go test -race`).',
            'Keep interfaces small — Go rewards "accept interfaces, return structs".',
          ],
        },
        color: '#a78bfa',
      },
      {
        id: 'locked-agent-ops',
        index: 2,
        title: 'AI Agent Ops (Locked)',
        status: 'locked',
        summary:
          'A future quest. An autonomous agent workflow for cloud operations.',
        tags: ['Agents', 'Automation'],
        stack: ['Coming soon'],
        detail: 'This level is locked. A new IT/AI project will be dropped here soon.',
        language: {
          name: 'Python',
          why: 'Planned in Python because the agent/LLM tooling ecosystem lives there first.',
          tips: PY_TIPS,
        },
        color: '#64748b',
      },
    ],
  },
  {
    id: 'w-genai',
    index: 3,
    cert: 'AWS Generative AI Developer – Professional',
    certStatus: 'in-progress',
    name: 'World 3 — Generative Depths',
    blurb: 'Neon caverns humming with LLMs and vectors. Certification: in progress ⏳',
    color: '#22d3ee',
    biome: {
      skyTop: '#0b1030',
      skyBottom: '#2a1a5e',
      sun: '#22d3ee',
      hills: '#1b2b6b',
      hillsFar: '#2d3f8f',
      ground: '#1a2547',
      groundDark: '#0f1730',
    },
    levels: [
      {
        id: 'ask-my-notes',
        index: 1,
        title: 'Ask My Notes — RAG Study Tool',
        status: 'live',
        summary:
          'A Retrieval-Augmented Generation app that answers exam questions from my own AWS study notes, with page citations. 100% serverless, ~$4/month.',
        tags: ['RAG', 'GenAI', 'Serverless', 'Bedrock'],
        stack: [
          'Amazon Bedrock (Claude)',
          'Titan Embeddings v2',
          'OpenSearch Serverless',
          'Lambda + API Gateway',
          'S3',
        ],
        detail: `A RAG pipeline that grounds an LLM in my personal AWS study notes so it answers
in my own words and cites the exact page it pulled from — no hallucinated exam answers.

Ingestion: S3 → Lambda → Titan Embeddings v2 → OpenSearch Serverless.
Query: API Gateway → Lambda → top-k retrieval → Bedrock → streamed response.

Key trade-offs: chose OpenSearch Serverless over Kendra for cost/control on a low-traffic
app; used 512-token chunks with 64-token overlap because citation precision matters more
than context breadth. Building the app taught me RAG better than any video — and it doubled
as a study auditor, surfacing the gaps in my own notes.`,
        language: {
          name: 'Python',
          why: 'Python was the obvious pick: AWS Lambda has first-class Python support, boto3 makes Bedrock/OpenSearch calls trivial, and the entire embeddings/RAG ecosystem (chunkers, tokenizers, vector clients) is Python-first. Less glue code means more time on retrieval quality.',
          tips: PY_TIPS,
        },
        repoUrl: 'https://github.com/hlonitor/ask-my-notes',
        demoUrl: 'https://linkedin.com',
        color: '#34d399',
      },
      {
        id: 'locked-edge-ml',
        index: 2,
        title: 'Edge ML (Locked)',
        status: 'locked',
        summary: 'A future quest. On-device / edge machine-learning inference experiments.',
        tags: ['ML', 'Edge'],
        stack: ['Coming soon'],
        detail: 'This level is locked. A new IT/AI project will be dropped here soon.',
        language: {
          name: 'Rust',
          why: 'Planned in Rust for edge inference: no garbage-collector pauses, tiny memory footprint, and safety guarantees that matter when code runs on constrained devices.',
          tips: [
            'Fight the borrow checker less by designing ownership up front, not after.',
            'Learn `Result`/`?` error handling early — it becomes second nature and eliminates whole bug classes.',
          ],
        },
        color: '#64748b',
      },
    ],
  },
];

// Flat helpers -------------------------------------------------------------
export const ALL_LEVELS: Level[] = WORLDS.flatMap((w) => w.levels);
export function findLevel(id: string): Level | undefined {
  return ALL_LEVELS.find((l) => l.id === id);
}
export function findWorldOfLevel(id: string): World | undefined {
  return WORLDS.find((w) => w.levels.some((l) => l.id === id));
}

export const CERTIFICATIONS = WORLDS.map((w) => ({
  name: w.cert,
  status: w.certStatus,
}));

// ---------------------------------------------------------------------------
// Funny stuff: coding-meme "booby-traps" and inspirational ? -block quotes.
// ---------------------------------------------------------------------------

// Shown when the player hits a booby-trap. Pure comedy — no real penalty.
export const MEMES: string[] = [
  "💥 IT WORKS ON MY MACHINE! …then we'll ship your machine. 🚢",
  '🐛 99 little bugs in the code, 99 little bugs… take one down, patch it around, 127 little bugs in the code.',
  "☠️ You died. Cause of death: a missing semicolon; (Jk, it was a race condition.)",
  '🔥 “It’s not a bug, it’s an undocumented feature.” — every developer, ever.',
  '🤖 Trap sprung! The code compiled on the first try. Nobody trusts it. 😳',
  '📉 `git push --force` on a Friday afternoon. Bold. Respawning…',
  '💤 Stack Overflow is down. You have forgotten how to center a div. 😱',
  "🧨 TODO: fix this later. (Written 3 years ago.)",
];

// Shown when the player headbutts a ? -block. Wisdom + a wink.
export const QUOTES: string[] = [
  '⭐ “First, solve the problem. Then, write the code.” — John Johnson',
  '⭐ “Talk is cheap. Show me the code.” — Linus Torvalds',
  '⭐ “Any fool can write code a computer understands. Good programmers write code humans understand.” — Martin Fowler',
  '⭐ “Programs must be written for people to read, and only incidentally for machines to execute.” — Abelson & Sussman',
  '⭐ “The best error message is the one that never shows up.” — Thomas Fuchs',
  '⭐ “Make it work, make it right, make it fast — in that order.” — Kent Beck',
  '⭐ “Simplicity is the soul of efficiency.” — Austin Freeman',
  '⭐ “The only way to learn a new programming language is by writing programs in it.” — Dennis Ritchie',
];
