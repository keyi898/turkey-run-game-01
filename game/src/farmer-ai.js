// Farmer brain: a small state machine.
//  PATROL  — wanders the yard, unaware.
//  CHASE   — saw the turkey (or heard a sprint): runs it down, net raised.
//  SEARCH  — lost sight (turkey hid in hay / ducked out of view): checks
//            haystacks and corners, slower and suspicious.
//  CORNER  — turkey is pinned near the left edge: he lunges.
// Hiding while unseen shakes him off; sprinting while hidden gives you away.
import { FARMER, VIEW } from './config.js';

export const FarmerState = { PATROL: 'patrol', CHASE: 'chase', SEARCH: 'search', CORNER: 'corner' };

export function createFarmer(startX) {
  return {
    x: startX,
    y: VIEW.groundY,
    vx: 0,
    facing: 1,
    state: FarmerState.PATROL,
    stateTime: 0,
    lastSeenX: startX,
    searchTargetX: startX,
    alertLevel: 0,        // 0 calm .. 1 certain
    netSwing: 0,
    stepPhase: 0,
    justSpotted: false,
    justLost: false,
    update(dt, turkey, stage, rng) {
      this.justSpotted = false;
      this.justLost = false;
      this.stateTime += dt;
      this.netSwing = Math.max(0, this.netSwing - dt * 3);

      const dx = turkey.x - this.x;
      const dist = Math.abs(dx);
      const turkeyVisible = !turkey.hidden && dist < FARMER.sightRange;
      const turkeyNoisy = turkey.sprinting && !turkey.hidden && dist < FARMER.sightRange * 1.5;
      const turkeySneaky = turkey.hidden && turkey.sprinting && dist < 140;

      // Perception
      if (turkeyVisible || turkeyNoisy || turkeySneaky) {
        const gain = turkeySneaky ? 0.5 : (dist < 200 ? 2.2 : 1.1);
        this.alertLevel = Math.min(1, this.alertLevel + gain * dt);
        this.lastSeenX = turkey.x;
      } else {
        this.alertLevel = Math.max(0, this.alertLevel - dt * 0.22);
      }

      const cornered = turkey.x < 150 && this.x < turkey.x + 260 && turkey.x > this.x - 60;

      // Transitions
      if (this.alertLevel >= 1 && this.state !== FarmerState.CHASE && this.state !== FarmerState.CORNER) {
        this.state = FarmerState.CHASE;
        this.stateTime = 0;
        this.justSpotted = true;
      } else if ((this.state === FarmerState.CHASE || this.state === FarmerState.CORNER) && this.alertLevel <= 0.05) {
        this.state = FarmerState.SEARCH;
        this.stateTime = 0;
        this.searchTargetX = this.lastSeenX;
        this.justLost = true;
      } else if (this.state === FarmerState.SEARCH && this.stateTime > FARMER.giveUpSeconds) {
        this.state = FarmerState.PATROL;
        this.stateTime = 0;
      }
      if (this.state === FarmerState.CHASE && cornered) this.state = FarmerState.CORNER;
      if (this.state === FarmerState.CORNER && !cornered) this.state = FarmerState.CHASE;

      // Movement per state
      const scale = stage.farmerSpeedScale;
      let targetSpeed = 0;
      let dir = this.facing;
      if (this.state === FarmerState.PATROL) {
        targetSpeed = FARMER.baseSpeed * 0.45 * scale;
        if (this.stateTime > 2.4) { this.facing *= -1; this.stateTime = 0; }
        dir = this.facing;
      } else if (this.state === FarmerState.CHASE) {
        targetSpeed = FARMER.sprintSpeed * scale;
        dir = Math.sign(dx) || 1;
      } else if (this.state === FarmerState.CORNER) {
        targetSpeed = FARMER.sprintSpeed * FARMER.cornerBoost * scale;
        dir = Math.sign(dx) || 1;
        if (dist < 90 && this.netSwing <= 0) this.netSwing = 1;
      } else if (this.state === FarmerState.SEARCH) {
        targetSpeed = FARMER.baseSpeed * 0.62 * scale;
        const toTarget = this.searchTargetX - this.x;
        if (Math.abs(toTarget) < 24) {
          // Poke around: pick a nearby spot to check next.
          this.searchTargetX = this.lastSeenX + (rng() * 2 - 1) * 220;
        }
        dir = Math.sign(toTarget) || this.facing;
      }

      this.facing = dir;
      const accel = 1400;
      const desired = dir * targetSpeed;
      if (this.vx < desired) this.vx = Math.min(desired, this.vx + accel * dt);
      else this.vx = Math.max(desired, this.vx - accel * dt);
      this.x += this.vx * dt;
      this.stepPhase += Math.abs(this.vx) * dt * 0.045;

      // Keep him in the world the camera can show.
      this.x = Math.max(30, Math.min(VIEW.width - 40, this.x));
    },
    caughtTurkey(turkey) {
      if (turkey.hidden) return false;
      const dx = Math.abs(turkey.x - this.x);
      const dy = Math.abs((turkey.y - turkey.height / 2) - (this.y - 40));
      return dx < FARMER.catchRadius && dy < 90;
    },
  };
}
