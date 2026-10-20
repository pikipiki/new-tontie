import Box from '@mui/material/Box'
import type { TontieGame } from '@/hooks/useTontieGame'
import type { UpgradeId } from '@game/adventure/types'
import { UPGRADES } from '@game/adventure/content'
import { themeColors as colors } from './theme'
export function UpgradeCard({
  game,
  upgrade,
}: {
  game: TontieGame
  upgrade: UpgradeId
}) {
  return (
    <Box
      component="button"
      key={upgrade}
      type="button"
      onClick={() => {
        game.chooseUpgrade(upgrade)
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        textAlign: 'left',
        p: 1.5,
        minHeight: 84,
        borderRadius: '18px',
        border: `1px solid ${colors.overlayBorder}`,
        background: colors.uiChipBg,
        color: colors.white,
        font: 'inherit',
        cursor: 'pointer',
        '&:hover, &:focus-visible': {
          borderColor: colors.yellow,
          outline: `2px solid ${colors.yellow}`,
        },
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          fontSize: 32,
          minWidth: 40,
          textAlign: 'center',
          color: colors.yellow,
        }}
      >
        {UPGRADES[upgrade].icon}
      </Box>
      <Box component="span">
        <Box component="strong" sx={{ display: 'block', fontSize: 17 }}>
          {UPGRADES[upgrade].title}
        </Box>
        <Box
          component="span"
          sx={{
            display: 'block',
            mt: 0.3,
            fontSize: 13,
            lineHeight: 1.4,
            color: colors.cream,
          }}
        >
          {UPGRADES[upgrade].description}
        </Box>
      </Box>
    </Box>
  )
}
