#!/usr/bin/env node
/**
 * Export Flash assets via ffdec (Java required).
 * Copies a curated sprite set into public/game/sprites/ for the canvas port.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanBoardHoles } from './clean-board-holes.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const swf = path.join(root, 'reference/tontie.swf')
const jar = path.join(root, 'reference/tools/ffdec-cli.jar')
const outDir = path.join(root, 'public/game/sprites')
const tmpDir = path.join(root, '.cache/ffdec-export')
const soundsSrc = path.join(root, 'reference/decompiled/ffdec/sounds')
const soundsDst = path.join(root, 'public/game/sounds')

const javaHome = process.env.JAVA_HOME
  ? path.join(process.env.JAVA_HOME, 'bin/java')
  : 'java'

function runJava(args) {
  const r = spawnSync(javaHome, ['-jar', jar, ...args], { stdio: 'inherit', cwd: root })
  if (r.status !== 0) {
    process.exit(r.status ?? 1)
  }
}

if (!fs.existsSync(jar)) {
  console.error('Missing ffdec-cli.jar at', jar)
  process.exit(1)
}
if (!fs.existsSync(swf)) {
  console.error('Missing reference/tontie.swf')
  process.exit(1)
}

fs.mkdirSync(outDir, { recursive: true })
fs.mkdirSync(tmpDir, { recursive: true })

console.log('Exporting embedded JPEG sprites…')
runJava(['-export', 'image', outDir, swf])

fs.mkdirSync(path.join(outDir, 'hole'), { recursive: true })
console.log('Exporting dodai tile (DefineSprite_624) for hole reference…')
const dodaiTmp = path.join(tmpDir, 'dodai-sprite')
if (fs.existsSync(dodaiTmp)) {
  fs.rmSync(dodaiTmp, { recursive: true })
}
runJava(['-export', 'sprite', dodaiTmp, swf, '-exportIds', '624'])
const dodaiPad = path.join(dodaiTmp, 'DefineSprite_624/1.png')
if (fs.existsSync(dodaiPad)) {
  fs.copyFileSync(dodaiPad, path.join(outDir, 'hole/pad.png'))
}

const img517 = path.join(outDir, '517.png')
const img692 = path.join(outDir, '692.png')
if (fs.existsSync(img517)) {
  fs.copyFileSync(img517, path.join(outDir, 'mob.png'))
}
if (fs.existsSync(img692)) {
  fs.copyFileSync(img692, path.join(outDir, 'mobs-sheet.png'))
}

const boardTmp = path.join(tmpDir, 'board-sprite')
if (fs.existsSync(boardTmp)) {
  fs.rmSync(boardTmp, { recursive: true })
}
console.log('Exporting board (DefineSprite_559)…')
runJava(['-export', 'sprite', boardTmp, swf, '-exportIds', '559'])
const framesTmp = path.join(tmpDir, 'main-frames')
if (fs.existsSync(framesTmp)) {
  fs.rmSync(framesTmp, { recursive: true })
}
console.log('Exporting main timeline frames…')
runJava(['-export', 'frame', framesTmp, swf])
const gameplayFrame = path.join(framesTmp, '51.png')
if (fs.existsSync(gameplayFrame)) {
  fs.copyFileSync(gameplayFrame, path.join(outDir, 'board.png'))
  fs.copyFileSync(gameplayFrame, path.join(outDir, 'board-gameplay.png'))
  const cleanBoard = path.join(outDir, 'board-gameplay-clean.png')
  if (cleanBoardHoles(path.join(outDir, 'board-gameplay.png'), cleanBoard)) {
    console.log('Wrote hammer-free board →', cleanBoard)
  }
}

const mobCatalogTmp = path.join(tmpDir, 'mob-catalog')
if (fs.existsSync(mobCatalogTmp)) {
  fs.rmSync(mobCatalogTmp, { recursive: true })
}
// DefineSprite_458 frame → child sprite placed at the lowest depth (from -swf2xml).
// Rendering 458 directly advances the child timelines (hit clouds); child frame 1 is the idle pose.
const MOB_CHILD_SPRITE = {
  5: 81, 6: 273, 7: 279, 8: 295, 9: 299, 10: 304, 11: 315, 12: 319, 13: 330, 14: 339,
  15: 351, 16: 366, 17: 372, 18: 380, 19: 389, 20: 402, 21: 406, 22: 408, 23: 411, 24: 423,
}
console.log('Exporting enemy idle sprites (DefineSprite_458 children)…')
runJava(['-export', 'sprite', mobCatalogTmp, swf, '-exportIds', Object.values(MOB_CHILD_SPRITE).join(',')])
const mobsOut = path.join(outDir, 'mobs')
fs.mkdirSync(mobsOut, { recursive: true })
for (const [frame, id] of Object.entries(MOB_CHILD_SPRITE)) {
  const src = path.join(mobCatalogTmp, `DefineSprite_${id}/1.png`)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(mobsOut, `${frame}.png`))
  } else {
    console.warn('Missing idle sprite', id, 'for catalog frame', frame)
  }
}
const shopTmp = path.join(tmpDir, 'shop-sprite')
if (fs.existsSync(shopTmp)) {
  fs.rmSync(shopTmp, { recursive: true })
}
runJava(['-export', 'sprite', shopTmp, swf, '-exportIds', '607'])
const shopOut = path.join(mobsOut, 'shop.png')
let shopExported = false
for (let f = 1; f <= 12; f++) {
  const shopSrc = path.join(shopTmp, `DefineSprite_607/${f}.png`)
  if (fs.existsSync(shopSrc) && fs.statSync(shopSrc).size > 400) {
    fs.copyFileSync(shopSrc, shopOut)
    shopExported = true
    console.log('Shop sprite from frame', f)
    break
  }
}
if (!shopExported) {
  console.warn('No usable shop sprite in DefineSprite_607')
}
const treasureSrc = path.join(mobsOut, '7.png')
if (fs.existsSync(treasureSrc)) {
  fs.copyFileSync(treasureSrc, path.join(mobsOut, 'treasure.png'))
}

const hammerTmp = path.join(tmpDir, 'hammer-strike')
if (fs.existsSync(hammerTmp)) {
  fs.rmSync(hammerTmp, { recursive: true })
}
console.log('Exporting hammer strike (DefineSprite_261 doka frames)…')
runJava(['-export', 'sprite', hammerTmp, swf, '-exportIds', '261'])
const hammerSrcDir = path.join(hammerTmp, 'DefineSprite_261')
const hammerOut = path.join(outDir, 'hammer')
fs.mkdirSync(hammerOut, { recursive: true })
const hammerSourceFrames = [4, 5, 6, 7, 8, 9, 10, 11]
for (let i = 0; i < hammerSourceFrames.length; i++) {
  const src = path.join(hammerSrcDir, `${hammerSourceFrames[i]}.png`)
  const dst = path.join(hammerOut, `${String(i + 1).padStart(2, '0')}.png`)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst)
  }
}

if (fs.existsSync(soundsSrc)) {
  fs.mkdirSync(soundsDst, { recursive: true })
  for (const name of fs.readdirSync(soundsSrc)) {
    fs.copyFileSync(path.join(soundsSrc, name), path.join(soundsDst, name))
  }
  console.log('Copied sounds →', soundsDst)
}

console.log('Sprites ready under', outDir)
console.log('Manifest: reference/sprites.manifest.json')
