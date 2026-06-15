import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PALETTE } from "./theme";

// A tiny robed wanderer (sphere head + cone body), gently bobbing.
export default function Player({ position = [0.6, 0.9, 1.6] }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.06;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });
  return (
    <group ref={ref} position={position}>
      {/* robe */}
      <mesh castShadow position={[0, 0.28, 0]}>
        <coneGeometry args={[0.26, 0.6, 8]} />
        <meshStandardMaterial color={PALETTE.cream} roughness={1} flatShading />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, 0.66, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={PALETTE.terracotta} roughness={1} flatShading />
      </mesh>
      {/* little hat */}
      <mesh castShadow position={[0, 0.82, 0]}>
        <coneGeometry args={[0.18, 0.22, 8]} />
        <meshStandardMaterial color={PALETTE.plum} roughness={1} flatShading />
      </mesh>
    </group>
  );
}
