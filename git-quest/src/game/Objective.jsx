import { useRef, useState } from "react";
import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { PALETTE } from "./theme";

// A floating octahedral crystal of gold light marking the lesson's guardian.
// Click/tap it to begin the boss fight.
export default function Objective({ position = [-1.1, 4, -1.1], onActivate, label }) {
  const ref = useRef();
  const [hover, setHover] = useState(false);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.6;
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        {/* soft halo */}
        <mesh scale={hover ? 1.9 : 1.7}>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshBasicMaterial color={PALETTE.gold} transparent opacity={hover ? 0.22 : 0.14} />
        </mesh>
        {/* the crystal */}
        <mesh
          ref={ref}
          onClick={(e) => { e.stopPropagation(); onActivate?.(); }}
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { setHover(false); document.body.style.cursor = "auto"; }}
          scale={hover ? 1.12 : 1}
          castShadow
        >
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={PALETTE.goldSoft}
            emissive={PALETTE.gold}
            emissiveIntensity={hover ? 1.4 : 0.9}
            roughness={0.3}
            metalness={0.1}
            flatShading
          />
        </mesh>
        {/* a point light so the crystal actually lights the tower */}
        <pointLight color={PALETTE.gold} intensity={hover ? 5 : 3} distance={6} />
      </Float>
    </group>
  );
}
