import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";

const CHROMATIC_OFFSET = new THREE.Vector2(0.00045, 0.00045);

function EnergyRing({
  radius,
  tube,
  color,
  rotation,
  speed,
  opacity = 1,
  compact,
}) {
  const ring = useRef();
  const segments = compact ? 96 : 144;

  useFrame((_, delta) => {
    if (!ring.current) return;
    ring.current.rotation.y += delta * speed;
    ring.current.rotation.z += delta * speed * 0.48;
  });

  return (
    <mesh ref={ring} rotation={rotation}>
      <torusGeometry args={[radius, tube, compact ? 12 : 16, segments]} />
      <meshStandardMaterial
        color={color}
        metalness={0.86}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.9}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

function EnergyCore({ compact }) {
  const core = useRef();
  const wire = useRef();
  const innerGlow = useRef();

  useFrame((state, delta) => {
    if (core.current) {
      core.current.rotation.y += delta * 0.24;
      core.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.45) * 0.14;
    }

    if (wire.current) {
      wire.current.rotation.y -= delta * 0.2;
      wire.current.rotation.z += delta * 0.13;
    }

    if (innerGlow.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
      innerGlow.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <mesh ref={innerGlow}>
        <sphereGeometry args={[0.63, compact ? 24 : 32, compact ? 24 : 32]} />
        <meshBasicMaterial color="#174cb1" transparent opacity={0.16} />
      </mesh>

      <mesh ref={core}>
        <icosahedronGeometry args={[0.73, compact ? 3 : 4]} />
        <meshPhysicalMaterial
          color="#193d80"
          metalness={0.88}
          roughness={0.13}
          clearcoat={1}
          clearcoatRoughness={0.06}
          emissive="#123b9a"
          emissiveIntensity={1.2}
        />
      </mesh>

      <mesh ref={wire}>
        <icosahedronGeometry args={[0.82, compact ? 1 : 2]} />
        <meshBasicMaterial
          color="#b5d2ff"
          wireframe
          transparent
          opacity={0.38}
        />
      </mesh>

      <mesh position={[0, 0, 0.76]}>
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial
          color="#fff0d4"
          emissive="#ffac5b"
          emissiveIntensity={3}
          metalness={0.65}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

function EnergyParticles({ compact }) {
  // The mobile scene keeps the same three-color particle layers with
  // fewer points to reduce GPU work and per-frame updates.
  return (
    <>
      <Sparkles
        count={compact ? 42 : 130}
        scale={5.2}
        size={compact ? 2 : 2.4}
        speed={compact ? 0.35 : 0.5}
        opacity={0.9}
        color="#a8caff"
      />
      <Sparkles
        count={compact ? 18 : 52}
        scale={3.8}
        size={compact ? 3 : 3.6}
        speed={compact ? 0.5 : 0.75}
        opacity={0.85}
        color="#ffc18a"
      />
      <Sparkles
        count={compact ? 12 : 32}
        scale={2.7}
        size={1.8}
        speed={compact ? 0.7 : 1}
        opacity={0.7}
        color="#987cff"
      />
    </>
  );
}

function PortalScene() {
  const portal = useRef();
  const compact = useThree((state) => state.size.width < 600);

  useFrame((state, delta) => {
    if (!portal.current) return;

    const targetX = state.pointer.y * 0.2;
    const targetY = state.pointer.x * 0.3;

    portal.current.rotation.x = THREE.MathUtils.damp(
      portal.current.rotation.x,
      targetX,
      3,
      delta
    );

    portal.current.rotation.y = THREE.MathUtils.damp(
      portal.current.rotation.y,
      targetY,
      3,
      delta
    );

    portal.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.75) * 0.09;
  });

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[4, 5, 5]}
        intensity={2.8}
        color="#c8ddff"
      />
      <pointLight position={[-3, 2, 2]} intensity={compact ? 23 : 35} color="#327bff" />
      <pointLight position={[3, -2, 1]} intensity={compact ? 18 : 26} color="#ff9651" />
      <pointLight position={[0, 0, -3]} intensity={compact ? 12 : 18} color="#714bff" />

      <group ref={portal}>
        <EnergyCore compact={compact} />

        <EnergyRing
          radius={1.12}
          tube={0.028}
          color="#ffbd7b"
          rotation={[1.1, 0.2, 0.3]}
          speed={0.22}
          compact={compact}
        />
        <EnergyRing
          radius={1.38}
          tube={0.018}
          color="#659dff"
          rotation={[0.3, 1.2, 0.7]}
          speed={-0.17}
          opacity={0.95}
          compact={compact}
        />
        <EnergyRing
          radius={1.63}
          tube={0.014}
          color="#b4caff"
          rotation={[1.7, 0.4, 1.1]}
          speed={0.12}
          opacity={0.7}
          compact={compact}
        />
        <EnergyRing
          radius={1.82}
          tube={0.01}
          color="#b28aff"
          rotation={[0.7, 0.8, 1.7]}
          speed={-0.1}
          opacity={0.65}
          compact={compact}
        />

        <Float
          speed={compact ? 1.5 : 2}
          rotationIntensity={0.8}
          floatIntensity={0.55}
        >
          <mesh position={[1.85, 0.9, 0.3]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color="#ffd19b"
              emissive="#ff9e50"
              emissiveIntensity={2.5}
            />
          </mesh>
        </Float>

        <Float
          speed={compact ? 1.2 : 1.6}
          rotationIntensity={0.7}
          floatIntensity={0.5}
        >
          <mesh position={[-1.85, -0.85, 0.4]}>
            <icosahedronGeometry args={[0.11, compact ? 0 : 1]} />
            <meshStandardMaterial
              color="#9dc3ff"
              emissive="#477eff"
              emissiveIntensity={2}
            />
          </mesh>
        </Float>

        <EnergyParticles compact={compact} />
      </group>

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={compact ? 0.85 : 1.15}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.35}
          mipmapBlur={!compact}
        />
        {/*
          Chromatic aberration is retained on desktop. On narrow screens,
          Bloom and Vignette preserve the cinematic glow with less GPU work.
        */}
        {!compact && (
          <ChromaticAberration
            offset={CHROMATIC_OFFSET}
            radialModulation={false}
            modulationOffset={0.15}
          />
        )}
        <Vignette
          eskil={false}
          offset={0.22}
          darkness={0.72}
        />
      </EffectComposer>
    </>
  );
}

export default function NexusPortalScene() {
  const [smallScreen, mediumScreen] = useMemo(() => {
    if (typeof window === "undefined") return [false, false];
    const width = window.innerWidth;
    return [width < 600, width >= 600 && width < 1024];
  }, []);

  const pixelRatio = smallScreen ? 0.8 : mediumScreen ? 1 : 1.25;

  return (
    <Canvas
      camera={{ position: [0, 0, 5.8], fov: 43 }}
      dpr={pixelRatio}
      gl={{
        antialias: !smallScreen,
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#080b13", 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      <PortalScene />
    </Canvas>
  );
}
