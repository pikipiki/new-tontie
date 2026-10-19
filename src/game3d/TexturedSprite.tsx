import { Billboard } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

const loader = new THREE.TextureLoader()

export function TexturedSprite({
  url,
  width,
  height,
  position = [0, 0, 0] as [number, number, number],
  depth = 0.18,
}: {
  url: string
  width: number
  height: number
  position?: [number, number, number]
  depth?: number
}) {
  const texture = useLoader(loader, url)
  const maps = useMemo(() => {
    const front = texture.clone()
    front.colorSpace = THREE.SRGBColorSpace
    front.magFilter = THREE.NearestFilter
    front.minFilter = THREE.NearestFilter
    front.needsUpdate = true

    const side = texture.clone()
    side.colorSpace = THREE.SRGBColorSpace
    side.magFilter = THREE.NearestFilter
    side.minFilter = THREE.NearestFilter
    side.needsUpdate = true

    return { front, side }
  }, [texture])

  return (
    <group position={position}>
      <Billboard follow lockX lockY lockZ>
        <mesh position={[0, 0, depth / 2]} castShadow>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={maps.front}
            transparent
            alphaTest={0.42}
            side={THREE.DoubleSide}
            roughness={0.55}
            metalness={0.05}
          />
        </mesh>
        <mesh position={[0, 0, -depth / 2]} scale={[0.96, 0.96, 1]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            map={maps.side}
            transparent
            alphaTest={0.42}
            color="#6a6a6a"
            side={THREE.DoubleSide}
            roughness={0.9}
          />
        </mesh>
      </Billboard>
    </group>
  )
}
