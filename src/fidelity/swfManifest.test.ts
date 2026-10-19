import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CANONICAL_SWF } from './swfManifest'

describe('canonical SWF fidelity', () => {
  it('reference and public copies match Eyezmaze hash', () => {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
    for (const rel of ['reference/tontie.swf', 'public/game/tontie.swf']) {
      const buf = readFileSync(path.join(root, rel))
      const hash = createHash('sha256').update(buf).digest('hex')
      expect(buf.length).toBe(CANONICAL_SWF.bytes)
      expect(hash).toBe(CANONICAL_SWF.sha256)
    }
  })
})
