import { publicUrl } from '@constants/publicUrl'
import { loadCanonicalSwf } from '@/fidelity/swfManifest'

interface RufflePlayerElement extends HTMLElement {
  ruffle: () => {
    load: (options: {
      data: Uint8Array
      swfFileName: string
      allowScriptAccess: boolean
    }) => Promise<void>
  }
}

const GAME_WIDTH = 400
const GAME_HEIGHT = 400

export async function loadRufflePlayer(
  host: HTMLDivElement,
  isCancelled: () => boolean,
  onError: (message: string) => void,
): Promise<void> {
  const swfBytes = await loadCanonicalSwf()
  if (isCancelled()) {
    return
  }
  if (!swfBytes) {
    onError('Original game file mismatch. Please reload the page.')
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

  const factory = window.RufflePlayer.newest?.()
  if (!factory) {
    onError('Ruffle failed to initialize')
    return
  }

  const player = factory.createPlayer() as RufflePlayerElement
  player.style.width = '100%'
  player.style.height = '100%'
  player.tabIndex = 0
  host.replaceChildren(player)
  await player.ruffle().load({
    data: swfBytes,
    swfFileName: 'tontie.swf',
    allowScriptAccess: false,
  })
}

export { GAME_WIDTH, GAME_HEIGHT }
