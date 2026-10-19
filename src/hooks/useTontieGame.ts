import { useEffect, useReducer, useRef, useState } from 'react'
import { playSfx, setSoundEnabled } from '@/game/audio'
import {
  buyShopIndex,
  closeShop,
  createInitialState,
  numpadToHole,
  queueHit,
  tick,
  togglePause,
} from '@/game/engine'
import { SHOP_OFFERS } from '@/game/shop'
import { FPS } from '@/game/spec'
import type { GameState } from '@/game/types'

export function useTontieGame() {
  const stateRef = useRef<GameState>(createInitialState())
  const randomRef = useRef(() => Math.random())
  const [shopIndex, setShopIndex] = useState(0)
  const [, bumpFrame] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    setSoundEnabled(true)
    playSfx('game')
  }, [])

  useEffect(() => {
    let frameId = 0
    let acc = 0
    let last = performance.now()
    const step = 1000 / FPS

    const loop = (now: number) => {
      const dt = now - last
      last = now
      acc += dt
      let stepped = false
      while (acc >= step) {
        tick(stateRef.current, randomRef.current)
        acc -= step
        stepped = true
      }
      if (stepped) {
        bumpFrame()
      }
      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const state = stateRef.current
      if (event.key === '0') {
        togglePause(state)
        event.preventDefault()
        return
      }
      if (state.phase === 'shop') {
        if (event.key === 'Enter') {
          closeShop(state)
          event.preventDefault()
          return
        }
        if (event.key === 'ArrowUp') {
          setShopIndex((i) => Math.max(0, i - 1))
          event.preventDefault()
          return
        }
        if (event.key === 'ArrowDown') {
          setShopIndex((i) => Math.min(SHOP_OFFERS.length - 1, i + 1))
          event.preventDefault()
          return
        }
        if (event.key === ' ') {
          buyShopIndex(state, shopIndex)
          event.preventDefault()
          return
        }
        const digit = Number(event.key)
        if (digit >= 1 && digit <= SHOP_OFFERS.length) {
          setShopIndex(digit - 1)
          buyShopIndex(state, digit - 1)
          event.preventDefault()
        }
        return
      }
      const hole = numpadToHole(event.key)
      if (hole !== null) {
        queueHit(state, hole)
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shopIndex])

  return { state: stateRef.current, shopIndex }
}
