// The escape route: three stages from the farmyard to the kitchen door.
// Each stage raises the farmer's speed, thickens the hazards and changes
// the scenery. Reaching ESCAPE_DISTANCE opens the freedom gate.
import { ESCAPE_DISTANCE } from './config.js';

export const STAGES = [
  {
    id: 'farmyard',
    name: 'Stage 1 · The Farmyard',
    from: 0, to: 500,
    farmerSpeedScale: 0.92,
    hazardEvery: [520, 780],     // px between hazards, min..max
    cornEvery: [340, 560],
    hayEvery: [900, 1400],       // hiding haystacks
    hazards: ['fence', 'pumpkin', 'knifeDrop'],
    sky: ['#ffd9a0', '#ff9e57'],
    ground: '#7c4a21', groundDark: '#5d3717',
    blurb: 'Out of the coop! Dodge the fences and falling knives.',
  },
  {
    id: 'barn',
    name: 'Stage 2 · The Barn & Yard',
    from: 500, to: 1000,
    farmerSpeedScale: 1.0,
    hazardEvery: [430, 660],
    cornEvery: [380, 620],
    hayEvery: [1000, 1500],
    hazards: ['fence', 'pumpkin', 'knifeDrop', 'knifeThrow', 'cart'],
    sky: ['#ffc98a', '#f77f3e'],
    ground: '#6e3f1c', groundDark: '#4f2c11',
    blurb: 'The farmer grabs his carving knife. Keep moving!',
  },
  {
    id: 'kitchen',
    name: 'Stage 3 · The Kitchen',
    from: 1000, to: ESCAPE_DISTANCE,
    farmerSpeedScale: 1.08,
    hazardEvery: [360, 560],
    cornEvery: [420, 700],
    hayEvery: [1100, 1700],
    hazards: ['oven', 'knifeThrow', 'knifeDrop', 'cart', 'pumpkin'],
    sky: ['#f7c873', '#e86a2e'],
    ground: '#5d3717', groundDark: '#3f2410',
    blurb: 'The oven is lit! Slip past the stove to freedom.',
  },
];

export function stageAt(distanceMetres) {
  for (const stage of STAGES) {
    if (distanceMetres >= stage.from && distanceMetres < stage.to) return stage;
  }
  return STAGES[STAGES.length - 1];
}

export function stageIndexAt(distanceMetres) {
  const stage = stageAt(distanceMetres);
  return STAGES.indexOf(stage);
}
