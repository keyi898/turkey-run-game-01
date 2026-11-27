// HUD and menu screens: title, pause, stage banner, caught / escaped endings.
// Everything is drawn on the canvas so screenshots show the real game UI.
import { ESCAPE_DISTANCE, PALETTE, VIEW } from './config.js';
import { FarmerState } from './farmer-ai.js';

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(43,21,3,0.82)';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill();
  ctx.strokeStyle = '#e8b34b'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.stroke();
}

function text(ctx, str, x, y, size, color, weight) {
  ctx.fillStyle = color || PALETTE.cream;
  ctx.font = `${weight || 'bold'} ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(str, x, y);
}

export function drawHud(ctx, game) {
  const { turkey, farmer, world } = game;
  // Top bar
  ctx.fillStyle = 'rgba(43,21,3,0.55)';
  ctx.fillRect(0, 0, VIEW.width, 52);

  text(ctx, `SCORE ${Math.floor(world.score)}`, 110, 34, 22, PALETTE.cream);
  text(ctx, `${Math.floor(world.distanceMetres)} m / ${ESCAPE_DISTANCE} m`, VIEW.width / 2, 34, 22, '#ffd23e');

  // Lives as little turkey feathers
  for (let i = 0; i < 3; i++) {
    const x = VIEW.width - 130 + i * 36;
    ctx.fillStyle = i < turkey.lives ? '#e6392b' : 'rgba(255,243,214,0.25)';
    ctx.beginPath();
    ctx.moveTo(x, 36);
    ctx.bezierCurveTo(x - 11, 24, x - 6, 12, x, 18);
    ctx.bezierCurveTo(x + 6, 12, x + 11, 24, x, 36);
    ctx.fill();
  }
  text(ctx, 'LIVES', VIEW.width - 176, 34, 15, PALETTE.cream);

  // Progress bar to freedom
  const prog = Math.min(1, world.distanceMetres / ESCAPE_DISTANCE);
  ctx.fillStyle = 'rgba(255,243,214,0.25)';
  ctx.beginPath(); ctx.roundRect(280, 42, 400, 6, 3); ctx.fill();
  ctx.fillStyle = '#4caf50';
  ctx.beginPath(); ctx.roundRect(280, 42, 400 * prog, 6, 3); ctx.fill();

  // Farmer alert meter
  const alert = farmer.alertLevel;
  ctx.fillStyle = 'rgba(43,21,3,0.55)';
  ctx.beginPath(); ctx.roundRect(14, 62, 190, 30, 8); ctx.fill();
  const label = farmer.state === FarmerState.CHASE || farmer.state === FarmerState.CORNER
    ? 'FARMER: CHASING!'
    : farmer.state === FarmerState.SEARCH ? 'FARMER: SEARCHING…' : 'FARMER: CALM';
  const color = farmer.state === FarmerState.CHASE || farmer.state === FarmerState.CORNER
    ? '#ff6b5e' : farmer.state === FarmerState.SEARCH ? '#ffd23e' : '#a8d8a8';
  ctx.fillStyle = color;
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, 24, 82);
  ctx.fillStyle = 'rgba(255,243,214,0.25)';
  ctx.fillRect(24, 86, 170, 4);
  ctx.fillStyle = color;
  ctx.fillRect(24, 86, 170 * alert, 4);

  // Corn count
  ctx.fillStyle = 'rgba(43,21,3,0.55)';
  ctx.beginPath(); ctx.roundRect(VIEW.width - 150, 62, 136, 30, 8); ctx.fill();
  text(ctx, `CORN × ${world.cornEaten}`, VIEW.width - 82, 82, 15, '#ffd23e');

  // Hidden indicator
  if (turkey.hidden) {
    text(ctx, 'HIDDEN IN THE HAY — stay still!', VIEW.width / 2, 84, 17, '#a8d8a8');
  }

  // Stage banner
  if (game.bannerT > 0) {
    const alpha = Math.min(1, game.bannerT);
    ctx.globalAlpha = alpha;
    panel(ctx, VIEW.width / 2 - 280, 108, 560, 86);
    text(ctx, world.stage.name, VIEW.width / 2, 144, 27, '#ffd23e');
    text(ctx, world.stage.blurb, VIEW.width / 2, 172, 16, PALETTE.cream, 'normal');
    ctx.globalAlpha = 1;
  }

  // Floating score popups
  for (const pop of game.popups) {
    ctx.globalAlpha = Math.max(0, pop.t);
    text(ctx, pop.text, pop.x, pop.y - (1 - pop.t) * 36, 18, pop.color);
  }
  ctx.globalAlpha = 1;
}

export function drawTitle(ctx, game, time) {
  ctx.fillStyle = 'rgba(43,21,3,0.45)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  panel(ctx, VIEW.width / 2 - 340, 52, 680, 400);

  text(ctx, 'GOBBLE DASH', VIEW.width / 2, 128, 58, '#ffd23e');
  text(ctx, 'THE GREAT THANKSGIVING ESCAPE', VIEW.width / 2, 162, 21, PALETTE.cream);
  text(ctx, 'It is the week before Thanksgiving. The farmer has a net,', VIEW.width / 2, 202, 17, PALETTE.cream, 'normal');
  text(ctx, 'a carving knife — and the oven is already lit.', VIEW.width / 2, 226, 17, PALETTE.cream, 'normal');
  text(ctx, 'Run 1,500 m through the farmyard, the barn and the kitchen', VIEW.width / 2, 256, 17, '#ffd23e', 'normal');
  text(ctx, 'to reach the Freedom Gate. Do not become dinner!', VIEW.width / 2, 280, 17, '#ffd23e', 'normal');

  const lines = [
    '← →  or  A D — run        SPACE / ↑ — jump        ↓ — duck',
    'SHIFT or hold mouse — sprint (fast but noisy!)',
    'H — hide in a haystack        P — pause        M — mute',
    'Grab corn for points. Three hits and you are caught!',
  ];
  lines.forEach((line, i) => text(ctx, line, VIEW.width / 2, 322 + i * 26, 16, PALETTE.cream, 'normal'));

  if (game.bestScore > 0) {
    text(ctx, `BEST SCORE: ${Math.floor(game.bestScore)}`, VIEW.width / 2, 436, 17, '#a8d8a8');
  }
  const blink = Math.floor(time * 2) % 2 === 0;
  if (blink) text(ctx, 'PRESS ENTER OR CLICK TO RUN!', VIEW.width / 2, 492, 24, '#ff9e57');
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(43,21,3,0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  panel(ctx, VIEW.width / 2 - 200, 190, 400, 150);
  text(ctx, 'PAUSED', VIEW.width / 2, 252, 38, '#ffd23e');
  text(ctx, 'Press P or click to keep running', VIEW.width / 2, 296, 17, PALETTE.cream, 'normal');
}

export function drawEnd(ctx, game, escaped, time) {
  ctx.fillStyle = escaped ? 'rgba(30,60,20,0.55)' : 'rgba(60,16,8,0.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  panel(ctx, VIEW.width / 2 - 320, 88, 640, 350);

  if (escaped) {
    text(ctx, 'YOU ESCAPED!', VIEW.width / 2, 158, 46, '#a8d8a8');
    text(ctx, 'Through the Freedom Gate and into the autumn woods.', VIEW.width / 2, 194, 18, PALETTE.cream, 'normal');
    text(ctx, 'The farmer eats pumpkin pie this year. Again.', VIEW.width / 2, 220, 18, PALETTE.cream, 'normal');
  } else {
    text(ctx, 'CAUGHT!', VIEW.width / 2, 158, 46, '#ff6b5e');
    text(ctx, game.caughtBy === 'farmer'
      ? 'The farmer netted you. The oven door creaks open…'
      : 'Too many close calls — the farmer scoops you up…', VIEW.width / 2, 194, 18, PALETTE.cream, 'normal');
    text(ctx, 'Thanksgiving dinner is saved. You are not.', VIEW.width / 2, 220, 18, PALETTE.cream, 'normal');
  }

  const rows = [
    ['Final score', `${Math.floor(game.world.score)}`],
    ['Distance run', `${Math.floor(game.world.distanceMetres)} m`],
    ['Corn gobbled', `${game.world.cornEaten}`],
    ['Near misses', `${game.world.nearMisses}`],
    ['Times hidden', `${game.world.hidesUsed}`],
    ['Best score', `${Math.floor(game.bestScore)}`],
  ];
  rows.forEach(([label, value], i) => {
    const y = 262 + i * 27;
    ctx.fillStyle = PALETTE.cream;
    ctx.font = '16px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(label, VIEW.width / 2 - 16, y);
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(value, VIEW.width / 2 + 16, y);
  });

  const blink = Math.floor(time * 2) % 2 === 0;
  if (blink) text(ctx, 'PRESS ENTER OR CLICK TO RUN AGAIN', VIEW.width / 2, 488, 22, '#ff9e57');
}
