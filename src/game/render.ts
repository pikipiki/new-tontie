import type { GameAssets } from './assets'
import { HOLE_ORDER, HOLE_POS, MOLE_RISE_DEPTH } from './layout'
import { SHOP_OFFERS } from './shop'
import { GAME_HEIGHT, GAME_WIDTH } from './spec'
import type { GameState, HoleIndex, MolePhase } from './types'

const COLORS = {
  bg: '#5a8fd4',
  hole: '#3d2b22',
  rim: '#2a1e18',
  mob: '#7cb342',
  boss: '#e53935',
  treasure: '#fdd835',
  shop: '#42a5f5',
  twoHit: '#8e24aa',
} as const

function moleColor(kind: GameState['holes'][HoleIndex]['enemy']['kind']): string {
  switch (kind) {
    case 'boss':
      return COLORS.boss
    case 'treasure':
      return COLORS.treasure
    case 'shop':
      return COLORS.shop
    case 'twoHit':
      return COLORS.twoHit
    case 'item':
      return COLORS.treasure
    default:
      return COLORS.mob
  }
}

function moleOffset(phase: MolePhase, koma: number, phaseTicks: number): number {
  if (phase === 'off') {
    return MOLE_RISE_DEPTH
  }
  if (phase === 'rising') {
    return MOLE_RISE_DEPTH - (phaseTicks / koma) * MOLE_RISE_DEPTH
  }
  if (phase === 'top') {
    return 0
  }
  return (phaseTicks / koma) * MOLE_RISE_DEPTH
}

function drawBoard(ctx: CanvasRenderingContext2D, assets: GameAssets): void {
  if (!assets.board) {
    return
  }
  const c = assets.boardCrop
  ctx.drawImage(
    assets.board,
    c.cropX,
    c.cropY,
    c.cropWidth,
    c.cropHeight,
    0,
    0,
    GAME_WIDTH,
    GAME_HEIGHT,
  )
}

function drawMoleFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  _y: number,
  cy: number,
  kind: GameState['holes'][HoleIndex]['enemy']['kind'],
): void {
  ctx.fillStyle = moleColor(kind)
  ctx.beginPath()
  ctx.ellipse(x + 36, cy, 24, 28, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawMole(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lift: number,
  slot: GameState['holes'][HoleIndex],
  assets: GameAssets | null,
): void {
  const kind = slot.enemy.kind
  const { anchorX, width, height } = assets?.mobDraw ?? {
    anchorX: 8,
    anchorY: 52,
    width: 56,
    height: 72,
  }
  const moleBottom = y + 56
  const drawY = moleBottom - height - (MOLE_RISE_DEPTH - lift)
  const cy = drawY + height / 2

  if (assets?.mob && kind !== 'shop' && kind !== 'treasure') {
    ctx.drawImage(assets.mob, x + anchorX, drawY, width, height)
    return
  }

  if (kind === 'shop' || kind === 'treasure') {
    drawMoleFallback(ctx, x, y, cy, kind)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(kind === 'shop' ? 'S' : '?', x + 36, cy - 4)
    return
  }

  drawMoleFallback(ctx, x, y, cy, kind)
}

function drawHammerStrikes(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  assets: GameAssets | null,
): void {
  if (!assets?.hammerFrames.length || state.hammerStrikes.length === 0) {
    return
  }
  const { width, height, anchorX, anchorY } = assets.hammerDraw
  for (const strike of state.hammerStrikes) {
    const img = assets.hammerFrames[strike.frame]
    if (!img) {
      continue
    }
    const { x, y } = HOLE_POS[strike.hole]
    const dx = x + 36 - anchorX
    const dy = y + 6 - anchorY
    ctx.drawImage(img, dx, dy, width, height)
  }
}

function drawFallbackScene(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  for (const hole of HOLE_ORDER) {
    const { x, y } = HOLE_POS[hole]
    ctx.fillStyle = COLORS.rim
    ctx.fillRect(x - 2, y - 2, 76, 76)
    ctx.fillStyle = COLORS.hole
    ctx.fillRect(x, y, 72, 72)
  }
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  shopHighlight = 0,
  assets: GameAssets | null = null,
): void {
  const useBoard = Boolean(assets?.board)
  if (useBoard && assets) {
    drawBoard(ctx, assets)
  } else {
    drawFallbackScene(ctx)
  }

  for (const hole of HOLE_ORDER) {
    const { x, y } = HOLE_POS[hole]
    const slot = state.holes[hole]
    if (slot.phase !== 'off') {
      const lift = moleOffset(slot.phase, state.koma, slot.phaseTicks)
      drawMole(ctx, x, y, lift, slot, assets)
    }
  }

  drawHammerStrikes(ctx, state, assets)

  if (state.phase === 'paused') {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('PAUSE', GAME_WIDTH / 2, GAME_HEIGHT / 2)
  }

  if (state.phase === 'shop') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SHOP', GAME_WIDTH / 2, 52)
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'left'
    let ly = 72
    for (let i = 0; i < SHOP_OFFERS.length; i++) {
      const o = SHOP_OFFERS[i]!
      if (i === shopHighlight) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.fillRect(48, ly - 11, 304, 16)
      }
      ctx.fillStyle = state.money >= o.price ? '#fff' : '#aaa'
      ctx.fillText(`${i + 1}. ${o.label}  $${o.price}`, 56, ly)
      ly += 18
    }
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ddd'
    ctx.fillText('Enter: continuer le jeu', GAME_WIDTH / 2, GAME_HEIGHT - 24)
  }

  if (state.phase === 'gameOver') {
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2)
  }

  if (state.phase === 'win') {
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('YOU WIN!', GAME_WIDTH / 2, GAME_HEIGHT / 2)
  }
}

export { GAME_WIDTH, GAME_HEIGHT }
