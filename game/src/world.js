// The scrolling world: distance, stage progression, spawning hazards,
// corn and haystacks, collisions, score, and win/lose detection.
import { ESCAPE_DISTANCE, PIXELS_PER_METRE, SCORING, VIEW } from './config.js';
import { stageAt, stageIndexAt } from './levels.js';
import { makeHazard, makePickup, makeHaystack, hazardBounds, updateHazard, overlaps } from './hazards.js';

function rand(rng, min, max) { return min + rng() * (max - min); }

export function createWorld(rng) {
  return {
    distancePx: 0,
    score: 0,
    cornEaten: 0,
    nearMisses: 0,
    hidesUsed: 0,
    hazards: [],
    pickups: [],
    haystacks: [],
    nextHazardIn: 420,
    nextCornIn: 300,
    nextHayIn: 700,
    stageIdx: 0,
    stageJustChanged: false,
    escaped: false,

    get distanceMetres() { return this.distancePx / PIXELS_PER_METRE; },
    get stage() { return stageAt(this.distanceMetres); },

    nearHaystack(x) {
      return this.haystacks.some((h) => Math.abs(h.x - x) < h.w / 2 + 14);
    },

    update(dt, turkey, farmer, scrollSpeed, events) {
      this.stageJustChanged = false;
      this.distancePx += scrollSpeed * dt;
      const metres = this.distanceMetres;
      this.score += SCORING.perMetre * (scrollSpeed * dt / PIXELS_PER_METRE);

      const idx = stageIndexAt(metres);
      if (idx !== this.stageIdx) {
        this.stageIdx = idx;
        this.stageJustChanged = true;
        this.score += SCORING.stageClear;
        events.push('stage');
      }
      if (metres >= ESCAPE_DISTANCE) {
        this.escaped = true;
        this.score += SCORING.escapeBonus;
        events.push('escaped');
        return;
      }

      const stage = this.stage;
      // Spawning
      this.nextHazardIn -= scrollSpeed * dt;
      if (this.nextHazardIn <= 0) {
        const kind = stage.hazards[Math.floor(rng() * stage.hazards.length)];
        const x = VIEW.width + 90;
        this.hazards.push(makeHazard(kind, kind === 'knifeThrow' ? x + 160 : x));
        if (kind === 'knifeDrop' || kind === 'knifeThrow') events.push('knife');
        if (kind === 'oven') events.push('oven');
        this.nextHazardIn = rand(rng, stage.hazardEvery[0], stage.hazardEvery[1]);
      }
      this.nextCornIn -= scrollSpeed * dt;
      if (this.nextCornIn <= 0) {
        const golden = rng() < 0.12;
        const high = rng() < 0.35;
        this.pickups.push(makePickup(golden ? 'goldenCorn' : 'corn', VIEW.width + 60, high ? VIEW.groundY - 130 : VIEW.groundY - 34));
        this.nextCornIn = rand(rng, stage.cornEvery[0], stage.cornEvery[1]);
      }
      this.nextHayIn -= scrollSpeed * dt;
      if (this.nextHayIn <= 0) {
        this.haystacks.push(makeHaystack(VIEW.width + 80));
        this.nextHayIn = rand(rng, stage.hayEvery[0], stage.hayEvery[1]);
      }

      // Hazards
      const tb = turkey.bounds();
      for (const h of this.hazards) {
        updateHazard(h, dt, scrollSpeed);
        const hb = hazardBounds(h);
        if (hb && !h.hitDone && overlaps(tb, hb)) {
          if (turkey.hurt()) { h.hitDone = true; events.push('hurt'); }
        }
        if (!h.passed && h.x < turkey.x - 30) {
          h.passed = true;
          if (!h.hitDone && turkey.invincible <= 0) {
            // A clean pass close to danger earns a near-miss bonus.
            this.score += SCORING.nearMiss;
            this.nearMisses += 1;
          }
        }
      }
      this.hazards = this.hazards.filter((h) => !h.dead);

      // Pickups
      for (const p of this.pickups) {
        p.t += dt;
        p.x -= scrollSpeed * dt;
        if (!p.taken && Math.abs(p.x - turkey.x) < 34 && Math.abs(p.y - (turkey.y - turkey.height / 2)) < 52) {
          p.taken = true;
          this.cornEaten += 1;
          if (p.kind === 'goldenCorn') { this.score += SCORING.goldenCorn; events.push('golden'); }
          else { this.score += SCORING.corn; events.push('corn'); }
        }
      }
      this.pickups = this.pickups.filter((p) => !p.taken && p.x > -80);

      for (const h of this.haystacks) h.x -= scrollSpeed * dt;
      this.haystacks = this.haystacks.filter((h) => h.x > -140);

      // Farmer catch
      if (farmer.caughtTurkey(turkey)) events.push('caught');
    },
  };
}
