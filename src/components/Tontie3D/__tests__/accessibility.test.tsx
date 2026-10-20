import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { muiTheme } from '@constants/muiTheme'
import { SkipToGameLink } from '../SkipToGameLink'
import { GameButton, Overlay } from '../ui'

function withProviders(tree: ReactElement) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {tree}
      </ThemeProvider>
    </I18nextProvider>
  )
}

describe('accessibility (WCAG / RGAA)', () => {
  it('skip link targets the main game landmark', () => {
    render(withProviders(<SkipToGameLink />))
    const link = screen.getByRole('link', { name: /skip to game/i })
    expect(link).toHaveAttribute('href', '#tontie-game-main')
  })

  it('overlay dialog exposes an accessible name', () => {
    render(
      withProviders(
        <Overlay label="Paused">
          <p>Content</p>
        </Overlay>,
      ),
    )
    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeInTheDocument()
  })

  it('icon buttons require an accessible name', () => {
    render(
      withProviders(
        <GameButton variant="icon" label="Mute" onClick={() => undefined}>
          🔇
        </GameButton>,
      ),
    )
    expect(screen.getByRole('button', { name: 'Mute' })).toBeInTheDocument()
  })

  it('core chrome passes automated axe checks', async () => {
    const { container } = render(
      withProviders(
        <>
          <SkipToGameLink />
          <main id="tontie-game-main" aria-label="Test game">
            <GameButton label="Play" onClick={() => undefined}>
              Play
            </GameButton>
          </main>
        </>,
      ),
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
