import type { HoleIndex } from './types'

/**
 * Hole anchor (top-left of 72×72 hit box) aligned to main timeline frame 51 (400×400 gameplay).
 * Numpad layout: 7-8-9 / 4-5-6 / 1-2-3.
 */
export const HOLE_POS: Record<HoleIndex, { x: number; y: number }> = {
  7: { x: 58, y: 98 },
  8: { x: 164, y: 98 },
  9: { x: 270, y: 98 },
  4: { x: 58, y: 178 },
  5: { x: 164, y: 178 },
  6: { x: 270, y: 178 },
  1: { x: 58, y: 258 },
  2: { x: 164, y: 258 },
  3: { x: 270, y: 258 },
}

export const HOLE_ORDER: HoleIndex[] = [7, 8, 9, 4, 5, 6, 1, 2, 3]

/** Vertical travel while rising (pixels). */
export const MOLE_RISE_DEPTH = 32
