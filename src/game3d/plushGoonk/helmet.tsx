import { themeColors } from '@game3d/theme'
import { useFrame } from '@react-three/fiber'

const plush = themeColors.plush
import { useMemo, useRef, useState } from 'react'
import { DoubleSide, Vector2, type Group } from 'three'

export function HelmetShard({ index, born }: { index: number; born: number }) {
  const group = useRef<Group>(null)
  const angle = (index / 8) * Math.PI * 2
  const profile = useMemo(
    () => [
      new Vector2(0.365, 0),
      new Vector2(0.33, 0.12),
      new Vector2(0.275, 0.255),
      new Vector2(0.145, 0.325),
      new Vector2(0.125, 0.325),
      new Vector2(0.255, 0.24),
      new Vector2(0.31, 0.11),
      new Vector2(0.345, 0),
    ],
    [],
  )
  useFrame(() => {
    if (!group.current) return
    const progress = (performance.now() - born) / 900
    group.current.visible = progress < 1
    group.current.position.set(
      Math.sin(angle) * progress * 0.9,
      0.545 + 0.65 * progress - 1.4 * progress * progress,
      Math.cos(angle) * progress * 0.9,
    )
    group.current.rotation.set(
      progress * (index % 2 ? 4 : -4),
      progress * 3,
      Math.sin(angle) * progress * 4,
    )
    group.current.scale.setScalar(Math.max(0.1, 1 - progress * 0.6))
  })
  return (
    <group ref={group}>
      <mesh castShadow>
        <latheGeometry args={[profile, 12, angle, Math.PI / 4 - 0.035]} />
        <meshPhysicalMaterial
          color={plush.helmetCream}
          roughness={0.23}
          clearcoat={0.6}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.005, 5, 10, Math.PI / 4 - 0.035]} />
        <meshStandardMaterial color={plush.helmetBlue} />
      </mesh>
    </group>
  )
}

export function ShatteredHelmet() {
  const [born] = useState(() => performance.now())
  return (
    <group>
      {Array.from({ length: 8 }, (_, shardIndex) => (
        <HelmetShard key={shardIndex} index={shardIndex} born={born} />
      ))}
    </group>
  )
}
export function PorcelainBowl() {
  const profile = useMemo(
    () => [
      new Vector2(0.365, 0),
      new Vector2(0.36, 0.025),
      new Vector2(0.33, 0.12),
      new Vector2(0.275, 0.255),
      new Vector2(0.18, 0.31),
      new Vector2(0.145, 0.315),
      new Vector2(0.145, 0.345),
      new Vector2(0.115, 0.345),
      new Vector2(0.115, 0.325),
      new Vector2(0, 0.325),
    ],
    [],
  )
  return (
    <group position={[0, 0.545, 0]} rotation={[0.025, 0, -0.035]}>
      <mesh castShadow>
        <latheGeometry args={[profile, 64]} />
        <meshPhysicalMaterial
          color={plush.helmetCream}
          roughness={0.23}
          clearcoat={0.7}
          side={DoubleSide}
        />
      </mesh>
      {[0.015, 0.031, 0.085, 0.272, 0.295].map((ringY) => {
        const radius =
          ringY < 0.09 ? 0.365 - ringY * 0.3 : 0.18 + (0.31 - ringY) * 1.5
        return (
          <mesh
            key={ringY}
            position={[0, ringY, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[radius, 0.0038, 6, 64]} />
            <meshStandardMaterial
              color={plush.helmetBlueDeep}
              roughness={0.3}
            />
          </mesh>
        )
      })}
      {Array.from({ length: 30 }, (_, studIndex) => {
        const studAngle = (studIndex / 30) * Math.PI * 2
        return (
          <group
            key={studIndex}
            position={[
              Math.sin(studAngle) * 0.349,
              0.058,
              Math.cos(studAngle) * 0.349,
            ]}
            rotation={[0, studAngle, 0]}
          >
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[0.02, 0.003, 4, 4]} />
              <meshStandardMaterial color={plush.helmetBlue} roughness={0.35} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
