import { useContext, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, MeshPhysicalMaterial } from 'three'
import { slapArmSwing } from '../adventureMotion'
import { SwapCueContext } from '../SwapCueContext'
import { SlapCueContext } from '../SlapCueContext'
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
    cue = useContext(SwapCueContext),
    slap = useContext(SlapCueContext)
  useFrame(() => {
    if (!root.current) return
    if (slap !== null && side === 1)
      root.current.rotation.x = slapArmSwing(slap)
    else if (cue)
      root.current.rotation.x = bananaArmSwing(cue.progress, cue.reverse, side)
    else root.current.rotation.x = 0
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
