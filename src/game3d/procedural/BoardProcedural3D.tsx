import { HOLE_ORDER } from '@/game/layout'
import { BOARD_DEPTH, BOARD_SURFACE_Y, BOARD_WIDTH, holeWorldPosition } from '../layout3d'

const PLANK = 0.36
const CELL = 1.22

function PlayCell({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, BOARD_SURFACE_Y - PLANK / 2, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[CELL, PLANK, CELL]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.86} />
      </mesh>
      <mesh position={[0, PLANK / 2 + 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CELL * 0.94, CELL * 0.94]} />
        <meshStandardMaterial color="#c49a6c" roughness={0.78} />
      </mesh>
      <mesh position={[0, -PLANK / 2 - 0.02, 0]} receiveShadow>
        <boxGeometry args={[CELL * 1.02, 0.05, CELL * 1.02]} />
        <meshStandardMaterial color="#5d4037" roughness={0.92} />
      </mesh>
    </group>
  )
}

export function BoardProcedural3D() {
  return (
    <group>
      <mesh position={[0, PLANK / 2 - 0.02, 0]} receiveShadow castShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.5, PLANK + 0.08, BOARD_DEPTH + 0.5]} />
        <meshStandardMaterial color="#4a7a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.7, 0.14, BOARD_DEPTH + 0.7]} />
        <meshStandardMaterial color="#3d6b32" roughness={0.95} />
      </mesh>
      {HOLE_ORDER.map((hole) => {
        const [x, , z] = holeWorldPosition(hole)
        return <PlayCell key={hole} x={x} z={z} />
      })}
      <mesh position={[0, BOARD_SURFACE_Y + 0.04, -BOARD_DEPTH / 2 - 0.15]} castShadow>
        <boxGeometry args={[BOARD_WIDTH, 0.12, 0.2]} />
        <meshStandardMaterial color="#6d4c41" roughness={0.8} />
      </mesh>
    </group>
  )
}
