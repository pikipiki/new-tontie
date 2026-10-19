import { ContactShadows } from '@react-three/drei'
import { HOLE_ORDER } from '@/game/layout'
import type { GameState } from '@/game/types'
import { BoardScene3D } from './BoardScene3D'
import { BoardProcedural3D } from './procedural/BoardProcedural3D'
import { FixedGameCamera } from './FixedGameCamera'
import { HoleSlot3D } from './HoleSlot3D'
import { BOARD_SURFACE_Y } from './layout3d'

export function TontieScene3D({ state }: { state: GameState }) {
  return (
    <>
      <color attach="background" args={['#5a8fd4']} />
      <FixedGameCamera />
      <ambientLight intensity={0.72} />
      <hemisphereLight color="#fff8e7" groundColor="#3d6b32" intensity={0.55} />
      <directionalLight position={[2.5, 5.5, 3.5]} intensity={1.35} castShadow shadow-mapSize={[1024, 1024]} />

      <BoardProcedural3D />
      <BoardScene3D />

      {HOLE_ORDER.map((hole) => (
        <HoleSlot3D key={hole} hole={hole} state={state} />
      ))}

      <ContactShadows position={[0, BOARD_SURFACE_Y - 0.02, 0]} opacity={0.28} scale={5.5} blur={2.2} far={3.2} />
    </>
  )
}
