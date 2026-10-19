import { Billboard } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { EnemySpawn } from '@/game/types'

const loader = new THREE.TextureLoader()

function kindColor(kind: EnemySpawn['kind']): string {
  switch (kind) {
    case 'boss':
      return '#c62828'
    case 'treasure':
      return '#f9a825'
    case 'shop':
      return '#1e88e5'
    case 'twoHit':
      return '#7b1fa2'
    case 'item':
      return '#fdd835'
    default:
      return '#689f38'
  }
}

export function SpriteMob3D({
  enemy,
  url,
  width,
  height,
  depth,
  position,
}: {
  enemy: EnemySpawn
  url: string
  width: number
  height: number
  depth: number
  position: [number, number, number]
}) {
  const texture = useLoader(loader, url)
  const map = useMemo(() => {
    const t = texture.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.magFilter = THREE.NearestFilter
    t.minFilter = THREE.NearestFilter
    t.needsUpdate = true
    return t
  }, [texture])

  const fill = kindColor(enemy.kind)

  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} castShadow renderOrder={2}>
        <boxGeometry args={[width * 0.92, height * 0.92, depth]} />
        <meshStandardMaterial color={fill} roughness={0.75} />
      </mesh>
      <Billboard follow lockX lockY lockZ>
        <mesh position={[0, 0, depth / 2 + 0.01]} renderOrder={3}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={map}
            transparent
            alphaTest={0.32}
            side={THREE.DoubleSide}
            roughness={0.5}
            depthWrite
          />
        </mesh>
      </Billboard>
    </group>
  )
}
