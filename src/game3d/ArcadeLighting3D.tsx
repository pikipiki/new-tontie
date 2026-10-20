import { themeColors } from './theme'
export function ArcadeLighting3D({ bossArena }: { bossArena: boolean }) {
  return (
    <>
      {' '}
      <hemisphereLight
        color={themeColors.scene.hemiSky}
        groundColor={themeColors.scene.hemiGround}
        intensity={0.75}
      />
      <directionalLight
        position={[-3, 7, 5]}
        color={
          bossArena ? themeColors.hudAccentCyan : themeColors.scene.keyLight
        }
        intensity={bossArena ? 2.6 : 3.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-normalBias={0.025}
        shadow-bias={-0.0001}
        shadow-radius={4}
      />
      <directionalLight
        position={[4, 3, -3]}
        intensity={2.4}
        color={themeColors.scene.rimPurple}
      />
      <pointLight
        position={[-3, 2, 1]}
        color={themeColors.scene.accentPink}
        intensity={8}
        distance={8}
        decay={2}
      />
    </>
  )
}
