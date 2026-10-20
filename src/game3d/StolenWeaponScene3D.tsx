import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { GameState } from '@game/types'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { BOARD_SURFACE_Y, holeWorldPosition } from './layout3d'
import { stealRun, stealSeconds } from './adventureMotion'
import { StolenTag3D, StolenWeaponModel3D } from './StolenWeaponModel3D'
import { themeColors as colors } from './theme'

export function StolenWeaponScene3D({ state }: { state: GameState }) {
  const dropped = useRef<Group>(null)
  const reduced = useReducedMotion()
  const stolen = state.adventure?.stolenWeapon
  useFrame(({ clock }) => {
    if (!dropped.current) return
    dropped.current.position.y =
      BOARD_SURFACE_Y + 0.42 + Math.sin(clock.elapsedTime * 3) * 0.035
    dropped.current.rotation.y = clock.elapsedTime * 0.7
  })
  if (!stolen) return null
  const [posX, , posZ] = holeWorldPosition(stolen.holder ?? stolen.dropHole)
  const home =
    stolen.holder === null ||
    stealRun(stealSeconds(stolen), reduced).phase === 'held'
  return (
    <group>
      {stolen.holder === null && (
        <group ref={dropped} position={[posX, BOARD_SURFACE_Y + 0.42, posZ]}>
          <StolenWeaponModel3D weapon={stolen} wing={state.wing} />
          <StolenTag3D label="STOLEN" />
        </group>
      )}
      {home && (
        <>
          <mesh
            position={[posX, BOARD_SURFACE_Y + 0.1, posZ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.46, 0.035, 10, 40]} />
            <meshBasicMaterial color={colors.gold} toneMapped={false} />
          </mesh>
          <group position={[posX, BOARD_SURFACE_Y + 0.55, posZ]}>
            <StolenTag3D label="↓ RECOVER" />
          </group>
        </>
      )}
    </group>
  )
}
