import type { MeshPhysicalMaterial } from 'three'
import { PinkSnack3D } from '@game3d/PinkSnack3D'
import { PlushArmRig3D } from './PlushArmRig3D'

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
          <PlushArmRig3D
            key={side}
            side={side}
            material={material}
            holding={pink && flying && side === 1}
            aiming={holdingWeapon && side === 1}
            scared={frightened}
          />
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
