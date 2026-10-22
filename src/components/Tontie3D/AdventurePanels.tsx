import { UpgradeCard } from './AdventureUpgradeCard'
import Box from '@mui/material/Box'
import type { TontieGame } from '@/hooks/useTontieGame'
import { missionFor, MISSION_COUNT, UPGRADES } from '@game/adventure/content'
import { themeColors as colors } from './theme'
import { GameButton, Overlay } from './ui'

const card = {
  width: 'min(100%, 580px)',
  borderRadius: '26px',
  p: { xs: 2, sm: 3 },
  background: colors.overlayBg,
  border: `1px solid ${colors.overlayBorder}`,
  boxShadow: `0 18px 80px ${colors.overlayShadow}`,
}
export function AdventureBriefing({
  game,
  welcome = false,
}: {
  game: TontieGame
  welcome?: boolean
}) {
  const adventure = game.state.adventure
  if (!adventure) return null
  const mission = missionFor(adventure.stage)
  return (
    <Overlay label={welcome ? 'Choose your adventure' : mission.title}>
      <Box
        sx={{
          ...card,
          maxHeight: '90dvh',
          overflowY: 'auto',
          touchAction: 'pan-y',
        }}
      >
        <Box
          sx={{
            color: colors.cabinetPink,
            fontSize: 12,
            letterSpacing: 3,
            fontWeight: 900,
          }}
        >
          PAINGPAING’S ADVENTURE
        </Box>
        <Box sx={{ fontSize: 54, lineHeight: 1.3 }} aria-hidden>
          {mission.icon}
        </Box>
        <Box
          component="h1"
          sx={{ m: 0, fontSize: { xs: 26, sm: 34 }, fontWeight: 900 }}
        >
          {mission.title}
        </Box>
        <Box sx={{ color: colors.cream, fontWeight: 800, mt: 0.5 }}>
          MISSION {adventure.stage} / {MISSION_COUNT} ·{' '}
          {mission.seconds +
            (adventure.upgrades.includes('extraTime') ? 10 : 0)}{' '}
          SECONDS
        </Box>
        <Box component="p" sx={{ fontSize: 15, lineHeight: 1.6, my: 2 }}>
          {mission.hint}
        </Box>
        {welcome && <AdventureHowTo />}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <GameButton autoFocus onClick={game.start}>
            {welcome ? 'Start adventure' : 'Let’s go!'} ▶
          </GameButton>
          {welcome && (
            <GameButton
              variant="ghost"
              onClick={() => {
                game.setMode(false)
              }}
            >
              Classic mode
            </GameButton>
          )}
        </Box>
      </Box>
    </Overlay>
  )
}
export function AdventureRewards({ game }: { game: TontieGame }) {
  const adventure = game.state.adventure
  if (!adventure) return null
  return (
    <Overlay label="Choose your next power">
      <Box
        sx={{
          ...card,
          maxHeight: '90dvh',
          overflowY: 'auto',
          touchAction: 'pan-y',
        }}
      >
        <Box
          sx={{
            color: colors.cabinetPink,
            fontSize: 12,
            letterSpacing: 2,
            fontWeight: 900,
          }}
        >
          MISSION {adventure.stage} COMPLETE · +8 HEALTH
        </Box>
        <Box component="h1" sx={{ my: 1, fontSize: 28 }}>
          A little more magic
        </Box>
        <Box sx={{ mb: 2, color: colors.cream, fontSize: 14 }}>
          Choose one power. It stays for this adventure.
        </Box>
        <Box sx={{ display: 'grid', gap: 1.2 }}>
          {adventure.offers.map((upgrade) => (
            <UpgradeCard key={upgrade} game={game} upgrade={upgrade} />
          ))}
        </Box>
        {adventure.upgrades.length > 0 && (
          <Box sx={{ mt: 2, fontSize: 12, color: colors.cabinetPink }}>
            Your build:{' '}
            {adventure.upgrades
              .map((upgrade) => UPGRADES[upgrade].title)
              .join(' + ')}
          </Box>
        )}
      </Box>
    </Overlay>
  )
}

function AdventureHowTo() {
  return (
    <Box
      sx={{
        textAlign: 'left',
        fontSize: 14,
        p: 1.5,
        mb: 2,
        borderRadius: 3,
        bgcolor: colors.uiChipBg,
        lineHeight: 1.7,
      }}
    >
      <strong>Tap a Goonk to fly and strike.</strong>
      <br />
      Rest to eat: each bite charges sugar. Finish a donut for a mini frenzy,
      then tap <strong>Sugar Rush</strong> to freeze Goonks and double points.
      <br />
      Bananas warn of a swap. A jester then runs to Pink, steals the weapon with
      a STOLEN tag, and sprints home. Tap the carrier — Pink slaps the thief and
      takes it back. Complete missions and outsmart two bosses.
    </Box>
  )
}
