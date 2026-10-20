import { FPS } from '../spec'
import { HOLES } from '../engine/shared'
import type { HoleIndex } from '../types'
import type { AdventureState } from './types'

export const SWAP_WARNING_FRAMES = Math.round(FPS * 1.5)
export const SWAP_TRAVEL_FRAMES = Math.ceil(FPS * 0.65)
export interface SwapPair {
  source: HoleIndex
  target: HoleIndex
  code: string
  colorIndex: number
  moving: boolean
}
export function swapReserved(
  adventure: AdventureState,
  hole: HoleIndex,
): boolean {
  const actor = adventure.actors[hole]
  const travelling =
    actor?.swapAge !== undefined &&
    actor.age - actor.swapAge < SWAP_TRAVEL_FRAMES
  return (
    Boolean(actor?.swapWith) ||
    travelling ||
    HOLES.some((other) => adventure.actors[other]?.swapWith === hole)
  )
}
export function swapPairCode(
  source: HoleIndex,
  target: HoleIndex,
): { code: string; colorIndex: number } {
  const lower = Math.min(source, target),
    upper = Math.max(source, target)
  let index = upper - lower - 1
  for (let hole = 1; hole < lower; hole += 1) index += 9 - hole
  let code = String.fromCharCode(65 + index)
  if (index >= 26) code = `A${String.fromCharCode(65 + index - 26)}`
  return { code, colorIndex: index % 4 }
}
/** Only live pairs get a link; keep it briefly while both plushes follow their jump arcs. */
export function visibleSwapPairs(adventure: AdventureState): SwapPair[] {
  const pairs = new Map<string, SwapPair>()
  for (const source of HOLES) {
    const actor = adventure.actors[source]
    if (!actor) continue
    let target = actor.swapWith
    let moving = false
    if (
      !target &&
      actor.swappedFrom &&
      actor.swapAge !== undefined &&
      actor.age - actor.swapAge < SWAP_TRAVEL_FRAMES
    ) {
      target = actor.swappedFrom
      moving = true
    }
    if (!target) continue
    const friend = adventure.actors[target]
    if (!friend) continue
    if (moving && friend.swappedFrom !== source) continue
    const identity = swapPairCode(source, target)
    if (!pairs.has(identity.code))
      pairs.set(identity.code, { source, target, ...identity, moving })
  }
  return [...pairs.values()]
}

export interface SwapCue {
  partner: HoleIndex
  progress: number
  reverse: boolean
}
export function pendingSwapCue(
  adventure: AdventureState,
  hole: HoleIndex,
): SwapCue | undefined {
  const source = HOLES.find(
    (other) =>
      adventure.actors[other]?.swapWith === hole ||
      (other === hole && adventure.actors[other]?.swapWith),
  )
  if (!source) return undefined
  const actor = adventure.actors[source]
  const partner = source === hole ? actor?.swapWith : source
  if (!actor || !partner || !adventure.actors[partner]) return undefined
  return {
    partner,
    progress: Math.min(
      1,
      Math.max(0, (actor.age - FPS * 2) / SWAP_WARNING_FRAMES),
    ),
    reverse: source !== hole,
  }
}
