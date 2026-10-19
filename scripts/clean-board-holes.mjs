#!/usr/bin/env node
/**
 * Remove hammers + cyan ripples baked into flattened main-timeline board export.
 * Flash hides d{n}.hammer at "off"; this approximates that on the static PNG.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Same grid as src/game/layout.ts (72×72 hit boxes). */
const HOLE_ANCHORS = [
  [58, 98],
  [164, 98],
  [270, 98],
  [58, 178],
  [164, 178],
  [270, 178],
  [58, 258],
  [164, 258],
  [270, 258],
]

const py = `import sys
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
holes = eval(sys.argv[3])
raw = Image.open(src).convert('RGB')
img = raw.copy()
w, h = img.size

def is_grass(r, g, b):
    return g > 95 and r < 125 and b < 105

def is_hole_mouth(r, g, b):
    return r < 50 and g < 40 and b < 35

def should_paint_soil(r, g, b, dy):
    if is_hole_mouth(r, g, b):
        return False
    if dy < 52:
        return True
    if b > 165 and g > 125 and r < 145:
        return True
    if r > 110 and g > 105 and b > 105:
        return True
    return False

for x, y in holes:
    left = raw.getpixel((min(x + 10, w - 1), min(y + 54, h - 1)))
    right = raw.getpixel((min(x + 62, w - 1), min(y + 54, h - 1)))
    ref = tuple((a + b) // 2 for a, b in zip(left, right))
    for dx in range(0, 72):
        px = x + dx
        if px >= w:
            continue
        for dy in range(0, 68):
            py = y + dy
            if py >= h:
                continue
            c = raw.getpixel((px, py))
            if is_grass(*c):
                img.putpixel((px, py), c)
            elif should_paint_soil(*c, dy):
                img.putpixel((px, py), ref)
            else:
                img.putpixel((px, py), c)

img.save(dst)
`

export function cleanBoardHoles(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    console.warn('clean-board-holes: missing', inputPath)
    return false
  }
  const r = spawnSync('python3', ['-c', py, inputPath, outputPath, JSON.stringify(HOLE_ANCHORS)], {
    encoding: 'utf8',
  })
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout)
    return false
  }
  return fs.existsSync(outputPath)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const input = process.argv[2] ?? path.join(root, 'public/game/sprites/board-gameplay.png')
  const output = process.argv[3] ?? path.join(root, 'public/game/sprites/board-gameplay-clean.png')
  if (!cleanBoardHoles(input, output)) {
    process.exit(1)
  }
  console.log('Wrote', output)
}
