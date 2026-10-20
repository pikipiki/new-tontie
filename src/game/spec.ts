import gameSpec from '../../reference/game-spec.json'
import type { HoleIndex } from './types'

export const FPS = gameSpec.runtime.fps
export const GAME_WIDTH = gameSpec.runtime.frameSize.width
export const GAME_HEIGHT = gameSpec.runtime.frameSize.height
export const ROUND_SECONDS = gameSpec.round.timerSeconds
export const MAX_LEVEL = gameSpec.round.maxLevels
export const BOSS_LEVELS = gameSpec.round.bossLevels
export const BOSS_HOLE = gameSpec.round.bossHoleIndex as HoleIndex
export const MONEY_CAP = gameSpec.economy.moneyCap
export const SHOP_LEVELS = gameSpec.shop.levels

export const INIT = {
  kakurituOrg: FPS * 2,
  koma: FPS,
  topStay: FPS * 4,
  upTime: 1,
  upKakuritu: 2.5,
  upChar: 1,
  upTop: 1.5,
  upTimeMx: 80,
  upKakurituMx: 3,
  upCharMx: 6,
  upTopMx: 50,
  heartMax: 52,
  karaburi: 10,
  hammerLv: 1,
  money: 0,
  score: 0,
  continues: 10,
  chousei: 3,
} as const

/** Hammer level → damage per hit (DefineSprite_208). */
export const HAMMER_DAMAGE: Record<number, number> = {
  1: 1,
  2: 3,
  3: 5,
  4: 7,
}

export function hammerDamage(hammerLv: number): number {
  return HAMMER_DAMAGE[hammerLv] ?? 7
}

/** DefineSprite_208 frame 5: 50 rounds, 8 damage; frame_20 spends one round per shot. */
export const LASER_AMMO = 50
export const LASER_DAMAGE = 8

/** doka strike clip (DefineSprite_261 / 669) frame count used on hit. */
export const HAMMER_STRIKE_FRAMES = 8
