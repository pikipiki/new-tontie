import type { SwapCue } from '@game/adventure/swaps'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type { Group } from 'three'
import type { AdventureActor, StolenWeapon } from '@game/adventure/types'
import type { HoleIndex, MolePhase } from '@game/types'
import { PINK_FLIGHT_MS } from './plushAnimation'
import { fxProgress, useGameFx } from './fx'
import { updateMoleMotion } from './moleMotionHelpers'

interface MotionProps {
  hole: HoleIndex
  phase: MolePhase
  target: number
  damaged: boolean
  lift: RefObject<Group | null>
  body: RefObject<Group | null>
  actor?: AdventureActor
  swapCue?: SwapCue
  stolen?: StolenWeapon
}
export function useMoleMotion({
  hole,
  phase,
  target,
  damaged,
  lift,
  body,
  actor,
  swapCue,
  stolen,
}: MotionProps) {
  const reduced = useReducedMotion()
  const gameFx = useGameFx()
  const sync = useRef({ age: -1, at: 0 })
  useFrame(({ clock }, delta) => {
    const liftGroup = lift.current,
      bodyGroup = body.current
    if (!liftGroup || !bodyGroup) return
    const slap =
      gameFx.slap?.hole === hole
        ? fxProgress(gameFx.slap.at, performance.now(), PINK_FLIGHT_MS)
        : null
    updateMoleMotion(
      liftGroup,
      bodyGroup,
      {
        hole,
        phase,
        target,
        damaged,
        actor,
        reduced,
        swapCue,
        stolen,
        slapProgress: slap,
      },
      gameFx.holes[hole].hitAt,
      clock.elapsedTime,
      delta,
      sync.current,
    )
  })
}
