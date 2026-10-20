import { HOLE_ORDER } from '@/game/layout'
import type { GameState, HoleIndex } from '@/game/types'
import { SKY } from '@/components/Tontie3D/theme'
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
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 8, 16]} />
      <CameraRig3D />
      {/* Two lights only (no shadow pass) so weak phones keep 60 fps. */}
      <hemisphereLight color="#fff1f8" groundColor="#8a4a88" intensity={1.5} />
      <directionalLight position={[2.2, 6, 3.2]} intensity={1.7} />
      {/* Arcade neon behind the cabinet: pink rim on the velour. */}
      <directionalLight position={[0, 3, -5]} intensity={0.7} color="#ff7ad0" />

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
