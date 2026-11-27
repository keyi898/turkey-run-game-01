// Gobble Dash — boot, screen state machine and the main loop.
// Screens: title → play (3 stages) → end (escaped / caught) → title.
// The world scrolls while the turkey runs right; the farmer hunts on the
// same screen, so every chase, search and corner is visible at a glance.
import { ESCAPE_DISTANCE, PIXELS_PER_METRE, SCORING, VIEW } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createTurkey } from './turkey.js';
import { createFarmer, FarmerState } from './farmer-ai.js';
import { createWorld } from './world.js';
import { makeHazard, makePickup, makeHaystack } from './hazards.js';
import {
  drawBackground, drawTurkey, drawFarmer, drawHazard, drawPickup, drawHaystack, drawFreedomGate,
} from './render.js';
import { drawHud, drawTitle, drawPaused, drawEnd } from './hud.js';
import { shotMode, mulberry32 } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const input = createInput(canvas);
const audio = createAudio();

const shot = shotMode();
const rng = shot ? mulberry32(shot.seed) : Math.random;

const Screen = { TITLE: 'title', PLAY: 'play', PAUSED: 'paused', END: 'end' };

function freshRun() {
  return {
    screen: Screen.TITLE,
    turkey: createTurkey(240),
    farmer: createFarmer(90),
    world: createWorld(rng),
    scrollX: 0,
    time: 0,
    bannerT: 0,
    popups: [],
    escaped: false,
    caughtBy: 'farmer',
    bestScore: Number(localStorage.getItem('gobble-dash-best') || 0),
    muted: false,
    idleScroll: 0,
  };
}

let game = freshRun();

function announce(message) {
  if (statusEl) statusEl.textContent = message;
}

function popup(x, y, text, color) {
  game.popups.push({ x, y, text, color, t: 1 });
}

function startRun() {
  const best = game.bestScore;
  const muted = game.muted;
  game = freshRun();
  game.bestScore = best;
  game.muted = muted;
  game.screen = Screen.PLAY;
  game.bannerT = 3.2;
  audio.unlock();
  audio.gobble();
  audio.startMusic();
  announce('Run! The farmer is coming. Reach the Freedom Gate at 1500 metres.');
}

function endRun(escaped, caughtBy) {
  game.screen = Screen.END;
  game.escaped = escaped;
  game.caughtBy = caughtBy;
  audio.stopMusic();
  if (escaped) audio.escaped(); else audio.caught();
  if (game.world.score > game.bestScore) {
    game.bestScore = game.world.score;
    try { localStorage.setItem('gobble-dash-best', String(Math.floor(game.bestScore))); } catch { /* private mode */ }
  }
  announce(escaped ? 'You escaped! Press Enter to run again.' : 'Caught! Press Enter to try again.');
}

function handleEvents(events) {
  for (const ev of events) {
    if (ev === 'hurt') {
      audio.hurt();
      audio.gobble();
      popup(game.turkey.x, game.turkey.y - 80, 'OUCH! -1 LIFE', '#ff6b5e');
      if (game.turkey.lives <= 0) endRun(false, 'hits');
    } else if (ev === 'corn') {
      audio.corn();
      popup(game.turkey.x, game.turkey.y - 70, `+${SCORING.corn}`, '#ffd23e');
    } else if (ev === 'golden') {
      audio.goldenCorn();
      popup(game.turkey.x, game.turkey.y - 70, `GOLDEN! +${SCORING.goldenCorn}`, '#ffb703');
    } else if (ev === 'stage') {
      audio.stageClear();
      game.bannerT = 3.2;
      announce(game.world.stage.name + '. ' + game.world.stage.blurb);
    } else if (ev === 'knife') {
      audio.knifeWhoosh();
    } else if (ev === 'oven') {
      audio.ovenHiss();
    } else if (ev === 'caught') {
      endRun(false, 'farmer');
    } else if (ev === 'escaped') {
      endRun(true, 'none');
    }
  }
}

function updatePlay(dt) {
  const events = [];
  const turkeyEvent = game.turkey.update(dt, input, game.world);
  if (turkeyEvent === 'jump') audio.jump();
  else if (turkeyEvent === 'land') audio.land();
  else if (turkeyEvent === 'hid') {
    audio.hide();
    game.world.hidesUsed += 1;
    game.world.score += SCORING.hideBonus;
    popup(game.turkey.x, game.turkey.y - 80, `HIDDEN +${SCORING.hideBonus}`, '#a8d8a8');
  }

  // The world scrolls with the turkey's rightward run; standing still
  // still creeps forward slowly so the farmer stays a threat.
  const scrollSpeed = Math.max(60, game.turkey.vx) + (game.turkey.hidden ? 0 : 40);
  game.scrollX += scrollSpeed * dt;

  const prevAlert = game.farmer.alertLevel;
  game.farmer.update(dt, game.turkey, game.world.stage, rng);
  if (game.farmer.justSpotted) {
    audio.spotted();
    audio.farmerShout();
    popup(game.farmer.x, game.farmer.y - 150, 'SPOTTED!', '#ff6b5e');
  } else if (game.farmer.justLost) {
    popup(game.farmer.x, game.farmer.y - 150, 'Lost him…', '#ffd23e');
  } else if (prevAlert < 0.5 && game.farmer.alertLevel >= 0.5) {
    audio.spotted();
  }

  game.world.update(dt, game.turkey, game.farmer, scrollSpeed, events);
  handleEvents(events);

  game.bannerT = Math.max(0, game.bannerT - dt);
  for (const pop of game.popups) pop.t -= dt * 0.9;
  game.popups = game.popups.filter((p) => p.t > 0);
}

