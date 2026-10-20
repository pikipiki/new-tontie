import type { AdventureActor } from '@game/adventure/types'

/** Damped spring: overshoots once, then settles without changing the target volume. */
export function plushPopScale(seconds: number) {
  if (seconds >= 0.85) return { width: 1, height: 1 }
  const spring =
    Math.sin(Math.max(0, seconds) * 16) * Math.exp(-Math.max(0, seconds) * 5)
  return { width: 1 - spring * 0.16, height: 1 + spring * 0.25 }
}
export function swapArc(actor: AdventureActor, seconds: number) {
  if (actor.swappedFrom === undefined || actor.swapAge === undefined)
    return null
  const progress = Math.min(
    1,
    Math.max(0, (seconds - actor.swapAge / 17) / 0.65),
  )
  if (progress >= 1) return null
  const blend = (1 - progress) ** 3
  return {
    blend,
    lift: Math.sin(progress * Math.PI) * 0.6,
    spin: Math.sin(progress * Math.PI) * 0.4,
  }
}
