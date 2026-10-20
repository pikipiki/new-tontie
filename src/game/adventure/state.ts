import type { GameState } from '../types'
import { FPS } from '../spec'
import { emptyHole, emit, freshStats, HOLES } from '../engine/shared'
import { missionFor, UPGRADES } from './content'
import type { AdventureState, UpgradeId } from './types'

export function createAdventure(): AdventureState {
  return {
    stage: 1,
    progress: 0,
    cake: 6,
    noise: 0,
    spawnIn: 8,
    spawned: 0,
    snackSeconds: 0,
    charge: 0,
    biteCount: 0,
    donuts: 0,
    flightFrames: 0,
    frenzyFrames: 0,
    upgrades: [],
    offers: [],
    actors: {},
    boss: null,
    notice: '',
    noticeFrames: 0,
    failure: '',
  }
}
export function announce(state: GameState, message: string): void {
  if (!state.adventure) return
  state.adventure.notice = message
  state.adventure.noticeFrames = FPS * 3
}
export function clearBoard(state: GameState): void {
  for (const hole of HOLES) state.holes[hole] = emptyHole()
  state.moguraOn = 0
  state.pendingHits = []
  if (state.adventure) state.adventure.actors = {}
}
export function prepareAdventure(state: GameState): void {
  const adventure = state.adventure
  if (!adventure) return
  clearBoard(state)
  adventure.progress = 0
  adventure.noise = 0
  adventure.spawnIn = 8
  adventure.spawned = 0
  adventure.boss = null
  adventure.flightFrames = 0
  adventure.failure = ''
  adventure.notice = ''
  adventure.cake = adventure.upgrades.includes('cakeShield') ? 8 : 6
  state.roundFramesLeft =
    (missionFor(adventure.stage).seconds +
      (adventure.upgrades.includes('extraTime') ? 10 : 0)) *
    FPS
  state.roundFrameCounter = 0
  state.level = adventure.stage
  state.koma = 4
  state.topStay = 65
  state.levelStats = freshStats(state.score)
  state.phase = 'levelIntro'
  state.pikoOk = false
  state.hammerStrikes = []
  state.stone = adventure.upgrades.includes('comfort')
  if (adventure.upgrades.includes('laser')) {
    state.gun = 1
    state.gunAmmo = 50
  }
}
export function finishAdventureStage(
  state: GameState,
  random: () => number,
): void {
  const adventure = state.adventure
  if (!adventure) return
  clearBoard(state)
  state.pikoOk = false
  state.hp = Math.min(state.hpMax, state.hp + 8)
  if (adventure.stage === 6) {
    state.phase = 'win'
    emit(state, { kind: 'win', sfx: 'last', music: 'stop' })
    return
  }
  const available = (Object.keys(UPGRADES) as UpgradeId[]).filter(
    (upgrade) => !adventure.upgrades.includes(upgrade),
  )
  adventure.offers = []
  while (adventure.offers.length < 3 && available.length) {
    const index = Math.min(
      available.length - 1,
      Math.floor(random() * available.length),
    )
    const [offer] = available.splice(index, 1)
    if (offer) adventure.offers.push(offer)
  }
  state.phase = 'levelClear'
  emit(state, { kind: 'levelUp', sfx: 'level_up', music: 'stop' })
}
export function chooseUpgrade(state: GameState, upgrade: UpgradeId): void {
  const adventure = state.adventure
  if (
    !adventure ||
    state.phase !== 'levelClear' ||
    !adventure.offers.includes(upgrade)
  )
    return
  adventure.upgrades.push(upgrade)
  adventure.offers = []
  if (upgrade === 'hammer') state.hammerLv = 4
  if (upgrade === 'comfort') state.hp = Math.min(state.hpMax, state.hp + 16)
  adventure.stage += 1
  prepareAdventure(state)
  emit(state, { kind: 'buy', sfx: 'sp_get' })
}
export function failAdventure(state: GameState, reason: string): void {
  if (!state.adventure || state.phase !== 'playing') return
  state.adventure.failure = reason
  state.phase = 'gameOver'
  state.pikoOk = false
  state.pendingHits = []
  emit(state, { kind: 'gameOver', sfx: 'last', music: 'gameover' })
}
