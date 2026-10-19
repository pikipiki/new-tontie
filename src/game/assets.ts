import manifest from '../../reference/sprites.manifest.json'

export interface GameAssets {
  ready: boolean
  board: HTMLImageElement | null
  boardCrop: (typeof manifest)['board']
  mob: HTMLImageElement | null
  mobsSheet: HTMLImageElement | null
  holeBase: HTMLImageElement | null
  holeRim: HTMLImageElement | null
  mobsSheetMeta: (typeof manifest)['mobsSheet']
  mobDraw: (typeof manifest)['mobDraw']
  hammerFrames: HTMLImageElement[]
  hammerDraw: (typeof manifest)['hammerStrike']
}

const emptyAssets: GameAssets = {
  ready: false,
  board: null,
  boardCrop: manifest.board,
  mob: null,
  mobsSheet: null,
  holeBase: null,
  holeRim: null,
  mobsSheetMeta: manifest.mobsSheet,
  mobDraw: manifest.mobDraw,
  hammerFrames: [],
  hammerDraw: manifest.hammerStrike,
}

let cache: GameAssets = { ...emptyAssets }
let loadPromise: Promise<GameAssets> | null = null

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${url}`))
    img.src = url
  })
}

export function getGameAssets(): GameAssets {
  return cache
}

export async function loadGameAssets(): Promise<GameAssets> {
  if (cache.ready) {
    return cache
  }
  if (loadPromise) {
    return loadPromise
  }

  loadPromise = (async () => {
    const paths = manifest.paths
    const boardUrl = paths.boardGameplay ?? paths.board
    const hammerMeta = manifest.hammerStrike
    const hammerUrls = Array.from({ length: hammerMeta.frameCount }, (_, i) =>
      `/game/sprites/hammer/${String(i + 1).padStart(2, '0')}.png`,
    )
    const [board, mob, mobsSheet, holeBase, holeRim, ...hammerFrames] = await Promise.all([
      loadImage(boardUrl).catch(() => loadImage(paths.board).catch(() => null)),
      loadImage(paths.mob).catch(() => null),
      loadImage(paths.mobsSheet).catch(() => null),
      loadImage(paths.holeBase).catch(() => null),
      loadImage(paths.holeRim).catch(() => null),
      ...hammerUrls.map((url) => loadImage(url).catch(() => null)),
    ])
    const loadedHammer = hammerFrames.filter((img): img is HTMLImageElement => img !== null)
    cache = {
      ready: Boolean(board),
      board,
      boardCrop: manifest.board,
      mob,
      mobsSheet,
      holeBase,
      holeRim,
      mobsSheetMeta: manifest.mobsSheet,
      mobDraw: manifest.mobDraw,
      hammerFrames: loadedHammer,
      hammerDraw: manifest.hammerStrike,
    }
    return cache
  })()

  return loadPromise
}

export function mobSheetIndex(catalogFrame: number | undefined): number {
  if (catalogFrame === undefined) {
    return 0
  }
  return Math.abs(catalogFrame) % manifest.mobsSheet.count
}
