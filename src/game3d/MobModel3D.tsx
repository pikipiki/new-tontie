import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import {
  findNodesByPrefix,
  setNodesScaleY,
  showDamageState,
} from './sceneMutations'
import { PlushGoonk3D } from './PlushGoonk3D'
import { useClonedGltf } from './useClonedGltf'

const BLINK_MS = 140

/**
 * Blender mob with its eye rigs (nodes named `EyeRig*`) blinking on a per-instance rhythm.
 * `damaged` swaps the `Intact*` / `Damaged*` variants (e.g. the cracked bowl and scared face).
 */
function GltfMobModel3D({
  url,
  seed = 0,
  damaged = false,
}: {
  url: string
  seed?: number
  damaged?: boolean
}) {
  const root = useClonedGltf(url)
  const eyes = useMemo(() => findNodesByPrefix(root, 'EyeRig'), [root])

  useEffect(() => {
    showDamageState(root, damaged)
  }, [root, damaged])

  useFrame(() => {
    if (eyes.length === 0) return
    const period = (damaged ? 1300 : 2600) + (seed % 5) * 380
    const t = (performance.now() + seed * 977) % period
    const lid = t < BLINK_MS ? Math.abs(Math.cos((t / BLINK_MS) * Math.PI)) : 1
    setNodesScaleY(eyes, Math.max(0.08, lid))
  })

  return <primitive object={root} />
}

/** Photo-derived plush models replace the previous generic meshes for both first enemies. */
export function MobModel3D(props: {
  url: string
  seed?: number
  damaged?: boolean
  shatter?: boolean
}) {
  if (
    props.url === '/game/models/mobs/5.glb' ||
    props.url === '/game/models/mobs/default.glb'
  )
    return <PlushGoonk3D seed={props.seed} />
  if (props.url === '/game/models/mobs/6.glb')
    return (
      <PlushGoonk3D
        seed={props.seed}
        bowl
        damaged={props.damaged}
        shatter={props.shatter}
      />
    )
  if (props.url === '/game/models/player.glb')
    return <PlushGoonk3D seed={props.seed} pink />
  return <GltfMobModel3D {...props} />
}
