import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { GameState, HoleIndex } from '@/game/types'
import { Burst3D } from './Burst3D'
import { BURSTS } from './burstStyles'
import {
  HIT_MS,
  KILL_MS,
  MISS_MS,
  PICKUP_MS,
  SCORE_POP_MS,
  useGameFx,
} from './fx'
import { HammerStrike3D } from './HammerStrike3D'
import { KillPop3D } from './KillPop3D'
import {
  BOARD_SURFACE_Y,
  HOLE_TAP_DEPTH,
  HOLE_TAP_WIDTH,
  holeWorldPosition,
  MOLE_TOP_SINK,
  moleLiftWorld,
} from './layout3d'
import { MoleCharacter3D } from './MoleCharacter3D'
import { ScorePop3D } from './ScorePop3D'
import { catalogFrameGlbKey, mobGlbHeight, mobGlbKey } from './resolveMobGlb'

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
  const fx = useGameFx().holes[hole]
  const [x, , z] = holeWorldPosition(hole)
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

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHit(hole)
  }

  return (
    <group position={[x, BOARD_SURFACE_Y, z]}>
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

      {(hovered || now - fx.strikeAt < 180) && (
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.39, 0.42, 48]} />
          <meshBasicMaterial
            color="#ffe091"
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

      {now - fx.killAt < KILL_MS && (
        <>
          <KillPop3D
            glbKey={catalogFrameGlbKey(fx.killFrame)}
            startAt={fx.killAt}
            bomb={fx.killBomb}
          />
          <Burst3D
            startAt={fx.killAt}
            style={fx.killBomb ? BURSTS.bomb : BURSTS.kill}
            position={[0, 0.35, 0]}
          />
        </>
      )}
      {now - fx.killAt < SCORE_POP_MS && fx.killPoints > 0 && (
        <ScorePop3D key={fx.killAt} points={fx.killPoints} />
      )}
      {now - fx.hitAt < HIT_MS && (
        <Burst3D
          startAt={fx.hitAt}
          style={BURSTS.hit}
          position={[0, hitY + 0.05, 0.1]}
        />
      )}
      {now - fx.missAt < MISS_MS && (
        <Burst3D
          startAt={fx.missAt}
          style={BURSTS.miss}
          position={[0, 0.03, 0]}
        />
      )}
      {now - fx.pickupAt < PICKUP_MS && (
        <Burst3D
          startAt={fx.pickupAt}
          style={BURSTS.pickup}
          position={[0, 0.2, 0]}
        />
      )}
    </group>
  )
}
