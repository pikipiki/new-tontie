import { HOLE_ORDER } from '@/game/layout'
import type { GameState, HoleIndex } from '@/game/types'
import { BoardScene3D } from './BoardScene3D'
import { CameraRig3D } from './CameraRig3D'
import { HoleSlot3D } from './HoleSlot3D'

export function TontieScene3D({
  state,
  now,
  onHit,
}: {
  state: GameState
  now: number
  onHit: (hole: HoleIndex) => void
}) {
  return (
    <>
      <color attach="background" args={['#5a8fd4']} />
      <fog attach="fog" args={['#5a8fd4', 9, 18]} />
      <CameraRig3D />
      <ambientLight intensity={0.55} />
      <hemisphereLight color="#fff8e7" groundColor="#3d6b32" intensity={0.75} />
      <directionalLight
        position={[2.2, 6, 3.2]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <directionalLight
        position={[-3, 2.5, 4]}
        intensity={0.35}
        color="#cfe3ff"
      />

      <BoardScene3D />

      {HOLE_ORDER.map((hole) => (
        <HoleSlot3D
          key={hole}
          hole={hole}
          state={state}
          now={now}
          onHit={onHit}
        />
      ))}
    </>
  )
}
