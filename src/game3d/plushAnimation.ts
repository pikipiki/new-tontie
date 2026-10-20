import type { EnemySpawn } from '@/game/types'
import {
  BOARD_SURFACE_Y,
  hammerSwing,
  PLAYER_SHOULDER,
  PLAYER_YAW,
  strikePose,
} from './layout3d'

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
  t: number,
  home: readonly number[],
  anchor: readonly number[],
  hitY: number,
  origin: readonly number[] = home,
) {
  const pose = strikePose(hitY)
  const arrive = 0.22,
    leave = 0.68
  const ease = (v: number) => 1 - (1 - v) ** 3
  const amount =
    t < arrive
      ? ease(t / arrive)
      : t > leave
        ? 1 - ease((t - leave) / (1 - leave))
        : 1
  const x = anchor[0] ?? 0,
    z = anchor[2] ?? 0
  const destination = [
    x + pose.body[0],
    BOARD_SURFACE_Y + pose.body[1],
    z + pose.body[2],
  ]
  const departure = t < arrive ? origin : home
  const body = destination.map(
    (v, i) => (departure[i] ?? 0) + (v - (departure[i] ?? 0)) * amount,
  ) as [number, number, number]
  body[1] += Math.sin(Math.PI * amount) * 0.48
  const yaw = 0.2 + (PLAYER_YAW - 0.2) * amount
  const [sx, sy, sz] = PLAYER_SHOULDER
  const shoulder = [
    sx * Math.cos(yaw) + sz * Math.sin(yaw),
    sy,
    -sx * Math.sin(yaw) + sz * Math.cos(yaw),
  ]
  const pivot: [number, number, number] = [
    body[0] + (shoulder[0] ?? 0),
    body[1] + sy,
    body[2] + (shoulder[2] ?? 0),
  ]
  const swing = hammerSwing(Math.min(1, Math.max(0, (t - 0.12) / 0.72)))
  return { body, pivot, yaw, angle: swing.angle + pose.tilt, amount }
}

export const PINK_SNACK_SECONDS = 3.6

/** Lift the snack, take a bite, chew, then lower it before the next bite. */
export function pinkSnackPose(seconds: number) {
  const t = Math.max(0, seconds) % PINK_SNACK_SECONDS
  const smooth = (v: number) => {
    const x = Math.min(1, Math.max(0, v))
    return x * x * (3 - 2 * x)
  }
  const lift = smooth((t - 0.2) / 0.7) * (1 - smooth((t - 1.9) / 0.7))
  const chewing = t >= 1.05 && t < 2.45
  const chew = chewing ? (1 + Math.sin((t - 1.05) * 24)) / 2 : 0
  return {
    lift,
    chew,
    bitten: t >= 1.1 && t < 3.1,
    crumb: t >= 1.1 && t < 1.8 ? (t - 1.1) / 0.7 : null,
  }
}
