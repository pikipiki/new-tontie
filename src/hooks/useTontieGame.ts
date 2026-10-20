import { useCallback, useEffect, useState } from 'react'
import {
  installAudioLifecycle,
  playMusic,
  playSfx,
  setMusicPaused,
  stopMusic,
  unlockAudio,
} from '@/game/audio'
import {
  beginRound,
  buyShopIndex,
  closeShop,
  createInitialState,
  drainEvents,
  numpadToHole,
  queueHit,
  startLevel,
  tick,
  togglePause,
} from '@/game/engine'
import { SHOP_OFFERS } from '@/game/shop'
import { FPS } from '@/game/spec'
import type { GameEvent, GameState, HoleIndex } from '@/game/types'
import { createFx, recordEvent, syncStrikes, type GameFx } from '@/game3d/fx'

/** Avoid a burst of catch-up ticks after the tab was in the background. */
const MAX_CATCH_UP_MS = 250

/** Shop grid: the offers, then EXIT in the last cell (3 columns). */
export const SHOP_CELLS = SHOP_OFFERS.length + 1
export const SHOP_EXIT_INDEX = SHOP_OFFERS.length
const SHOP_COLUMNS = 3

const SHOP_MOVES: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -SHOP_COLUMNS,
  ArrowDown: SHOP_COLUMNS,
}

export interface TontieGame {
  state: GameState
  fx: GameFx
  clock: number
  /** Audio unlocked and the simulation loop running (first START tap). */
  started: boolean
  shopIndex: number
  /** START on the level panel. */
  start: () => void
  hit: (hole: HoleIndex) => void
  pause: () => void
  buy: (index: number) => void
  selectShop: (index: number) => void
  leaveShop: () => void
  restart: () => void
}

function playEvents(events: GameEvent[], state: GameState, fx: GameFx): void {
  const now = performance.now()
  for (const ev of events) {
    if (ev.sfx) playSfx(ev.sfx)
    if (ev.music === 'stop') stopMusic()
    else if (ev.music) playMusic(ev.music)
    if (ev.kind === 'pause') setMusicPaused(true)
    if (ev.kind === 'resume') setMusicPaused(false)
    recordEvent(fx, ev, state, now)
  }
  syncStrikes(fx, state, now)
}

/** Mutable simulation owned by one hook instance; the engine mutates `state` in place. */
class GameSession {
  state: GameState = createInitialState()
  fx: GameFx = createFx()
  readonly random = () => Math.random()

  /** A new run reopens the level 1 panel with its slide-in sound. */
  reset(): void {
    this.state = createInitialState()
    beginRound(this.state)
    this.fx = createFx()
  }
}

export function useTontieGame(): TontieGame {
  useEffect(installAudioLifecycle, [])
  const [session] = useState(() => new GameSession())
  const [started, setStarted] = useState(false)
  const [shopIndex, setShopIndex] = useState(0)
  /** Wall-clock time of the last flush; also forces the re-render after each tick / action. */
  const [clock, setClock] = useState(0)

  const flush = useCallback(() => {
    playEvents(drainEvents(session.state), session.state, session.fx)
    setClock(performance.now())
  }, [session])

  const start = useCallback(() => {
    unlockAudio()
    setStarted(true)
    startLevel(session.state)
    flush()
  }, [flush, session])

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
    [flush, session],
  )

  const leaveShop = useCallback(() => {
    closeShop(session.state)
    setShopIndex(0)
    flush()
  }, [flush, session])

  const restart = useCallback(() => {
    unlockAudio()
    stopMusic()
    setMusicPaused(false)
    session.reset()
    setShopIndex(0)
    flush()
  }, [flush, session])

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return
      }
      const activates = event.key === 'Enter' || event.key === ' '
      if (activates && event.target instanceof HTMLButtonElement) {
        return
      }
      const state = session.state
      if (state.phase === 'levelIntro') {
        if (event.key === 'Enter' || event.key === ' ' || event.key === '0') {
          start()
          event.preventDefault()
        }
        return
      }
      if (state.phase === 'shop') {
        const move = SHOP_MOVES[event.key]
        if (move !== undefined) {
          setShopIndex((i) => Math.min(SHOP_CELLS - 1, Math.max(0, i + move)))
          event.preventDefault()
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          if (shopIndex === SHOP_EXIT_INDEX) leaveShop()
          else buy(shopIndex)
          event.preventDefault()
          return
        }
        if (event.key === '0' || event.key === 'Escape') {
          leaveShop()
          event.preventDefault()
          return
        }
        const digit = Number(event.key)
        if (digit >= 1 && digit <= SHOP_OFFERS.length) {
          buy(digit - 1)
          event.preventDefault()
        }
        return
      }
      if (event.key === '0' || event.key === 'Escape' || event.key === 'p') {
        pause()
        event.preventDefault()
        return
      }
      const hole = numpadToHole(event.key)
      if (hole !== null) {
        hit(hole)
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [started, shopIndex, start, pause, leaveShop, buy, hit, session])

  return {
    state: session.state,
    fx: session.fx,
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
