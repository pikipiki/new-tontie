type SfxName =
  | 'hit'
  | 'todome'
  | 'life_get'
  | 'coin_get'
  | 'shop_in'
  | 'karaburi'
  | 'game'
  | 'boss'

const SFX_FILES: Partial<Record<SfxName, string>> = {
  hit: '/game/sounds/41.mp3',
  todome: '/game/sounds/42.mp3',
  life_get: '/game/sounds/43.mp3',
  coin_get: '/game/sounds/44.mp3',
  shop_in: '/game/sounds/45.mp3',
  karaburi: '/game/sounds/46.mp3',
  game: '/game/sounds/47.mp3',
  boss: '/game/sounds/48.mp3',
}

let enabled = true
const pool = new Map<string, HTMLAudioElement>()

function clip(url: string): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') {
    return null
  }
  let a = pool.get(url)
  if (!a) {
    a = new Audio(url)
    a.preload = 'auto'
    pool.set(url, a)
  }
  return a
}

export function setSoundEnabled(on: boolean): void {
  enabled = on
}

export function playSfx(name: SfxName): void {
  if (!enabled) {
    return
  }
  const url = SFX_FILES[name]
  if (!url) {
    return
  }
  const a = clip(url)
  if (!a) {
    return
  }
  a.currentTime = 0
  try {
    const p = a.play()
    if (p && typeof p.catch === 'function') {
      void p.catch(() => {})
    }
  } catch {
    /* no audio in test env */
  }
}
