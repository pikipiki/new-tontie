import { Environment, Lightformer, RoundedBox } from '@react-three/drei'

function NeonCabinet({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, -0.65, z]} rotation={[0, 0.16, 0]}>
      <RoundedBox
        args={[1.55, 3.7, 1.1]}
        radius={0.12}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color="#170f21"
          roughness={0.43}
          metalness={0.25}
        />
      </RoundedBox>
      <RoundedBox
        position={[0, 1.35, 0.58]}
        args={[1.36, 0.48, 0.06]}
        radius={0.07}
        smoothness={3}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </RoundedBox>
      <mesh position={[0, 1.35, 0.622]}>
        <planeGeometry args={[1.22, 0.31]} />
        <meshBasicMaterial color="#29152e" />
      </mesh>
      <RoundedBox
        position={[0, 0.35, 0.63]}
        rotation={[-0.15, 0, 0]}
        args={[1.22, 1.3, 0.07]}
        radius={0.06}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#29465c"
          emissive="#176db8"
          emissiveIntensity={0.5}
          roughness={0.22}
          metalness={0.5}
        />
      </RoundedBox>
      {[-0.4, 0, 0.4].map((dx, i) => (
        <mesh key={dx} position={[dx, 0.3 + i * 0.14, 0.7]}>
          <circleGeometry args={[0.12, 24]} />
          <meshBasicMaterial
            color={i % 2 ? '#fb7bd5' : '#58d6fa'}
            toneMapped={false}
          />
        </mesh>
      ))}
      <RoundedBox
        position={[0, -0.5, 0.8]}
        rotation={[-0.45, 0, 0]}
        args={[1.4, 0.18, 0.55]}
        radius={0.06}
        smoothness={3}
      >
        <meshStandardMaterial color="#39203c" metalness={0.4} roughness={0.3} />
      </RoundedBox>
      <pointLight
        position={[0, 1, 1.2]}
        color={color}
        intensity={3}
        distance={4}
      />
    </group>
  )
}

export function ArcadeRoom3D() {
  return (
    <>
      <Environment resolution={64} frames={1}>
        <Lightformer
          form="rect"
          intensity={3}
          color="#ffe2cb"
          position={[2, 5, 3]}
          scale={[5, 5, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          color="#f589ca"
          position={[-4, 2, 0]}
          scale={[2, 5, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#889afa"
          position={[3, 1, -4]}
          scale={[3, 4, 1]}
          target={[0, 0, 0]}
        />
      </Environment>
      <mesh
        position={[0, -1.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#171323"
          roughness={0.35}
          metalness={0.22}
        />
      </mesh>
      <mesh position={[0, 3, -6]}>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#150e20" roughness={1} />
      </mesh>
      <NeonCabinet x={-4.1} z={-1.7} color="#f02b98" />
      <NeonCabinet x={-5.9} z={-2.5} color="#446bff" />
      <NeonCabinet x={4.6} z={-3.3} color="#903ce7" />
      {[-5, -2, 1, 4].map((x) => (
        <mesh key={x} position={[x, 2.4, -5.9]}>
          <boxGeometry args={[0.035, 4.5, 0.035]} />
          <meshBasicMaterial color="#2e1a3d" toneMapped={false} />
        </mesh>
      ))}
    </>
  )
}
