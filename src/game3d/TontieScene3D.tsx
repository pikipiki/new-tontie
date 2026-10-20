import { ArcadeLighting3D } from './ArcadeLighting3D'
import { AdventureTable3D } from './AdventureTable3D'
import { missionFor } from '@game/adventure/content'
import { Suspense } from 'react'
import { HOLE_ORDER } from '@game/layout'
import { FPS } from '@game/spec'
import type { GameState, HoleIndex } from '@game/types'
import { SKY } from '@game3d/theme'
import { ArcadeRoom3D } from '@game3d/ArcadeRoom3D'
import { BoardScene3D } from '@game3d/BoardScene3D'
import { CabinetSign3D } from '@game3d/CabinetSign3D'
import { CameraRig3D } from '@game3d/CameraRig3D'
import { HoleSlot3D } from '@game3d/HoleSlot3D'
import {
  CabinetPatches3D,
  PlushAttract3D,
  PlushPlayer3D,
} from '@game3d/PlushCast3D'

export function TontieScene3D({
  state,
  now,
  onHit,
  attract = false,
  photo = false,
  high = 0,
}: {
  state: GameState
  now: number
  onHit: (hole: HoleIndex) => void
  attract?: boolean
  photo?: boolean
  high?: number
}) {
  const bossArena = Boolean(
    state.adventure &&
    missionFor(state.adventure.stage).kind === 'boss' &&
    !['levelClear', 'win', 'gameOver'].includes(state.phase),
  )
  const playerProps = { photo, state, now, attract }
  return (
    <>
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 12, 28]} />
      <CameraRig3D photo={photo} />
      <ArcadeLighting3D bossArena={bossArena} />
      <Suspense fallback={null}>
        <ArcadeRoom3D />
        <BoardScene3D bossArena={bossArena} />
        <CabinetPatches3D />
        <CabinetSign3D
          seconds={photo ? 28 : Math.ceil(state.roundFramesLeft / FPS)}
          score={photo ? 350 : state.score}
          high={photo ? 800 : high}
        />
        <AdventureTable3D state={state} />
        <PlushPlayer3D {...playerProps} />
        {attract ? (
          <PlushAttract3D />
        ) : (
          HOLE_ORDER.map((hole) => (
            <HoleSlot3D
              key={hole}
              hole={hole}
              state={state}
              now={now}
              onHit={onHit}
            />
          ))
        )}
      </Suspense>
    </>
  )
}
