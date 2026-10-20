import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { themeColors as colors } from './theme'

export function BossStageLights() {
  const reduced = useReducedMotion()
  const beams = useRef<Group>(null)
  const equalizer = useRef<(Mesh | null)[]>([])
  useFrame(({ clock }) => {
    if (reduced) return
    const time = clock.elapsedTime
    if (beams.current) beams.current.rotation.z = Math.sin(time * 1.1) * 0.16
    equalizer.current.forEach((bar, index) => {
      if (bar) {
        bar.scale.y = 0.35 + Math.sin(time * 4 + index * 0.9) ** 2 * 0.65
        bar.position.y = -0.45 + bar.scale.y * 0.11
      }
    })
  })
  return (
    <group>
      <group ref={beams} position={[0, 0, -1.8]}>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 1.7, 0.8, 0]}
            rotation={[0, 0, side * 0.35]}
          >
            <coneGeometry args={[0.38, 1.8, 24, 1, true]} />
            <meshBasicMaterial
              color={side === 1 ? colors.cabinetPink : colors.hudAccentCyan}
              transparent
              opacity={0.08}
              depthWrite={false}
              side={2}
            />
          </mesh>
        ))}
      </group>
      {Array.from({ length: 19 }, (_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            equalizer.current[index] = node
          }}
          position={[(index - 9) * 0.15, -0.35, 2.18]}
        >
          <boxGeometry args={[0.08, 0.22, 0.018]} />
          <meshBasicMaterial
            color={index % 2 ? colors.cabinetPink : colors.hudAccentCyan}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}
