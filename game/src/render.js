// All drawing: autumn sky, rolling hills, barn, kitchen stove, the turkey,
// the farmer with his net, hazards (oven, carving knives, fences), corn,
// haystacks and little feather particles. Everything is canvas shapes —
// original art, no image files.
import { PALETTE, VIEW } from './config.js';
import { FarmerState } from './farmer-ai.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function drawBackground(ctx, stage, scrollX, time) {
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  sky.addColorStop(0, stage.sky[0]);
  sky.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  // Sun
  ctx.fillStyle = '#fff2b8';
  ctx.beginPath(); ctx.arc(820, 84, 42, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,242,184,0.35)';
  ctx.beginPath(); ctx.arc(820, 84, 62, 0, Math.PI * 2); ctx.fill();

  // Clouds drifting
  ctx.fillStyle = 'rgba(255,244,220,0.85)';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 280 - scrollX * 0.12 + time * 4) % 1200 + 1200) % 1200 - 120;
    const cy = 56 + (i % 2) * 34;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 52, 17, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 34, cy + 5, 38, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Far hills
  ctx.fillStyle = PALETTE.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, 340);
  for (let x = 0; x <= VIEW.width; x += 40) {
    ctx.lineTo(x, 330 - Math.sin((x + scrollX * 0.3) * 0.008) * 42);
  }
  ctx.lineTo(VIEW.width, VIEW.groundY); ctx.lineTo(0, VIEW.groundY);
  ctx.fill();

  // Near hills
  ctx.fillStyle = PALETTE.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, 400);
  for (let x = 0; x <= VIEW.width; x += 40) {
    ctx.lineTo(x, 396 - Math.sin((x + scrollX * 0.55) * 0.011 + 2) * 30);
  }
  ctx.lineTo(VIEW.width, VIEW.groundY); ctx.lineTo(0, VIEW.groundY);
  ctx.fill();

  // Barn silhouette on the horizon (stages 1-2) / farmhouse (stage 3)
  const barnX = ((640 - scrollX * 0.45) % 1600 + 1600) % 1600 - 220;
  drawBarn(ctx, barnX, VIEW.groundY - 128);

  // Autumn trees
  for (let i = 0; i < 5; i++) {
    const tx = ((i * 340 - scrollX * 0.7) % 1700 + 1700) % 1700 - 120;
    drawTree(ctx, tx, VIEW.groundY);
  }

  // Ground
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, VIEW.groundY, VIEW.width, VIEW.height - VIEW.groundY);
  ctx.fillStyle = stage.groundDark;
  const dashW = 46;
  const off = scrollX % (dashW * 2);
  for (let x = -off; x < VIEW.width; x += dashW * 2) {
    ctx.fillRect(x, VIEW.groundY + 16, dashW, 5);
    ctx.fillRect(x + 20, VIEW.groundY + 42, dashW - 12, 4);
  }
  ctx.fillStyle = '#e8b34b';
  ctx.fillRect(0, VIEW.groundY, VIEW.width, 5);
}

function drawBarn(ctx, x, baseY) {
  ctx.fillStyle = PALETTE.barnRed;
  ctx.fillRect(x, baseY + 40, 150, 88);
  ctx.fillStyle = PALETTE.barnDark;
  ctx.beginPath();
  ctx.moveTo(x - 12, baseY + 44); ctx.lineTo(x + 75, baseY - 8); ctx.lineTo(x + 162, baseY + 44);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(x + 58, baseY + 76, 34, 52);
  ctx.strokeStyle = PALETTE.barnDark; ctx.lineWidth = 4;
  ctx.strokeRect(x + 58, baseY + 76, 34, 52);
  ctx.beginPath();
  ctx.moveTo(x + 58, baseY + 76); ctx.lineTo(x + 92, baseY + 128);
  ctx.moveTo(x + 92, baseY + 76); ctx.lineTo(x + 58, baseY + 128);
  ctx.stroke();
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(x + 18, baseY + 58, 20, 20);
  ctx.fillRect(x + 112, baseY + 58, 20, 20);
}

