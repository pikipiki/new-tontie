import { endRound } from '../engine/progression'
import { HURRY_FRAMES } from '../engine/constants'
import { emit } from '../engine/shared'
import { isBossLevel } from './bossLevels'
import { ensureGameFeaturesLoaded } from './featureBoot'
import type { RandomSource } from '../clock'
import type { GameState } from '../types'
import type { RoundRuleFeature, RoundTickPhase } from './types'

const roundRules: RoundRuleFeature[] = []

export function registerRoundRule(rule: RoundRuleFeature): void {
  if (roundRules.some((row) => row.id === rule.id)) {
    throw new Error(`round rule already registered: ${rule.id}`)
  }
  roundRules.push(rule)
}

export function runRoundRules(
  phase: RoundTickPhase,
  state: GameState,
  random: RandomSource,
): void {
  ensureGameFeaturesLoaded()
  for (const rule of roundRules) {
    if (rule.phase === phase) {
      rule.tick(state, random)
    }
  }
}

function registerBuiltinRoundRules(): void {
  registerRoundRule({
    id: 'boss-hurry',
    phase: 'after-clock',
    tick: (state) => {
      if (state.roundFramesLeft === HURRY_FRAMES && isBossLevel(state.level)) {
        emit(state, { kind: 'hurry', sfx: 'hurry' })
      }
    },
  })
  registerRoundRule({
    id: 'hp-game-over',
    phase: 'after-spawn',
    tick: (state) => {
      if (state.hp > 0) {
        return
      }
      state.hp = 0
      state.phase = 'gameOver'
      state.pikoOk = false
      state.pendingHits = []
      state.hammerStrikes = []
      emit(state, { kind: 'gameOver', music: 'gameover' })
    },
  })
  registerRoundRule({
    id: 'round-timer',
    phase: 'after-spawn',
    tick: (state) => {
      if (state.phase === 'playing' && state.roundFramesLeft <= 0) {
        endRound(state)
      }
    },
  })
}

export function loadBuiltinRoundRules(): void {
  registerBuiltinRoundRules()
}

export function resetRoundRules(): void {
  roundRules.length = 0
}
