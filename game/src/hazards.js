// Hazards and pickups that scroll in from the right.
//  fence / pumpkin / cart — jump them (or duck under the cart's load).
//  knifeDrop — a carving knife falls from above with a warning glint.
//  knifeThrow — the farmer hurls a knife along the ground line; jump it.
//  oven — the kitchen stove: its door swings open and breathes fire;
//         time your run between blasts or leap the flames.
//  corn / goldenCorn — score pickups.  haystack — a hiding place.
import { VIEW } from './config.js';

let nextId = 1;

export function makeHazard(kind, x) {
  const base = { id: nextId++, kind, x, passed: false, hitDone: false, t: Math.random() * 10 };
  if (kind === 'fence') return { ...base, w: 54, h: 58, y: VIEW.groundY };
  if (kind === 'pumpkin') return { ...base, w: 46, h: 40, y: VIEW.groundY };
  if (kind === 'cart') return { ...base, w: 84, h: 66, y: VIEW.groundY };
  if (kind === 'knifeDrop') return { ...base, w: 20, h: 56, y: -70, vy: 0, state: 'warn', warnT: 0.55 };
  if (kind === 'knifeThrow') return { ...base, w: 52, h: 16, y: VIEW.groundY - 26, vx: -430, spin: 0 };
  if (kind === 'oven') return { ...base, w: 96, h: 104, y: VIEW.groundY, flameT: 0, flameOn: false };
  return base;
}

export function makePickup(kind, x, y) {
  return { id: nextId++, kind, x, y: y ?? (VIEW.groundY - 34), taken: false, t: Math.random() * 10 };
}

export function makeHaystack(x) {
  return { id: nextId++, kind: 'haystack', x, w: 92, h: 64, y: VIEW.groundY };
}

export function hazardBounds(h) {
  if (h.kind === 'knifeDrop') return { left: h.x - 8, right: h.x + 8, top: h.y, bottom: h.y + h.h };
  if (h.kind === 'knifeThrow') return { left: h.x - 24, right: h.x + 24, top: h.y - 8, bottom: h.y + 8 };
  if (h.kind === 'oven') {
    // The oven body is solid scenery; only its flame blast hurts.
    if (!h.flameOn) return null;
    return { left: h.x - 70, right: h.x + 6, top: h.y - 92, bottom: h.y };
  }
  return { left: h.x - h.w / 2, right: h.x + h.w / 2, top: h.y - h.h, bottom: h.y };
}

export function updateHazard(h, dt, scrollSpeed) {
  h.t += dt;
  h.x -= scrollSpeed * dt;
  if (h.kind === 'knifeDrop') {
    if (h.state === 'warn') {
      h.warnT -= dt;
      if (h.warnT <= 0) h.state = 'fall';
    } else if (h.state === 'fall') {
      h.vy += 2600 * dt;
      h.y += h.vy * dt;
      if (h.y >= VIEW.groundY - h.h) { h.y = VIEW.groundY - h.h; h.state = 'stuck'; h.stuckT = 0.9; }
    } else if (h.state === 'stuck') {
      h.stuckT -= dt;
      if (h.stuckT <= 0) h.dead = true;
    }
  } else if (h.kind === 'knifeThrow') {
    h.spin += dt * 14;
    h.x += h.vx * dt;
  } else if (h.kind === 'oven') {
    h.flameT += dt;
    const cycle = h.flameT % 2.6;
    h.flameOn = cycle > 1.5 && cycle < 2.4;
  }
  if (h.x < -160) h.dead = true;
}

export function overlaps(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
