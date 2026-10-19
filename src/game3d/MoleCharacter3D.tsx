import type { EnemySpawn, MolePhase } from '@/game/types'
import { MOB_TILT_X, moleLiftWorld } from './layout3d'
import { MobGlbModel } from './MobGlbModel'
import { mobGlbHeight, mobGlbKey, mobGlbUrl } from './resolveMobGlb'
import { MobProcedural3D } from './procedural/MobProcedural3D'

export function MoleCharacter3D({
  enemy,
  phase,
  koma,
  phaseTicks,
}: {
  enemy: EnemySpawn
  phase: MolePhase
  koma: number
  phaseTicks: number
}) {
  if (phase === 'off' || enemy.kind === 'none') {
    return null
  }

  const glbKey = mobGlbKey(enemy)
  if (glbKey) {
    const y = moleLiftWorld(
      phase,
      koma,
      phaseTicks,
      mobGlbHeight(glbKey) + 0.05,
    )
    return (
      <MobGlbModel
        url={mobGlbUrl(glbKey)}
        position={[0, y, 0]}
        tilt={MOB_TILT_X}
      />
    )
  }

  return (
    <MobProcedural3D
      enemy={enemy}
      position={[0, moleLiftWorld(phase, koma, phaseTicks), 0]}
    />
  )
}
