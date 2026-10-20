import type { SwapCue } from '@game/adventure/swaps'
import { bananaFacing } from './bananaMotion'
import type { Group } from 'three'
import type { AdventureActor } from '@game/adventure/types'
import type { HoleIndex, MolePhase } from '@game/types'
import { fxProgress, HIT_MS } from './fx'
import { MOB_TILT_X, holeWorldPosition } from './layout3d'
import { plushPopScale, swapArc } from './adventureMotion'
interface Pose {
  hole: HoleIndex
  phase: MolePhase
  target: number
  damaged: boolean
  actor?: AdventureActor
  swapCue?: SwapCue
  reduced: boolean
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
  body.position.x += (origin[0] - destination[0]) * arc.blend
  const travelZ = (origin[2] - destination[2]) * arc.blend
  body.position.z =
    travelZ * Math.cos(MOB_TILT_X) + arc.lift * Math.sin(MOB_TILT_X)
  body.position.y +=
    -travelZ * Math.sin(MOB_TILT_X) + arc.lift * Math.cos(MOB_TILT_X)
  body.rotation.y += arc.spin
}
