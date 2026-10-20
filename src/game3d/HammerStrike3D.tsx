import { useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import type { Group } from 'three'
import type { HoleIndex } from '@/game/types'
import { ImpactRing3D } from './Burst3D'
import { fxProgress, STRIKE_MS, useGameFx } from './fx'
import {
  HAMMER_IMPACT_T,
  hammerSwing,
  PLAYER_YAW,
  strikePose,
} from './layout3d'
import { MobModel3D } from './MobModel3D'
import { tintMeshesByPrefix } from './sceneMutations'
import { useClonedGltf } from './useClonedGltf'

const HAMMER_GLB = '/game/models/hammer.glb'
const PLAYER_GLB = '/game/models/player.glb'

/** DefineSprite_208 hammer levels: the pink plush mallet, then bronze, silver and gold heads. */
const HEAD_TINT: Record<number, { color: string; metal: number }> = {
  1: { color: '#ff86bd', metal: 0 },
  2: { color: '#c27a3a', metal: 0.75 },
  3: { color: '#e9eef5', metal: 0.75 },
  4: { color: '#ffc83a', metal: 0.75 },
}

function HammerModel({ hammerLv }: { hammerLv: number }) {
  const root = useClonedGltf(HAMMER_GLB)
  useEffect(() => {
    const tint = HEAD_TINT[hammerLv] ?? HEAD_TINT[4]
    if (tint) {
      tintMeshesByPrefix(root, 'Head', tint.color, tint.metal)
    }
  }, [root, hammerLv])
  return <primitive object={root} />
}

/** The pink Goonk floats over the hole and swings the mallet from its shoulder onto `hitY`. */
export function HammerStrike3D({
  hole,
  hitY,
  hammerLv,
}: {
  hole: HoleIndex
  hitY: number
  hammerLv: number
}) {
  const fx = useGameFx()
  const pivot = useRef<Group>(null)
  const player = useRef<Group>(null)
  /** Impact height captured when the strike starts, so a kill mid-swing doesn't drop the hammer. */
  const frozen = useRef({ at: Number.NaN, y: 0 })
  const strikeAt = fx.holes[hole].strikeAt

  useFrame(() => {
    const g = pivot.current
    const p = player.current
    if (!g || !p) return
    if (frozen.current.at !== strikeAt) {
      frozen.current = { at: strikeAt, y: hitY }
    }
    const t = fxProgress(strikeAt, performance.now(), STRIKE_MS)
    g.visible = t !== null
    p.visible = t !== null
    if (t === null) return
    const pose = strikePose(frozen.current.y)
    const { angle, scale } = hammerSwing(t)
    const bob = Math.sin(performance.now() / 160 + hole) * 0.025
    g.position.set(pose.pivot[0], pose.pivot[1] + bob, pose.pivot[2])
    g.rotation.z = angle + pose.tilt
    g.scale.setScalar(scale)

    const impact = t > HAMMER_IMPACT_T && t < 0.62
    const squash = impact ? 0.93 : 1
    p.position.set(pose.body[0], pose.body[1] + bob, pose.body[2])
    p.scale.set(scale * (2 - squash), scale * squash, scale * (2 - squash))
  })

  return (
    <group>
      <group ref={pivot} visible={false}>
        <Suspense fallback={null}>
          <HammerModel hammerLv={hammerLv} />
        </Suspense>
      </group>
      <group ref={player} rotation={[0, PLAYER_YAW, 0]} visible={false}>
        <Suspense fallback={null}>
          <MobModel3D url={PLAYER_GLB} seed={hole} />
        </Suspense>
      </group>
      <ImpactRing3D
        startAt={strikeAt + STRIKE_MS * HAMMER_IMPACT_T}
        y={hitY + 0.01}
      />
    </group>
  )
}
