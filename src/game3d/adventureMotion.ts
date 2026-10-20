import type { AdventureActor, StolenWeapon } from '@game/adventure/types'
import {
  STEAL_BACK,
  STEAL_END,
  STEAL_GRAB,
  STEAL_OUT,
  STEAL_WAIT,
} from '@game/adventure/stealTiming'

export { STEAL_BACK, STEAL_END, STEAL_GRAB, STEAL_OUT, STEAL_WAIT }

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

const SLAP_WINDUP = 0.22
const SLAP_CONTACT = 0.4

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}
function smooth(value: number) {
  const amount = clamp(value)
  return amount * amount * (3 - 2 * amount)
}

export function stealSeconds(stolen: Pick<StolenWeapon, 'age'>) {
  return stolen.age / 17
}

/** Violet plush waits for the swap to land, dashes to pink, snatches, then sprints home. */
export function stealRun(seconds: number, reduced = false) {
  if (seconds < STEAL_WAIT)
    return {
      phase: 'wait' as const,
      travel: 0,
      hasWeapon: false,
      lift: 0,
      bob: 0,
      spin: 0,
    }
  if (reduced)
    return {
      phase: 'held' as const,
      travel: 0,
      hasWeapon: true,
      lift: 0,
      bob: 0,
      spin: 0,
    }
  const elapsed = seconds - STEAL_WAIT
  if (elapsed < STEAL_OUT) {
    const blend = smooth(elapsed / STEAL_OUT)
    return {
      phase: 'out' as const,
      travel: blend,
      hasWeapon: false,
      lift: Math.sin(blend * Math.PI) * 0.55,
      bob: Math.abs(Math.sin(blend * 20)) * 0.09,
      spin: Math.sin(blend * Math.PI) * 0.18,
    }
  }
  if (elapsed < STEAL_OUT + STEAL_GRAB) {
    const blend = (elapsed - STEAL_OUT) / STEAL_GRAB
    return {
      phase: 'grab' as const,
      travel: 1,
      hasWeapon: true,
      lift: 0.14,
      bob: 0,
      spin: Math.sin(blend * Math.PI) * 0.45,
    }
  }
  if (elapsed < STEAL_OUT + STEAL_GRAB + STEAL_BACK) {
    const blend = smooth((elapsed - STEAL_OUT - STEAL_GRAB) / STEAL_BACK)
    return {
      phase: 'back' as const,
      travel: 1 - blend,
      hasWeapon: true,
      lift: Math.sin((1 - blend) * Math.PI) * 0.55,
      bob: Math.abs(Math.sin(blend * 20)) * 0.09,
      spin: Math.sin((1 - blend) * Math.PI) * 0.18,
    }
  }
  return {
    phase: 'held' as const,
    travel: 0,
    hasWeapon: true,
    lift: 0,
    bob: 0,
    spin: 0,
  }
}

export function thiefHoldsWeapon(
  stolen: Pick<StolenWeapon, 'age'>,
  reduced = false,
) {
  return stealRun(stealSeconds(stolen), reduced).hasWeapon
}

export function pinkLostWeapon(
  stolen?: Pick<StolenWeapon, 'age' | 'holder'> | null,
  reduced = false,
) {
  return Boolean(
    stolen && (stolen.holder === null || thiefHoldsWeapon(stolen, reduced)),
  )
}

/** Open-hand slap: wind up, whip, hold contact, then settle. */
export function slapArmSwing(progress: number) {
  const phase = clamp(progress)
  if (phase < SLAP_WINDUP) return (phase / SLAP_WINDUP) * -1.15
  if (phase < SLAP_CONTACT)
    return -1.15 + ((phase - SLAP_WINDUP) / (SLAP_CONTACT - SLAP_WINDUP)) * 2.55
  if (phase < 0.55) return 1.4 - ((phase - SLAP_CONTACT) / 0.15) * 0.35
  return 1.05 * (1 - (phase - 0.55) / 0.45)
}

export function slapContact(progress: number) {
  return progress >= SLAP_CONTACT && progress < 0.72
}
