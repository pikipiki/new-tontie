import { RoundedBox } from '@react-three/drei'
import { useEffect } from 'react'
import { Mesh, MeshStandardMaterial } from 'three'
import { BOARD_SURFACE_Y } from './layout3d'
import { useClonedGltf } from './useClonedGltf'

/** Reuse the genuinely cut-out board, with a taller upholstered arcade marquee. */
export function BoardScene3D() {
  const root = useClonedGltf('/game/models/board.glb')
  useEffect(() => {
    root.traverse((obj) => {
      if (/^(BackPanel|BackFrame|BackStars|Text_|Mascot)/.test(obj.name))
        obj.visible = false
      if (!(obj instanceof Mesh)) return
      const materials = Array.isArray(obj.material)
        ? obj.material
        : [obj.material]
      for (const material of materials) {
        if (!(material instanceof MeshStandardMaterial)) continue
        if (/BackPlush/.test(material.name)) material.emissiveIntensity = 0
        if (/Carpet/.test(material.name)) material.color.set('#d9b0a7')
        if (/RimPlush|BumperPlush|Cabinet/.test(material.name))
          material.color.set('#b49dba')
      }
    })
  }, [root])
  return (
    <group position={[0, BOARD_SURFACE_Y, 0]}>
      <primitive object={root} />
      <RoundedBox
        position={[0, 1.04, -2.23]}
        args={[4.42, 2.62, 0.28]}
        radius={0.28}
        smoothness={6}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#9b557f"
          roughness={0.94}
          sheen={1}
          sheenColor="#d690af"
        />
      </RoundedBox>
      <RoundedBox
        position={[0, 1.04, -2.065]}
        args={[4.18, 2.4, 0.12]}
        radius={0.25}
        smoothness={6}
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#c789a1"
          roughness={0.94}
          sheen={1}
          sheenColor="#efbac4"
        />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.99, 0.02, 1.91]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.025, 20]} />
            <meshStandardMaterial
              color="#c89a72"
              metalness={0.75}
              roughness={0.35}
            />
          </mesh>
        </group>
      ))}
      <RoundedBox
        position={[1.66, -0.32, 2.115]}
        args={[0.32, 0.44, 0.06]}
        radius={0.035}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#b9a49c"
          metalness={0.85}
          roughness={0.3}
        />
      </RoundedBox>
      <mesh position={[1.66, -0.29, 2.15]}>
        <boxGeometry args={[0.035, 0.21, 0.018]} />
        <meshStandardMaterial color="#19131d" />
      </mesh>
    </group>
  )
}
