import Box from '@mui/material/Box'
import { cartoonText, INK, themeColors, YELLOW } from './theme'

/** Each letter drops in with a small stagger, like the up_boad "up" tween. */
export function CartoonTitle({
  text,
  fill = YELLOW,
  size = 48,
}: {
  text: string
  fill?: string
  size?: number
}) {
  return (
    <Box
      component="h2"
      aria-label={text}
      sx={{
        m: 0,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        fontSize: { xs: size * 0.78, sm: size },
        ...cartoonText(fill, INK, 7),
        filter: `drop-shadow(0 10px 18px ${themeColors.dropShadow})`,
      }}
    >
      {Array.from(
        new Intl.Segmenter().segment(text),
        (part) => part.segment,
      ).map((char, index) => (
        <Box
          key={index}
          component="span"
          aria-hidden
          sx={{
            display: 'inline-block',
            whiteSpace: 'pre',
            animation: `tontie-letter-in 520ms ${String(index * 38)}ms cubic-bezier(.2,1.7,.4,1) both`,
          }}
        >
          {char}
        </Box>
      ))}
    </Box>
  )
}
