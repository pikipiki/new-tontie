import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import type { Group } from 'three'
import { createBossDeck } from './bossDeckGeometry'
import { BossDrumWells } from './BossDrumWells'
import { BossStageLights } from './BossStageLights'
import { themeColors as colors } from './theme'

/** The pink carpet retracts; a neon concert stage rises in its place. */
export function BossArena3D() {
  const reduced = useReducedMotion()
  const root = useRef<Group>(null)
  const age = useRef(0)
  const geometry = useMemo(() => createBossDeck(), [])
  useEffect(
    () => () => {
      geometry.dispose()
    },
    [geometry],
  )
  useFrame((_, delta) => {
    age.current += delta
    if (root.current)
      root.current.position.y = reduced ? 0 : -0.65 * Math.exp(-age.current * 7)
  })
  return (
    <group ref={root}>
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.3, 0]}
        receiveShadow
        castShadow
      >
        <meshPhysicalMaterial
          color={colors.purpleInk}
          metalness={0.72}
          roughness={0.26}
          clearcoat={0.8}
        />
      </mesh>
      <BossDrumWells />
      <RoundedBox
        position={[0, -0.32, 2.05]}
        args={[4.35, 0.52, 0.23]}
        radius={0.09}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color={colors.scene.arcadeMetal}
          metalness={0.75}
          roughness={0.25}
        />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 2.12, 0.06, 0]}>
            <boxGeometry args={[0.035, 0.045, 3.92]} />
            <meshBasicMaterial
              color={colors.hudAccentCyan}
              toneMapped={false}
            />
          </mesh>
          <mesh
            position={[side * 1.75, 0.25, -1.73]}
            rotation={[0, 0, side * 0.15]}
            castShadow
          >
            <boxGeometry args={[0.34, 0.57, 0.3]} />
            <meshStandardMaterial color={colors.ink} metalness={0.4} />
          </mesh>
          <mesh
            position={[side * 1.75, 0.3, -1.55]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
            <meshStandardMaterial color={colors.purpleMuted} metalness={0.7} />
          </mesh>
        </group>
      ))}
      <BossStageLights />
    </group>
  )
}
