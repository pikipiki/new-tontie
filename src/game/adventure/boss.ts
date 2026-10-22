import type { GameState, HoleIndex } from '../types'
import { FPS } from '../spec'
import { activateHole } from '../engine/holes'
import { emit, hurt } from '../engine/shared'
import { missionFor } from './content'
import { announce } from './state'

export const BOSS_HOLES: HoleIndex[] = [7, 8, 9]
export function spawnConductor(state: GameState): void {
  const adventure = state.adventure
  if (
    !adventure ||
    adventure.boss ||
    missionFor(adventure.stage).kind !== 'boss'
  )
    return
  adventure.spawnIn = FPS * 4
  const health = missionFor(adventure.stage).goal
  adventure.boss = {
    hp: health,
    maxHp: health,
    weak: 8,
    frames: FPS * 2,
    warning: true,
    wave: 0,
  }
  for (const hole of BOSS_HOLES) {
    activateHole(state, hole, {
      kind: 'boss',
      hp: 1,
      maxHp: 1,
      attack: 0,
      score: 100,
      catalogFrame: 5,
    })
    state.holes[hole].phase = 'top'
    adventure.actors[hole] = {
      role: 'boss',
      age: 0,
      acted: true,
      swapWith: null,
    }
  }
  announce(state, 'Red lane = warning. Gold crystal = strike!')
}
export function tickConductor(state: GameState): void {
  const adventure = state.adventure
  const boss = adventure?.boss
  if (!adventure || !boss) return
  if (!boss.warning && adventure.frenzyFrames > 0) return
  boss.frames -= 1
  if (boss.frames > 0) return
  if (boss.warning) {
    boss.warning = false
    boss.frames = FPS * (adventure.stage === 6 ? 2 : 3)
    announce(state, 'STRIKE the golden crystal!')
    emit(state, { kind: 'pickup', hole: boss.weak, sfx: 'item_on' })
  } else {
    hurt(state, 6, boss.weak)
    boss.wave += 1
    boss.warning = true
    boss.frames = FPS * 2
    announce(state, 'DRUM WAVE! You missed the weak spot')
    boss.weak = BOSS_HOLES[
      (BOSS_HOLES.indexOf(boss.weak) + 1) % BOSS_HOLES.length
    ] as HoleIndex
  }
}
export function strikeConductor(
  state: GameState,
  hole: HoleIndex,
  laser = false,
): void {
  const adventure = state.adventure
  const boss = adventure?.boss
  if (!adventure || !boss) return
  if (boss.warning || boss.weak !== hole) {
    emit(state, { kind: 'guard', hole, sfx: 'kan' })
    announce(
      state,
      boss.warning
        ? 'Wait for the crystal to turn gold'
        : 'Aim for the GOLD crystal!',
    )
    return
  }
  const damage = adventure.upgrades.includes('hammer') && !laser ? 2 : 1
  boss.hp = Math.max(0, boss.hp - damage)
  adventure.progress = boss.maxHp - boss.hp
  state.score += 100 * damage * (adventure.frenzyFrames > 0 ? 2 : 1)
  emit(state, { kind: 'hit', hole, sfx: 'hit' })
  boss.weak = BOSS_HOLES[
    (BOSS_HOLES.indexOf(hole) + 1) % BOSS_HOLES.length
  ] as HoleIndex
  boss.warning = true
  boss.frames = Math.round(FPS * 1.1)
  announce(state, 'Nice! Follow the next lane')
}
