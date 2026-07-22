import type { Cell, Dir, Food } from './snakeTypes';

// A rounded-rect helper for softer, more realistic shapes.
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export type RenderArgs = {
  ctx: CanvasRenderingContext2D;
  cols: number;
  rows: number;
  cell: number; // px per grid cell
  originX: number; // left padding to center the board
  originY: number;
  snake: Cell[]; // head first
  dir: Dir;
  interp: number; // 0..1 progress toward the next step (smooth motion)
  prevSnake: Cell[]; // snake positions at previous step (for interpolation)
  foods: Food[];
  anim: number;
  collectedProjects: Set<string>;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Wrap-aware interpolation: if a segment jumped across the board edge this step,
// don't draw a long streak across the whole board — snap instead.
function segPos(prev: Cell, cur: Cell, t: number) {
  const dx = Math.abs(cur.x - prev.x);
  const dy = Math.abs(cur.y - prev.y);
  if (dx > 1 || dy > 1) return cur; // wrapped — just show target cell
  return { x: lerp(prev.x, cur.x, t), y: lerp(prev.y, cur.y, t) };
}

export function drawSnake(a: RenderArgs) {
  const { ctx, cols, rows, cell, originX, originY, snake, prevSnake, interp, foods, anim } = a;
  const boardW = cols * cell;
  const boardH = rows * cell;

  // --- Arena backdrop (dark, glossy floor with subtle radial light) ---------
  const bg = ctx.createLinearGradient(0, originY, 0, originY + boardH);
  bg.addColorStop(0, '#0d1230');
  bg.addColorStop(1, '#070a1c');
  ctx.fillStyle = bg;
  rr(ctx, originX, originY, boardW, boardH, 14);
  ctx.fill();

  // Grid lines (faint neon)
  ctx.save();
  ctx.beginPath();
  rr(ctx, originX, originY, boardW, boardH, 14);
  ctx.clip();
  ctx.strokeStyle = 'rgba(80,140,220,0.10)';
  ctx.lineWidth = 1;
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    ctx.moveTo(originX + c * cell, originY);
    ctx.lineTo(originX + c * cell, originY + boardH);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(originX, originY + r * cell);
    ctx.lineTo(originX + boardW, originY + r * cell);
    ctx.stroke();
  }
  // Center glow
  const glow = ctx.createRadialGradient(
    originX + boardW / 2, originY + boardH / 2, 10,
    originX + boardW / 2, originY + boardH / 2, boardH * 0.7,
  );
  glow.addColorStop(0, 'rgba(34,211,238,0.10)');
  glow.addColorStop(1, 'rgba(34,211,238,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(originX, originY, boardW, boardH);

  // --- Food -----------------------------------------------------------------
  for (const f of foods) drawFood(ctx, f, cell, originX, originY, anim);

  // --- Snake ----------------------------------------------------------------
  const px = (gx: number) => originX + gx * cell + cell / 2;
  const py = (gy: number) => originY + gy * cell + cell / 2;
  const seg = cell * 0.86;

  // Body (tail → head so head draws on top). Each segment is a glossy rounded
  // capsule; a slight per-segment hue shift gives a scaly, realistic sheen.
  for (let i = snake.length - 1; i >= 0; i--) {
    const cur = snake[i];
    const prev = prevSnake[i] ?? cur;
    const p = segPos(prev, cur, interp);
    const cx = px(p.x);
    const cy = py(p.y);
    const t = i / Math.max(1, snake.length - 1);

    // drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    rr(ctx, cx - seg / 2 + 2, cy - seg / 2 + 3, seg, seg, seg * 0.4);
    ctx.fill();

    const light = `hsl(${168 + t * 20}, 80%, ${58 - t * 14}%)`;
    const dark = `hsl(${168 + t * 20}, 75%, ${30 - t * 8}%)`;
    const g = ctx.createLinearGradient(cx - seg / 2, cy - seg / 2, cx + seg / 2, cy + seg / 2);
    g.addColorStop(0, light);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    rr(ctx, cx - seg / 2, cy - seg / 2, seg, seg, seg * 0.4);
    ctx.fill();

    // top gloss highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    rr(ctx, cx - seg / 2 + 3, cy - seg / 2 + 3, seg - 6, seg * 0.3, seg * 0.2);
    ctx.fill();
  }

  // Head (bigger, with eyes + tongue facing the travel direction)
  if (snake.length) {
    const cur = snake[0];
    const prev = prevSnake[0] ?? cur;
    const p = segPos(prev, cur, interp);
    const cx = px(p.x);
    const cy = py(p.y);
    const hs = cell * 0.98;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    rr(ctx, cx - hs / 2 + 2, cy - hs / 2 + 3, hs, hs, hs * 0.42);
    ctx.fill();

    const g = ctx.createRadialGradient(cx - hs * 0.2, cy - hs * 0.2, 2, cx, cy, hs * 0.7);
    g.addColorStop(0, '#8dffe0');
    g.addColorStop(1, '#0e9e8a');
    ctx.fillStyle = g;
    rr(ctx, cx - hs / 2, cy - hs / 2, hs, hs, hs * 0.42);
    ctx.fill();

    // eyes
    const d = a.dir;
    const ex = d === 'left' ? -1 : d === 'right' ? 1 : 0;
    const ey = d === 'up' ? -1 : d === 'down' ? 1 : 0;
    const off = hs * 0.18;
    const perpX = ey; // perpendicular for two-eye spread
    const perpY = ex;
    const er = hs * 0.12;
    for (const s of [-1, 1]) {
      const eyeX = cx + ex * off + perpX * off * s;
      const eyeY = cy + ey * off + perpY * off * s;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, er, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#06121a';
      ctx.beginPath();
      ctx.arc(eyeX + ex * er * 0.4, eyeY + ey * er * 0.4, er * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    // flicking tongue
    if (Math.sin(anim * 6) > 0.3) {
      ctx.strokeStyle = '#ff4d6d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + ex * hs * 0.5, cy + ey * hs * 0.5);
      ctx.lineTo(cx + ex * hs * 0.8, cy + ey * hs * 0.8);
      ctx.stroke();
    }
  }
  ctx.restore();

  // --- Vignette (depth / realism) -------------------------------------------
  const vig = ctx.createRadialGradient(
    originX + boardW / 2, originY + boardH / 2, boardH * 0.35,
    originX + boardW / 2, originY + boardH / 2, boardH * 0.85,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vig;
  rr(ctx, originX, originY, boardW, boardH, 14);
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(120,200,255,0.35)';
  ctx.lineWidth = 2;
  rr(ctx, originX, originY, boardW, boardH, 14);
  ctx.stroke();
}

function drawFood(
  ctx: CanvasRenderingContext2D, f: Food, cell: number,
  originX: number, originY: number, anim: number,
) {
  const cx = originX + f.cell.x * cell + cell / 2;
  const cy = originY + f.cell.y * cell + cell / 2;
  const pulse = 1 + Math.sin(anim * 4 + f.cell.x + f.cell.y) * 0.08;
  const r = cell * 0.34 * pulse;

  ctx.save();
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 14;

  if (f.kind === 'packet') {
    // A glowing data packet (rounded square with a core)
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
    g.addColorStop(0, '#fff6c0');
    g.addColorStop(0.6, f.color);
    g.addColorStop(1, '#b8860b');
    ctx.fillStyle = g;
    rr(ctx, cx - r, cy - r, r * 2, r * 2, r * 0.5);
    ctx.fill();
  } else if (f.kind === 'project') {
    // A rotating diamond "project core"
    ctx.translate(cx, cy);
    ctx.rotate(anim * 1.2);
    const g = ctx.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, f.color);
    ctx.fillStyle = g;
    const R = r * 1.25;
    ctx.beginPath();
    ctx.moveTo(0, -R); ctx.lineTo(R, 0); ctx.lineTo(0, R); ctx.lineTo(-R, 0);
    ctx.closePath();
    ctx.fill();
    ctx.rotate(-anim * 1.2);
  } else if (f.kind === 'wisdom') {
    // A golden "?" orb of wisdom
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
    g.addColorStop(0, '#fff');
    g.addColorStop(1, f.color);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#5a3a06';
    ctx.font = `bold ${Math.floor(cell * 0.5)}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', cx, cy + 1);
  } else {
    // meme booby-trap food: a spiky, ominous bug
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
    g.addColorStop(0, '#ffb3b3');
    g.addColorStop(1, f.color);
    ctx.fillStyle = g;
    const spikes = 7;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const ang = (Math.PI * i) / spikes;
      const rad = i % 2 === 0 ? r : r * 0.55;
      ctx.lineTo(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#3a0a0a';
    ctx.font = `bold ${Math.floor(cell * 0.4)}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐛', cx, cy + 1);
  }
  ctx.restore();
}
