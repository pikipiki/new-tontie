import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { themeColors } from '@game3d/theme'
import type { GameState, HoleIndex } from '@game/types'
import { useGameFx } from '@game3d/fx'
import { HammerStrike3D } from '@game3d/HammerStrike3D'
import { HoleSlotFx3D } from '@game3d/HoleSlotFx3D'
import {
  BOARD_SURFACE_Y,
  HOLE_TAP_DEPTH,
  HOLE_TAP_WIDTH,
  holeWorldPosition,
  MOLE_TOP_SINK,
  moleLiftWorld,
} from '@game3d/layout3d'
import { MoleCharacter3D } from '@game3d/MoleCharacter3D'
import { mobGlbHeight, mobGlbKey } from '@game3d/resolveMobGlb'

const EMPTY_TAP_HEIGHT = 0.18

export function HoleSlot3D({
  hole,
  state,
  now,
  onHit,
}: {
  hole: HoleIndex
  state: GameState
  /** Clock of the last engine flush, used to mount one-shot effects. */
  now: number
  onHit: (hole: HoleIndex) => void
}) {
  const [hovered, setHovered] = useState(false)
  const holeFx = useGameFx().holes[hole]
  const [posX, , posZ] = holeWorldPosition(hole)
  const slot = state.holes[hole]
  const occupied = slot.phase !== 'off' && slot.enemy.kind !== 'none'
  const modelHeight = occupied ? mobGlbHeight(mobGlbKey(slot.enemy)) : 0
  const mobTop = occupied
    ? moleLiftWorld(
        slot.phase,
        state.koma,
        slot.phaseTicks,
        modelHeight + 0.05,
      ) + modelHeight
    : 0
  /** The hammer head lands on top of whatever is in the hole (or on the pit when empty). */
  const hitY = Math.max(0.04, mobTop)
  const tapHeight = Math.max(EMPTY_TAP_HEIGHT, modelHeight - MOLE_TOP_SINK)

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    onHit(hole)
  }

  return (
    <group position={[posX, BOARD_SURFACE_Y, posZ]}>
      <mesh
        position={[0, tapHeight / 2 - 0.05, 0]}
        onPointerDown={onPointerDown}
        onPointerOver={() => {
          setHovered(true)
        }}
        onPointerOut={() => {
          setHovered(false)
        }}
        onPointerUp={() => {
          setHovered(false)
        }}
      >
        <boxGeometry args={[HOLE_TAP_WIDTH, tapHeight + 0.1, HOLE_TAP_DEPTH]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>

      {(hovered || now - holeFx.strikeAt < 180) && (
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.39, 0.42, 48]} />
          <meshBasicMaterial
            color={themeColors.scene.holeGlow}
            transparent
            opacity={0.8}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      )}

      <MoleCharacter3D
        hole={hole}
        enemy={slot.enemy}
        phase={slot.phase}
        koma={state.koma}
        phaseTicks={slot.phaseTicks}
        extraHitRemaining={slot.nikaiRemaining}
      />

      <HammerStrike3D hole={hole} hitY={hitY} hammerLv={state.hammerLv} />
      <HoleSlotFx3D hole={hole} now={now} hitY={hitY} />
    </group>
  )
}
