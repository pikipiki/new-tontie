import { afterEach, describe, expect, it, vi } from 'vitest'
import { showBootstrapFailure } from '@/bootstrapFailure'

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('bootstrap error screen', () => {
  it('renders attacker-controlled error text without interpreting HTML', () => {
    document.body.innerHTML = '<div id="root"></div>'
    const hostile =
      '<img src=x onerror="window.compromised=true"><script>alert(1)</script>'
    showBootstrapFailure(hostile)
    const alert = document.querySelector('[role="alert"]')
    expect(alert?.textContent).toContain(hostile)
    expect(alert?.querySelector('img, script, [onclick], [onerror]')).toBeNull()
    expect(alert?.querySelector('button')?.textContent).toContain('Reload')
  })

  it('survives an error before the root element exists', () => {
    expect(() => {
      showBootstrapFailure('offline')
    }).not.toThrow()
  })
})
