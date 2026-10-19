import type { EnemySpawn, MolePhase } from '@/game/types'
import { moleLiftWorld } from './layout3d'
import { MobGlbModel } from './MobGlbModel'
import { MOB_WORLD_HEIGHT, mobGlbKey, mobGlbUrl } from './resolveMobGlb'
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

  const lift = moleLiftWorld(phase, koma, phaseTicks)
  const y = lift + MOB_WORLD_HEIGHT * 0.48
  const pos: [number, number, number] = [0, y, 0]

  const glbKey = mobGlbKey(enemy)
  if (glbKey) {
    return <MobGlbModel url={mobGlbUrl(glbKey)} height={MOB_WORLD_HEIGHT} position={pos} />
  }

  return <MobProcedural3D enemy={enemy} position={pos} />
}
