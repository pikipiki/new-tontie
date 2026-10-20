import { useEffect } from 'react'
import type { HoleIndex } from '@/game/types'
import { ImpactRing3D } from './Burst3D'
import { useGameFx } from './fx'
import { PINK_FLIGHT_MS } from './plushAnimation'
import { applyHammerAppearance } from './hammerAppearance'
import { useClonedGltf } from './useClonedGltf'

const HAMMER_GLB = '/game/models/hammer.glb'

/** The resting and flying player share the exact same equipped weapon. */
export function HammerModel({
  hammerLv,
  wing = false,
}: {
  hammerLv: number
  wing?: boolean
}) {
  const root = useClonedGltf(HAMMER_GLB)
  useEffect(() => {
    applyHammerAppearance(root, hammerLv)
  }, [root, hammerLv])
  return (
    <group>
      <primitive object={root} />
      {wing && (
        <group position={[-0.27, 0.035, 0]}>
          {[-1, 1].map((side) => (
            <group key={side}>
              {[0, 1, 2].map((feather) => (
                <mesh
                  key={feather}
                  position={[
                    feather * -0.022,
                    0.015 + feather * 0.008,
                    side * (0.04 + feather * 0.018),
                  ]}
                  rotation={[side * 0.55, side * -0.35, 0]}
                  scale={[0.025, 0.065 - feather * 0.008, 0.014]}
                >
                  <sphereGeometry args={[1, 16, 10]} />
                  <meshPhysicalMaterial
                    color="#fff3cc"
                    roughness={0.7}
                    sheen={0.5}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}
    </group>
  )
}

/** Impact stays at the target; the mallet is attached to the flying pink character. */
export function HammerStrike3D({
  hole,
  hitY,
}: {
  hole: HoleIndex
  hitY: number
  hammerLv: number
}) {
  const fx = useGameFx()
  return (
    <ImpactRing3D
      startAt={fx.holes[hole].strikeAt + PINK_FLIGHT_MS * 0.42}
      y={hitY + 0.01}
    />
  )
}
