import { themeColors } from '@/components/Tontie3D/theme'
import { useFrame } from '@react-three/fiber'

const plush = themeColors.plush
import { useRef } from 'react'
import type { Group } from 'three'

export function CryingFace() {
  const drops = useRef<(Group | null)[]>([])
  useFrame(({ clock }) => {
    drops.current.forEach((drop, dropIndex) => {
      if (!drop) return
      const side = dropIndex < 3 ? -1 : 1
      const phase = (clock.elapsedTime * 1.8 + (dropIndex % 3) / 3) % 1
      drop.position.set(
        side * (0.12 + phase * 0.065),
        0.54 - 0.3 * phase,
        0.263 + phase * 0.04,
      )
      drop.scale.setScalar(Math.sin(phase * Math.PI) * 0.8 + 0.2)
    })
  })
  return (
    <group>
      {Array.from({ length: 6 }, (_, dropIndex) => (
        <group
          key={dropIndex}
          ref={(group) => {
            drops.current[dropIndex] = group
          }}
        >
          <mesh scale={[0.017, 0.033, 0.009]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial
              color={plush.tearBlue}
              roughness={0.13}
              clearcoat={1}
            />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.108, 0.66, 0.225]}
          rotation={[0, 0, side * -0.4]}
          scale={[0.055, 0.009, 0.008]}
        >
          <sphereGeometry args={[1, 16, 8]} />
          <meshStandardMaterial color={plush.facePurple} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0.093, 0.27, 0.263]} scale={[0.044, 0.058, 0.009]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={plush.faceInk} roughness={0.8} />
      </mesh>
      <mesh position={[0.093, 0.244, 0.273]} scale={[0.027, 0.021, 0.006]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={plush.mouthPink} roughness={0.8} />
      </mesh>
    </group>
  )
}