function drawWorld() {
  const { world, turkey, farmer } = game;
  drawBackground(ctx, world.stage, game.scrollX, game.time);
  for (const h of world.haystacks) {
    drawHaystack(ctx, h, turkey.hidden && Math.abs(h.x - turkey.x) < h.w / 2 + 14);
  }
  for (const p of world.pickups) drawPickup(ctx, p, game.time);
  for (const h of world.hazards) drawHazard(ctx, h, game.time);
  // Freedom gate slides in during the final stretch.
  const remainingPx = (ESCAPE_DISTANCE - world.distanceMetres) * PIXELS_PER_METRE;
  if (remainingPx < VIEW.width) {
    drawFreedomGate(ctx, turkey.x + remainingPx, game.time);
  }
  drawFarmer(ctx, farmer, game.time);
  drawTurkey(ctx, turkey, game.time);
}

function draw() {
  if (game.screen === Screen.TITLE) {
    // Attract mode: the farm scrolls by behind the title panel.
    drawBackground(ctx, game.world.stage, game.idleScroll, game.time);
    drawHaystack(ctx, { x: 150, w: 92, h: 64, y: VIEW.groundY }, false);
    drawFarmer(ctx, { ...game.farmer, x: 872, state: FarmerState.PATROL, alertLevel: 0, stepPhase: game.time * 3 }, game.time);
    drawTurkey(ctx, { ...game.turkey, x: 92, runPhase: game.time * 6, sprinting: false }, game.time);
    drawTitle(ctx, game, game.time);
  } else {
    drawWorld();
    drawHud(ctx, game);
    if (game.screen === Screen.PAUSED) drawPaused(ctx);
    if (game.screen === Screen.END) drawEnd(ctx, game, game.escaped, game.time);
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.time += dt;

  if (game.screen === Screen.TITLE) {
    game.idleScroll += 40 * dt;
    if (input.confirmPressed()) { audio.click(); startRun(); }
  } else if (game.screen === Screen.PLAY) {
    if (input.pausePressed()) {
      game.screen = Screen.PAUSED;
      audio.stopMusic();
    } else {
      updatePlay(dt);
    }
  } else if (game.screen === Screen.PAUSED) {
    if (input.pausePressed() || input.confirmPressed()) {
      game.screen = Screen.PLAY;
      audio.startMusic();
    }
  } else if (game.screen === Screen.END) {
    if (input.confirmPressed()) { audio.click(); startRun(); }
  }

  draw();
  input.endFrame();
  requestAnimationFrame(frame);
}

// --- Screenshot staging (?shot=...) -------------------------------------
function stageShot() {
  game = freshRun();
  game.time = 3.2;
  if (shot.shot === 'title') {
    game.screen = Screen.TITLE;
    game.idleScroll = 260;
    game.bestScore = 4250;
  } else if (shot.shot === 'play') {
    game.screen = Screen.PLAY;
    game.turkey.x = 470;
    game.turkey.runPhase = 4.2;
    game.farmer.x = 210;
    game.farmer.state = FarmerState.CHASE;
    game.farmer.alertLevel = 1;
    game.farmer.stepPhase = 5.1;
    game.world.distancePx = 320 * PIXELS_PER_METRE;
    game.world.score = 1840;
    game.world.cornEaten = 7;
    game.world.hazards.push(makeHazard('fence', 700), makeHazard('knifeDrop', 560));
    game.world.hazards[1].state = 'fall'; game.world.hazards[1].y = 180;
    game.world.pickups.push(makePickup('corn', 610, VIEW.groundY - 120), makePickup('goldenCorn', 800, VIEW.groundY - 34));
    game.world.haystacks.push(makeHaystack(880));
    game.bannerT = 0;
    popup(470, 360, '+25', '#ffd23e');
  } else if (shot.shot === 'kitchen') {
    game.screen = Screen.PLAY;
    game.turkey.x = 380;
    game.turkey.y = VIEW.groundY - 120;
    game.turkey.grounded = false;
    game.turkey.runPhase = 2.4;
    game.farmer.x = 150;
    game.farmer.state = FarmerState.SEARCH;
    game.farmer.alertLevel = 0.4;
    game.farmer.stepPhase = 3.3;
    game.world.distancePx = 1180 * PIXELS_PER_METRE;
    game.world.score = 5120;
    game.world.cornEaten = 19;
    game.world.stageIdx = 2;
    const oven = makeHazard('oven', 640);
    oven.flameOn = true; oven.flameT = 1.9;
    const knife = makeHazard('knifeThrow', 520);
    knife.spin = 0.8;
    game.world.hazards.push(oven, knife);
    game.world.pickups.push(makePickup('corn', 760, VIEW.groundY - 34));
    game.world.haystacks.push(makeHaystack(860));
  } else if (shot.shot === 'end') {
    game.screen = Screen.END;
    game.escaped = true;
    game.turkey.x = 560;
    game.farmer.x = 180;
    game.farmer.state = FarmerState.SEARCH;
    game.world.distancePx = ESCAPE_DISTANCE * PIXELS_PER_METRE;
    game.world.score = 8940;
    game.world.cornEaten = 31;
    game.world.nearMisses = 14;
    game.world.hidesUsed = 4;
    game.bestScore = 8940;
  }
  draw();
  // Signal for headless screenshot tooling that the frame is ready.
  document.title = 'SHOT-READY';
  window.__shotReady = true;
}

if (shot) {
  stageShot();
} else {
  requestAnimationFrame(frame);
}
