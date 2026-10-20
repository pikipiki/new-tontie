import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Group } from 'three'
import type { GameState } from '@game/types'
import { FPS } from '@game/spec'
import {
  BOARD_SURFACE_Y,
  holeWorldPosition,
  PINK_LEDGE_POSITION,
} from './layout3d'
import { StolenWeaponModel3D } from './StolenWeaponModel3D'
import { themeColors as colors } from './theme'

export function StolenWeaponScene3D({ state }: { state: GameState }) {
  const flight = useRef<Group>(null),
    dropped = useRef<Group>(null)
  const stolen = state.adventure?.stolenWeapon
  useFrame(({ clock }) => {
    if (!stolen) return
    const [targetX, , targetZ] = holeWorldPosition(
      stolen.holder ?? stolen.dropHole,
    )
    if (flight.current) {
      const phase = Math.min(1, stolen.age / (FPS * 0.7))
      flight.current.visible = phase < 1 && stolen.holder !== null
      flight.current.position.set(
        PINK_LEDGE_POSITION[0] +
          (targetX + 0.36 - PINK_LEDGE_POSITION[0]) * phase,
        0.4 +
          (BOARD_SURFACE_Y + 0.23 - 0.4) * phase +
          Math.sin(phase * Math.PI) * 1.1,
        PINK_LEDGE_POSITION[2] +
          (targetZ + 0.22 - PINK_LEDGE_POSITION[2]) * phase,
      )
      flight.current.rotation.y = phase * Math.PI * 2
    }
    if (dropped.current) {
      dropped.current.position.y =
        BOARD_SURFACE_Y + 0.42 + Math.sin(clock.elapsedTime * 3) * 0.035
      dropped.current.rotation.y = clock.elapsedTime * 0.7
    }
  })
  if (!stolen) return null
  const [posX, , posZ] = holeWorldPosition(stolen.holder ?? stolen.dropHole)
  return (
    <group>
      <group ref={flight} visible={false}>
        <StolenWeaponModel3D weapon={stolen} wing={state.wing} />
      </group>
      {stolen.holder === null && (
        <group ref={dropped} position={[posX, BOARD_SURFACE_Y + 0.42, posZ]}>
          <StolenWeaponModel3D weapon={stolen} wing={state.wing} />
        </group>
      )}
      <mesh
        position={[posX, BOARD_SURFACE_Y + 0.1, posZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.46, 0.035, 10, 40]} />
        <meshBasicMaterial color={colors.gold} toneMapped={false} />
      </mesh>
      <Html
        position={[posX, BOARD_SURFACE_Y + 1.08, posZ]}
        center
        zIndexRange={[3, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <span
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: 12,
            background: colors.purpleInk,
            color: colors.yellow,
            border: `2px solid ${colors.yellow}`,
            fontWeight: 900,
            fontSize: 12,
            whiteSpace: 'nowrap',
          }}
        >
          ↓ RECOVER
        </span>
      </Html>
    </group>
  )
}
