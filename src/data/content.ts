// ---------------------------------------------------------------------------
// All portfolio content lives here — single source of truth for both the 3D
// world and the 2D accessible view. Edit this file to add projects or skills.
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

export type Project = {
  id: string;
  level: number;
  title: string;
  status: 'live' | 'building' | 'locked';
  summary: string;
  tags: string[];
  stack: string[];
  detail: string;
  repoUrl?: string;
  demoUrl?: string;
  // Position of the kiosk in the 3D world (x, z on the floor plane).
  worldPos: [number, number];
  color: string;
};

export const PROJECTS: Project[] = [
  {
    id: 'this-site',
    level: 1,
    title: 'This Arcade Portfolio',
    status: 'live',
    summary:
      'The site you are exploring right now — a 3D gamified portfolio built with React Three Fiber, physics, and a procedural synthwave soundtrack.',
    tags: ['Three.js', 'React', 'WebGL', 'CI/CD'],
    stack: [
      'React + Vite + TypeScript',
      'React Three Fiber + drei',
      '@react-three/cannon (physics)',
      'WebAudio API (procedural music/SFX)',
      'GitHub Actions → GitHub Pages',
    ],
    detail: `Project #1 is this website itself. It renders a real-time 3D showroom you
navigate with WASD / arrow keys or on-screen controls, with cannon-es physics for
collisions, a heads-up display, quest markers, and an 8-bit/synthwave soundtrack
generated entirely in the browser (zero audio files shipped).

Engineered against the AWS Well-Architected pillars: low-poly geometry and code-split
bundles for Performance Efficiency, zero hardcoded secrets for Security, and a full
2D accessible fallback for Reliability & inclusive access. Deployed automatically via
GitHub Actions to GitHub Pages on every push to main.`,
    repoUrl: 'https://github.com/lydron/arcade-portfolio',
    worldPos: [0, -6],
    color: '#22d3ee',
  },
  {
    id: 'ask-my-notes',
    level: 2,
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
than context breadth for a study tool. Shipped a throwaway Streamlit UI first to validate
the pipeline, then migrated the frontend. Building the app taught me RAG better than any
video — and it doubled as a study auditor, surfacing the gaps in my own notes.`,
    repoUrl: 'https://github.com/lydron/ask-my-notes',
    demoUrl: 'https://linkedin.com',
    worldPos: [-9, 2],
    color: '#34d399',
  },
  {
    id: 'locked-3',
    level: 3,
    title: 'Locked — AI Agent Ops',
    status: 'locked',
    summary:
      'A future quest. An autonomous agent workflow for cloud operations. Unlocks as the build progresses.',
    tags: ['Agents', 'Automation'],
    stack: ['Coming soon'],
    detail: 'This level is locked. A new IT/AI project will be dropped here soon.',
    worldPos: [9, 2],
    color: '#64748b',
  },
  {
    id: 'locked-4',
    level: 4,
    title: 'Locked — Cloud Observability',
    status: 'locked',
    summary:
      'A future quest. Full-stack observability and cost-guardrails for serverless fleets.',
    tags: ['Observability', 'FinOps'],
    stack: ['Coming soon'],
    detail: 'This level is locked. A new IT/AI project will be dropped here soon.',
    worldPos: [-6, 10],
    color: '#64748b',
  },
  {
    id: 'locked-5',
    level: 5,
    title: 'Locked — Edge ML',
    status: 'locked',
    summary: 'A future quest. On-device / edge machine-learning inference experiments.',
    tags: ['ML', 'Edge'],
    stack: ['Coming soon'],
    detail: 'This level is locked. A new IT/AI project will be dropped here soon.',
    worldPos: [6, 10],
    color: '#64748b',
  },
];

export const CERTIFICATIONS = [
  { name: 'AWS Cloud Practitioner', status: 'earned' },
  { name: 'AWS Solutions Architect – Associate', status: 'in-progress' },
  { name: 'AWS Generative AI Developer – Professional', status: 'in-progress' },
];
