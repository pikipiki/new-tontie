import { useEffect } from 'react'
import { tick } from '@/game/engine'
import { FPS } from '@/game/spec'
import type { GameSession } from './useTontieGameSession'
import { MAX_CATCH_UP_MS } from './useTontieGameConstants'

export function useTontieGameLoop(
  started: boolean,
  session: GameSession,
  flush: () => void,
) {
  useEffect(() => {
    if (!started) {
      return
    }
    let frameId = 0
    let acc = 0
    let last = performance.now()
    const step = 1000 / FPS

    const loop = (now: number) => {
      acc += Math.min(MAX_CATCH_UP_MS, now - last)
      last = now
      let stepped = false
      while (acc >= step) {
        tick(session.state, session.random)
        acc -= step
        stepped = true
      }
      if (stepped) {
        flush()
      }
      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [started, flush, session])
}
