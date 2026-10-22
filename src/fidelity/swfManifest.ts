import { publicUrl } from '@constants/publicUrl'

/** Canonical Eyezmaze Tontie v1 — must match reference/tontie.swf byte-for-byte. */
export const CANONICAL_SWF = {
  url: publicUrl('game/tontie.swf'),
  sha256: '2b91801d763ff6c1fdf52d461849e11e4c3fa31a9dd6aea3b836f4dfff9f8193',
  bytes: 360757,
} as const

export async function loadCanonicalSwf(): Promise<Uint8Array | null> {
  const res = await fetch(CANONICAL_SWF.url)
  if (!res.ok) {
    return null
  }
  const buf = await res.arrayBuffer()
  if (buf.byteLength !== CANONICAL_SWF.bytes) {
    return null
  }
  const hash = await crypto.subtle.digest('SHA-256', buf)
  const hex = [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
  return hex === CANONICAL_SWF.sha256 ? new Uint8Array(buf) : null
}

/** Compatibility check for callers that only need the fidelity result. */
export async function verifyCanonicalSwf(): Promise<boolean> {
  return (await loadCanonicalSwf()) !== null
}
