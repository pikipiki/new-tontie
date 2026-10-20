import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { AdventureState } from '@game/adventure/types'
import {
  visibleSwapPairs,
  pendingSwapCue,
  type SwapPair,
} from '@game/adventure/swaps'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { BananaModel3D } from './BananaModel3D'
import {
  BANANA_ARC_HEIGHT,
  REDUCED_BANANA_ARC_HEIGHT,
  bananaThrowPosition,
} from './bananaMotion'

export function BananaSwapCues3D({ adventure }: { adventure: AdventureState }) {
  return (
    <group>
      {visibleSwapPairs(adventure)
        .filter((pair) => !pair.moving)
        .map((pair) => (
          <BananaPair key={pair.code} adventure={adventure} pair={pair} />
        ))}
    </group>
  )
}
function BananaPair({
  adventure,
  pair,
}: {
  adventure: AdventureState
  pair: SwapPair
}) {
  const reduced = useReducedMotion()
  const first = useRef<Group>(null),
    second = useRef<Group>(null)
  useFrame(() => {
    const cue = pendingSwapCue(adventure, pair.source)
    if (!cue || !first.current || !second.current) return
    const arc = reduced ? REDUCED_BANANA_ARC_HEIGHT : BANANA_ARC_HEIGHT
    first.current.position.copy(
      bananaThrowPosition(cue.progress, pair.source, pair.target, false, arc),
    )
    second.current.position.copy(
      bananaThrowPosition(cue.progress, pair.target, pair.source, true, arc),
    )
    const spin = reduced ? 0 : cue.progress * Math.PI * 3
    first.current.rotation.z = spin
    second.current.rotation.z = -spin
  })
  return (
    <group>
      <group ref={first}>
        <BananaModel3D />
      </group>
      <group ref={second}>
        <BananaModel3D />
      </group>
    </group>
  )
}
