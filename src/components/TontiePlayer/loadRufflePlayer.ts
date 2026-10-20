import { publicUrl } from '@constants/publicUrl'
import { CANONICAL_SWF, verifyCanonicalSwf } from '@/fidelity/swfManifest'

interface RufflePlayerElement extends HTMLElement {
  ruffle: () => { load: (url: string) => void }
}

const SWF_URL = CANONICAL_SWF.url
const GAME_WIDTH = 400
const GAME_HEIGHT = 400

export async function loadRufflePlayer(
  host: HTMLDivElement,
  isCancelled: () => boolean,
  onFidelity: (ok: boolean) => void,
  onError: (message: string) => void,
): Promise<void> {
  const fidelityOk = await verifyCanonicalSwf()
  if (isCancelled()) {
    return
  }
  onFidelity(fidelityOk)
  if (!fidelityOk) {
    onError(
      'SWF hash/size mismatch — run: cp reference/tontie.swf public/game/tontie.swf',
    )
    return
  }

  const ruffleGlobal = window.RufflePlayer ?? {}
  window.RufflePlayer = ruffleGlobal
  ruffleGlobal.config = {
    ...ruffleGlobal.config,
    publicPath: publicUrl('ruffle/'),
  }

  await import('@ruffle-rs/ruffle')

  if (isCancelled()) {
    return
  }

  const newest = ruffleGlobal.newest
  if (!newest) {
    onError('Ruffle failed to initialize')
    return
  }
  const factory = newest()

  const player = factory.createPlayer() as RufflePlayerElement
  player.style.width = `${String(GAME_WIDTH)}px`
  player.style.height = `${String(GAME_HEIGHT)}px`
  player.tabIndex = 0
  host.replaceChildren(player)
  player.ruffle().load(SWF_URL)
}

export { GAME_WIDTH, GAME_HEIGHT }
