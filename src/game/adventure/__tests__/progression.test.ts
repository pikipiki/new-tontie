import { describe, expect, it } from 'vitest'
import { continueGame, queueHit, startLevel, tick } from '../../engine'
import { HOLES } from '../../engine/shared'
import { GameSession } from '@/session/GameSession'
import { missionFor } from '../content'
import { chooseUpgrade, finishAdventureStage, prepareAdventure } from '../state'
import { resolveAdventureHits } from '../combat'
import { adventureGame, addActor, advance } from './helpers'

describe('adventure progression', () => {
  it('offers three distinct unowned powers and waits for an explicit choice', () => {
    const { state, adventure } = adventureGame()
    adventure.upgrades = ['quickBites']
    finishAdventureStage(state, () => 0)
    expect(new Set(adventure.offers).size).toBe(3)
    expect(adventure.offers).not.toContain('quickBites')
    advance(state, 400)
    expect(state.phase).toBe('levelClear')
    chooseUpgrade(state, 'quickBites')
    expect(adventure.stage).toBe(1)
    const offer = adventure.offers[0]
    if (!offer) throw new Error('Missing reward')
    chooseUpgrade(state, offer)
    expect(adventure.stage).toBe(2)
    expect(state.phase).toBe('levelIntro')
    expect(adventure.upgrades).toContain(offer)
  })
  it.each(['cake', 'noise', 'health', 'time'])(
    'ends a failed mission for %s',
    (reason) => {
      const { state, adventure } = adventureGame()
      if (reason === 'cake') adventure.cake = 0
      if (reason === 'noise') adventure.noise = 5
      if (reason === 'health') state.hp = 0
      if (reason === 'time') state.roundFramesLeft = 1
      tick(state, () => 0)
      expect(state.phase).toBe('gameOver')
      expect(adventure.failure.length).toBeGreaterThan(0)
      expect(state.pikoOk).toBe(false)
    },
  )
  it('spends a finite continue and restarts the current mission, retaining powers', () => {
    const { state, adventure } = adventureGame(4)
    adventure.upgrades = ['hammer']
    adventure.progress = 3
    state.hp = 0
    tick(state, () => 0)
    const credits = state.continues
    expect(continueGame(state)).toBe(true)
    expect(state.continues).toBe(credits - 1)
    expect(adventure.stage).toBe(4)
    expect(adventure.progress).toBe(0)
    expect(adventure.upgrades).toContain('hammer')
  })
  it('resets powers for a fresh run and keeps Classic available', () => {
    const session = new GameSession({
      adventure: true,
      presenter: { present: () => undefined },
    })
    session.state.adventure?.upgrades.push('laser')
    session.reset()
    expect(session.state.adventure?.upgrades).toEqual([])
    session.setMode(false)
    expect(session.state.adventure).toBeUndefined()
    expect(session.state.level).toBe(1)
  })
})
describe('upgrade synergies', () => {
  it('bounces a hammer kill to one enemy and leaves innocent guests alone', () => {
    const { state, adventure } = adventureGame(4)
    adventure.upgrades = ['ricochet']
    addActor(state, 1, 'innocent')
    addActor(state, 5, 'impostor')
    addActor(state, 6, 'impostor')
    queueHit(state, 5)
    resolveAdventureHits(state)
    expect(adventure.progress).toBe(2)
    expect(adventure.actors[1]?.role).toBe('innocent')
  })
  it('a laser pierces one helmet, spends one shot, and never ricochets', () => {
    const { state, adventure } = adventureGame(5)
    adventure.upgrades = ['laser', 'ricochet']
    state.gun = 1
    state.gunAmmo = 1
    addActor(state, 5, 'helmet')
    addActor(state, 6, 'helmet')
    queueHit(state, 5)
    resolveAdventureHits(state)
    expect(state.gunAmmo).toBe(0)
    expect(state.gun).toBe(0)
    expect(state.holes[5].phase).toBe('off')
    expect(state.holes[6].nikaiRemaining).toBe(1)
    expect(adventure.progress).toBe(1)
  })
  it('replenishes the selected ray and adds time at the next mission', () => {
    const { state, adventure } = adventureGame(2)
    adventure.upgrades = ['laser', 'extraTime', 'comfort']
    prepareAdventure(state)
    expect(state.gunAmmo).toBe(50)
    expect(state.stone).toBe(true)
    expect(state.roundFramesLeft).toBe((missionFor(2).seconds + 10) * 17)
  })
})
function playWholeRun(seed: number) {
  const { state, adventure } = adventureGame()
  let entropy = seed
  const random = () => {
    entropy = (entropy * 1664525 + 1013904223) >>> 0
    return entropy / 4294967296
  }
  for (
    let frame = 0;
    frame < 6000 && state.phase !== 'win' && state.phase !== 'gameOver';
    frame += 1
  ) {
    if (state.phase === 'levelIntro') startLevel(state)
    if (state.phase === 'levelClear') {
      const offer = adventure.offers[0]
      if (offer) chooseUpgrade(state, offer)
    }
    autoStrike(state)
    tick(state, random)
  }
  return { state, adventure }
}
describe('complete six-mission adventures', () => {
  it.each([17, 932, 4431, 86434, 391949])(
    'can win with generated upgrade choices, seed %i',
    (seed) => {
      const { state, adventure } = playWholeRun(seed)
      expect(state.phase).toBe('win')
      expect(adventure.stage).toBe(6)
      expect(adventure.upgrades).toHaveLength(5)
      expect(new Set(adventure.upgrades).size).toBe(5)
      expect(state.hp).toBeGreaterThan(0)
    },
  )
})

function autoStrike(state: ReturnType<typeof adventureGame>['state']) {
  const adventure = state.adventure
  if (!adventure || state.phase !== 'playing') return
  if (adventure.stolenWeapon) {
    queueHit(
      state,
      adventure.stolenWeapon.holder ?? adventure.stolenWeapon.dropHole,
    )
    return
  }
  if (adventure.boss) {
    if (!adventure.boss.warning) queueHit(state, adventure.boss.weak)
  }
  for (const hole of HOLES) {
    const actor = adventure.actors[hole]
    if (actor && actor.role !== 'innocent' && actor.role !== 'boss')
      queueHit(state, hole)
  }
}
