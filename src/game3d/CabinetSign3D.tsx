import { RoundedBox } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { themeColors } from '@/components/Tontie3D/theme'
import { BOARD_SURFACE_Y } from '@game3d/layout3d'

const scene = themeColors.scene

/** Local canvas lettering avoids font downloads and keeps the cabinet signage portable. */
function Lettering({
  text,
  width,
  height,
  color = scene.signDefault,
  logo = false,
}: {
  text: string
  width: number
  height: number
  color?: string
  logo?: boolean
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = logo ? 2048 : 1024
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `900 ${logo ? '154' : '120'}px "Arial Rounded MT Bold", "Nunito", sans-serif`
    if (logo) {
      ctx.lineJoin = 'round'
      const colors = scene.signPalette
      const spacing = 108
      Array.from(text).forEach((char, charIndex) => {
        const charX =
          canvas.width / 2 + (charIndex - (text.length - 1) / 2) * spacing
        ctx.strokeStyle = scene.signStrokeDark
        ctx.lineWidth = 42
        ctx.strokeText(char, charX, 136)
        ctx.strokeStyle = scene.signStrokeLight
        ctx.lineWidth = 23
        ctx.strokeText(char, charX, 125)
        ctx.fillStyle = colors[charIndex % colors.length] ?? color
        ctx.fillText(char, charX, 125)
      })
    } else {
      ctx.fillStyle = color
      ctx.fillText(text, canvas.width / 2, 128)
    }
    const map = new CanvasTexture(canvas)
    map.colorSpace = SRGBColorSpace
    return map
  }, [text, color, logo])
  useEffect(
    () => () => {
      texture.dispose()
    },
    [texture],
  )
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

const SEGMENTS = [
  [0, 0.42, 0],
  [0.23, 0.21, 1],
  [0.23, -0.21, 1],
  [0, -0.42, 0],
  [-0.23, -0.21, 1],
  [-0.23, 0.21, 1],
  [0, 0, 0],
] as const
const DIGITS = [
  '1111110',
  '0110000',
  '1101101',
  '1111001',
  '0110011',
  '1011011',
  '1011111',
  '1110000',
  '1111111',
  '1111011',
]

function Digit({ digit, posX }: { digit: string; posX: number }) {
  const segments =
    (digit === ' ' ? undefined : DIGITS[Number(digit)]) ?? '0000000'
  return (
    <group position={[posX, 0, 0]} scale={[0.32, 0.39, 1]}>
      {SEGMENTS.map(([segmentPosX, segmentPosY, vertical], segmentIndex) => (
        <mesh
          key={segmentIndex}
          position={[segmentPosX, segmentPosY, 0]}
          rotation={[0, 0, vertical ? Math.PI / 2 : 0]}
        >
          <planeGeometry args={[0.36, 0.065]} />
          <meshBasicMaterial
            color={
              segments[segmentIndex] === '1'
                ? themeColors.ledRedBright
                : themeColors.ledOff
            }
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function Display({
  value,
  digits,
  label,
  posX,
  width,
}: {
  value: number
  digits: number
  label: string
  posX: number
  width: number
}) {
  const string = String(
    Math.min(Math.max(0, Math.floor(value)), 10 ** digits - 1),
  ).padStart(digits, ' ')
  return (
    <group position={[posX, 0.97, 0.12]}>
      <RoundedBox args={[width, 0.5, 0.025]} radius={0.045} smoothness={3}>
        <meshStandardMaterial color={scene.signFrame} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[width - 0.04, 0.46]} />
        <meshStandardMaterial color={scene.signBezel} roughness={0.42} />
      </mesh>
      <group position={[0, 0, 0.038]}>
        {Array.from(string).map((digit, digitIndex) => (
          <Digit
            key={digitIndex}
            digit={digit === ' ' ? ' ' : digit}
            posX={(digitIndex - (digits - 1) / 2) * 0.225}
          />
        ))}
      </group>
      <group position={[0, 0.36, 0.02]}>
        <Lettering text={label} width={width * 0.82} height={0.19} />
      </group>
    </group>
  )
}

export function CabinetSign3D({
  seconds,
  score,
  high,
}: {
  seconds: number
  score: number
  high: number
}) {
  return (
    <group position={[0, BOARD_SURFACE_Y, -2.06]}>
      <RoundedBox
        position={[0, 1.1, 0]}
        args={[3.92, 0.99, 0.17]}
        radius={0.12}
        smoothness={5}
        castShadow
      >
        <meshStandardMaterial color={scene.signPanel} roughness={0.94} />
      </RoundedBox>
      <RoundedBox
        position={[0, 1.1, 0.09]}
        args={[3.73, 0.8, 0.035]}
        radius={0.07}
        smoothness={4}
      >
        <meshStandardMaterial color={scene.signBase} roughness={0.7} />
      </RoundedBox>
      <Display
        value={seconds}
        digits={2}
        label="TIME"
        posX={-1.35}
        width={0.72}
      />
      <Display
        value={score}
        digits={5}
        label="SCORE"
        posX={-0.05}
        width={1.55}
      />
      <Display
        value={high}
        digits={4}
        label="HIGH SCORE"
        posX={1.31}
        width={1.04}
      />
      <group position={[0, 1.93, 0.17]}>
        <Lettering text="Paingpaing's game" width={3.55} height={0.64} logo />
      </group>
      <group position={[0, 1.57, 0.15]}>
        <Lettering
          text="P A I N G P A I N G   •   P L U S H   A R C A D E"
          width={2.5}
          height={0.1}
          color={scene.signAccent}
        />
      </group>
    </group>
  )
}
