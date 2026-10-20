import { useEffect } from 'react'
import type { HoleIndex } from '@/game/types'
import { ImpactRing3D } from './Burst3D'
import { useGameFx } from './fx'
import { PINK_FLIGHT_MS } from './plushAnimation'
import { tintMeshesByPrefix } from './sceneMutations'
import { useClonedGltf } from './useClonedGltf'

const HAMMER_GLB = '/game/models/hammer.glb'

/** DefineSprite_208 hammer levels: the pink plush mallet, then bronze, silver and gold heads. */
const HEAD_TINT: Record<number, { color: string; metal: number }> = {
  1: { color: '#ff86bd', metal: 0 },
  2: { color: '#c27a3a', metal: 0.75 },
  3: { color: '#e9eef5', metal: 0.75 },
  4: { color: '#ffc83a', metal: 0.75 },
}

export function HammerModel({ hammerLv }: { hammerLv: number }) {
  const root = useClonedGltf(HAMMER_GLB)
  useEffect(() => {
    const tint = HEAD_TINT[hammerLv] ?? HEAD_TINT[4]
    if (tint) {
      tintMeshesByPrefix(root, 'Head', tint.color, tint.metal)
    }
  }, [root, hammerLv])
  return <primitive object={root} />
}

/** Impact stays at the target; the mallet is attached to the flying pink character. */
export function HammerStrike3D({
  hole,
  hitY,
}: {
  hole: HoleIndex
  hitY: number
  hammerLv: number
}) {
  const fx = useGameFx()
  return (
    <ImpactRing3D
      startAt={fx.holes[hole].strikeAt + PINK_FLIGHT_MS * 0.42}
      y={hitY + 0.01}
    />
  )
}
