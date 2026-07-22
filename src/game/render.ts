import type { World } from '../data/content';
import type { LevelMap } from './types';

type PlayerLike = {
  x: number; y: number; w: number; h: number;
  vx: number; vy: number; onGround: boolean; facing: 1 | -1; bounceTimer: number;
};

type SceneArgs = {
  map: LevelMap;
  world: World;
  player: PlayerLike;
  cameraX: number;
  viewW: number;
  viewH: number;
  anim: number;
  completed: boolean;
};

// A rounded-rect helper (used everywhere for softer, more realistic shapes).
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

export function drawScene(ctx: CanvasRenderingContext2D, s: SceneArgs) {
  const { map, world, player, cameraX, viewW, viewH, anim } = s;
  const b = world.biome;

  // --- Sky: vertical gradient ------------------------------------------------
  const sky = ctx.createLinearGradient(0, 0, 0, viewH);
  sky.addColorStop(0, b.skyTop);
  sky.addColorStop(1, b.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, viewW, viewH);

  // --- Sun / glow ------------------------------------------------------------
  const sunX = viewW * 0.78 - cameraX * 0.02;
  const sunGrad = ctx.createRadialGradient(sunX, 120, 10, sunX, 120, 160);
  sunGrad.addColorStop(0, b.sun);
  sunGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, viewW, viewH);

  // --- Parallax far hills ----------------------------------------------------
  drawHills(ctx, cameraX * 0.2, map, viewW, b.hillsFar, 160);
  drawHills(ctx, cameraX * 0.4, map, viewW, b.hills, 110);

  // --- Decorations (parallax mid) -------------------------------------------
  ctx.save();
  ctx.translate(-cameraX * 0.6, 0);
  for (const d of map.decorations) {
    if (d.kind === 'cloud') drawCloud(ctx, d.x, d.y, d.w);
    else if (d.kind === 'hill') drawHill(ctx, d.x, d.y, d.w, d.h, b.hills);
    else if (d.kind === 'stalactite') drawStalactite(ctx, d.x, d.y, d.w, d.h);
  }
  ctx.restore();

  // --- Foreground world (full-speed) ----------------------------------------
  ctx.save();
  ctx.translate(-cameraX, 0);

  // Bushes + pipes + crystals live at full speed (foreground)
  for (const d of map.decorations) {
    if (d.kind === 'bush') drawBush(ctx, d.x, d.y, d.h);
    else if (d.kind === 'pipe') drawPipe(ctx, d.x, d.y, d.w, d.h);
    else if (d.kind === 'crystal') drawCrystal(ctx, d.x, d.y, d.w, d.h, b.sun);
  }

  // Platforms
  for (const p of map.platforms) {
    if (p.x + p.w < cameraX - 40 || p.x > cameraX + viewW + 40) continue;
    if (p.kind === 'ground') drawGround(ctx, p.x, p.y, p.w, p.h, b);
    else drawBrick(ctx, p.x, p.y, p.w, p.h, p.kind === 'block');
  }

  // Coins (spinning)
  for (const c of map.coins) {
    if (c.taken) continue;
    drawCoin(ctx, c.x, c.y, c.w, c.h, anim);
  }

  // ? -blocks
  for (const q of map.questionBlocks) {
    drawQBlock(ctx, q.x, q.y, q.w, q.h, q.hit, anim);
  }

  // Traps
  for (const t of map.traps) {
    if (t.kind === 'goomba') drawGoomba(ctx, t.x, t.y, t.w, t.h, anim);
    else drawSpike(ctx, t.x, t.y, t.w, t.h);
  }

  // Flag
  drawFlag(ctx, map.flag.x, map.flag.y, map.flag.h, world.color);

  // Player
  drawPlayer(ctx, player, anim);

  ctx.restore();

  // --- Vignette (realism / depth) -------------------------------------------
  const vig = ctx.createRadialGradient(
    viewW / 2, viewH / 2, viewH * 0.4,
    viewW / 2, viewH / 2, viewH * 0.9,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, viewW, viewH);
}

// --- Individual sprite painters ---------------------------------------------

