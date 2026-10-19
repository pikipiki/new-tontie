import { cssVarMap } from './designTokens'

export function applyDesignTokens(
  root: HTMLElement = document.documentElement,
): void {
  for (const [name, value] of Object.entries(cssVarMap)) {
    root.style.setProperty(name, value)
  }
}
