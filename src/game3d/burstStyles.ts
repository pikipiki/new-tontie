import { themeColors } from '@game3d/theme'

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
    colors: themeColors.burst.hit,
    speed: 2.6,
    lift: 0.45,
    gravity: 4,
    size: 0.07,
    durationMs: 320,
    shape: 'star',
  },
  kill: {
    count: 18,
    colors: themeColors.burst.kill,
    speed: 3.2,
    lift: 0.7,
    gravity: 6,
    size: 0.075,
    durationMs: 620,
    shape: 'star',
  },
  bomb: {
    count: 26,
    colors: themeColors.burst.bomb,
    speed: 3.8,
    lift: 0.6,
    gravity: 3,
    size: 0.12,
    durationMs: 700,
    shape: 'puff',
  },
  miss: {
    count: 10,
    colors: themeColors.burst.miss,
    speed: 1.4,
    lift: 0.15,
    gravity: 1.5,
    size: 0.045,
    durationMs: 420,
    shape: 'puff',
  },
  pickup: {
    count: 16,
    colors: themeColors.burst.pickup,
    speed: 1.6,
    lift: 0.95,
    gravity: -0.6,
    size: 0.06,
    durationMs: 720,
    shape: 'star',
  },
} as const satisfies Record<string, BurstStyle>
