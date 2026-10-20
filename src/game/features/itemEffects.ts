import { heal } from '../stats'
import { addCoin } from '../money'
import type { GameState, HoleIndex } from '../types'
import type { ItemEffectFeature } from './types'

const HOLES: HoleIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function forEachPacifiableHole(
  state: GameState,
  eachHole: (hole: HoleIndex, slot: GameState['holes'][HoleIndex]) => void,
): void {
  for (const hole of HOLES) {
    const slot = state.holes[hole]
    if (
      slot.phase !== 'off' &&
      slot.enemy.kind !== 'none' &&
      slot.enemy.kind !== 'boss'
    ) {
      eachHole(hole, slot)
    }
  }
}

function applyAllCoin(state: GameState): void {
  forEachPacifiableHole(state, (_hole, slot) => {
    addCoin(state, Math.min(30, Math.floor(slot.enemy.score / 5)))
    slot.enemy.attack = 0
  })
}

function applyAllLife(state: GameState): void {
  forEachPacifiableHole(state, (_hole, slot) => {
    slot.enemy.attack = 0
  })
  heal(state, 12)
}

function pickupItemEffects(): ItemEffectFeature[] {
  return [
    {
      id: 'life',
      apply: (state, amount) => {
        heal(state, amount)
      },
    },
    {
      id: 'utsuwa',
      apply: (state, amount) => {
        heal(state, amount)
      },
    },
    {
      id: 'coin',
      apply: (state, amount) => {
        addCoin(state, amount)
      },
    },
    {
      id: 'stone',
      apply: (state) => {
        state.stone = true
      },
    },
    {
      id: 'gun',
      apply: (state) => {
        state.gun = 1
        state.gunAmmo = 8
      },
    },
    {
      id: 'wing',
      apply: (state) => {
        state.wing = true
      },
    },
    {
      id: 'allcoin',
      apply: (state) => {
        applyAllCoin(state)
      },
    },
    {
      id: 'alllife',
      apply: (state) => {
        applyAllLife(state)
      },
    },
  ]
}

function hammerItemEffects(): ItemEffectFeature[] {
  return [
    {
      id: 'hammer1',
      apply: (state) => {
        state.hammerLv = 1
        state.bronze = false
        state.silver = false
        state.gold = false
      },
    },
    {
      id: 'hammer2',
      apply: (state) => {
        state.hammerLv = 2
        state.bronze = true
      },
    },
    {
      id: 'hammer3',
      apply: (state) => {
        state.hammerLv = 3
        state.silver = true
      },
    },
    {
      id: 'hammer4',
      apply: (state) => {
        state.hammerLv = 4
        state.gold = true
      },
    },
  ]
}

function sekibanItemEffects(): ItemEffectFeature[] {
  return [
    {
      id: 'sekiban1',
      apply: (state) => {
        state.sekiban1 = true
      },
    },
    {
      id: 'sekiban2',
      apply: (state) => {
        state.sekiban2 = true
      },
    },
    {
      id: 'sekiban3',
      apply: (state) => {
        state.sekiban3 = true
      },
    },
  ]
}

/** Default takara / item() effects (registered at boot). */
export function createBuiltinItemEffects(): ItemEffectFeature[] {
  return [
    ...pickupItemEffects(),
    ...hammerItemEffects(),
    ...sekibanItemEffects(),
  ]
}
