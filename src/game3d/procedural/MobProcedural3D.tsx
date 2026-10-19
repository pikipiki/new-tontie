import type { EnemySpawn } from '@/game/types'
import { mobPalette } from './mobStyle'

const BASE_H = 0.74

function MoleFace({ accent }: { accent: string }) {
  return (
    <group position={[0, 0.22, 0.14]}>
      <mesh position={[0, 0, 0.04]} castShadow>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#f48fb1" roughness={0.55} />
      </mesh>
      <mesh position={[-0.06, 0.05, 0.1]} castShadow>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      <mesh position={[0.06, 0.05, 0.1]} castShadow>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.02, 0.12]} castShadow>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshStandardMaterial color={accent} roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  )
}

function BossHorns() {
  return (
    <>
      <mesh position={[-0.1, 0.38, 0.05]} rotation={[0, 0, -0.5]} castShadow>
        <coneGeometry args={[0.05, 0.16, 8]} />
        <meshStandardMaterial color="#ff6f00" roughness={0.5} />
      </mesh>
      <mesh position={[0.1, 0.38, 0.05]} rotation={[0, 0, 0.5]} castShadow>
        <coneGeometry args={[0.05, 0.16, 8]} />
        <meshStandardMaterial color="#ff6f00" roughness={0.5} />
      </mesh>
    </>
  )
}

function ShopAwning() {
  return (
    <group position={[0, 0.42, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.42, 0.06, 0.28]} />
        <meshStandardMaterial color="#ffeb3b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.38, 0.04, 0.24]} />
        <meshStandardMaterial color="#1976d2" roughness={0.5} />
      </mesh>
    </group>
  )
}

function TreasureChest() {
  return (
    <group position={[0, 0.08, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.32, 0.22, 0.24]} />
        <meshStandardMaterial color="#f9a825" metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[0.34, 0.1, 0.26]} />
        <meshStandardMaterial color="#ff8f00" metalness={0.5} roughness={0.35} />
      </mesh>
    </group>
  )
}

export function MobProcedural3D({
  enemy,
  position,
}: {
  enemy: EnemySpawn
  position: [number, number, number]
}) {
  const pal = mobPalette(enemy)
  const s = pal.scale

  if (enemy.kind === 'treasure') {
    return (
      <group position={position} scale={s} renderOrder={2}>
        <TreasureChest />
      </group>
    )
  }

  return (
    <group position={position} scale={s} renderOrder={2}>
      <mesh position={[0, -0.08, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.28, 10, 16]} />
        <meshStandardMaterial color={pal.body} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.08, 0.02]} castShadow>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial color={pal.head} roughness={0.68} />
      </mesh>
      <mesh position={[0, -0.02, 0.1]} castShadow>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color={pal.belly} roughness={0.75} />
      </mesh>
      <MoleFace accent={pal.accent} />
      {enemy.kind === 'boss' && <BossHorns />}
      {enemy.kind === 'shop' && <ShopAwning />}
      {enemy.kind === 'twoHit' && (
        <mesh position={[0.18, 0.2, 0.08]} castShadow>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color={pal.accent} roughness={0.6} />
        </mesh>
      )}
      {enemy.kind === 'item' && (
        <mesh position={[0, 0.35, 0.12]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
          <meshStandardMaterial color="#ffd54f" metalness={0.6} roughness={0.3} />
        </mesh>
      )}
    </group>
  )
}

export const MOB_PROCEDURAL_HEIGHT = BASE_H
