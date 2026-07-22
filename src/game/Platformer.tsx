import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';
import { findLevel, findWorldOfLevel } from '../data/content';
import { buildLevel, VIEW_H } from './buildLevel';
import { drawScene } from './render';
import type { LevelMap, Trap } from './types';

const GRAVITY = 2100; // px/s²
const MOVE = 320; // horizontal speed px/s
const JUMP = 760; // jump impulse px/s
const STEP = 1 / 120; // fixed physics timestep

type Player = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  bounceTimer: number; // brief squash after hitting a trap
};

// The playable Mario-style stage. A fixed-timestep physics loop drives a
// canvas renderer; input comes from keyboard + on-screen buttons (shared refs).
export default function Platformer() {
  const activeLevelId = useGame((s) => s.activeLevelId);
  const goToMap = useGame((s) => s.goToMap);
  const completeLevel = useGame((s) => s.completeLevel);
  const addCoin = useGame((s) => s.addCoin);
  const audioOn = useGame((s) => s.audioOn);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState('');

  // Input is held in a ref so the RAF loop never triggers React renders.
  const keys = useRef<Record<string, boolean>>({});
  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    const level = activeLevelId ? findLevel(activeLevelId) : undefined;
    const world = activeLevelId ? findWorldOfLevel(activeLevelId) : undefined;
    if (!level || !world) return;
    setSubtitle(`${world.name.split('—')[0].trim()}  ·  Level ${world.index}-${level.index}: ${level.title}`);

    const map: LevelMap = buildLevel(level, world);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const player: Player = {
      x: map.spawn.x,
      y: map.spawn.y,
      w: 30,
      h: 44,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      bounceTimer: 0,
    };

    let cameraX = 0;
    let completed = false;
    let raf = 0;
    let acc = 0;
    let last = performance.now();
    let anim = 0; // animation clock

    // --- Canvas sizing (responsive, retina-aware) ---
    const resize = () => {
      const parent = canvas.parentElement!;
      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // --- Collision helper: AABB overlap ---
    const hit = (
      ax: number, ay: number, aw: number, ah: number,
      b: { x: number; y: number; w: number; h: number },
    ) => ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;

    const trapBounce = (t: Trap) => {
      if (t.triggered) return;
      t.triggered = true;
      player.vy = -JUMP * 0.7; // comedic bounce, no death
      player.bounceTimer = 0.25;
      if (audioOn) audio.sfx('hover');
      showToast(t.meme);
      window.setTimeout(() => (t.triggered = false), 1200);
    };

    const physics = (dt: number) => {
      // Horizontal input
      const left = keys.current.left;
      const right = keys.current.right;
      player.vx = (right ? MOVE : 0) - (left ? MOVE : 0);
      if (player.vx > 0) player.facing = 1;
      else if (player.vx < 0) player.facing = -1;

      // Jump
      if (keys.current.jump && player.onGround) {
        player.vy = -JUMP;
        player.onGround = false;
        if (audioOn) audio.sfx('click');
      }

      // Integrate
      player.vy += GRAVITY * dt;
      player.x += player.vx * dt;
      player.y += player.vy * dt;
      if (player.bounceTimer > 0) player.bounceTimer -= dt;

      // World bounds
      if (player.x < 0) player.x = 0;
      if (player.x + player.w > map.width) player.x = map.width - player.w;

      // Platform collisions (resolve vertically then horizontally)
      player.onGround = false;
      for (const p of map.platforms) {
        if (!hit(player.x, player.y, player.w, player.h, p)) continue;
        const prevBottom = player.y - player.vy * dt + player.h;
        if (player.vy >= 0 && prevBottom <= p.y + 6) {
          // landing on top
          player.y = p.y - player.h;
          player.vy = 0;
          player.onGround = true;
        } else if (player.vy < 0 && player.y >= p.y) {
          // bonk head
          player.y = p.y + p.h;
          player.vy = 40;
        } else {
          // side hit
          if (player.vx > 0) player.x = p.x - player.w;
          else if (player.vx < 0) player.x = p.x + p.w;
        }
      }

      // Fell in a pit → respawn (with a wink)
      if (player.y > VIEW_H + 200) {
        player.x = map.spawn.x;
        player.y = map.spawn.y;
        player.vx = player.vy = 0;
        showToast('🕳️ Whoops — undefined is not a platform. Respawning…');
      }

      // ? -blocks
      for (const q of map.questionBlocks) {
        if (q.hit) continue;
        if (hit(player.x, player.y, player.w, player.h, q) && player.vy < 0) {
          q.hit = true;
          player.vy = 60;
          addCoin();
          if (audioOn) audio.sfx('achievement');
          showToast(q.quote);
        }
      }

      // Coins
      for (const c of map.coins) {
        if (c.taken) continue;
        if (hit(player.x, player.y, player.w, player.h, c)) {
          c.taken = true;
          addCoin();
          if (audioOn) audio.sfx('hover');
        }
      }

      // Traps (patrol goombas + static spikes)
      for (const t of map.traps) {
        if (t.kind === 'goomba' && t.vx !== undefined) {
          t.x += t.vx * dt;
          if (t.minX !== undefined && t.x < t.minX) { t.x = t.minX; t.vx = Math.abs(t.vx); }
          if (t.maxX !== undefined && t.x > t.maxX) { t.x = t.maxX; t.vx = -Math.abs(t.vx); }
        }
        if (hit(player.x, player.y, player.w, player.h, t)) trapBounce(t);
      }

      // Flag → level clear
      if (!completed && hit(player.x, player.y, player.w, player.h, map.flag)) {
        completed = true;
        if (audioOn) audio.sfx('achievement');
        window.setTimeout(() => completeLevel(level.id), 500);
      }

      // Camera follows player, clamped to the world.
      const viewW = canvas.clientWidth;
      const target = player.x + player.w / 2 - viewW / 2;
      cameraX += (target - cameraX) * Math.min(1, dt * 8);
      cameraX = Math.max(0, Math.min(cameraX, map.width - viewW));
    };

    const loop = (now: number) => {
      let frame = (now - last) / 1000;
      last = now;
      if (frame > 0.05) frame = 0.05; // clamp after tab-switch
      acc += frame;
      anim += frame;
      while (acc >= STEP) {
        physics(STEP);
        acc -= STEP;
      }
      drawScene(ctx, {
        map,
        world,
        player,
        cameraX,
        viewW: canvas.clientWidth,
        viewH: canvas.clientHeight,
        anim,
        completed,
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // --- Keyboard ---
    const down = (e: KeyboardEvent) => {
      const k = keyMap(e.code);
      if (k) {
        if (['left', 'right', 'jump'].includes(k)) e.preventDefault();
        keys.current[k] = true;
      }
      if (e.code === 'Escape') goToMap();
    };
    const up = (e: KeyboardEvent) => {
      const k = keyMap(e.code);
      if (k) keys.current[k] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [activeLevelId, audioOn, addCoin, completeLevel, goToMap]);

  // Touch controls set the same key refs.
  const hold = (k: string, v: boolean) => () => (keys.current[k] = v);

  return (
    <div style={styles.wrap}>
      <div style={styles.topbar}>
        <button className="btn" onClick={() => { audio.sfx('click'); goToMap(); }}>
          ◀ World Map
        </button>
        <span className="mono" style={styles.subtitle}>{subtitle}</span>
        <span className="mono" style={styles.hint}>← → move · ↑ / Space jump · reach the 🚩</span>
      </div>

      <div style={styles.stage}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />
        {toast && (
          <div style={styles.toast} className="mono" role="status" aria-live="polite">
            {toast}
          </div>
        )}
      </div>

      {/* On-screen controls (touch / mouse) */}
      <div style={styles.touch}>
        <div style={styles.dpad}>
          <button
            className="btn ctrl" aria-label="Move left"
            onPointerDown={hold('left', true)} onPointerUp={hold('left', false)}
            onPointerLeave={hold('left', false)}
          >◀</button>
          <button
            className="btn ctrl" aria-label="Move right"
            onPointerDown={hold('right', true)} onPointerUp={hold('right', false)}
            onPointerLeave={hold('right', false)}
          >▶</button>
        </div>
        <button
          className="btn ctrl pink" aria-label="Jump"
          onPointerDown={hold('jump', true)} onPointerUp={hold('jump', false)}
          onPointerLeave={hold('jump', false)}
        >JUMP ⤴</button>
      </div>
    </div>
  );
}

function keyMap(code: string): string | null {
  switch (code) {
    case 'ArrowLeft':
    case 'KeyA':
      return 'left';
    case 'ArrowRight':
    case 'KeyD':
      return 'right';
    case 'ArrowUp':
    case 'KeyW':
    case 'Space':
      return 'jump';
    default:
      return null;
  }
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#05060d' },
  topbar: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
    borderBottom: '1px solid var(--panel-border)', flexWrap: 'wrap',
  },
  subtitle: { color: '#e6f1ff', fontSize: 13, fontWeight: 700 },
  hint: { color: '#8aa0c0', fontSize: 11, marginLeft: 'auto' },
  stage: { position: 'relative', flex: 1, overflow: 'hidden' },
  toast: {
    position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
    maxWidth: 'min(92vw, 640px)', textAlign: 'center',
    background: 'rgba(6,8,20,0.92)', color: '#ffe08a',
    border: '2px solid #ffb020', borderRadius: 10, padding: '10px 16px',
    fontSize: 14, lineHeight: 1.5, boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
    animation: 'pulse 1s ease',
  },
  touch: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 16px', gap: 12,
  },
  dpad: { display: 'flex', gap: 10 },
};
