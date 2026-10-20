import type { BufferGeometry } from 'three'
import { themeColors } from './theme'
import { CrystalHeartSurfaces } from './CrystalHeartSurfaces'
import { useCrystalHeartAnimation } from './useCrystalHeartAnimation'

export function CrystalHeart3D({
  geometry,
  edges,
  fill,
  index,
  reducedMotion,
}: {
  geometry: BufferGeometry
  edges: BufferGeometry
  fill: number
  index: number
  reducedMotion: boolean
}) {
  const { root, sparkle, center, planes } = useCrystalHeartAnimation(
    fill,
    index,
    reducedMotion,
  )
  return (
    <group position={[center, 0, 0]}>
      <group ref={root} rotation={[-0.13, -0.22, -0.035]}>
        <CrystalHeartSurfaces geometry={geometry} planes={planes} />
        <lineSegments geometry={edges} dispose={null}>
          <lineBasicMaterial
            color={themeColors.white}
            transparent
            opacity={fill > 0 ? 0.62 : 0.23}
            depthWrite={false}
          />
        </lineSegments>
        <group ref={sparkle} position={[-0.47, 0.4, 0.29]}>
          <mesh scale={[0.027, 0.12, 0.015]}>
            <octahedronGeometry />
            <meshBasicMaterial color={themeColors.white} toneMapped={false} />
          </mesh>
          <mesh scale={[0.09, 0.022, 0.015]}>
            <octahedronGeometry />
            <meshBasicMaterial color={themeColors.white} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
