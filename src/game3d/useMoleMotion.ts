import type { SwapCue } from '@game/adventure/swaps'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type { Group } from 'three'
import type { AdventureActor } from '@game/adventure/types'
import type { HoleIndex, MolePhase } from '@game/types'
import { useGameFx } from './fx'
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
}: MotionProps) {
  const reduced = useReducedMotion()
  const gameFx = useGameFx()
  const sync = useRef({ age: -1, at: 0 })
  useFrame(({ clock }, delta) => {
    const liftGroup = lift.current,
      bodyGroup = body.current
    if (!liftGroup || !bodyGroup) return
    updateMoleMotion(
      liftGroup,
      bodyGroup,
      { hole, phase, target, damaged, actor, reduced, swapCue },
      gameFx.holes[hole].hitAt,
      clock.elapsedTime,
      delta,
      sync.current,
    )
  })
}
