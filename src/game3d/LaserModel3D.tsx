import { RoundedBox } from '@react-three/drei'
import type { RefObject } from 'react'
import type { Group } from 'three'
import { themeColors } from './theme'
import { LASER_MUZZLE } from './laserLayout'

function LaserHousing() {
  return (
    <group>
      <RoundedBox
        args={[0.12, 0.23, 0.13]}
        radius={0.025}
        position={[0, -0.015, -0.015]}
        rotation={[-0.18, 0, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color={themeColors.purpleDeep}
          roughness={0.42}
          metalness={0.3}
          clearcoat={0.6}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.24, 0.23, 0.33]}
        radius={0.055}
        position={[0, 0.13, 0.1]}
        castShadow
      >
        <meshPhysicalMaterial
          color={themeColors.cabinetViolet}
          metalness={0.65}
          roughness={0.23}
          clearcoat={1}
        />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.124, 0.13, 0.07]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.073, 0.073, 0.014, 20]} />
            <meshStandardMaterial
              color={themeColors.gold}
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[side * 0.01, 0, 0]} scale={[0.015, 0.046, 0.046]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial
              color={themeColors.hudAccentCyan}
              emissive={themeColors.hudAccentCyan}
              emissiveIntensity={1.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      <RoundedBox
        args={[0.07, 0.04, 0.17]}
        radius={0.012}
        position={[0, 0.27, 0.03]}
        castShadow
      >
        <meshStandardMaterial
          color={themeColors.gold}
          metalness={0.7}
          roughness={0.25}
        />
      </RoundedBox>
      <mesh position={[0, 0.26, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.043, 0.012, 8, 16]} />
        <meshStandardMaterial
          color={themeColors.purpleDeep}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}

function LaserBarrel() {
  return (
    <group position={[0, 0.13, 0.27]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.074, 0.09, 0.3, 24]} />
        <meshPhysicalMaterial
          color={themeColors.paper}
          metalness={0.75}
          roughness={0.19}
          clearcoat={1}
        />
      </mesh>
      {[-0.13, -0.04, 0.09].map((offset) => (
        <mesh
          key={offset}
          position={[0, offset, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.083, 0.016, 8, 24]} />
          <meshStandardMaterial
            color={themeColors.gold}
            metalness={0.8}
            roughness={0.23}
          />
        </mesh>
      ))}
      <mesh position={[0, -0.155, 0]}>
        <cylinderGeometry args={[0.059, 0.059, 0.015, 24]} />
        <meshStandardMaterial
          color={themeColors.hudAccentCyan}
          emissive={themeColors.hudAccentCyan}
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -0.169, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.049, 0.009, 8, 24]} />
        <meshBasicMaterial color={themeColors.white} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Grip at the origin, barrel along +Z; attaches directly to the plush's right palm. */
export function LaserModel3D({
  muzzleRef,
  flashRef,
}: {
  muzzleRef: RefObject<Group | null>
  flashRef: RefObject<Group | null>
}) {
  return (
    <group>
      <LaserHousing />
      <LaserBarrel />
      <group ref={muzzleRef} position={LASER_MUZZLE}>
        <group ref={flashRef} visible={false}>
          <mesh>
            <sphereGeometry args={[0.085, 16, 12]} />
            <meshBasicMaterial color={themeColors.white} toneMapped={false} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.12, 0.018, 8, 24]} />
            <meshBasicMaterial
              color={themeColors.hudAccentCyan}
              transparent
              opacity={0.8}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}
