import { catalogForFrame, mapCatalogItem } from '../catalog'
import type { EnemySpawn } from '../types'

/** Flash-faithful catalog row → spawn (used when no custom builder matches). */
export function defaultEnemyFromCatalogFrame(frame: number): EnemySpawn {
  const row = catalogForFrame(frame)
  const hitPoints = row.hp ?? 1
  const attack = row.attack ?? 0
  const score = row.score ?? 0
  const item = mapCatalogItem(row.item)

  if (row.enemyI === 'boss') {
    return {
      kind: 'boss',
      hp: hitPoints,
      maxHp: hitPoints,
      attack,
      score,
      catalogFrame: frame,
    }
  }

  if (row.nikai || row.enemyI === 2) {
    return {
      kind: 'twoHit',
      hp: hitPoints,
      maxHp: hitPoints,
      attack,
      score,
      catalogFrame: frame,
      item,
      nikai: true,
      counterDamage: row.counterDamage,
    }
  }

  if (item === 'life' || item === 'coin') {
    return {
      kind: 'item',
      hp: 1,
      maxHp: 1,
      attack,
      score,
      catalogFrame: frame,
      item,
    }
  }

  if (attack < 0) {
    return {
      kind: 'item',
      hp: 1,
      maxHp: 1,
      attack: 0,
      score,
      catalogFrame: frame,
      item: 'coin',
      coinSteal: Math.abs(attack),
    }
  }

  return {
    kind: 'mob',
    hp: hitPoints,
    maxHp: hitPoints,
    attack,
    score,
    catalogFrame: frame,
    item,
  }
}
