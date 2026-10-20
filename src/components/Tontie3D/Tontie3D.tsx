import './tontiePreload'
import { AdventureHud } from './AdventureHud'
import Box from '@mui/material/Box'
import { useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { isMuted, setMuted } from '@game/audio'
import { useTontieGame } from '@/hooks/useTontieGame'
import { GameStatusAnnouncer } from './GameStatusAnnouncer'
import { BottomBar, TopBar } from './TontieHud'
import { Tontie3DViewport } from './Tontie3DViewport'
import { useHighScore } from './tontieHudScore'
import { HoleButtons, Overlays } from './TontieOverlays'
import { SKY } from './theme'

function blockContextMenu(event: MouseEvent) {
  event.preventDefault()
}

export function Tontie3D() {
  const { t } = useTranslation()
  const game = useTontieGame()
  const high = useHighScore(game.state.score)
  const [photo] = useState(
    () => new URLSearchParams(window.location.search).get('scene') === '1',
  )
  const [muted, setMutedState] = useState(isMuted)
  const [dpr, setDpr] = useState(() => Math.min(1.5, window.devicePixelRatio))
  const now = game.clock

  const toggleMute = () => {
    setMuted(!muted)
    setMutedState(!muted)
  }

  return (
    <Box
      id="tontie-game-main"
      component="main"
      tabIndex={-1}
      aria-label={t('game.label')}
      onContextMenu={blockContextMenu}
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: SKY,
        fontFamily: '"Nunito", "Arial Rounded MT Bold", system-ui, sans-serif',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <GameStatusAnnouncer
        state={game.state}
        high={high}
        gameFx={game.gameFx}
        now={now}
      />
      <TopBar game={game} high={high} />
      {!photo && <AdventureHud game={game} />}
      <Tontie3DViewport
        game={game}
        high={high}
        now={now}
        photo={photo}
        dpr={dpr}
        onDeclineDpr={() => {
          setDpr(1)
        }}
      />
      {!photo && (
        <BottomBar game={game} muted={muted} onToggleMute={toggleMute} />
      )}
      <HoleButtons game={game} />
      {!photo && <Overlays game={game} now={now} />}
    </Box>
  )
}