function drawHills(
  ctx: CanvasRenderingContext2D, offset: number, map: LevelMap,
  viewW: number, color: string, amp: number,
) {
  const baseY = map.groundY;
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  const step = 60;
  for (let x = -offset % (step * 4) - step * 4; x < viewW + step; x += step) {
    const y = baseY - (Math.sin((x + offset) * 0.01) * 0.5 + 0.5) * amp;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(viewW, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + w * 0.4);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(1, 'rgba(220,235,255,0.75)');
  ctx.fillStyle = g;
  const r = w * 0.22;
  [[0, 0], [r, -r * 0.5], [r * 2, 0], [r * 2.6, r * 0.3], [r * 0.6, r * 0.4]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawHill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.quadraticCurveTo(x + w / 2, y - h * 0.3, x + w, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number, h: number) {
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#5fd36a');
  g.addColorStop(1, '#2f9e3f');
  ctx.fillStyle = g;
  const r = h;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + r * i + r / 2, y + h, r * 0.8, Math.PI, 0);
    ctx.fill();
  }
  ctx.restore();
}

function drawPipe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  const body = ctx.createLinearGradient(x, 0, x + w, 0);
  body.addColorStop(0, '#1f8f2f');
  body.addColorStop(0.4, '#57e06b');
  body.addColorStop(0.6, '#57e06b');
  body.addColorStop(1, '#0f6a1e');
  ctx.fillStyle = body;
  rr(ctx, x + 6, y + 22, w - 12, h - 22, 4);
  ctx.fill();
  // rim
  rr(ctx, x, y, w, 24, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // gloss
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x + 12, y + 26, 6, h - 30);
  ctx.restore();
}

function drawStalactite(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#3a4f8f');
  g.addColorStop(1, '#10173a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCrystal(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, glow: string) {
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 16;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, glow);
  g.addColorStop(1, '#0ea5b7');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h * 0.6);
  ctx.lineTo(x + w / 2, y + h);
  ctx.lineTo(x, y + h * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGround(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, b: World['biome']) {
  ctx.save();
  // Grass/soil top strip
  const top = ctx.createLinearGradient(0, y, 0, y + 16);
  const isCave = b.ground === '#1a2547';
  top.addColorStop(0, isCave ? '#2d3f8f' : '#5fd36a');
  top.addColorStop(1, isCave ? '#1a2547' : '#3d9e42');
  ctx.fillStyle = top;
  ctx.fillRect(x, y, w, 16);
  // Soil body
  const body = ctx.createLinearGradient(0, y + 16, 0, y + h);
  body.addColorStop(0, b.ground);
  body.addColorStop(1, b.groundDark);
  ctx.fillStyle = body;
  ctx.fillRect(x, y + 16, w, h - 16);
  // Brick seams for texture
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  for (let bx = x; bx < x + w; bx += 48) {
    ctx.strokeRect(bx, y + 16, 48, (h - 16) / 2);
    ctx.strokeRect(bx + 24, y + 16 + (h - 16) / 2, 48, (h - 16) / 2);
  }
  ctx.restore();
}

function drawBrick(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, block: boolean) {
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  if (block) {
    g.addColorStop(0, '#e8b45a');
    g.addColorStop(1, '#b07a1e');
  } else {
    g.addColorStop(0, '#c96b3a');
    g.addColorStop(1, '#8f421e');
  }
  ctx.fillStyle = g;
  rr(ctx, x + 1, y + 1, w - 2, h - 2, 4);
  ctx.fill();
  // top gloss
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x + 4, y + 3, w - 8, 4);
  // seam
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.restore();
}

function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, anim: number) {
  ctx.save();
  const sx = Math.abs(Math.sin(anim * 4 + x)); // spin
  const cx = x + w / 2;
  ctx.translate(cx, y + h / 2);
  ctx.scale(sx * 0.9 + 0.1, 1);
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, w / 2);
  g.addColorStop(0, '#fff6c0');
  g.addColorStop(0.6, '#ffd23f');
  g.addColorStop(1, '#c68a10');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a5e08';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawQBlock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, hit: boolean, anim: number) {
  ctx.save();
  const bob = hit ? 0 : Math.sin(anim * 3 + x) * 2;
  const yy = y + bob;
  const g = ctx.createLinearGradient(0, yy, 0, yy + h);
  if (hit) {
    g.addColorStop(0, '#9a7b3a');
    g.addColorStop(1, '#6b531e');
  } else {
    g.addColorStop(0, '#ffcf5a');
    g.addColorStop(1, '#e08a1e');
  }
  ctx.fillStyle = g;
  rr(ctx, x + 1, yy + 1, w - 2, h - 2, 5);
  ctx.fill();
  // rivets
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  [[6, 6], [w - 8, 6], [6, h - 8], [w - 8, h - 8]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx, yy + dy, 1.6, 0, Math.PI * 2);
    ctx.fill();
  });
  if (!hit) {
    ctx.fillStyle = '#5a3a06';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x + w / 2, yy + h / 2 + 1);
  }
  ctx.restore();
}

