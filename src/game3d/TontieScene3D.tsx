import { ContactShadows, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { HOLE_ORDER } from '@/game/layout'
import type { GameState } from '@/game/types'
import { BOARD_SURFACE_Y } from './layout3d'
import { Board3D } from './Board3D'
import { GameHud3D } from './GameHud3D'
import { HoleSlot3D } from './HoleSlot3D'

export function TontieScene3D({ state }: { state: GameState }) {
  return (
    <>
      <color attach="background" args={['#6eb5e8']} />
      <PerspectiveCamera makeDefault position={[0.35, 4.2, 5.1]} fov={46} />
      <OrbitControls
        enablePan={false}
        minPolarAngle={0.55}
        maxPolarAngle={1.25}
        minDistance={2.8}
        maxDistance={7.5}
        target={[0, 0.42, 0]}
      />
      <ambientLight intensity={0.85} />
      <hemisphereLight color="#fff8e7" groundColor="#4a7a4a" intensity={0.65} />
      <directionalLight position={[3, 6, 4]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />

      <Board3D />

      {HOLE_ORDER.map((hole) => (
        <HoleSlot3D key={hole} hole={hole} state={state} />
      ))}

      <GameHud3D state={state} />

      <ContactShadows position={[0, BOARD_SURFACE_Y, 0]} opacity={0.35} scale={14} blur={2.5} far={4.5} />
    </>
  )
}
