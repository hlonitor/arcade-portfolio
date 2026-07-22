import type { Level, World } from '../data/content';
import { MEMES, QUOTES } from '../data/content';
import type { LevelMap } from './types';

export const VIEW_H = 540; // fixed logical height of the play area
const GROUND_H = 80;

// Deterministic pseudo-random so a given level always builds the same layout
// (no Date.now/Math.random — keeps things reproducible + testable).
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Procedurally lay out a side-scrolling stage themed to its world + level.
// Locked levels get a shorter, "under construction" flavour.
export function buildLevel(level: Level, world: World): LevelMap {
  const rand = seeded(hash(level.id));
  const groundY = VIEW_H - GROUND_H;
  const locked = level.status === 'locked';
  const width = locked ? 1600 : 3200;

  const platforms: LevelMap['platforms'] = [
    // Continuous ground with a couple of pits to hop over (skip pits for locked).
    { x: 0, y: groundY, w: width, h: GROUND_H, kind: 'ground' },
  ];

  const questionBlocks: LevelMap['questionBlocks'] = [];
  const traps: LevelMap['traps'] = [];
  const coins: LevelMap['coins'] = [];
  const decorations: LevelMap['decorations'] = [];

  // Background decorations (parallax handled at render time).
  const isCave = world.id === 'w-genai';
  const decoCount = Math.floor(width / 340);
  for (let i = 0; i < decoCount; i++) {
    const x = 120 + i * 340 + rand() * 120;
    if (isCave) {
      decorations.push({ x, y: 40 + rand() * 30, w: 60, h: 90, kind: 'stalactite' });
      decorations.push({ x: x + 80, y: groundY - 40, w: 30, h: 40, kind: 'crystal' });
    } else {
      decorations.push({ x, y: 60 + rand() * 60, w: 120, h: 60, kind: 'cloud' });
      decorations.push({ x: x + 40, y: groundY - 70, w: 160, h: 70, kind: 'hill' });
      decorations.push({ x: x + 200, y: groundY - 26, w: 60, h: 26, kind: 'bush' });
    }
  }

  // Entry pipe (visual nod to Mario) near the spawn.
  decorations.push({ x: 40, y: groundY - 70, w: 70, h: 70, kind: 'pipe' });

  if (!locked) {
    // Floating brick / block rows with ? -blocks and coins.
    const segments = 6;
    for (let seg = 0; seg < segments; seg++) {
      const baseX = 360 + seg * 460;
      const platY = groundY - (110 + Math.floor(rand() * 3) * 60);

      // A short floating platform.
      const plen = 3 + Math.floor(rand() * 3);
      for (let b = 0; b < plen; b++) {
        platforms.push({
          x: baseX + b * 40,
          y: platY,
          w: 40,
          h: 40,
          kind: 'brick',
        });
      }

      // A ? -block above it with an inspirational quote.
      const q = QUOTES[(hash(level.id) + seg) % QUOTES.length];
      questionBlocks.push({
        x: baseX + 40,
        y: platY - 120,
        w: 40,
        h: 40,
        hit: false,
        quote: q,
      });

      // A coin trail leading up to the platform.
      for (let c = 0; c < 3; c++) {
        coins.push({
          x: baseX - 90 + c * 34,
          y: platY - 60,
          w: 22,
          h: 22,
          taken: false,
        });
      }

      // A booby-trap on the ground between segments (patrolling goomba or spike).
      const trapX = baseX + 200 + rand() * 120;
      const meme = MEMES[(hash(level.id) + seg * 3) % MEMES.length];
      if (seg % 2 === 0) {
        traps.push({
          x: trapX,
          y: groundY - 34,
          w: 34,
          h: 34,
          triggered: false,
          meme,
          kind: 'goomba',
          vx: 40,
          minX: trapX - 90,
          maxX: trapX + 90,
        });
      } else {
        traps.push({
          x: trapX,
          y: groundY - 26,
          w: 40,
          h: 26,
          triggered: false,
          meme,
          kind: 'spike',
        });
      }
    }
  } else {
    // Locked level: one lonely sign-post trap + a couple decorations.
    traps.push({
      x: 700,
      y: groundY - 34,
      w: 34,
      h: 34,
      triggered: false,
      meme: '🚧 This level is still compiling… check back after the next commit!',
      kind: 'goomba',
      vx: 30,
      minX: 620,
      maxX: 820,
    });
  }

  // Flag at the far right — reaching it "clears" the level.
  const flag = { x: width - 120, y: groundY - 220, w: 16, h: 220 };

  return {
    width,
    height: VIEW_H,
    groundY,
    platforms,
    questionBlocks,
    traps,
    coins,
    decorations,
    flag,
    spawn: { x: 90, y: groundY - 60 },
  };
}
