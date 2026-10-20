import { themeColors } from '@/components/Tontie3D/theme'
import { useMemo } from 'react'
import { ExtrudeGeometry, Shape } from 'three'

export function FeltStar3D({
  position,
  scale = 1,
  color = themeColors.scene.feltStarGold,
}: {
  position: [number, number, number]
  scale?: number
  color?: string
}) {
  const geometry = useMemo(() => {
    const shape = new Shape()
    for (let index = 0; index < 10; index++) {
      const angle = (index * Math.PI) / 5 + Math.PI / 2
      const radius = index % 2 === 0 ? 0.13 : 0.061
      const posX = Math.cos(angle) * radius
      const posY = Math.sin(angle) * radius
      if (index === 0) shape.moveTo(posX, posY)
      else shape.lineTo(posX, posY)
    }
    shape.closePath()
    return new ExtrudeGeometry(shape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.012,
    })
  }, [])
  return (
    <mesh
      geometry={geometry}
      position={position}
      scale={scale}
      rotation={[0, 0, -0.15]}
      castShadow
    >
      <meshPhysicalMaterial color={color} roughness={0.92} sheen={1} />
    </mesh>
  )
}
