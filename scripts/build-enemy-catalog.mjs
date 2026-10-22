#!/usr/bin/env node
/**
 * Extract DefineSprite_458 enemy stats from ffdec AS exports → reference/enemy-catalog.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const base = path.join(
  root,
  'reference/decompiled/ffdec/scripts/DefineSprite_458',
)

function parseLoadFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const frame = Number(
    path.basename(path.dirname(path.dirname(filePath))).replace('frame_', ''),
  )
  const entry = { frame, source: path.relative(root, filePath) }
  const hp = text.match(/\bhp\s*=\s*(-?\d+)/)
  const attack = text.match(/\battack\s*=\s*(-?\d+)/)
  const score = text.match(/\bscore\s*=\s*(-?\d+)/)
  if (hp) entry.hp = Number(hp[1])
  if (attack) entry.attack = Number(attack[1])
  if (score) entry.score = Number(score[1])
  const item = text.match(/item\s*=\s*"([^"]+)"/)
  if (item) entry.item = item[1]
  if (text.includes('enemy_i = "boss"') || text.includes('enemyI = "boss"'))
    entry.enemyI = 'boss'
  if (text.includes('enemy_i = 2')) entry.enemyI = 2
  if (text.includes('nikai = 1')) entry.nikai = true
  if (text.includes('hit = 2')) entry.hitMode = 2
  if (text.includes('sikaesi = 40')) entry.counterDamage = 40
  if (text.includes('gotoAndStop("takara")')) entry.label = 'takara'
  const goto = text.match(/gotoAndStop\(([^)]+)\)/)
  if (goto && !entry.label) entry.gotoStop = goto[1].trim()
  return entry
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) {
      walk(p, out)
    } else if (name.includes('onClipEvent(load)') && name.endsWith('.as')) {
      out.push(parseLoadFile(p))
    }
  }
  return out
}

const raw = walk(base)
const byFrame = new Map()
for (const e of raw) {
  if (e.hp === undefined && e.attack === undefined && !e.label) {
    continue
  }
  const prev = byFrame.get(e.frame)
  if (!prev || (e.hp !== undefined && prev.hp === undefined)) {
    byFrame.set(e.frame, e)
  }
}

const catalog = [...byFrame.values()].sort((a, b) => a.frame - b.frame)
const outPath = path.join(root, 'reference/enemy-catalog.json')
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedFrom: 'DefineSprite_458',
      spawnFormula:
        'Math.floor(Math.random() * _root.lv + 5) /* DefineSprite_459 */',
      entries: catalog,
    },
    null,
    2,
  ),
)
console.log(`Wrote ${catalog.length} entries → ${outPath}`)
