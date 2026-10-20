import { useEffect, useMemo } from 'react'
import { Vector3, type MeshPhysicalMaterial } from 'three'
import { stuffedTube } from './mesh'
import { LASER_GRIP } from '../laserLayout'

/** Bent arm and curled fingers wrap the ray gun's actual grip. */
export function LaserGripArm({ material }: { material: MeshPhysicalMaterial }) {
  const geometry = useMemo(
    () =>
      stuffedTube(
        [
          new Vector3(0.27, 0.43, 0.015),
          new Vector3(0.43, 0.36, 0.12),
          new Vector3(...LASER_GRIP),
        ],
        0.057,
        0.06,
      ),
    [],
  )
  useEffect(
    () => () => {
      geometry.dispose()
    },
    [geometry],
  )
  return (
    <group>
      <mesh geometry={geometry} material={material} castShadow />
      <mesh
        position={LASER_GRIP}
        scale={[0.065, 0.055, 0.06]}
        material={material}
        castShadow
      >
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      {[0, 1, 2].map((finger) => (
        <mesh
          key={finger}
          position={[
            LASER_GRIP[0] - 0.038 + finger * 0.027,
            LASER_GRIP[1] - 0.012,
            LASER_GRIP[2] + 0.055,
          ]}
          scale={[0.019, 0.033, 0.022]}
          material={material}
        >
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
      ))}
    </group>
  )
}
