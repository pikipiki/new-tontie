import { Suspense } from 'react'
import type { EnemySpawn, MolePhase } from '@/game/types'
import { moleLiftWorld } from './layout3d'
import { MobGlbModel } from './MobGlbModel'
import { mobGlbUrl, mobModelKey, mobUseGlbModel } from './resolveMobGlb'
import { mobSpriteUrl } from './resolveMobSprite'
import { ProceduralMob3D } from './ProceduralMob3D'
import { SpriteMob3D } from './SpriteMob3D'

const MOLE_W = 0.58
const MOLE_H = 0.74
const MOLE_DEPTH = 0.22

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
  if (phase === 'off') {
    return null
  }

  const lift = moleLiftWorld(phase, koma, phaseTicks)
  const y = lift + MOLE_H * 0.48
  const pos: [number, number, number] = [0, y, 0]

  if (mobUseGlbModel(enemy)) {
    return <MobGlbModel url={mobGlbUrl(mobModelKey(enemy))} height={MOLE_H} position={pos} />
  }

  // Shop export is often empty — always show a readable 3D placeholder.
  if (enemy.kind === 'shop') {
    return <ProceduralMob3D enemy={enemy} width={MOLE_W} height={MOLE_H} depth={MOLE_DEPTH} position={pos} />
  }

  const url = mobSpriteUrl(enemy)
  const fallback = <ProceduralMob3D enemy={enemy} width={MOLE_W} height={MOLE_H} depth={MOLE_DEPTH} position={pos} />

  return (
    <Suspense fallback={fallback}>
      <SpriteMob3D
        enemy={enemy}
        url={url}
        width={MOLE_W}
        height={MOLE_H}
        depth={MOLE_DEPTH}
        position={pos}
      />
    </Suspense>
  )
}
