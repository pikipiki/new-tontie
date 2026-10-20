import { Suspense } from 'react'
import { HOLE_ORDER } from '@/game/layout'
import { FPS } from '@/game/spec'
import type { GameState, HoleIndex } from '@/game/types'
import { SKY } from '@/components/Tontie3D/theme'
import { ArcadeRoom3D } from './ArcadeRoom3D'
import { BoardScene3D } from './BoardScene3D'
import { CabinetSign3D } from './CabinetSign3D'
import { CameraRig3D } from './CameraRig3D'
import { HoleSlot3D } from './HoleSlot3D'
import { CabinetPatches3D, PlushAttract3D, PlushPlayer3D } from './PlushCast3D'

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
  return (
    <>
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 12, 28]} />
      <CameraRig3D photo={photo} />
      <hemisphereLight color="#efcadd" groundColor="#44314d" intensity={0.75} />
      <directionalLight
        position={[-3, 7, 5]}
        color="#ffe0c1"
        intensity={3.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-normalBias={0.025}
        shadow-bias={-0.0001}
        shadow-radius={4}
      />
      <directionalLight position={[4, 3, -3]} intensity={2.4} color="#bb8df8" />
      <pointLight
        position={[-3, 2, 1]}
        color="#ff409e"
        intensity={8}
        distance={8}
        decay={2}
      />
      <Suspense fallback={null}>
        <ArcadeRoom3D />
        <BoardScene3D />
        <CabinetPatches3D />
        <CabinetSign3D
          seconds={photo ? 28 : Math.ceil(state.roundFramesLeft / FPS)}
          score={photo ? 350 : state.score}
          high={photo ? 800 : high}
        />
        <PlushPlayer3D photo={photo} state={state} attract={attract} />
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
