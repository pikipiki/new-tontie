import { pendingSwapCue } from '@game/adventure/swaps'
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
  const modelHeight = targetHeight(state, hole, occupied)
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

  const clearHover = () => {
    setHovered(false)
  }
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
        onPointerOut={clearHover}
        onPointerUp={clearHover}
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

      <HoleMole3D hole={hole} state={state} />

      <HammerStrike3D hole={hole} hitY={hitY} hammerLv={state.hammerLv} />
      <HoleSlotFx3D hole={hole} now={now} hitY={hitY} />
    </group>
  )
}

function HoleMole3D({ hole, state }: { hole: HoleIndex; state: GameState }) {
  const slot = state.holes[hole]
  if (state.adventure?.actors[hole]?.role === 'boss') return null
  return (
    <MoleCharacter3D
      hole={hole}
      enemy={slot.enemy}
      phase={slot.phase}
      koma={state.koma}
      phaseTicks={slot.phaseTicks}
      extraHitRemaining={slot.nikaiRemaining}
      actor={state.adventure?.actors[hole]}
      swapCue={
        state.adventure ? pendingSwapCue(state.adventure, hole) : undefined
      }
      heldWeapon={
        state.adventure?.stolenWeapon?.holder === hole
          ? state.adventure.stolenWeapon
          : undefined
      }
      role={
        slot.nikaiRemaining > 0 ? 'helmet' : state.adventure?.actors[hole]?.role
      }
    />
  )
}

function targetHeight(state: GameState, hole: HoleIndex, occupied: boolean) {
  const stolen = state.adventure?.stolenWeapon
  if (stolen && (stolen.holder ?? stolen.dropHole) === hole) return 1.3
  if (state.adventure?.actors[hole]?.role === 'boss' && occupied)
    return hole === 8 ? 2.5 : 1.4
  return occupied ? mobGlbHeight(mobGlbKey(state.holes[hole].enemy)) : 0
}
