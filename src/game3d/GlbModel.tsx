import { Suspense } from 'react'
import { useClonedGltf } from './useClonedGltf'

interface GlbModelProps {
  url: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number] | number
}

function GlbModelInner({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: GlbModelProps) {
  const root = useClonedGltf(url)
  return (
    <primitive
      object={root}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  )
}

export function GlbModel(props: GlbModelProps) {
  return (
    <Suspense fallback={null}>
      <GlbModelInner {...props} />
    </Suspense>
  )
}
