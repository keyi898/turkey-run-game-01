// Shared tuning for Gobble Dash. One place for every number the game feels by.
export const VIEW = { width: 960, height: 540, groundY: 462 };

export const TURKEY = {
  runSpeed: 300,        // px per second at a steady trot
  sprintSpeed: 430,     // holding Shift / mouse: faster, but noisier
  jumpVelocity: -760,
  gravity: 2100,
  width: 46,
  height: 52,
  duckHeight: 30,
  lives: 3,
  invincibleSeconds: 1.4,
};

export const FARMER = {
  baseSpeed: 268,
  sprintSpeed: 355,
  catchRadius: 34,
  sightRange: 430,
  giveUpSeconds: 6,     // how long he searches before wandering off
  cornerBoost: 1.18,    // he speeds up when the turkey is cornered at the edge
};

export const SCORING = {
  perMetre: 2,
  corn: 25,
  goldenCorn: 120,
  nearMiss: 15,
  hideBonus: 40,
  stageClear: 250,
  escapeBonus: 1000,
};

export const ESCAPE_DISTANCE = 1500; // metres to the freedom gate
export const PIXELS_PER_METRE = 28;

export const PALETTE = {
  skyTop: '#ffd9a0', skyBottom: '#ff9e57',
  hillFar: '#c96f2e', hillNear: '#a8561f',
  ground: '#7c4a21', groundDark: '#5d3717',
  barnRed: '#b5342a', barnDark: '#7e211a',
  cream: '#fff3d6', ink: '#331a05',
  turkeyBrown: '#8a5a2b', turkeyDark: '#5f3c18', beak: '#f2a007', wattle: '#d64533',
  farmerShirt: '#3e6b9e', farmerPants: '#4a4a52', hat: '#e8c15a',
  corn: '#ffd23e', cornLeaf: '#5d9b3a',
  ovenSteel: '#8d97a3', ovenDark: '#3c434c', ovenGlow: '#ff7a1a',
  knifeBlade: '#dfe6ec', knifeHandle: '#6b3a1d',
  danger: '#e6392b', good: '#4caf50', gold: '#ffb703',
};
