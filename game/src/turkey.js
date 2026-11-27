// The player turkey: run, sprint, jump, duck, hide in haystacks.
// Hiding makes the turkey invisible to the farmer but it cannot move;
// sprinting is fast but loud. Three lives; a hit knocks a feather loose
// and grants brief invincibility so escapes stay fair.
import { TURKEY, VIEW } from './config.js';

export function createTurkey(startX) {
  return {
    x: startX,
    y: VIEW.groundY,
    vx: 0,
    vy: 0,
    width: TURKEY.width,
    height: TURKEY.height,
    facing: 1,
    grounded: true,
    ducking: false,
    sprinting: false,
    hidden: false,
    lives: TURKEY.lives,
    invincible: 0,
    runPhase: 0,
    featherBurst: 0,
    update(dt, input, world) {
      this.invincible = Math.max(0, this.invincible - dt);
      this.featherBurst = Math.max(0, this.featherBurst - dt * 2);

      const wantsHide = input.hidePressed() && this.grounded;
      if (wantsHide) {
        if (this.hidden) {
          this.hidden = false;
        } else if (world.nearHaystack(this.x)) {
          this.hidden = true;
          this.vx = 0;
          return 'hid';
        }
      }
      if (this.hidden) {
        if (input.left || input.right || input.jumpPressed()) this.hidden = false;
        else { this.runPhase += dt * 2; return null; }
      }

      this.sprinting = input.sprint && (input.left || input.right);
      const speed = this.sprinting ? TURKEY.sprintSpeed : TURKEY.runSpeed;
      let move = 0;
      if (input.left) move -= 1;
      if (input.right) move += 1;
      this.ducking = input.duck && this.grounded;
      this.height = this.ducking ? TURKEY.duckHeight : TURKEY.height;

      if (move !== 0) this.facing = move;
      const targetVx = this.ducking ? 0 : move * speed;
      const accel = this.grounded ? 2600 : 1400;
      if (this.vx < targetVx) this.vx = Math.min(targetVx, this.vx + accel * dt);
      else this.vx = Math.max(targetVx, this.vx - accel * dt);

      let event = null;
      if (input.jumpPressed() && this.grounded && !this.ducking) {
        this.vy = TURKEY.jumpVelocity;
        this.grounded = false;
        event = 'jump';
      }

      this.vy += TURKEY.gravity * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.y >= VIEW.groundY) {
        if (!this.grounded) event = event || 'land';
        this.y = VIEW.groundY;
        this.vy = 0;
        this.grounded = true;
      }
      this.x = Math.max(40, Math.min(VIEW.width - 40, this.x));
      this.runPhase += Math.abs(this.vx) * dt * 0.05;
      return event;
    },
    hurt() {
      if (this.invincible > 0 || this.hidden) return false;
      this.lives -= 1;
      this.invincible = TURKEY.invincibleSeconds;
      this.featherBurst = 1;
      this.vy = -320;
      this.grounded = false;
      return true;
    },
    bounds() {
      return {
        left: this.x - this.width / 2,
        right: this.x + this.width / 2,
        top: this.y - this.height,
        bottom: this.y,
      };
    },
  };
}
