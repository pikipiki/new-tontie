import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import {
  findNodesByPrefix,
  setNodesScaleY,
  showDamageState,
} from '@game3d/sceneMutations'
import { PlushGoonk3D } from '@game3d/PlushGoonk3D'
import { mobGlbUrl } from '@game3d/resolveMobGlb'
import { useClonedGltf } from '@game3d/useClonedGltf'
import { publicUrl } from '@constants/publicUrl'

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
    const blinkPhase = (performance.now() + seed * 977) % period
    const lid =
      blinkPhase < BLINK_MS
        ? Math.abs(Math.cos((blinkPhase / BLINK_MS) * Math.PI))
        : 1
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
  holdingWeapon?: boolean
}) {
  if (props.url === mobGlbUrl('5') || props.url === mobGlbUrl('default'))
    return (
      <PlushGoonk3D seed={props.seed} holdingWeapon={props.holdingWeapon} />
    )
  if (props.url === mobGlbUrl('6'))
    return (
      <PlushGoonk3D
        seed={props.seed}
        bowl
        holdingWeapon={props.holdingWeapon}
        damaged={props.damaged}
        shatter={props.shatter}
      />
    )
  if (props.url === publicUrl('game/models/player.glb'))
    return <PlushGoonk3D seed={props.seed} pink />
  return <GltfMobModel3D {...props} />
}
