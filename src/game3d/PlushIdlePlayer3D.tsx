import { RoundedBox } from '@react-three/drei'
import type { RefObject } from 'react'
import type { Group } from 'three'
import type { GameState } from '@game/types'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { pinkLostWeapon } from './adventureMotion'
import { themeColors } from './theme'
import {
  BOARD_SURFACE_Y,
  PINK_LEDGE_POSITION,
  PINK_LEDGE_SCALE,
} from './layout3d'
import { PlushGoonk3D } from './PlushGoonk3D'
import { HammerModel } from './HammerStrike3D'
import { LaserModel3D } from './LaserModel3D'
import { LASER_GRIP } from './laserLayout'

export function PlushIdlePlayer3D({
  state,
  photo,
  laser,
  rootRef,
  malletRef,
  weaponRef,
  muzzleRef,
  flashRef,
}: {
  state: GameState
  photo: boolean
  laser: boolean
  rootRef: RefObject<Group | null>
  malletRef: RefObject<Group | null>
  weaponRef: RefObject<Group | null>
  muzzleRef: RefObject<Group | null>
  flashRef: RefObject<Group | null>
}) {
  const reduced = useReducedMotion()
  const stolen = state.adventure?.stolenWeapon
  const disarmed = pinkLostWeapon(stolen, reduced)
  const showLaser = !disarmed && (stolen ? stolen.gun > 0 : laser)
  const idleYaw = photo ? 1.65 : 0.2
  const bodyYaw = showLaser ? 2.5 : idleYaw
  return (
    <group
      position={
        photo ? [-1.82, BOARD_SURFACE_Y + 0.02, 1.75] : PINK_LEDGE_POSITION
      }
      scale={photo ? 1.55 : PINK_LEDGE_SCALE}
    >
      {!photo && (
        <RoundedBox
          position={[0, -0.04, 0]}
          args={[0.95, 0.12, 0.75]}
          radius={0.1}
          smoothness={3}
          receiveShadow
        >
          <meshStandardMaterial
            color={themeColors.scene.playerShadow}
            roughness={0.9}
          />
        </RoundedBox>
      )}
      <group ref={rootRef}>
        <group rotation={[photo || showLaser ? 0 : -0.45, bodyYaw, 0]}>
          <PlushGoonk3D pink seed={2} snacking holdingWeapon={showLaser} />
          {showLaser && (
            <group ref={weaponRef} position={LASER_GRIP}>
              <LaserModel3D muzzleRef={muzzleRef} flashRef={flashRef} />
            </group>
          )}
        </group>
        <group
          position={[0.36, 0.38, 0.16]}
          ref={malletRef}
          rotation={[0, 0, -2.08]}
          visible={!showLaser && !disarmed}
        >
          <group scale={0.95}>
            <HammerModel hammerLv={state.hammerLv} wing={state.wing} />
          </group>
        </group>
      </group>
    </group>
  )
}
