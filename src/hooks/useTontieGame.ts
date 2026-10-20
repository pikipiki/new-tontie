import { useCallback, useEffect, useState } from 'react'
import { installAudioLifecycle } from '@/game/audio'
import { SHOP_CELLS, SHOP_EXIT_INDEX } from './useTontieGameConstants'
import { useTontieGameActions } from './useTontieGameActions'
import { useTontieGameKeyboard } from './useTontieGameKeyboard'
import { useTontieGameLoop } from './useTontieGameLoop'
import { GameSession } from './useTontieGameSession'
import type { TontieGame } from './useTontieGameTypes'

export { SHOP_CELLS, SHOP_EXIT_INDEX }
export type { TontieGame } from './useTontieGameTypes'

export function useTontieGame(): TontieGame {
  useEffect(installAudioLifecycle, [])
  const [session] = useState(() => new GameSession())
  const [started, setStarted] = useState(false)
  const [shopIndex, setShopIndex] = useState(0)
  const [clock, setClock] = useState(0)

  const flush = useCallback(() => {
    session.flush(setClock)
  }, [session])

  const { start, hit, pause, buy, leaveShop, restart } = useTontieGameActions(
    session,
    flush,
    setStarted,
    setShopIndex,
  )

  useTontieGameLoop(started, session, flush)

  useEffect(() => {
    if (!started) {
      return
    }
    const onHidden = () => {
      if (document.hidden && session.state.phase === 'playing') {
        pause()
      }
    }
    document.addEventListener('visibilitychange', onHidden)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
    }
  }, [started, pause, session])

  useTontieGameKeyboard({
    started,
    shopIndex,
    sessionState: () => session.state,
    start,
    pause,
    leaveShop,
    buy,
    hit,
    setShopIndex,
  })

  return {
    state: session.state,
    gameFx: session.gameFx,
    clock,
    started,
    shopIndex,
    start,
    hit,
    pause,
    buy,
    selectShop: setShopIndex,
    leaveShop,
    restart,
  }
}
