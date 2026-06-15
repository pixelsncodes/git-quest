import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { PALETTE } from "./theme";

// A stylized, flat-shaded block. RoundedBox gives the soft MV silhouette.
function Block({ position, size = [1, 1, 1], color, radius = 0.08 }) {
  return (
    <RoundedBox
      position={position}
      args={size}
      radius={radius}
      smoothness={3}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} flatShading />
    </RoundedBox>
  );
}

// A short flight of steps climbing in +x, evoking MV's impossible staircases.
function Steps({ origin = [0, 0, 0], count = 4, color }) {
  const steps = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        position: [origin[0] + i * 0.75, origin[1] + i * 0.4 + 0.2, origin[2]],
        size: [0.75, 0.4, 1.2],
      })),
    [origin, count]
  );
  return steps.map((s, i) => <Block key={i} {...s} color={color} radius={0.05} />);
}

// The island that represents the current lesson. It reads slightly different per
// tier so fundamentals and advanced islands feel distinct.
export default function Island({ tier = "fundamentals" }) {
  const base = tier === "advanced" ? PALETTE.plum : PALETTE.sand;
  const baseWarm = tier === "advanced" ? PALETTE.deepPlum : PALETTE.sandWarm;
  const accent = tier === "advanced" ? PALETTE.teal : PALETTE.terracotta;

  return (
    <group>
      {/* plinth */}
      <Block position={[0, -0.5, 0]} size={[5.4, 1, 5.4]} color={baseWarm} radius={0.14} />
      <Block position={[0, 0.15, 0]} size={[4.6, 0.6, 4.6]} color={base} radius={0.12} />

      {/* a raised plateau with a central tower */}
      <Block position={[-1.1, 0.7, -1.1]} size={[2.2, 0.6, 2.2]} color={baseWarm} radius={0.1} />
      <Block position={[-1.1, 1.4, -1.1]} size={[1.1, 1.6, 1.1]} color={accent} radius={0.1} />
      {/* tower cap */}
      <Block position={[-1.1, 2.45, -1.1]} size={[1.4, 0.4, 1.4]} color={base} radius={0.12} />

      {/* impossible staircase climbing toward the objective */}
      <Steps origin={[0.6, 0.45, 1.2]} count={4} color={baseWarm} />

      {/* a small arch — two pillars + lintel */}
      <Block position={[1.7, 0.9, -1.3]} size={[0.4, 1.6, 0.4]} color={accent} radius={0.06} />
      <Block position={[2.6, 0.9, -1.3]} size={[0.4, 1.6, 0.4]} color={accent} radius={0.06} />
      <Block position={[2.15, 1.8, -1.3]} size={[1.3, 0.4, 0.4]} color={base} radius={0.08} />

      {/* decorative cones (stylized cypress) */}
      <mesh position={[1.6, 0.9, 1.7]} castShadow>
        <coneGeometry args={[0.35, 1.1, 6]} />
        <meshStandardMaterial color={PALETTE.teal} roughness={1} flatShading />
      </mesh>
      <mesh position={[-1.9, 0.9, 1.4]} castShadow>
        <coneGeometry args={[0.28, 0.9, 6]} />
        <meshStandardMaterial color={PALETTE.teal} roughness={1} flatShading />
      </mesh>
    </group>
  );
}
