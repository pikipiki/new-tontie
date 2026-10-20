import { useFrame } from '@react-three/fiber'
import { Suspense, useRef, useState } from 'react'
import type { Group } from 'three'
import { HOLE_ORDER } from '@game/layout'
import type { HoleIndex } from '@game/types'
import { previewStrike, useGameFx } from '@game3d/fx'
import { themeColors } from '@/components/Tontie3D/theme'
import { FeltStar3D } from '@game3d/FeltStar3D'
import {
  BOARD_SURFACE_Y,
  holeWorldPosition,
  MOB_TILT_X,
} from '@game3d/layout3d'
import { MobModel3D } from '@game3d/MobModel3D'
export function CabinetPatches3D() {
  return (
    <group position={[0, BOARD_SURFACE_Y, 0]}>
      <FeltStar3D position={[-1.8, 1.93, -1.98]} scale={1.2} />
      <FeltStar3D position={[1.83, 1.96, -1.98]} scale={1.25} />
      <FeltStar3D
        position={[-1.92, 1.5, -1.98]}
        scale={0.43}
        color={themeColors.scene.feltStarPurple}
      />
      <FeltStar3D
        position={[1.95, 1.46, -1.98]}
        scale={0.48}
        color={themeColors.scene.feltStarBlue}
      />
    </group>
  )
}

export { PlushPlayer3D } from '@game3d/PlushPlayer3D'

function DisplayPlush({
  hole,
  bowl = false,
  damaged = false,
  onPreviewHit,
}: {
  onPreviewHit: (hole: HoleIndex) => void
  hole: HoleIndex
  bowl?: boolean
  damaged?: boolean
}) {
  const group = useRef<Group>(null)
  const [posX, , posZ] = holeWorldPosition(hole)
  useFrame(({ clock }) => {
    const node = group.current
    if (!node) return
    node.position.y =
      BOARD_SURFACE_Y - 0.18 + Math.sin(clock.elapsedTime * 2.2 + hole) * 0.024
    node.rotation.z = Math.sin(clock.elapsedTime * 1.3 + hole) * 0.045
  })
  return (
    <group
      ref={group}
      onPointerDown={(event) => {
        event.stopPropagation()
        onPreviewHit(hole)
      }}
      position={[posX, BOARD_SURFACE_Y - 0.18, posZ]}
      rotation={[MOB_TILT_X, 0.1 * ((hole % 3) - 1), 0]}
    >
      <MobModel3D
        url={`/game/models/mobs/${bowl ? '6' : '5'}.glb`}
        seed={hole}
        damaged={damaged}
      />
    </group>
  )
}

/** Attract mode shows the full cast without changing the game simulation. */
export function PlushAttract3D() {
  const [damaged, setDamaged] = useState<Set<HoleIndex>>(() => new Set())
  const gameFx = useGameFx()
  const hit = (hole: HoleIndex) => {
    const now = performance.now()
    previewStrike(gameFx, hole, now)
    if (hole === 9 || hole === 3)
      setDamaged((previous) => new Set(previous).add(hole))
  }
  return (
    <Suspense fallback={null}>
      {HOLE_ORDER.map((hole) => (
        <DisplayPlush
          key={hole}
          hole={hole}
          bowl={hole === 9 || hole === 3}
          damaged={damaged.has(hole)}
          onPreviewHit={hit}
        />
      ))}
    </Suspense>
  )
}
