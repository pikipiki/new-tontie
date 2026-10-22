declare module '@ruffle-rs/ruffle' {
  const init: unknown
  export default init
}

interface Window {
  RufflePlayer?: {
    config?: { publicPath?: string }
    newest?: () => {
      createPlayer: () => HTMLElement
    }
  }
}
