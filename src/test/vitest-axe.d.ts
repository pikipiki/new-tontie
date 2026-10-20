import 'vitest'
import type { AxeResults } from 'vitest-axe'

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- vitest Assertion generic
  interface Assertion<T = unknown> {
    toHaveNoViolations(): void
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void
  }
}

export type { AxeResults }
