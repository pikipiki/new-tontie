import type { EnemySpawn } from '@/game/types'

function kindColor(kind: EnemySpawn['kind']): string {
  switch (kind) {
    case 'boss':
      return '#d32f2f'
    case 'treasure':
      return '#fbc02d'
    case 'shop':
      return '#1976d2'
    case 'twoHit':
      return '#8e24aa'
    case 'item':
      return '#ffeb3b'
    default:
      return '#7cb342'
  }
}

/** Visible 3D placeholder when no sprite / GLB (e.g. broken shop export). */
export function ProceduralMob3D({
  enemy,
  width,
  height,
  depth,
  position,
}: {
  enemy: EnemySpawn
  width: number
  height: number
  depth: number
  position: [number, number, number]
}) {
  const c = kindColor(enemy.kind)

  return (
    <group position={position}>
      <mesh castShadow renderOrder={2}>
        <capsuleGeometry args={[width * 0.28, height * 0.55, 8, 16]} />
        <meshStandardMaterial color={c} roughness={0.65} />
      </mesh>
      <mesh position={[0, height * 0.15, depth * 0.55]} renderOrder={3}>
        <boxGeometry args={[width * 0.35, height * 0.12, 0.06]} />
        <meshStandardMaterial color="#fff" roughness={0.4} emissive="#ffffff" emissiveIntensity={0.15} />
      </mesh>
      {/* eslint-disable-next-line react/no-unknown-property -- R3F Text not used; simple marker mesh */}
      <mesh position={[0, height * 0.15, depth * 0.62]} renderOrder={4}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={enemy.kind === 'shop' ? '#fff' : '#333'} />
      </mesh>
    </group>
  )
}
