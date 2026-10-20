import { useContext, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, MeshPhysicalMaterial } from 'three'
import { SwapCueContext } from '../SwapCueContext'
import { bananaArmSwing } from '../bananaMotion'
import { PlushArm } from './PlushArm'
export function PlushArmRig3D({
  side,
  material,
  holding,
  aiming,
  scared,
}: {
  side: number
  material: MeshPhysicalMaterial
  holding: boolean
  aiming: boolean
  scared: boolean
}) {
  const root = useRef<Group>(null),
    cue = useContext(SwapCueContext)
  useFrame(() => {
    if (root.current)
      root.current.rotation.x = cue
        ? bananaArmSwing(cue.progress, cue.reverse, side)
        : 0
  })
  return (
    <group ref={root} position={[side * 0.27, 0.43, 0.015]}>
      <group position={[-side * 0.27, -0.43, -0.015]}>
        <PlushArm
          side={side}
          material={material}
          holding={holding}
          aiming={aiming}
          scared={scared}
        />
      </group>
    </group>
  )
}
