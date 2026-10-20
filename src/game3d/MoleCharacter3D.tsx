import { useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import type { Group } from 'three'
import type { EnemySpawn, HoleIndex, MolePhase } from '@/game/types'
import { fxProgress, HIT_MS, useGameFx } from './fx'
import { MOB_TILT_X, moleLiftWorld } from './layout3d'
import { plushIsFrightened } from './plushAnimation'
import { MobModel3D } from './MobModel3D'
import { mobGlbHeight, mobGlbKey, mobGlbUrl } from './resolveMobGlb'

/** Exponential smoothing so 17 fps engine steps read as continuous motion at 60+ fps. */
function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number,
): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
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
  const fx = useGameFx()
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

  useFrame((frame, dt) => {
    const g = lift.current
    const b = body.current
    if (!g || !b) return
    g.position.y = damp(g.position.y, target, 22, dt)

    const t = frame.clock.elapsedTime + hole * 0.7
    const idle = phase === 'top' ? 1 : 0.35
    let sy = 1 + 0.04 * idle * Math.sin(t * 5.2)
    let sx = 1 - 0.025 * idle * Math.sin(t * 5.2)
    let shake = 0
    const hit = fxProgress(fx.holes[hole].hitAt, performance.now(), HIT_MS)
    if (hit !== null) {
      const k = Math.sin(hit * Math.PI)
      sy *= 1 - 0.3 * k
      sx *= 1 + 0.2 * k
      shake = Math.sin(hit * 46) * 0.05 * (1 - hit)
    }
    if (damaged) {
      shake += Math.sin(t * 63) * 0.012
    }
    b.scale.set(sx, sy, sx)
    b.position.x = shake
    b.rotation.z = 0.06 * idle * Math.sin(t * 2.1)
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
