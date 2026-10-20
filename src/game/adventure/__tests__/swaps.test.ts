import { describe, expect, it } from 'vitest'
import { FPS } from '../../spec'
import { HOLES } from '../../engine/shared'
import { visibleSwapPairs, swapPairCode, SWAP_WARNING_FRAMES } from '../swaps'
import { tickActors } from '../interactions'
import { removeActor } from '../spawn'
import { adventureGame, addActor } from './helpers'
function advanceActors(
  state: ReturnType<typeof adventureGame>['state'],
  frames: number,
) {
  for (let frame = 0; frame < frames; frame += 1) tickActors(state)
}
describe('readable swap pairs', () => {
  it('uses a unique symmetric badge for every possible pair', () => {
    const codes = new Set<string>()
    for (const source of HOLES)
      for (const target of HOLES)
        if (source < target) {
          const pair = swapPairCode(source, target)
          expect(pair).toEqual(swapPairCode(target, source))
          codes.add(pair.code)
        }
    expect(codes.size).toBe(36)
  })
  it('links both live partners during the warning and while they jump', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 5, 'prankster')
    addActor(state, 4, 'singer')
    advanceActors(state, FPS * 2)
    expect(visibleSwapPairs(adventure)).toHaveLength(1)
    expect(visibleSwapPairs(adventure)[0]?.moving).toBe(false)
    const code = visibleSwapPairs(adventure)[0]?.code
    advanceActors(state, SWAP_WARNING_FRAMES)
    expect(visibleSwapPairs(adventure)).toHaveLength(1)
    expect(visibleSwapPairs(adventure)[0]?.code).toBe(code)
    expect(visibleSwapPairs(adventure)[0]?.moving).toBe(true)
  })
  it('cancels the link as soon as a partner is hit', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 5, 'prankster')
    addActor(state, 4, 'singer')
    advanceActors(state, FPS * 2)
    removeActor(state, 4)
    expect(adventure.actors[5]?.swapWith).toBeNull()
    expect(visibleSwapPairs(adventure)).toEqual([])
  })
  it('never announces two swaps involving the same plush', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 5, 'prankster')
    addActor(state, 4, 'singer')
    addActor(state, 6, 'prankster')
    advanceActors(state, FPS * 2)
    expect(visibleSwapPairs(adventure)).toHaveLength(1)
    expect(adventure.actors[6]?.swapWith).toBeNull()
  })
  it('keeps an older partner visible until the announced swap finishes', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 5, 'prankster')
    addActor(state, 4, 'singer')
    const friend = adventure.actors[4]
    if (friend) friend.age = FPS * 3
    advanceActors(state, FPS * 2 + SWAP_WARNING_FRAMES)
    expect(adventure.actors[4]?.role).toBe('prankster')
    expect(adventure.actors[5]?.role).toBe('singer')
    advanceActors(state, 3)
    expect(visibleSwapPairs(adventure)[0]?.moving).toBe(true)
  })
})
