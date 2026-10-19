import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { findNodesByPrefix, setNodesScaleY } from './sceneMutations'
import { useClonedGltf } from './useClonedGltf'

const BLINK_MS = 140

/** Blender mob with its eye rigs (nodes named `EyeRig*`) blinking on a per-instance rhythm. */
export function MobModel3D({ url, seed = 0 }: { url: string; seed?: number }) {
  const root = useClonedGltf(url)
  const eyes = useMemo(() => findNodesByPrefix(root, 'EyeRig'), [root])

  useFrame(() => {
    if (eyes.length === 0) return
    const period = 2600 + (seed % 5) * 380
    const t = (performance.now() + seed * 977) % period
    const lid = t < BLINK_MS ? Math.abs(Math.cos((t / BLINK_MS) * Math.PI)) : 1
    setNodesScaleY(eyes, Math.max(0.08, lid))
  })

  return <primitive object={root} />
}
