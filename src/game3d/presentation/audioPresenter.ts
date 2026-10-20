import type { GameEvent } from '@game/types'
import { playMusic, playSfx, setMusicPaused, stopMusic } from '@game/audio'
import type { GameEventPresenter } from '@game3d/presentation/types'

/** Maps {@link GameEvent} music/sfx fields to the Web Audio layer. */
export class AudioGameEventPresenter implements GameEventPresenter {
  present(events: readonly GameEvent[]): void {
    for (const event of events) {
      if (event.sfx) {
        playSfx(event.sfx)
      }
      if (event.music === 'stop') {
        stopMusic()
      } else if (event.music) {
        playMusic(event.music)
      }
      if (event.kind === 'pause') {
        setMusicPaused(true)
      }
      if (event.kind === 'resume') {
        setMusicPaused(false)
      }
    }
  }
}
