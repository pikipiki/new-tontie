import { HOLE_ORDER } from '@/game/layout'
import type { GameState } from '@/game/types'
import { BoardScene3D } from './BoardScene3D'
import { HoleSlot3D } from './HoleSlot3D'

export function TontieScene3D({ state }: { state: GameState }) {
  return (
    <>
      <color attach="background" args={['#5a8fd4']} />
      <ambientLight intensity={0.75} />
      <hemisphereLight color="#fff8e7" groundColor="#3d6b32" intensity={0.6} />
      <directionalLight
        position={[2.2, 6, 3.2]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      />

      <BoardScene3D />

      {HOLE_ORDER.map((hole) => (
        <HoleSlot3D key={hole} hole={hole} state={state} />
      ))}
    </>
  )
}
