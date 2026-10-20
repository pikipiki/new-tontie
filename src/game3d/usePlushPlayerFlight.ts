import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type { Group } from 'three'
import type { GameState, HoleIndex } from '@game/types'
import { fxProgress, useGameFx } from '@game3d/fx'
import { PINK_FLIGHT_MS } from '@game3d/plushAnimation'
import { PINK_LEDGE_POSITION } from '@game3d/layout3d'
import {
  applyPlushFlightMotion,
  applyPlushIdleMotion,
  latestStrikeHole,
  plushFlightStartFrom,
  strikeHitY,
} from '@game3d/plushPlayerFlightHelpers'

export function usePlushPlayerFlight(
  state: GameState,
  photo: boolean,
  attract: boolean,
  rootRef: RefObject<Group | null>,
  malletRef: RefObject<Group | null>,
  flyerRef: RefObject<Group | null>,
  flyerBodyRef: RefObject<Group | null>,
  flyerHammerRef: RefObject<Group | null>,
) {
  const gameFx = useGameFx()
  const capture = useRef<{
    at: number
    y: number
    hole: HoleIndex
    from: [number, number, number]
  }>({
    at: -1e9,
    y: 0.5,
    hole: 5,
    from: [...PINK_LEDGE_POSITION],
  })

  useFrame(({ clock }) => {
    const root = rootRef.current
    const mallet = malletRef.current
    const flyer = flyerRef.current
    const flyerBody = flyerBodyRef.current
    const flyerHammer = flyerHammerRef.current
    if (!root || !mallet || !flyer || !flyerBody || !flyerHammer) return

    const now = performance.now()
    const { latest, hole } = latestStrikeHole(gameFx)
    const laserStrike =
      state.gun > 0 || (gameFx.laser !== null && latest <= gameFx.laser.at)
    const flight = laserStrike ? null : fxProgress(latest, now, PINK_FLIGHT_MS)
    root.visible = flight === null
    applyPlushIdleMotion(root, mallet, clock.elapsedTime)
    flyer.visible = flight !== null
    if (flight === null) return

    if (capture.current.at !== latest) {
      const hitY = strikeHitY(state, gameFx, hole, now, attract)
      const continuing = now - capture.current.at < PINK_FLIGHT_MS
      const from = plushFlightStartFrom(continuing, photo, flyerBody.position)
      capture.current = {
        at: latest,
        y: Math.max(0.04, hitY),
        hole,
        from,
      }
    }
    applyPlushFlightMotion(
      flight,
      photo,
      capture.current,
      flyerBody,
      flyerHammer,
    )
  })
}
