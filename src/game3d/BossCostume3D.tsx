import type { RefObject } from 'react'
import type { Group } from 'three'
import { themeColors as colors } from './theme'
export function BossCostume3D({
  final,
  crownRef,
}: {
  final: boolean
  crownRef: RefObject<Group | null>
}) {
  return (
    <group>
      {final && (
        <group>
          <mesh
            position={[0, 0.36, -0.13]}
            scale={[0.44, 0.42, 0.17]}
            castShadow
          >
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color={colors.ink} roughness={0.55} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.32, 0.59, 0]}>
              <mesh castShadow>
                <icosahedronGeometry args={[0.12, 0]} />
                <meshStandardMaterial
                  color={colors.hudAccentCyan}
                  metalness={0.85}
                  roughness={0.18}
                />
              </mesh>
              {[0, 1].map((spike) => (
                <mesh
                  key={spike}
                  position={[side * spike * 0.04, 0.12, 0]}
                  rotation={[0, 0, -side * 0.4]}
                >
                  <coneGeometry args={[0.035, 0.14, 6]} />
                  <meshStandardMaterial color={colors.white} metalness={0.8} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}
      <group ref={crownRef} position={[0, 0.81, 0]}>
        {final ? <PunkHelmet /> : <KingCrown />}
      </group>
    </group>
  )
}
function KingCrown() {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.23, 0.12, 32]} />
        <meshStandardMaterial
          color={colors.gold}
          metalness={0.7}
          roughness={0.22}
        />
      </mesh>
      {[0, 1, 2, 3, 4].map((index) => (
        <mesh
          key={index}
          position={[
            Math.sin(index * Math.PI * 0.4) * 0.22,
            0.13,
            Math.cos(index * Math.PI * 0.4) * 0.22,
          ]}
        >
          <coneGeometry args={[0.07, 0.24, 5]} />
          <meshStandardMaterial
            color={colors.gold}
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>
      ))}
    </group>
  )
}
function PunkHelmet() {
  return (
    <group>
      <mesh position={[0, -0.04, 0]} castShadow>
        <sphereGeometry args={[0.27, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={colors.scene.arcadeMetal}
          metalness={0.9}
          roughness={0.22}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.28, 0.07, 0]}
          rotation={[0, 0, -side * 0.75]}
          castShadow
        >
          <coneGeometry args={[0.075, 0.38, 8]} />
          <meshStandardMaterial
            color={colors.hudAccentCyan}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      ))}
      {[0, 1, 2, 3, 4].map((index) => (
        <mesh
          key={index}
          position={[
            0,
            0.12 + Math.sin((index * Math.PI) / 4) * 0.08,
            (index - 2) * 0.09,
          ]}
          rotation={[0.2, 0, 0]}
        >
          <coneGeometry args={[0.075, 0.25, 5]} />
          <meshStandardMaterial
            color={colors.cabinetPink}
            emissive={colors.redPink}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}
