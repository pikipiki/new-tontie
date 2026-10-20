import type { BufferGeometry, Plane } from 'three'
import { themeColors } from './theme'

export function CrystalHeartSurfaces({
  geometry,
  planes,
}: {
  geometry: BufferGeometry
  planes: { full: Plane[]; empty: Plane[] }
}) {
  return (
    <>
      <mesh geometry={geometry} dispose={null}>
        <meshPhysicalMaterial
          color={themeColors.red}
          roughness={0.075}
          metalness={0.08}
          transmission={0.58}
          thickness={0.75}
          ior={1.85}
          dispersion={0.6}
          attenuationColor={themeColors.redDeep}
          attenuationDistance={0.85}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={2.4}
          flatShading
          clippingPlanes={planes.full}
        />
      </mesh>
      <mesh geometry={geometry} dispose={null}>
        <meshPhysicalMaterial
          color={themeColors.ink}
          roughness={0.28}
          metalness={0.25}
          transmission={0.12}
          thickness={0.5}
          ior={1.65}
          clearcoat={1}
          envMapIntensity={0.8}
          flatShading
          clippingPlanes={planes.empty}
        />
      </mesh>
    </>
  )
}