function drawTree(ctx, x, groundY) {
  ctx.fillStyle = '#5d3717';
  ctx.fillRect(x - 5, groundY - 62, 10, 62);
  const blobs = [['#e86a2e', 0, -96, 30], ['#f2a007', -24, -78, 22], ['#c73e1d', 24, -80, 24], ['#ffb703', 2, -116, 22]];
  for (const [color, dx, dy, r] of blobs) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x + dx, groundY + dy, r, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawTurkey(ctx, turkey, time) {
  if (turkey.hidden) return; // tucked inside the haystack
  const blink = turkey.invincible > 0 && Math.floor(time * 14) % 2 === 0;
  ctx.save();
  ctx.translate(turkey.x, turkey.y);
  ctx.scale(turkey.facing, 1);
  if (blink) ctx.globalAlpha = 0.35;

  const duck = turkey.ducking;
  const bodyY = duck ? -16 : -26;
  const legSwing = turkey.grounded ? Math.sin(turkey.runPhase) * 9 : 4;

  // Tail fan
  ctx.fillStyle = '#a8641e';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(-18, bodyY - 4);
    ctx.rotate(i * 0.32 - 0.5);
    ctx.beginPath(); ctx.ellipse(0, -14, 6, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // Legs
  ctx.strokeStyle = PALETTE.beak; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -6); ctx.lineTo(-4 + legSwing, 0);
  ctx.moveTo(8, -6); ctx.lineTo(8 - legSwing, 0);
  ctx.stroke();
  // Body
  ctx.fillStyle = PALETTE.turkeyBrown;
  ctx.beginPath(); ctx.ellipse(0, bodyY, 25, duck ? 15 : 19, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.turkeyDark;
  ctx.beginPath(); ctx.ellipse(-6, bodyY + 2, 14, 10, -0.4, 0, Math.PI * 2); ctx.fill();
  // Wing
  const flap = turkey.grounded ? Math.sin(turkey.runPhase * 1.4) * 0.18 : -0.55;
  ctx.save();
  ctx.translate(2, bodyY - 4); ctx.rotate(flap);
  ctx.fillStyle = '#74481a';
  ctx.beginPath(); ctx.ellipse(-4, 4, 15, 8, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Head + neck
  const headX = 22, headY = duck ? -26 : -48;
  ctx.fillStyle = PALETTE.turkeyBrown;
  ctx.beginPath(); ctx.ellipse(headX - 6, headY + 12, 7, 13, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c98d4b';
  ctx.beginPath(); ctx.arc(headX, headY, 11, 0, Math.PI * 2); ctx.fill();
  // Beak
  ctx.fillStyle = PALETTE.beak;
  ctx.beginPath();
  ctx.moveTo(headX + 9, headY - 2); ctx.lineTo(headX + 21, headY + 1); ctx.lineTo(headX + 9, headY + 5);
  ctx.fill();
  // Wattle
  ctx.fillStyle = PALETTE.wattle;
  ctx.beginPath(); ctx.ellipse(headX + 6, headY + 9, 4, 7, 0.2, 0, Math.PI * 2); ctx.fill();
  // Eye — wide with panic when sprinting
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(headX + 3, headY - 3, turkey.sprinting ? 5 : 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath(); ctx.arc(headX + 4.5, headY - 3, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Loose feathers after a hit
  if (turkey.featherBurst > 0) {
    ctx.fillStyle = '#d9a55c';
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + time * 2;
      const r = 26 + (1 - turkey.featherBurst) * 30;
      ctx.save();
      ctx.translate(turkey.x + Math.cos(a) * r, turkey.y - 30 + Math.sin(a) * r * 0.6);
      ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0, 0, 8, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
}

export function drawFarmer(ctx, farmer, time) {
  ctx.save();
  ctx.translate(farmer.x, farmer.y);
  ctx.scale(farmer.facing, 1);
  const legSwing = Math.sin(farmer.stepPhase) * 10;
  const angry = farmer.state === FarmerState.CHASE || farmer.state === FarmerState.CORNER;

  // Legs
  ctx.strokeStyle = PALETTE.farmerPants; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -44); ctx.lineTo(legSwing, 0);
  ctx.moveTo(0, -44); ctx.lineTo(-legSwing, 0);
  ctx.stroke();
  // Boots
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(legSwing - 4, -6, 15, 6);
  ctx.fillRect(-legSwing - 4, -6, 15, 6);
  // Torso (checked shirt)
  ctx.fillStyle = PALETTE.farmerShirt;
  rr(ctx, -15, -84, 30, 44, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(-15, -70, 30, 5); ctx.fillRect(-15, -56, 30, 5);
  ctx.fillRect(-6, -84, 5, 44); ctx.fillRect(6, -84, 5, 44);
  // Overalls bib
  ctx.fillStyle = '#33506e';
  ctx.fillRect(-9, -58, 18, 18);
  // Arms: one pumps, the other holds the net up when chasing
  ctx.strokeStyle = PALETTE.farmerShirt; ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-12, -78); ctx.lineTo(-20 + legSwing * 0.5, -52);
  ctx.stroke();
  const netArmY = angry ? -96 : -58;
  ctx.beginPath();
  ctx.moveTo(12, -78); ctx.lineTo(24, netArmY);
  ctx.stroke();
  // Net
  ctx.save();
  ctx.translate(24, netArmY);
  ctx.rotate(angry ? -0.5 + Math.sin(time * 6) * 0.12 : 0.9);
  if (farmer.netSwing > 0) ctx.rotate(-farmer.netSwing * 1.4);
  ctx.strokeStyle = '#7a4a21'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -34); ctx.stroke();
  ctx.strokeStyle = '#dfe6ec'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, -46, 17, 13, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(223,230,236,0.55)'; ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(i * 9, -57); ctx.lineTo(i * 9, -35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-16, -46 + i * 7); ctx.lineTo(16, -46 + i * 7); ctx.stroke();
  }
  ctx.restore();
  // Head
  ctx.fillStyle = '#f0b98a';
  ctx.beginPath(); ctx.arc(2, -96, 13, 0, Math.PI * 2); ctx.fill();
  // Beard
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath(); ctx.ellipse(5, -88, 9, 7, 0, 0, Math.PI); ctx.fill();
  // Straw hat
  ctx.fillStyle = PALETTE.hat;
  ctx.beginPath(); ctx.ellipse(2, -105, 21, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(2, -108, 12, 8, 0, Math.PI, Math.PI * 2); ctx.fill();
  // Eye + mouth: determined when chasing
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath(); ctx.arc(8, -97, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.ink; ctx.lineWidth = 2;
  ctx.beginPath();
  if (angry) { ctx.moveTo(4, -102); ctx.lineTo(11, -100); }
  else { ctx.moveTo(4, -101); ctx.lineTo(11, -101); }
  ctx.stroke();
  ctx.restore();

  // Alert icon above his head
  if (farmer.state === FarmerState.CHASE || farmer.state === FarmerState.CORNER) {
    ctx.fillStyle = PALETTE.danger;
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', farmer.x, farmer.y - 152 + Math.sin(time * 8) * 3);
  } else if (farmer.state === FarmerState.SEARCH) {
    ctx.fillStyle = '#f2a007';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', farmer.x, farmer.y - 152 + Math.sin(time * 4) * 3);
  } else if (farmer.alertLevel > 0.25) {
    ctx.fillStyle = 'rgba(51,26,5,0.8)';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('…', farmer.x, farmer.y - 126);
  }
}

export function drawHazard(ctx, h, time) {
  if (h.kind === 'fence') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(h.x - 26, h.y - h.h, 8, h.h);
    ctx.fillRect(h.x + 18, h.y - h.h, 8, h.h);
    ctx.fillStyle = '#a06a33';
    ctx.fillRect(h.x - 30, h.y - h.h + 8, 60, 9);
    ctx.fillRect(h.x - 30, h.y - h.h + 30, 60, 9);
  } else if (h.kind === 'pumpkin') {
    ctx.fillStyle = '#e86a2e';
    ctx.beginPath(); ctx.ellipse(h.x, h.y - 18, 24, 19, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c24e14'; ctx.lineWidth = 3;
    for (const dx of [-12, 0, 12]) {
      ctx.beginPath(); ctx.ellipse(h.x + dx * 0.6, h.y - 18, 8, 18, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = '#5d9b3a';
    ctx.fillRect(h.x - 3, h.y - 44, 6, 9);
  } else if (h.kind === 'cart') {
    ctx.fillStyle = '#7a4a21';
    rr(ctx, h.x - 42, h.y - 52, 84, 30, 5); ctx.fill();
    ctx.fillStyle = '#e8c15a';
    ctx.beginPath(); ctx.ellipse(h.x, h.y - 56, 36, 12, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a2c11';
    for (const dx of [-26, 26]) {
      ctx.beginPath(); ctx.arc(h.x + dx, h.y - 12, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8a5a2b';
      ctx.beginPath(); ctx.arc(h.x + dx, h.y - 12, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a2c11';
    }
  } else if (h.kind === 'knifeDrop') {
    if (h.state === 'warn') {
      // Glinting warning where the knife will land.
      const blink = Math.floor(time * 10) % 2 === 0;
      ctx.fillStyle = blink ? 'rgba(230,57,43,0.85)' : 'rgba(230,57,43,0.35)';
      ctx.beginPath();
      ctx.moveTo(h.x - 12, VIEW.groundY - 4);
      ctx.lineTo(h.x + 12, VIEW.groundY - 4);
      ctx.lineTo(h.x, VIEW.groundY - 22);
      ctx.fill();
      drawKnife(ctx, h.x, 30, Math.PI / 2);
    } else {
      drawKnife(ctx, h.x, h.y + h.h / 2, Math.PI / 2);
    }
  } else if (h.kind === 'knifeThrow') {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.spin);
    drawKnifeShape(ctx, 0, 0, 1);
    ctx.restore();
  } else if (h.kind === 'oven') {
    drawOven(ctx, h, time);
  }
}

function drawKnife(ctx, x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  drawKnifeShape(ctx, 0, 0, 1.15);
  ctx.restore();
}

function drawKnifeShape(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // Blade
  ctx.fillStyle = PALETTE.knifeBlade;
  ctx.beginPath();
  ctx.moveTo(-26, -5); ctx.lineTo(14, -5); ctx.quadraticCurveTo(28, 0, 14, 6); ctx.lineTo(-26, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(-24, -4, 34, 2.5);
  // Handle
  ctx.fillStyle = PALETTE.knifeHandle;
  rr(ctx, -46, -4.5, 21, 9, 4); ctx.fill();
  ctx.restore();
}

function drawOven(ctx, h, time) {
  const x = h.x, base = h.y;
  // Body
  ctx.fillStyle = PALETTE.ovenSteel;
  rr(ctx, x - 48, base - 104, 96, 104, 8); ctx.fill();
  ctx.fillStyle = PALETTE.ovenDark;
  ctx.fillRect(x - 48, base - 104, 96, 22);
  // Burners
  ctx.fillStyle = '#22262c';
  for (const dx of [-28, 0, 28]) {
    ctx.beginPath(); ctx.ellipse(x + dx, base - 106, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Knobs
  ctx.fillStyle = '#dfe6ec';
  for (const dx of [-30, -10, 10, 30]) {
    ctx.beginPath(); ctx.arc(x + dx, base - 93, 4.5, 0, Math.PI * 2); ctx.fill();
  }
  // Door with glowing window
  const doorOpen = h.flameOn;
  ctx.fillStyle = '#59636e';
  rr(ctx, x - 38, base - 74, 76, 62, 6); ctx.fill();
  ctx.fillStyle = doorOpen ? PALETTE.ovenGlow : '#2b1a08';
  rr(ctx, x - 28, base - 64, 56, 40, 5); ctx.fill();
  if (doorOpen) {
    ctx.fillStyle = '#ffd23e';
    rr(ctx, x - 20, base - 56, 40, 24, 4); ctx.fill();
  }
  // Handle
  ctx.fillStyle = '#dfe6ec';
  ctx.fillRect(x - 32, base - 80, 64, 5);
  // Legs
  ctx.fillStyle = PALETTE.ovenDark;
  ctx.fillRect(x - 42, base - 8, 10, 8);
  ctx.fillRect(x + 32, base - 8, 10, 8);
  // Flame blast to the left when the door blows open
  if (h.flameOn) {
    for (let i = 0; i < 5; i++) {
      const fx = x - 52 - i * 16 - Math.sin(time * 22 + i) * 4;
      const fy = base - 52 + Math.sin(time * 18 + i * 2) * 8;
      ctx.fillStyle = i < 2 ? '#ffd23e' : (i < 4 ? '#ff7a1a' : '#e6392b');
      ctx.beginPath();
      ctx.ellipse(fx, fy, 21 - i * 2, 14 - i * 1.4, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = PALETTE.danger;
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT!', x, base - 122);
  } else {
    // Warning: door is about to blow
    const cycle = h.flameT % 2.6;
    if (cycle > 1.1) {
      ctx.fillStyle = '#f2a007';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('…', x, base - 120);
    }
  }
}

export function drawPickup(ctx, p, time) {
  const bob = Math.sin(p.t * 4) * 4;
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  if (p.kind === 'goldenCorn') {
    ctx.fillStyle = 'rgba(255,183,3,0.35)';
    ctx.beginPath(); ctx.arc(0, 0, 22 + Math.sin(time * 5) * 3, 0, Math.PI * 2); ctx.fill();
  }
  // Cob
  ctx.fillStyle = p.kind === 'goldenCorn' ? '#ffb703' : PALETTE.corn;
  rr(ctx, -7, -15, 14, 30, 7); ctx.fill();
  ctx.fillStyle = 'rgba(160,106,51,0.5)';
  for (let r = -10; r <= 10; r += 6) ctx.fillRect(-6, r, 12, 2);
  // Husk leaves
  ctx.fillStyle = PALETTE.cornLeaf;
  ctx.beginPath();
  ctx.moveTo(-7, 12); ctx.quadraticCurveTo(-18, 4, -15, -8); ctx.quadraticCurveTo(-7, -2, -6, 6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(7, 12); ctx.quadraticCurveTo(18, 4, 15, -8); ctx.quadraticCurveTo(7, -2, 6, 6);
  ctx.fill();
  ctx.restore();
}

export function drawHaystack(ctx, h, turkeyHiddenHere) {
  ctx.fillStyle = '#e8c15a';
  ctx.beginPath();
  ctx.moveTo(h.x - h.w / 2, h.y);
  ctx.quadraticCurveTo(h.x, h.y - h.h * 1.5, h.x + h.w / 2, h.y);
  ctx.fill();
  ctx.strokeStyle = '#c99a2e'; ctx.lineWidth = 3;
  for (const dx of [-28, -10, 10, 28]) {
    ctx.beginPath();
    ctx.moveTo(h.x + dx, h.y - 4);
    ctx.quadraticCurveTo(h.x + dx * 0.6, h.y - h.h * 0.8, h.x + dx * 0.3, h.y - h.h * 1.15);
    ctx.stroke();
  }
  if (turkeyHiddenHere) {
    // Two eyes peeking out: you're in there!
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(h.x - 6, h.y - 26, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(h.x + 6, h.y - 26, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.ink;
    ctx.beginPath(); ctx.arc(h.x - 5, h.y - 26, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(h.x + 7, h.y - 26, 2, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawFreedomGate(ctx, x, time) {
  const base = VIEW.groundY;
  ctx.fillStyle = '#5d3717';
  ctx.fillRect(x - 54, base - 150, 12, 150);
  ctx.fillRect(x + 42, base - 150, 12, 150);
  ctx.fillStyle = '#7c4a21';
  ctx.fillRect(x - 62, base - 164, 124, 18);
  // Bunting
  const colors = ['#e6392b', '#ffb703', '#4caf50', '#3e6b9e'];
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = colors[i % colors.length];
    const bx = x - 54 + i * 17;
    const by = base - 146 + Math.sin(i * 0.9 + time * 2) * 2;
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(bx + 14, by); ctx.lineTo(bx + 7, by + 13);
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FREEDOM', x, base - 150);
}
