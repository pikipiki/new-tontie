import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import type { GameState } from '@game/types'
import { CrystalHearts3D } from '@game3d/CrystalHearts3D'

/** Accessible life gauge with six real, faceted crystal meshes. */
export function Hearts({ state }: { state: GameState }) {
  const { t } = useTranslation()
  const health = Math.max(0, Math.min(state.hpMax, state.hp))
  return (
    <Box
      role="img"
      aria-label={t('game.life', { hp: health, max: state.hpMax })}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        aspectRatio: '7.64',
        mx: 'auto',
        pointerEvents: 'none',
      }}
    >
      <CrystalHearts3D filled={(health / Math.max(1, state.hpMax)) * 6} />
    </Box>
  )
}
