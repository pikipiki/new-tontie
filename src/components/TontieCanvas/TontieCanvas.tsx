import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
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
import { getGameAssets, loadGameAssets, type GameAssets } from '@/game/assets'
import { drawGame, GAME_HEIGHT, GAME_WIDTH } from '@/game/render'
import { FPS } from '@/game/spec'
import type { GameState } from '@/game/types'

export function TontieCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GameState>(createInitialState())
  const randomRef = useRef(() => Math.random())
  const assetsRef = useRef<GameAssets | null>(null)
  const [shopIndex, setShopIndex] = useState(0)
  const [assetsReady, setAssetsReady] = useState(false)

  useEffect(() => {
    setSoundEnabled(true)
    playSfx('game')
    void loadGameAssets().then((a) => {
      assetsRef.current = a
      setAssetsReady(a.ready)
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    let frameId = 0
    let acc = 0
    let last = performance.now()
    const step = 1000 / FPS

    const loop = (now: number) => {
      const dt = now - last
      last = now
      acc += dt
      while (acc >= step) {
        tick(stateRef.current, randomRef.current)
        acc -= step
      }
      drawGame(ctx, stateRef.current, shopIndex, assetsRef.current ?? getGameAssets())
      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [shopIndex, assetsReady])

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

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
        Port natif — même grille que le Flash (frame 51)
      </Typography>
      <Box
        tabIndex={0}
        onPointerDown={(e) => {
          e.currentTarget.focus()
        }}
        sx={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          mx: 'auto',
          border: '2px solid rgba(0,0,0,0.15)',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.12)',
          outline: 'none',
          '&:focus': {
            outline: '3px solid #6c5ce7',
            outlineOffset: 4,
          },
        }}
      >
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{ display: 'block', width: GAME_WIDTH, height: GAME_HEIGHT }}
        />
      </Box>
    </Box>
  )
}
