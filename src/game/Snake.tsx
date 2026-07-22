import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store';
import { audio } from '../audio/AudioEngine';
import { ALL_LEVELS, MEMES, QUOTES } from '../data/content';
import { drawSnake } from './snakeRender';
import type { Cell, Dir, Food } from './snakeTypes';

const COLS = 24;
const ROWS = 18;
const STEP_MS = 130; // time between grid moves (snake speed)

const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
const DELTA: Record<Dir, Cell> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};

const eq = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

// Deterministic PRNG (no Math.random — keeps reproducible + resume-safe).
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// The playable Snake arena (v3). Grid logic runs on a fixed step; rendering
// interpolates between steps for smooth motion.
export default function Snake() {
  const collectProject = useGame((s) => s.collectProject);
  const addCoin = useGame((s) => s.addCoin);
  const enterAccessible = useGame((s) => s.enterAccessible);
  const audioOn = useGame((s) => s.audioOn);
  const collected = useGame((s) => s.collected);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const dirRef = useRef<Dir>('right');
  const nextDirRef = useRef<Dir>('right');
  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rng = makeRng(0xc0ffee);

    let snake: Cell[] = [
      { x: 5, y: 9 }, { x: 4, y: 9 }, { x: 3, y: 9 },
    ];
    let prevSnake: Cell[] = snake.map((c) => ({ ...c }));
    let foods: Food[] = [];
    let grow = 0;
    let acc = 0;
    let last = performance.now();
    let anim = 0;
    let raf = 0;
    let cell = 24;
    let originX = 0;
    let originY = 0;

    dirRef.current = 'right';
    nextDirRef.current = 'right';

    const occupied = (c: Cell) =>
      snake.some((s) => eq(s, c)) || foods.some((f) => eq(f.cell, c));

    const freeCell = (): Cell => {
      let c: Cell;
      let guard = 0;
      do {
        c = { x: Math.floor(rng() * COLS), y: Math.floor(rng() * ROWS) };
        guard++;
      } while (occupied(c) && guard < 500);
      return c;
    };

    // Place one project node per not-yet-collected project.
    const spawnProjectNodes = () => {
      for (const lvl of ALL_LEVELS) {
        if (collected.has(lvl.id)) continue;
        foods.push({ cell: freeCell(), kind: 'project', id: lvl.id, color: lvl.color });
      }
    };

    const spawnPacket = () => foods.push({ cell: freeCell(), kind: 'packet', color: '#ffd23f' });
    const spawnMeme = () =>
      foods.push({
        cell: freeCell(), kind: 'meme', color: '#f87171',
        text: MEMES[Math.floor(rng() * MEMES.length)],
      });
    const spawnWisdom = () =>
      foods.push({
        cell: freeCell(), kind: 'wisdom', color: '#fbbf24',
        text: QUOTES[Math.floor(rng() * QUOTES.length)],
      });

    // Initial food set
    spawnProjectNodes();
    spawnPacket();
    spawnPacket();
    spawnWisdom();
    spawnMeme();

    let localScore = 0;

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
      // Fit the grid inside the viewport with a margin.
      cell = Math.floor(Math.min((cssW - 24) / COLS, (cssH - 24) / ROWS));
      const boardW = cell * COLS;
      const boardH = cell * ROWS;
      originX = Math.floor((cssW - boardW) / 2);
      originY = Math.floor((cssH - boardH) / 2);
    };
    resize();
    window.addEventListener('resize', resize);

    const respawn = (msg: string) => {
      snake = [{ x: 5, y: 9 }, { x: 4, y: 9 }, { x: 3, y: 9 }];
      prevSnake = snake.map((c) => ({ ...c }));
      dirRef.current = 'right';
      nextDirRef.current = 'right';
      grow = 0;
      showToast(msg);
    };

    const step = () => {
      dirRef.current = nextDirRef.current;
      const d = DELTA[dirRef.current];
      prevSnake = snake.map((c) => ({ ...c }));

      const head = snake[0];
      // Wrap around walls (classic modern-snake behaviour).
      const next: Cell = {
        x: (head.x + d.x + COLS) % COLS,
        y: (head.y + d.y + ROWS) % ROWS,
      };

      // Self collision → respawn with a gag (non-fatal, keeps it friendly).
      if (snake.some((s, i) => i < snake.length - 1 && eq(s, next))) {
        respawn('🌀 You ate your own tail — classic infinite recursion. Respawning…');
        return;
      }

      snake.unshift(next);

      // Eat?
      const fi = foods.findIndex((f) => eq(f.cell, next));
      if (fi >= 0) {
        const f = foods[fi];
        foods.splice(fi, 1);
        if (f.kind === 'packet') {
          grow += 1;
          localScore += 10;
          addCoin();
          if (audioOn) audio.sfx('hover');
          spawnPacket();
          // occasionally sprinkle a new wisdom/meme to keep the board lively
          if (localScore % 50 === 0) spawnWisdom();
          if (localScore % 70 === 0) spawnMeme();
        } else if (f.kind === 'wisdom') {
          grow += 1;
          localScore += 15;
          addCoin();
          if (audioOn) audio.sfx('achievement');
          showToast(f.text!);
          spawnWisdom();
        } else if (f.kind === 'meme') {
          // Booby-trap: shrink a little (never below 3) + laugh. Non-fatal.
          const shrink = Math.min(2, snake.length - 3);
          for (let k = 0; k < shrink; k++) snake.pop();
          localScore = Math.max(0, localScore - 5);
          if (audioOn) audio.sfx('click');
          showToast(f.text!);
          spawnMeme();
        } else if (f.kind === 'project') {
          grow += 2;
          localScore += 50;
          if (audioOn) audio.sfx('achievement');
          // Opening the panel pauses the loop (component stays mounted).
          collectProject(f.id!);
        }
        setScore(localScore);
      }

      // Trim tail unless growing.
      if (grow > 0) grow -= 1;
      else snake.pop();
    };

    const loop = (now: number) => {
      let dt = now - last;
      last = now;
      if (dt > 200) dt = STEP_MS; // tab-switch guard
      acc += dt;
      anim += dt / 1000;
      // Only advance the sim while no panel is open (pause on case study).
      const paused = useGame.getState().activePanel !== null;
      if (!paused) {
        while (acc >= STEP_MS) {
          step();
          acc -= STEP_MS;
        }
      } else {
        acc = 0;
      }
      const interp = paused ? 1 : Math.min(1, acc / STEP_MS);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSnake({
        ctx, cols: COLS, rows: ROWS, cell, originX, originY,
        snake, prevSnake, dir: dirRef.current, interp, foods, anim,
        collectedProjects: collected,
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const setDir = (d: Dir) => {
      // Disallow reversing directly into yourself.
      if (d === OPPOSITE[dirRef.current]) return;
      nextDirRef.current = d;
    };

    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir | undefined> = {
        ArrowUp: 'up', KeyW: 'up',
        ArrowDown: 'down', KeyS: 'down',
        ArrowLeft: 'left', KeyA: 'left',
        ArrowRight: 'right', KeyD: 'right',
      };
      const d = map[e.code];
      if (d) {
        e.preventDefault();
        setDir(d);
      }
    };
    window.addEventListener('keydown', onKey);

    // expose for touch buttons
    (canvas as unknown as { _setDir: (d: Dir) => void })._setDir = setDir;

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKey);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [addCoin, collectProject, collected, audioOn]);

  const touchDir = (d: Dir) => () => {
    const canvas = canvasRef.current as unknown as { _setDir?: (d: Dir) => void } | null;
    canvas?._setDir?.(d);
  };

  const projectsLeft = ALL_LEVELS.length - collected.size;

  return (
    <div style={styles.wrap}>
      <div style={styles.topbar}>
        <span className="mono neon-text" style={styles.brand}>🐍 SNAKE.PORTFOLIO v3</span>
        <span className="mono" style={styles.stat}>SCORE {score}</span>
        <span className="mono" style={styles.stat}>◆ nodes left: {projectsLeft}</span>
        <span className="mono" style={styles.hint}>← ↑ ↓ → / WASD · eat ◆ project cores · dodge 🐛</span>
        <button className="btn pink" style={styles.a11y}
                onClick={() => { audio.sfx('click'); enterAccessible(); }}>♿ 2D</button>
      </div>

      <div style={styles.stage}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />
        {toast && (
          <div style={styles.toast} className="mono" role="status" aria-live="polite">{toast}</div>
        )}
      </div>

      {/* Touch D-pad */}
      <div style={styles.dpad}>
        <div />
        <button className="btn ctrl" aria-label="Up" onClick={touchDir('up')}>▲</button>
        <div />
        <button className="btn ctrl" aria-label="Left" onClick={touchDir('left')}>◀</button>
        <button className="btn ctrl" aria-label="Down" onClick={touchDir('down')}>▼</button>
        <button className="btn ctrl" aria-label="Right" onClick={touchDir('right')}>▶</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#05060d' },
  topbar: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '8px 12px',
    borderBottom: '1px solid var(--panel-border)', flexWrap: 'wrap',
  },
  brand: { fontSize: 14, fontWeight: 700 },
  stat: { fontSize: 12, color: '#ffd23f' },
  hint: { fontSize: 11, color: '#8aa0c0', marginLeft: 'auto' },
  a11y: { fontSize: 11, padding: '6px 10px' },
  stage: { position: 'relative', flex: 1, overflow: 'hidden' },
  toast: {
    position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
    maxWidth: 'min(92vw, 640px)', textAlign: 'center',
    background: 'rgba(6,8,20,0.92)', color: '#ffe08a',
    border: '2px solid #ffb020', borderRadius: 10, padding: '10px 16px',
    fontSize: 14, lineHeight: 1.5, boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
    animation: 'pulse 1s ease',
  },
  dpad: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 56px)', gridAutoRows: '48px',
    gap: 6, justifyContent: 'center', padding: '8px',
  },
};