function drawGoomba(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, anim: number) {
  ctx.save();
  const wob = Math.sin(anim * 6 + x) * 2;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 4, w / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // body (a grumpy bug)
  const g = ctx.createRadialGradient(x + w / 2, y + h * 0.4, 3, x + w / 2, y + h * 0.6, w / 1.4);
  g.addColorStop(0, '#a9662f');
  g.addColorStop(1, '#5e3413');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2 + wob, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // angry eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x + w * 0.35, y + h * 0.45 + wob, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w * 0.65, y + h * 0.45 + wob, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(x + w * 0.37, y + h * 0.47 + wob, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w * 0.67, y + h * 0.47 + wob, 1.8, 0, Math.PI * 2); ctx.fill();
  // angry brows
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.28, y + h * 0.34 + wob); ctx.lineTo(x + w * 0.44, y + h * 0.42 + wob);
  ctx.moveTo(x + w * 0.72, y + h * 0.34 + wob); ctx.lineTo(x + w * 0.56, y + h * 0.42 + wob);
  ctx.stroke();
  ctx.restore();
}

function drawSpike(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  const n = Math.max(2, Math.floor(w / 12));
  const sw = w / n;
  for (let i = 0; i < n; i++) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#e6edf5');
    g.addColorStop(1, '#8494a8');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x + i * sw, y + h);
    ctx.lineTo(x + i * sw + sw / 2, y);
    ctx.lineTo(x + i * sw + sw, y + h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawFlag(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, color: string) {
  ctx.save();
  // pole
  const g = ctx.createLinearGradient(x, 0, x + 8, 0);
  g.addColorStop(0, '#d0d6e0');
  g.addColorStop(0.5, '#fff');
  g.addColorStop(1, '#9aa4b2');
  ctx.fillStyle = g;
  rr(ctx, x, y, 8, h, 3);
  ctx.fill();
  // ball on top
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + 4, y - 4, 8, 0, Math.PI * 2);
  ctx.fill();
  // flag
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 8);
  ctx.lineTo(x + 66, y + 22);
  ctx.lineTo(x + 8, y + 36);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('★', x + 30, y + 27);
  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: PlayerLike, anim: number) {
  ctx.save();
  const squash = p.bounceTimer > 0 ? 0.8 : p.onGround ? 1 : 1.06;
  const cx = p.x + p.w / 2;
  const feet = p.y + p.h;

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(cx, feet + 3, p.w / 2, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(cx, feet);
  ctx.scale(p.facing, 1);
  ctx.translate(-p.w / 2, -p.h * squash);
  const w = p.w;
  const h = p.h * squash;

  // legs (running animation)
  const legSwing = p.onGround && Math.abs(p.vx) > 5 ? Math.sin(anim * 14) * 4 : 0;
  ctx.fillStyle = '#1b2a5e';
  rr(ctx, w * 0.2, h * 0.7, w * 0.25, h * 0.3 + legSwing, 3); ctx.fill();
  rr(ctx, w * 0.55, h * 0.7, w * 0.25, h * 0.3 - legSwing, 3); ctx.fill();

  // body (a friendly astronaut-dev in a cyan suit)
  const body = ctx.createLinearGradient(0, 0, w, 0);
  body.addColorStop(0, '#0e7490');
  body.addColorStop(0.5, '#22d3ee');
  body.addColorStop(1, '#0e7490');
  ctx.fillStyle = body;
  rr(ctx, w * 0.15, h * 0.35, w * 0.7, h * 0.42, 6); ctx.fill();

  // chest emblem
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.55, w * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // helmet / head
  const head = ctx.createRadialGradient(w * 0.45, h * 0.18, 2, w * 0.5, h * 0.22, w * 0.4);
  head.addColorStop(0, '#ffffff');
  head.addColorStop(1, '#bfe6ff');
  ctx.fillStyle = head;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.22, w * 0.32, 0, Math.PI * 2);
  ctx.fill();
  // visor
  ctx.fillStyle = 'rgba(10,20,40,0.85)';
  rr(ctx, w * 0.32, h * 0.14, w * 0.4, h * 0.16, 6); ctx.fill();
  // visor glint
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  rr(ctx, w * 0.36, h * 0.16, w * 0.1, h * 0.05, 2); ctx.fill();

  ctx.restore();
}
