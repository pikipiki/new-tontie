import type { EnemySpawn } from '@/game/types'

export type MobPalette = {
  body: string
  head: string
  accent: string
  belly: string
  scale: number
}

export function mobPalette(enemy: EnemySpawn): MobPalette {
  const frame = enemy.catalogFrame ?? 5
  const hue = (frame * 47) % 360

  switch (enemy.kind) {
    case 'boss':
      return {
        body: '#b71c1c',
        head: '#d32f2f',
        accent: '#ff8f00',
        belly: '#5d1a1a',
        scale: 1.35,
      }
    case 'shop':
      return {
        body: '#1565c0',
        head: '#42a5f5',
        accent: '#ffeb3b',
        belly: '#0d47a1',
        scale: 1.05,
      }
    case 'treasure':
      return {
        body: '#f9a825',
        head: '#fdd835',
        accent: '#ff6f00',
        belly: '#f57f17',
        scale: 0.95,
      }
    case 'twoHit':
      return {
        body: '#6a1b9a',
        head: '#8e24aa',
        accent: '#ea80fc',
        belly: '#4a148c',
        scale: 1.1,
      }
    case 'item':
      return {
        body: '#f9a825',
        head: '#ffca28',
        accent: '#fff59d',
        belly: '#ff8f00',
        scale: 0.9,
      }
    default:
      return {
        body: `hsl(${hue}, 42%, 38%)`,
        head: `hsl(${hue}, 48%, 48%)`,
        accent: `hsl(${(hue + 40) % 360}, 55%, 55%)`,
        belly: `hsl(${hue}, 35%, 28%)`,
        scale: 0.92 + (frame % 5) * 0.04,
      }
  }
}
