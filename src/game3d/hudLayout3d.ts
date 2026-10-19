import { GAME_HEIGHT, GAME_WIDTH } from '@/game/spec'
import { BOARD_SURFACE_Y } from './layout3d'

const SCALE = 4.2 / GAME_WIDTH

/** Flash pixel (frame 51) → world position on top of the playfield. */
export function hudWorld(px: number, py: number, lift = 0.06): [number, number, number] {
  const wx = (px - GAME_WIDTH / 2) * SCALE
  const wz = (py - GAME_HEIGHT / 2) * SCALE
  return [wx, BOARD_SURFACE_Y + lift, wz]
}

/** HUD anchors (pixels on 400×400 gameplay frame). */
export const HUD = {
  level: hudWorld(200, 28, 0.1),
  hearts: hudWorld(52, 34, 0.08),
  laser: hudWorld(348, 38, 0.08),
  hammer: hudWorld(348, 72, 0.08),
  score: hudWorld(200, 372, 0.05),
} as const

export const HUD_SCALE = SCALE
