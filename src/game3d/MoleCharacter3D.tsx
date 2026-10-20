import type { AdventureRole } from '@game/adventure/types'
import { AdventureAccessory3D } from './AdventureAccessory3D'
import { useMoleMotion } from './useMoleMotion'
import type { AdventureActor } from '@game/adventure/types'
import { Suspense, useRef } from 'react'
import type { Group } from 'three'
import type { EnemySpawn, HoleIndex, MolePhase } from '@game/types'
import { MOB_TILT_X, moleLiftWorld } from '@game3d/layout3d'
import { plushIsFrightened } from '@game3d/plushAnimation'
import { MobModel3D } from '@game3d/MobModel3D'
import { mobGlbHeight, mobGlbKey, mobGlbUrl } from '@game3d/resolveMobGlb'

export function MoleCharacter3D({
  hole,
  enemy,
  phase,
  koma,
  phaseTicks,
  extraHitRemaining,
  role,
  actor,
}: {
  hole: HoleIndex
  enemy: EnemySpawn
  phase: MolePhase
  koma: number
  phaseTicks: number
  extraHitRemaining: number
  role?: AdventureRole
  actor?: AdventureActor
}) {
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

  useMoleMotion({ hole, phase, target, damaged, lift, body, actor })

  if (phase === 'off' || enemy.kind === 'none') {
    return null
  }

  return (
    <group ref={lift} position={[0, target, 0]}>
      <group ref={body} rotation={[MOB_TILT_X, 0, 0]}>
        <Suspense fallback={null}>
          <MobModel3D url={mobGlbUrl(key)} seed={hole} damaged={damaged} />
        </Suspense>
        <AdventureAccessory3D role={role} />
      </group>
    </group>
  )
}
