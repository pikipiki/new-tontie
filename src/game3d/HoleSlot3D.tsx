import type { GameState, HoleIndex } from '@/game/types'
import { BOARD_SURFACE_Y, holeWorldPosition } from './layout3d'
import { HammerStrike3D } from './HammerStrike3D'
import { Hole3D } from './Hole3D'
import { PlayTile3D } from './PlayTile3D'
import { MoleCharacter3D } from './MoleCharacter3D'

export function HoleSlot3D({
  hole,
  state,
}: {
  hole: HoleIndex
  state: GameState
}) {
  const [x, , z] = holeWorldPosition(hole)
  const slot = state.holes[hole]
  const strike = state.hammerStrikes.find((s) => s.hole === hole)

  return (
    <group position={[x, BOARD_SURFACE_Y, z]}>
      <Hole3D />
      <PlayTile3D />

      {strike && <HammerStrike3D frame={strike.frame} />}

      <MoleCharacter3D
        enemy={slot.enemy}
        phase={slot.phase}
        koma={state.koma}
        phaseTicks={slot.phaseTicks}
      />
    </group>
  )
}
