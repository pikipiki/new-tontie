import type { EnemySpawn } from '@game/types'
import {
  BOARD_SURFACE_Y,
  hammerSwing,
  PLAYER_SHOULDER,
  PLAYER_YAW,
  strikePose,
} from '@game3d/layout3d'

export const PINK_FLIGHT_MS = 1000

export function plushIsFrightened(
  enemy: EnemySpawn,
  extraHitRemaining: number,
): boolean {
  return (
    enemy.hp > 0 &&
    (enemy.hp < enemy.maxHp ||
      ((enemy.nikai === true || enemy.kind === 'twoHit') &&
        extraHitRemaining === 0))
  )
}

/** A fast approach, a readable strike above the victim, then an arcing return. */
export function pinkFlightPose(
  flightProgress: number,
  home: readonly number[],
  anchor: readonly number[],
  hitY: number,
  origin: readonly number[] = home,
) {
  const pose = strikePose(hitY)
  const arrive = 0.22,
    leave = 0.68
  const ease = (value: number) => 1 - (1 - value) ** 3
  let amount = 1
  if (flightProgress < arrive) {
    amount = ease(flightProgress / arrive)
  } else if (flightProgress > leave) {
    amount = 1 - ease((flightProgress - leave) / (1 - leave))
  }
  const anchorX = anchor[0] ?? 0,
    anchorZ = anchor[2] ?? 0
  const destination = [
    anchorX + pose.body[0],
    BOARD_SURFACE_Y + pose.body[1],
    anchorZ + pose.body[2],
  ]
  const departure = flightProgress < arrive ? origin : home
  const body = destination.map(
    (value, axis) =>
      (departure[axis] ?? 0) + (value - (departure[axis] ?? 0)) * amount,
  ) as [number, number, number]
  body[1] += Math.sin(Math.PI * amount) * 0.48
  const yaw = 0.2 + (PLAYER_YAW - 0.2) * amount
  const [shoulderLocalX, shoulderLocalY, shoulderLocalZ] = PLAYER_SHOULDER
  const shoulder = [
    shoulderLocalX * Math.cos(yaw) + shoulderLocalZ * Math.sin(yaw),
    shoulderLocalY,
    -shoulderLocalX * Math.sin(yaw) + shoulderLocalZ * Math.cos(yaw),
  ]
  const pivot: [number, number, number] = [
    body[0] + (shoulder[0] ?? 0),
    body[1] + shoulderLocalY,
    body[2] + (shoulder[2] ?? 0),
  ]
  const swing = hammerSwing(
    Math.min(1, Math.max(0, (flightProgress - 0.12) / 0.72)),
  )
  return { body, pivot, yaw, angle: swing.angle + pose.tilt, amount }
}

export const PINK_SNACK_SECONDS = 3.6

/** Lift the snack, take a bite, chew, then lower it before the next bite. */
export function pinkSnackPose(seconds: number) {
  const phase = Math.max(0, seconds) % PINK_SNACK_SECONDS
  const smooth = (value: number) => {
    const clamped = Math.min(1, Math.max(0, value))
    return clamped * clamped * (3 - 2 * clamped)
  }
  const lift = smooth((phase - 0.2) / 0.7) * (1 - smooth((phase - 1.9) / 0.7))
  const chewing = phase >= 1.05 && phase < 2.45
  const chew = chewing ? (1 + Math.sin((phase - 1.05) * 24)) / 2 : 0
  return {
    lift,
    chew,
    bitten: phase >= 1.1 && phase < 3.1,
    crumb: phase >= 1.1 && phase < 1.8 ? (phase - 1.1) / 0.7 : null,
  }
}
