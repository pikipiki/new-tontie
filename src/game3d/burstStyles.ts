export interface BurstStyle {
  count: number
  colors: readonly string[]
  speed: number
  /** Upward bias of the launch direction (0 = flat ring, 1 = fountain). */
  lift: number
  gravity: number
  size: number
  durationMs: number
  shape: 'star' | 'puff' | 'cube'
}

export const BURSTS = {
  hit: {
    count: 10,
    colors: ['#ffffff', '#fff4a8', '#ffd84a'],
    speed: 2.6,
    lift: 0.45,
    gravity: 4,
    size: 0.07,
    durationMs: 320,
    shape: 'star',
  },
  kill: {
    count: 18,
    colors: ['#ffffff', '#ffe066', '#ff8fb1', '#8fe3ff'],
    speed: 3.2,
    lift: 0.7,
    gravity: 6,
    size: 0.075,
    durationMs: 620,
    shape: 'star',
  },
  bomb: {
    count: 26,
    colors: ['#ff6a00', '#ffd000', '#3a3a3a', '#ff2d00'],
    speed: 3.8,
    lift: 0.6,
    gravity: 3,
    size: 0.12,
    durationMs: 700,
    shape: 'puff',
  },
  miss: {
    count: 10,
    colors: ['#c9a46a', '#a7834f', '#e2cfa3'],
    speed: 1.4,
    lift: 0.15,
    gravity: 1.5,
    size: 0.045,
    durationMs: 420,
    shape: 'puff',
  },
  pickup: {
    count: 16,
    colors: ['#ffe066', '#fff7c2', '#ffd000'],
    speed: 1.6,
    lift: 0.95,
    gravity: -0.6,
    size: 0.06,
    durationMs: 720,
    shape: 'star',
  },
} as const satisfies Record<string, BurstStyle>
