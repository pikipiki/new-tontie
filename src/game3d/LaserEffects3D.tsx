import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { AdditiveBlending, type Group } from 'three'
import type { GameState } from '@game/types'
import { useGameFx } from './fx'
import { updateLaserPresentation } from './laserPresentation'
import { themeColors } from './theme'

export function LaserEffects3D({
  state,
  weaponRef,
  muzzleRef,
  flashRef,
}: {
  state: GameState
  weaponRef: RefObject<Group | null>
  muzzleRef: RefObject<Group | null>
  flashRef: RefObject<Group | null>
}) {
  const gameFx = useGameFx()
  const beam = useRef<Group>(null)
  useFrame(() => {
    const weapon = weaponRef.current,
      muzzle = muzzleRef.current,
      flash = flashRef.current
    if (weapon && muzzle && flash && beam.current)
      updateLaserPresentation(
        weapon,
        muzzle,
        flash,
        beam.current,
        state,
        gameFx,
        performance.now(),
      )
  })
  return (
    <group>
      <group ref={beam} visible={false}>
        <mesh>
          <cylinderGeometry args={[1, 1, 1, 10]} />
          <meshBasicMaterial
            color={themeColors.white}
            transparent
            opacity={0.95}
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh scale={[3, 1, 3]}>
          <cylinderGeometry args={[1, 1, 1, 10]} />
          <meshBasicMaterial
            color={themeColors.hudAccentCyan}
            transparent
            opacity={0.2}
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  )
}
