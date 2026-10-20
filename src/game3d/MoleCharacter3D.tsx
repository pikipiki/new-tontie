import { useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import type { Group } from 'three'
import type { EnemySpawn, HoleIndex, MolePhase } from '@game/types'
import { fxProgress, HIT_MS, useGameFx } from '@game3d/fx'
import { MOB_TILT_X, moleLiftWorld } from '@game3d/layout3d'
import { plushIsFrightened } from '@game3d/plushAnimation'
import { MobModel3D } from '@game3d/MobModel3D'
import { mobGlbHeight, mobGlbKey, mobGlbUrl } from '@game3d/resolveMobGlb'

/** Exponential smoothing so 17 fps engine steps read as continuous motion at 60+ fps. */
function damp(
  current: number,
  target: number,
  lambda: number,
  deltaTime: number,
): number {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaTime))
}

export function MoleCharacter3D({
  hole,
  enemy,
  phase,
  koma,
  phaseTicks,
  extraHitRemaining,
}: {
  hole: HoleIndex
  enemy: EnemySpawn
  phase: MolePhase
  koma: number
  phaseTicks: number
  extraHitRemaining: number
}) {
  const gameFx = useGameFx()
  const lift = useRef<Group>(null)
  const body = useRef<Group>(null)
  const key = mobGlbKey(enemy)
  /** Wounded but alive (e.g. the bowl Goonk after its first hit): cracked bowl, scared, trembling. */
  const damaged = plushIsFrightened(enemy, extraHitRemaining)
  const target = moleLiftWorld(
    phase,
    koma,
    phaseTicks,
    mobGlbHeight(key) + 0.05,
  )

  useFrame((frame, deltaTime) => {
    const liftGroup = lift.current
    const bodyGroup = body.current
    if (!liftGroup || !bodyGroup) return
    liftGroup.position.y = damp(liftGroup.position.y, target, 22, deltaTime)

    const timePhase = frame.clock.elapsedTime + hole * 0.7
    const idle = phase === 'top' ? 1 : 0.35
    let scaleY = 1 + 0.04 * idle * Math.sin(timePhase * 5.2)
    let scaleX = 1 - 0.025 * idle * Math.sin(timePhase * 5.2)
    let shake = 0
    const hit = fxProgress(gameFx.holes[hole].hitAt, performance.now(), HIT_MS)
    if (hit !== null) {
      const hitSquash = Math.sin(hit * Math.PI)
      scaleY *= 1 - 0.3 * hitSquash
      scaleX *= 1 + 0.2 * hitSquash
      shake = Math.sin(hit * 46) * 0.05 * (1 - hit)
    }
    if (damaged) {
      shake += Math.sin(timePhase * 63) * 0.012
    }
    bodyGroup.scale.set(scaleX, scaleY, scaleX)
    bodyGroup.position.x = shake
    bodyGroup.rotation.z = 0.06 * idle * Math.sin(timePhase * 2.1)
  })

  if (phase === 'off' || enemy.kind === 'none') {
    return null
  }

  return (
    <group ref={lift} position={[0, target, 0]}>
      <group ref={body} rotation={[MOB_TILT_X, 0, 0]}>
        <Suspense fallback={null}>
          <MobModel3D url={mobGlbUrl(key)} seed={hole} damaged={damaged} />
        </Suspense>
      </group>
    </group>
  )
}
