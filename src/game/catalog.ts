import catalogJson from '../../reference/enemy-catalog.json'
import type { ItemId } from './types'

export interface CatalogEntry {
  frame: number
  hp?: number
  attack?: number
  score?: number
  item?: string
  enemyI?: number | 'boss'
  nikai?: boolean
  hitMode?: number
  counterDamage?: number
  label?: string
}

const entries = catalogJson.entries as CatalogEntry[]
const byFrame = new Map<number, CatalogEntry>()
for (const e of entries) {
  byFrame.set(e.frame, e)
}

export function catalogForFrame(frame: number): CatalogEntry {
  const hit = byFrame.get(frame)
  if (hit) {
    return hit
  }
  let best = entries[0]
  for (const e of entries) {
    if (e.frame <= frame) {
      best = e
    }
  }
  return best ?? { frame, hp: 1, attack: 10, score: 5 }
}

const TREASURE_ITEMS: ItemId[] = [
  'life',
  'coin',
  'stone',
  'gun',
  'allcoin',
  'alllife',
  'wing',
  'hammer1',
  'hammer2',
  'hammer3',
  'hammer4',
]

export function rollTreasureItem(random: () => number): ItemId {
  const idx = Math.floor(random() * TREASURE_ITEMS.length)
  return TREASURE_ITEMS[idx] ?? 'coin'
}

export function mapCatalogItem(raw?: string): ItemId | undefined {
  if (!raw) {
    return undefined
  }
  if (raw === 'life' || raw === 'life2') {
    return 'life'
  }
  if (raw.startsWith('coin')) {
    return 'coin'
  }
  if (
    raw === 'hammer1' ||
    raw === 'hammer2' ||
    raw === 'hammer3' ||
    raw === 'hammer4'
  ) {
    return raw
  }
  if (
    raw === 'stone' ||
    raw === 'gun' ||
    raw === 'allcoin' ||
    raw === 'alllife' ||
    raw === 'wing' ||
    raw === 'utsuwa' ||
    raw === 'sekiban1' ||
    raw === 'sekiban2' ||
    raw === 'sekiban3'
  ) {
    return raw
  }
  return undefined
}
