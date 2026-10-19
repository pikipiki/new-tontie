import { useLoader } from '@react-three/fiber'
import { LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace, TextureLoader } from 'three'
import { BOARD_DEPTH, BOARD_WIDTH } from './layout3d'

const BOARD_URL = '/game/sprites/board-gameplay-clean.png'
const PLANK_H = 0.38

export function Board3D() {
  const texture = useLoader(TextureLoader, BOARD_URL)
  texture.colorSpace = SRGBColorSpace
  texture.magFilter = LinearFilter
  texture.minFilter = LinearMipmapLinearFilter

  return (
    <group>
      <mesh position={[0, PLANK_H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.08, PLANK_H, BOARD_DEPTH + 0.08]} />
        <meshStandardMaterial color="#4a7a3a" roughness={0.92} />
      </mesh>
      <mesh position={[0, PLANK_H + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow renderOrder={0}>
        <planeGeometry args={[BOARD_WIDTH, BOARD_DEPTH]} />
        <meshStandardMaterial map={texture} roughness={0.86} metalness={0.02} />
      </mesh>
      <mesh position={[0, -PLANK_H / 2 - 0.04, 0]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH + 0.2, 0.08, BOARD_DEPTH + 0.2]} />
        <meshStandardMaterial color="#3d6b32" roughness={0.95} />
      </mesh>
    </group>
  )
}
