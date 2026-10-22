import { runReplayState } from '@game/replay-run'

export function installReplayDevTools(enabled = import.meta.env.DEV): void {
  if (enabled) {
    ;(
      window as unknown as { tontieReplay: typeof runReplayState }
    ).tontieReplay = runReplayState
  }
}
