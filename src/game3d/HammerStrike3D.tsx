import { useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import type { Group } from 'three'
import type { HoleIndex } from '@/game/types'
import { ImpactRing3D } from './Burst3D'
import { fxProgress, STRIKE_MS, useGameFx } from './fx'
import { tintMeshesByPrefix } from './sceneMutations'
import { useClonedGltf } from './useClonedGltf'
import { HAMMER_IMPACT_T, hammerSwing } from './layout3d'

const HAMMER_GLB = '/game/models/hammer.glb'
/** Grip sits right of the hole; the head (at local -X) lands on the target. */
const GRIP_OFFSET_X = 0.52
const HEAD_HALF_HEIGHT = 0.16
/** Slightly towards the camera so the head reads as landing on the monster's head, not inside it. */
const HEAD_Z = 0.1

/** DefineSprite_208 hammer levels: iron, bronze, silver, gold heads. */
const HEAD_TINT: Record<number, string> = {
  1: '#9aa3ad',
  2: '#c27a3a',
  3: '#e9eef5',
  4: '#ffc83a',
}

function HammerModel({ hammerLv }: { hammerLv: number }) {
  const root = useClonedGltf(HAMMER_GLB)
  useEffect(() => {
    tintMeshesByPrefix(
      root,
      'Head',
      HEAD_TINT[hammerLv] ?? '#ffc83a',
      0.75,
      hammerLv >= 3 ? 0.25 : 0.4,
    )
  }, [root, hammerLv])
  return <primitive object={root} />
}

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
  const lane = useRef<Group>(null)
  const pivot = useRef<Group>(null)
  /** Impact height captured when the strike starts, so a kill mid-swing doesn't drop the hammer. */
  const frozen = useRef({ at: Number.NaN, y: 0 })
  const strikeAt = fx.holes[hole].strikeAt

  useFrame(() => {
    const l = lane.current
    const g = pivot.current
    if (!l || !g) return
    if (frozen.current.at !== strikeAt) {
      frozen.current = { at: strikeAt, y: hitY }
    }
    const t = fxProgress(strikeAt, performance.now(), STRIKE_MS)
    g.visible = t !== null
    if (t === null) return
    l.position.y = frozen.current.y
    const { angle, scale } = hammerSwing(t)
    g.rotation.z = angle
    g.scale.setScalar(scale)
  })

  return (
    <group ref={lane} position={[0, hitY, 0]}>
      <group
        ref={pivot}
        position={[GRIP_OFFSET_X, HEAD_HALF_HEIGHT + 0.01, HEAD_Z]}
        visible={false}
      >
        <Suspense fallback={null}>
          <HammerModel hammerLv={hammerLv} />
        </Suspense>
      </group>
      <ImpactRing3D startAt={strikeAt + STRIKE_MS * HAMMER_IMPACT_T} y={0.01} />
    </group>
  )
}
