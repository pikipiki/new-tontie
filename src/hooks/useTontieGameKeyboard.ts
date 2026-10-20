import { useEffect } from 'react'
import type { GameState, HoleIndex } from '@game/types'
import {
  handleLevelIntroKey,
  handlePlayingKey,
  handleShopKey,
} from './tontieGameKeyboardHandlers'

export function useTontieGameKeyboard(options: {
  started: boolean
  shopIndex: number
  sessionState: () => GameState
  start: () => void
  pause: () => void
  leaveShop: () => void
  buy: (index: number) => void
  hit: (hole: HoleIndex) => void
  setShopIndex: (index: number | ((current: number) => number)) => void
}) {
  const {
    started,
    shopIndex,
    sessionState,
    start,
    pause,
    leaveShop,
    buy,
    hit,
    setShopIndex,
  } = options

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return
      }
      const activates = event.key === 'Enter' || event.key === ' '
      if (activates && event.target instanceof HTMLButtonElement) {
        return
      }
      const state = sessionState()
      if (state.phase === 'levelIntro') {
        handleLevelIntroKey(event, start)
        return
      }
      if (
        handleShopKey(event, state, shopIndex, setShopIndex, buy, leaveShop)
      ) {
        return
      }
      if (state.phase !== 'shop') {
        handlePlayingKey(event, pause, hit)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [
    started,
    shopIndex,
    start,
    pause,
    leaveShop,
    buy,
    hit,
    sessionState,
    setShopIndex,
  ])
}
