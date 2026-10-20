import { useCallback } from 'react'
import { setMusicPaused, stopMusic, unlockAudio } from '@game/audio'
import {
  buyShopIndex,
  closeShop,
  queueHit,
  startLevel,
  togglePause,
} from '@game/engine'
import type { HoleIndex } from '@game/types'
import type { GameSession } from './useTontieGameSession'

export function useTontieGameActions(
  session: GameSession,
  flush: () => void,
  setStarted: (started: boolean) => void,
  setShopIndex: (index: number) => void,
) {
  const start = useCallback(() => {
    unlockAudio()
    setStarted(true)
    startLevel(session.state)
    flush()
  }, [flush, session, setStarted])

  const hit = useCallback(
    (hole: HoleIndex) => {
      unlockAudio()
      queueHit(session.state, hole)
      flush()
    },
    [flush, session],
  )

  const pause = useCallback(() => {
    unlockAudio()
    togglePause(session.state)
    flush()
  }, [flush, session])

  const buy = useCallback(
    (index: number) => {
      unlockAudio()
      setShopIndex(index)
      buyShopIndex(session.state, index)
      flush()
    },
    [flush, session, setShopIndex],
  )

  const leaveShop = useCallback(() => {
    closeShop(session.state)
    setShopIndex(0)
    flush()
  }, [flush, session, setShopIndex])

  const restart = useCallback(() => {
    unlockAudio()
    stopMusic()
    setMusicPaused(false)
    session.reset()
    setShopIndex(0)
    flush()
  }, [flush, session, setShopIndex])

  return { start, hit, pause, buy, leaveShop, restart }
}
