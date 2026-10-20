import type { MeshPhysicalMaterial } from 'three'
import { PinkSnack3D } from '@game3d/PinkSnack3D'
import { PlushArm } from '@game3d/plushGoonk/PlushArm'

export function PlushGoonkArms({
  pink,
  snacking,
  flying,
  holdingWeapon,
  frightened,
  material,
}: {
  pink: boolean
  snacking: boolean
  flying: boolean
  holdingWeapon: boolean
  frightened: boolean
  material: MeshPhysicalMaterial
}) {
  return (
    <>
      {[-1, 1].map((side) =>
        pink && snacking && !flying && side === -1 ? (
          <PinkSnack3D key={side} material={material} />
        ) : (
          <group
            key={side}
            position={[side * 0.27, 0.43, 0.015]}
            rotation={[0, 0, 0]}
          >
            <group position={[-side * 0.27, -0.43, -0.015]}>
              <PlushArm
                side={side}
                material={material}
                holding={pink && flying && side === 1}
                aiming={pink && holdingWeapon && side === 1}
                scared={frightened}
              />
            </group>
          </group>
        ),
      )}
    </>
  )
}

export function PlushGoonkFeet({
  material,
}: {
  material: MeshPhysicalMaterial
}) {
  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.145, 0.055, 0.15]}>
          <mesh scale={[0.092, 0.055, 0.13]} material={material} castShadow>
            <sphereGeometry args={[1, 28, 16]} />
          </mesh>
          {[-1, 0, 1].map((toe) => (
            <mesh
              key={toe}
              position={[toe * 0.045, -0.006, 0.1]}
              scale={[0.034, 0.035, 0.05]}
              material={material}
              castShadow
            >
              <sphereGeometry args={[1, 20, 12]} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}
