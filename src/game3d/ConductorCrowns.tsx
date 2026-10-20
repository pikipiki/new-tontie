import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { BOSS_HOLES } from '@game/adventure/boss'
import type { AdventureState } from '@game/adventure/types'
import { BOARD_SURFACE_Y, holeWorldPosition } from './layout3d'
import { themeColors as colors } from './theme'
import { useReducedMotion } from '@/hooks/useReducedMotion'
export function ConductorCrowns({
  boss,
  crownColor,
}: {
  boss: NonNullable<AdventureState['boss']>
  crownColor: string
}) {
  const gem = useRef<Group>(null),
    reduced = useReducedMotion()
  const [posX, , posZ] = holeWorldPosition(boss.weak)
  useFrame(({ clock }) => {
    if (gem.current && !reduced)
      gem.current.rotation.y = clock.elapsedTime * 1.8
  })
  return (
    <group>
      {BOSS_HOLES.map((hole) => {
        const [targetX, , targetZ] = holeWorldPosition(hole)
        return (
          <mesh
            key={hole}
            position={[targetX, BOARD_SURFACE_Y + 0.04, targetZ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.43, 0.045, 10, 48]} />
            <meshStandardMaterial
              color={hole === boss.weak ? crownColor : colors.purpleSoft}
              emissive={hole === boss.weak ? crownColor : colors.purpleDeep}
              emissiveIntensity={0.7}
            />
          </mesh>
        )
      })}
      <group
        ref={gem}
        position={[
          posX,
          BOARD_SURFACE_Y + (boss.weak === 8 ? 2.24 : 1.12),
          posZ + (boss.weak === 8 ? 0.95 : 0.15),
        ]}
      >
        <mesh>
          <octahedronGeometry args={[0.24]} />
          <meshPhysicalMaterial
            color={crownColor}
            emissive={crownColor}
            emissiveIntensity={0.8}
            metalness={0.2}
            roughness={0.08}
            clearcoat={1}
          />
        </mesh>
        {[0, 1, 2].map((index) => (
          <mesh
            key={index}
            position={[
              Math.sin((index * Math.PI * 2) / 3) * 0.33,
              0,
              Math.cos((index * Math.PI * 2) / 3) * 0.33,
            ]}
          >
            <octahedronGeometry args={[0.045]} />
            <meshBasicMaterial color={colors.white} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
