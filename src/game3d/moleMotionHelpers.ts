import type { SwapCue } from '@game/adventure/swaps'
import type { StolenWeapon } from '@game/adventure/types'
import { bananaFacing } from './bananaMotion'
import type { Group } from 'three'
import type { AdventureActor } from '@game/adventure/types'
import type { HoleIndex, MolePhase } from '@game/types'
import { fxProgress, HIT_MS } from './fx'
import {
  BOARD_SURFACE_Y,
  MOB_TILT_X,
  PINK_LEDGE_POSITION,
  holeWorldPosition,
} from './layout3d'
import {
  plushPopScale,
  slapContact,
  stealRun,
  stealSeconds,
  swapArc,
} from './adventureMotion'
interface Pose {
  hole: HoleIndex
  phase: MolePhase
  target: number
  damaged: boolean
  actor?: AdventureActor
  swapCue?: SwapCue
  reduced: boolean
  stolen?: StolenWeapon
  slapProgress?: number | null
}
export function updateMoleMotion(
  liftGroup: Group,
  bodyGroup: Group,
  pose: Pose,
  hitAt: number,
  elapsed: number,
  delta: number,
  sync: { age: number; at: number },
) {
  const { hole, phase, target, damaged, actor, reduced } = pose
  liftGroup.position.y +=
    (target - liftGroup.position.y) * (1 - Math.exp(-22 * delta))
  const time = elapsed + hole * 0.7
  const idle = phase === 'top' ? 1 : 0.35
  const age = actor?.age ?? 0
  if (sync.age !== age) {
    sync.age = age
    sync.at = elapsed
  }
  const seconds = age / 17 + Math.min(1 / 17, elapsed - sync.at)
  const pop =
    actor && !reduced ? plushPopScale(seconds) : { width: 1, height: 1 }
  let height = pop.height * (1 + 0.04 * idle * Math.sin(time * 5.2))
  let width = pop.width * (1 - 0.025 * idle * Math.sin(time * 5.2))
  let shake = damaged ? Math.sin(time * 63) * 0.012 : 0
  const hit = fxProgress(hitAt, performance.now(), HIT_MS)
  if (hit !== null) {
    const squash = Math.sin(hit * Math.PI)
    height *= 1 - 0.3 * squash
    width *= 1 + 0.2 * squash
    shake += Math.sin(hit * 46) * 0.05 * (1 - hit)
  }
  bodyGroup.scale.set(width, height, width)
  bodyGroup.position.set(shake, 0, 0)
  bodyGroup.rotation.z = 0.06 * idle * Math.sin(time * 2.1)
  bodyGroup.rotation.y =
    actor?.role === 'thief' ? Math.sin(seconds * 4) * 0.16 : 0
  if (pose.swapCue)
    bodyGroup.rotation.y = bananaFacing(
      hole,
      pose.swapCue.partner,
      pose.swapCue.progress,
    )
  if (actor?.swapWith && !reduced) {
    bodyGroup.position.y = Math.abs(Math.sin(time * 18)) * 0.07
    bodyGroup.rotation.z += Math.sin(time * 20) * 0.12
  }
  if (actor && !reduced) applySwap(bodyGroup, actor, hole, seconds)
  if (pose.stolen?.holder === hole)
    applySteal(bodyGroup, hole, pose.stolen, reduced)
  if (pose.slapProgress != null && slapContact(pose.slapProgress)) {
    const whip = Math.sin((pose.slapProgress - 0.4) * 22) * 0.16
    bodyGroup.position.x += whip
    bodyGroup.rotation.z += whip * 1.8
    bodyGroup.rotation.y += 0.45
    height *= 0.82
    width *= 1.18
    bodyGroup.scale.set(width, height, width)
  }
}
function applyWorldOffset(
  body: Group,
  worldX: number,
  worldY: number,
  worldZ: number,
) {
  body.position.x += worldX
  body.position.z +=
    worldZ * Math.cos(MOB_TILT_X) + worldY * Math.sin(MOB_TILT_X)
  body.position.y +=
    -worldZ * Math.sin(MOB_TILT_X) + worldY * Math.cos(MOB_TILT_X)
}
function applySwap(
  body: Group,
  actor: AdventureActor,
  hole: HoleIndex,
  seconds: number,
) {
  const arc = swapArc(actor, seconds)
  if (!arc || actor.swappedFrom === undefined) return
  const origin = holeWorldPosition(actor.swappedFrom),
    destination = holeWorldPosition(hole)
  applyWorldOffset(
    body,
    (origin[0] - destination[0]) * arc.blend,
    arc.lift,
    (origin[2] - destination[2]) * arc.blend,
  )
  body.rotation.y += arc.spin
}
function applySteal(
  body: Group,
  hole: HoleIndex,
  stolen: StolenWeapon,
  reduced: boolean,
) {
  const run = stealRun(stealSeconds(stolen), reduced)
  if (run.travel <= 0 && run.bob === 0 && run.spin === 0) return
  const origin = holeWorldPosition(hole)
  applyWorldOffset(
    body,
    (PINK_LEDGE_POSITION[0] - origin[0]) * run.travel,
    (PINK_LEDGE_POSITION[1] - BOARD_SURFACE_Y) * run.travel +
      run.lift +
      run.bob,
    (PINK_LEDGE_POSITION[2] - origin[2]) * run.travel,
  )
  const towardPink = Math.atan2(
    PINK_LEDGE_POSITION[0] - origin[0],
    PINK_LEDGE_POSITION[2] - origin[2],
  )
  body.rotation.y = towardPink * run.travel
  body.rotation.y += run.spin
  body.rotation.z += run.travel * 0.18
}
