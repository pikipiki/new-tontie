/** Last-resort UI when the bundle fails before React mounts. */
export function showBootstrapFailure(reason: string): void {
  const root = document.getElementById('root')
  if (!root) {
    return
  }
  root.innerHTML = `
    <div role="alert" style="min-height:100dvh;display:grid;place-items:center;padding:24px;background:#24123a;color:#fffdf7;font-family:system-ui,sans-serif;text-align:center">
      <div style="max-width:420px">
        <h1 style="font-size:1.25rem;margin:0 0 8px">Game could not load</h1>
        <p style="margin:0 0 16px;opacity:0.95">Игра не загрузилась. Обновите страницу или проверьте интернет.</p>
        <p style="font-size:12px;opacity:0.75;word-break:break-word">${reason}</p>
        <button type="button" onclick="location.reload()" style="margin-top:16px;padding:12px 20px;font-size:16px;border-radius:12px;border:none;background:#5a8fd4;color:#fff;font-weight:700">
          Reload / Обновить
        </button>
      </div>
    </div>
  `
}

export function installGlobalFailureHandlers(): void {
  window.addEventListener('error', (event) => {
    if (document.getElementById('root')?.childElementCount) {
      return
    }
    const message =
      event.error instanceof Error ? event.error.message : event.message
    showBootstrapFailure(message)
  })
  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      if (document.getElementById('root')?.childElementCount) {
        return
      }
      const reason: unknown = event.reason
      let message = 'Failed to load game modules'
      if (reason instanceof Error) {
        message = reason.message
      } else if (typeof reason === 'string') {
        message = reason
      }
      showBootstrapFailure(message)
    },
  )
}
