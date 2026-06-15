import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import Island from "./Island";
import Objective from "./Objective";
import Player from "./Player";
import { PALETTE } from "./theme";

// Aim the isometric camera at the island and keep it framed on resize.
function Rig() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.set(10, 9, 10);
    camera.zoom = size.width < 700 ? 52 : 84;
    camera.lookAt(0, 0.8, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

// Subtle "breathing" rotation — MV stays composed, so this only sways gently
// rather than spinning, to keep the impossible-architecture reading stable.
function Breathing({ children }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.rotation.y = Math.sin(t * 0.18) * 0.12;
      ref.current.position.y = Math.sin(t * 0.5) * 0.04;
    }
  });
  return <group ref={ref}>{children}</group>;
}

// A faraway, locked island floating in the dusk — hints at the journey ahead.
function DistantIsland({ position, color }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.15;
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <boxGeometry args={[1.6, 0.6, 1.6]} />
        <meshStandardMaterial color={color} roughness={1} flatShading transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color={color} roughness={1} flatShading transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

export default function World({ tier, lessonTitle, onChallenge }) {
  return (
    <div className="world-canvas">
      <Canvas
        shadows
        orthographic
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [10, 9, 10], zoom: 84, near: -100, far: 100 }}
      >
        <Rig />

        {/* dusk lighting */}
        <hemisphereLight args={[PALETTE.skyTop, PALETTE.deepPlum, 1.1]} />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[6, 12, 4]}
          intensity={2.1}
          color={PALETTE.cream}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0004}
        />
        {/* warm rim from the opposite side */}
        <directionalLight position={[-6, 4, -6]} intensity={0.6} color={PALETTE.terracotta} />

        <Breathing>
          <Island tier={tier} />
          <Objective onActivate={onChallenge} label={lessonTitle} />
          <Player />
          <ContactShadows position={[0, -1.0, 0]} opacity={0.45} scale={14} blur={2.6} far={6} color={PALETTE.deepPlum} />
        </Breathing>

        {/* distant locked islands */}
        <DistantIsland position={[-7, 3.5, -3]} color={PALETTE.plum} />
        <DistantIsland position={[7.5, 2.5, -4]} color={PALETTE.terracotta} />
        <DistantIsland position={[2, 5, -8]} color={PALETTE.teal} />
      </Canvas>
    </div>
  );
}
