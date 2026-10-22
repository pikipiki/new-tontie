import { soundUrl } from './banks'

/** One decode per sound; a reset invalidates callbacks from a replaced audio context. */
export class SoundBufferCache {
  readonly buffers = new Map<number, AudioBuffer>()
  private readonly loading = new Map<number, Promise<AudioBuffer | null>>()
  private generation = 0

  load(
    soundId: number,
    context: AudioContext | null,
  ): Promise<AudioBuffer | null> {
    const cached = this.buffers.get(soundId)
    if (cached) return Promise.resolve(cached)
    const pending = this.loading.get(soundId)
    if (pending) return pending
    if (!context) return Promise.resolve(null)
    const generation = this.generation
    const promise = fetch(soundUrl(soundId))
      .then((response) => {
        if (!response.ok)
          throw new Error(`Audio request failed: ${String(response.status)}`)
        return response.arrayBuffer()
      })
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => {
        if (generation !== this.generation) return null
        this.buffers.set(soundId, buffer)
        return buffer
      })
      .catch(() => null)
      .finally(() => {
        if (this.loading.get(soundId) === promise) this.loading.delete(soundId)
      })
    this.loading.set(soundId, promise)
    return promise
  }

  clear(): void {
    this.generation += 1
    this.buffers.clear()
    this.loading.clear()
  }
}
