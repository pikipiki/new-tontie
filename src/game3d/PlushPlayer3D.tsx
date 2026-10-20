import { RoundedBox } from '@react-three/drei'
import { useRef } from 'react'
import type { Group } from 'three'
import { themeColors } from '@/components/Tontie3D/theme'
import type { GameState } from '@game/types'
import { HammerModel } from '@game3d/HammerStrike3D'
import {
  BOARD_SURFACE_Y,
  PINK_LEDGE_POSITION,
  PINK_LEDGE_SCALE,
} from '@game3d/layout3d'
import { PlushGoonk3D } from '@game3d/PlushGoonk3D'
import { usePlushPlayerFlight } from '@game3d/usePlushPlayerFlight'

/** The pink plush stays on the front ledge, holding the star mallet, as in the reference. */
export function PlushPlayer3D({
  photo = false,
  state,
  attract = false,
}: {
  photo?: boolean
  state: GameState
  attract?: boolean
}) {
  const root = useRef<Group>(null)
  const mallet = useRef<Group>(null)
  const flyer = useRef<Group>(null)
  const flyerBody = useRef<Group>(null)
  const flyerHammer = useRef<Group>(null)
  usePlushPlayerFlight(
    state,
    photo,
    attract,
    root,
    mallet,
    flyer,
    flyerBody,
    flyerHammer,
  )
  return (
    <>
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
        <group ref={root}>
          <group rotation={[photo ? 0 : -0.45, photo ? 1.65 : 0.2, 0]}>
            <PlushGoonk3D pink seed={2} snacking />
          </group>
          <group
            position={[0.36, 0.38, 0.16]}
            ref={mallet}
            rotation={[0, 0, -2.08]}
          >
            <group scale={0.95}>
              <HammerModel hammerLv={state.hammerLv} wing={state.wing} />
            </group>
          </group>
        </group>
      </group>
      <group ref={flyer} visible={false}>
        <group ref={flyerBody}>
          <PlushGoonk3D pink seed={2} flying />
        </group>
        <group ref={flyerHammer}>
          <HammerModel hammerLv={state.hammerLv} wing={state.wing} />
        </group>
      </group>
    </>
  )
}
