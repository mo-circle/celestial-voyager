
import { PlanetData } from './types';

const BASE_TEX_URL = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets';

/**
 * Data derived from NASA JPL Planetary Orbital Elements at J2000
 * Rates are per century (cy)
 */
export const PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#A5A5A5',
    radius: 0.8,
    elements: {
      a: 0.38709893, a_rate: 0.00000066,
      e: 0.20563069, e_rate: 0.00002527,
      i: 7.00487, i_rate: -0.00594749,
      L: 252.25084, L_rate: 149472.6741,
      longPeri: 77.45645, longPeri_rate: 0.15935,
      longNode: 48.33167, longNode_rate: -0.12534
    },
    orbitalPeriod: 87.969,
    rotationSpeed: 0.017,
    description: 'The smallest and closest planet to the Sun.',
    mass: '3.285 × 10^23 kg',
    gravity: '3.7 m/s²',
    temp: '167°C',
    distanceFromSun: '0.39 AU',
    textureUrl: `${BASE_TEX_URL}/mercury.jpg`
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#E3BB76',
    atmosphereColor: '#ffcc88',
    radius: 1.2,
    elements: {
      a: 0.72333199, a_rate: 0.00000092,
      e: 0.00677323, e_rate: -0.00004938,
      i: 3.39471, i_rate: -0.0007889,
      L: 181.97973, L_rate: 58517.8153,
      longPeri: 131.53298, longPeri_rate: 0.00213,
      longNode: 76.68069, longNode_rate: -0.27769
    },
    orbitalPeriod: 224.7,
    rotationSpeed: 0.004,
    description: 'Earth\'s twin in size with a thick, toxic atmosphere.',
    mass: '4.867 × 10^24 kg',
    gravity: '8.87 m/s²',
    temp: '464°C',
    distanceFromSun: '0.72 AU',
    textureUrl: `${BASE_TEX_URL}/venus.jpg`
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#2271B3',
    atmosphereColor: '#44aaff',
    radius: 1.3,
    elements: {
      a: 1.00000011, a_rate: -0.00000005,
      e: 0.01671022, e_rate: -0.00003804,
      i: 0.00005, i_rate: -0.01300,
      L: 100.46435, L_rate: 35999.3724,
      longPeri: 102.94719, longPeri_rate: 0.32327,
      longNode: -11.26064, longNode_rate: -0.44523
    },
    orbitalPeriod: 365.25,
    rotationSpeed: 1.0,
    description: 'Our home planet, the only known world with life.',
    mass: '5.972 × 10^24 kg',
    gravity: '9.81 m/s²',
    temp: '15°C',
    distanceFromSun: '1.00 AU',
    textureUrl: `${BASE_TEX_URL}/earth_atmos_2048.jpg`
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#E27B58',
    atmosphereColor: '#ff8866',
    radius: 1.0,
    elements: {
      a: 1.52366231, a_rate: -0.00007221,
      e: 0.09341233, e_rate: 0.00011902,
      i: 1.85061, i_rate: -0.00813,
      L: 355.45332, L_rate: 19140.3026,
      longPeri: 336.04084, longPeri_rate: 0.4411,
      longNode: 49.57854, longNode_rate: -0.2941
    },
    orbitalPeriod: 686.98,
    rotationSpeed: 0.97,
    description: 'The Red Planet, home to the solar system\'s largest volcano.',
    mass: '6.39 × 10^23 kg',
    gravity: '3.72 m/s²',
    temp: '-65°C',
    distanceFromSun: '1.52 AU',
    textureUrl: `${BASE_TEX_URL}/mars.jpg`
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#D39C7E',
    radius: 4.5,
    elements: {
      a: 5.20336301, a_rate: 0.00060737,
      e: 0.04839266, e_rate: -0.0001288,
      i: 1.30530, i_rate: -0.00415,
      L: 34.40438, L_rate: 3034.7461,
      longPeri: 14.75385, longPeri_rate: 0.16129,
      longNode: 100.55615, longNode_rate: 0.20469
    },
    orbitalPeriod: 4332.6,
    rotationSpeed: 2.4,
    description: 'The king of the planets, a massive gas giant.',
    mass: '1.898 × 10^27 kg',
    gravity: '24.79 m/s²',
    temp: '-110°C',
    distanceFromSun: '5.20 AU',
    textureUrl: `${BASE_TEX_URL}/jupiter.jpg`
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#C5AB6E',
    radius: 4.0,
    elements: {
      a: 9.53707032, a_rate: -0.0030153,
      e: 0.05415060, e_rate: -0.0003676,
      i: 2.48446, i_rate: 0.00611,
      L: 49.94432, L_rate: 1222.4944,
      longPeri: 92.43194, longPeri_rate: -0.0392,
      longNode: 113.71504, longNode_rate: -0.2591
    },
    orbitalPeriod: 10759.2,
    rotationSpeed: 2.2,
    description: 'Famous for its complex and beautiful ring system.',
    mass: '5.683 × 10^26 kg',
    gravity: '10.44 m/s²',
    temp: '-140°C',
    distanceFromSun: '9.54 AU',
    hasRings: true,
    textureUrl: `${BASE_TEX_URL}/saturn.jpg`,
    ringTextureUrl: `https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/saturn_ring_alpha.png`
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#B5E3E3',
    radius: 2.5,
    elements: {
      a: 19.19126393, a_rate: 0.0015202,
      e: 0.04716771, e_rate: -0.0001915,
      i: 0.76986, i_rate: 0.00026,
      L: 313.23218, L_rate: 428.4820,
      longPeri: 170.96424, longPeri_rate: 0.0779,
      longNode: 74.22988, longNode_rate: -0.0975
    },
    orbitalPeriod: 30685.4,
    rotationSpeed: 1.4,
    description: 'An ice giant that rotates on its side.',
    mass: '8.681 × 10^25 kg',
    gravity: '8.69 m/s²',
    temp: '-195°C',
    distanceFromSun: '19.22 AU',
    textureUrl: `${BASE_TEX_URL}/uranus.jpg`
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#4B70DD',
    atmosphereColor: '#6688ff',
    radius: 2.4,
    elements: {
      a: 30.06896348, a_rate: -0.0012519,
      e: 0.00858587, e_rate: 0.0000251,
      i: 1.76917, i_rate: -0.00035,
      L: 304.88003, L_rate: 218.4594,
      longPeri: 44.97135, longPeri_rate: -0.3224,
      longNode: 131.72169, longNode_rate: -0.0025
    },
    orbitalPeriod: 60190,
    rotationSpeed: 1.5,
    description: 'A blue ice giant with the fastest winds in the solar system.',
    mass: '1.024 × 10^26 kg',
    gravity: '11.15 m/s²',
    temp: '-201°C',
    distanceFromSun: '30.1 AU',
    textureUrl: `${BASE_TEX_URL}/neptune.jpg`
  }
];

export const SUN_DATA = {
  radius: 12,
  color: '#FFCC00',
  glowColor: '#FF4400',
  textureUrl: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/lava/lavatile.jpg'
};
