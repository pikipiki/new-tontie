import { readFileSync } from 'node:fs'
import { webcrypto } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CANONICAL_SWF,
  loadCanonicalSwf,
  verifyCanonicalSwf,
} from '../swfManifest'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('verified Flash bytes', () => {
  it('passes exactly the bytes that were hashed without a second network request', async () => {
    vi.stubGlobal('crypto', webcrypto)
    const root = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../..',
    )
    const bytes = readFileSync(path.join(root, 'reference/tontie.swf'))
    const request = vi.fn(() => Promise.resolve(new Response(bytes)))
    vi.stubGlobal('fetch', request)
    const verified = await loadCanonicalSwf()
    expect(verified).toEqual(new Uint8Array(bytes))
    expect(request).toHaveBeenCalledTimes(1)
    expect(await verifyCanonicalSwf()).toBe(true)
  })

  it('rejects failed requests, wrong sizes and same-size alterations', async () => {
    vi.stubGlobal('crypto', webcrypto)
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('', { status: 404 }))),
    )
    expect(await loadCanonicalSwf()).toBeNull()
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('wrong size'))),
    )
    expect(await verifyCanonicalSwf()).toBe(false)
    const bytes = new Uint8Array(CANONICAL_SWF.bytes)
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(bytes))),
    )
    expect(await loadCanonicalSwf()).toBeNull()
  })
})
