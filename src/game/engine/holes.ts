import {
  bossForLevel,
  holeBlockedForRandomSpawn,
  isBossLevel,
  rollEnemyForHole,
} from '../enemies'
import { BOSS_HOLE } from '../spec'
import type { EnemySpawn, GameState, HoleIndex } from '../types'
import { countsAsMonster, emit, HOLES, retireHole } from './shared'

function spawnNikaiHits(enemy: EnemySpawn): number {
  if (enemy.nikai) {
    return 1
  }
  if (enemy.kind === 'twoHit') {
    return 1
  }
  return 0
}

export function activateHole(
  state: GameState,
  hole: HoleIndex,
  enemy: EnemySpawn,
): void {
  const slot = state.holes[hole]
  if (slot.phase !== 'off') {
    return
  }
  slot.enemy = { ...enemy }
  slot.nikaiRemaining = spawnNikaiHits(enemy)
  slot.phase = 'rising'
  slot.phaseTicks = 0
  state.moguraOn += 1
  if (countsAsMonster(enemy)) state.levelStats.monsters += 1
  if (enemy.kind === 'boss') {
    emit(state, { kind: 'boss', hole, frame: enemy.catalogFrame })
  }
}

export function trySpawn(state: GameState, random: () => number): void {
  if (state.phase !== 'playing' || state.moguraOn >= 9 || state.lvup > 0) {
    return
  }

  if (!state.bossSpawned && isBossLevel(state.level)) {
    state.bossSpawned = true
    activateHole(state, BOSS_HOLE, bossForLevel(state.level))
    return
  }

  state.kakurituCounter -= 1
  if (state.kakurituCounter > 0) {
    return
  }
  state.kakurituCounter = state.kakurituOrg

  const candidates = HOLES.filter((holeIndex) => {
    if (holeBlockedForRandomSpawn(state.level, holeIndex)) {
      return false
    }
    return state.holes[holeIndex].phase === 'off'
  })
  if (candidates.length === 0) {
    return
  }

  const hole = candidates[Math.floor(random() * candidates.length)]
  if (hole === undefined) {
    return
  }
  const enemy = rollEnemyForHole(state, random)
  activateHole(state, hole, enemy)
}

export function tickHole(state: GameState, hole: HoleIndex): void {
  const slot = state.holes[hole]
  if (slot.phase === 'off') {
    return
  }

  slot.phaseTicks += 1

  if (slot.phase === 'rising') {
    if (slot.phaseTicks >= state.koma) {
      slot.phase = 'top'
      slot.phaseTicks = 0
    }
    return
  }

  if (slot.phase === 'top') {
    if (slot.phaseTicks >= state.topStay) {
      slot.phase = 'falling'
      slot.phaseTicks = 0
    }
    return
  }

  if (slot.phaseTicks >= state.koma) {
    retireHole(state, hole, true)
  }
}

export { retireHole } from './shared'
