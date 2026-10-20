import { BossCostume3D } from './BossCostume3D'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { GameState } from '@game/types'
import { PlushGoonk3D } from './PlushGoonk3D'
import { BossAngryFace3D } from './BossAngryFace3D'
import { BossFists3D } from './BossFists3D'
import { BOARD_SURFACE_Y, MOB_TILT_X, holeWorldPosition } from './layout3d'
import { useGameFx, fxProgress } from './fx'
import { themeColors as colors } from './theme'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function ConductorBoss3D({ state }: { state: GameState }) {
  const body = useRef<Group>(null),
    crown = useRef<Group>(null)
  const gameFx = useGameFx(),
    reduced = useReducedMotion()
  const wave = useRef({ count: -1, at: 0 })
  const boss = state.adventure?.boss
  const final = state.adventure?.stage === 6
  const [, , posZ] = holeWorldPosition(8)
  useFrame(({ clock }) => {
    if (!body.current || !crown.current || !boss) return
    if (wave.current.count !== boss.wave)
      wave.current = { count: boss.wave, at: clock.elapsedTime }
    const stomp = reduced
      ? 0
      : Math.max(0, 1 - (clock.elapsedTime - wave.current.at) / 0.7)
    body.current.position.z = posZ - 0.1 + Math.sin(stomp * Math.PI) * 0.2
    const hitAt = Math.max(
      gameFx.holes[7].hitAt,
      gameFx.holes[8].hitAt,
      gameFx.holes[9].hitAt,
    )
    const reaction = fxProgress(hitAt, performance.now(), 450)
    const squash = reaction === null ? 0 : Math.sin(reaction * Math.PI) * 0.12
    const size = final ? 2.75 : 2.4
    body.current.scale.set(size * (1 + squash * 0.4), size * (1 - squash), size)
    body.current.position.y =
      -0.16 + (reduced ? 0 : Math.sin(clock.elapsedTime * 2.5) * 0.045)
    body.current.rotation.z = reduced
      ? 0
      : Math.sin(clock.elapsedTime * 1.7) * 0.035
    crown.current.rotation.y = reduced
      ? 0
      : Math.sin(clock.elapsedTime * 1.2) * 0.08
  })
  if (!boss || boss.hp <= 0) return null
  return (
    <group position={[0, BOARD_SURFACE_Y, 0]}>
      <group
        ref={body}
        position={[0, -0.16, posZ - 0.1]}
        rotation={[MOB_TILT_X, 0, 0]}
        scale={final ? 2.75 : 2.4}
      >
        <PlushGoonk3D seed={8} hideArms />
        <BossAngryFace3D />
        <BossCostume3D final={final} crownRef={crown} />
      </group>
      <BossFists3D boss={boss} final={final} />
      <pointLight
        position={[0, 0.6, 0.7]}
        color={colors.redPink}
        intensity={final ? 4 : 2}
        distance={3}
        decay={2}
      />
    </group>
  )
}
