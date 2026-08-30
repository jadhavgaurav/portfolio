"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LIGHT } from "./palette";
import { WORLD, entities } from "./telemetry";
import type { Phase } from "./sequence";

/**
 * Sky.
 *
 * A gradient dome, lighter toward the horizon and toward the key light, so
 * structures read as silhouettes against air rather than against a void. The
 * horizon value is tied to the same aerial colour the fog uses, which is what
 * makes distant geometry dissolve into the sky instead of ending at it.
 *
 * It was not drawing. Measured: raising both its colours to near-white moved
 * the top third of every captured frame by zero, so the sky the traverse was
 * actually running against was the clear colour. It now rides the camera the
 * way a skybox is supposed to, at BackSide with depth testing off and culling
 * disabled, rather than sitting at the world origin as an inside-out sphere
 * the traverse eventually leaves behind.
 */
export function Sky({ phase }: { phase: Phase }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uHorizon: { value: new THREE.Color("#7c8992") },
      uZenith: { value: new THREE.Color("#333e46") },
      uKeyDir: { value: new THREE.Vector3(...LIGHT.keyPos).normalize() },
      uOpacity: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (mesh.current) mesh.current.position.copy(state.camera.position);
    if (!mat.current) return;
    const want = phase === "VOID" ? 0 : phase === "SIGNAL" ? 0.25 : 1;
    const u = mat.current.uniforms.uOpacity;
    u.value += (want - u.value) * 0.02;
  });

  return (
    <mesh ref={mesh} renderOrder={-1000} frustumCulled={false}>
      <sphereGeometry args={[600, 32, 20]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
        fog={false}
        toneMapped={false}
        vertexShader={`
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uHorizon;
          uniform vec3 uZenith;
          uniform vec3 uKeyDir;
          uniform float uOpacity;
          varying vec3 vDir;
          void main() {
            vec3 d = normalize(vDir);
            // Air thickens toward the horizon.
            float h = pow(1.0 - clamp(abs(d.y), 0.0, 1.0), 2.2);
            vec3 col = mix(uZenith, uHorizon, h);
            // A broad lift where the key light comes from. No sun disc:
            // this is scattering, not a lens effect.
            float toKey = max(dot(d, normalize(uKeyDir)), 0.0);
            col += vec3(0.055, 0.05, 0.042) * pow(toKey, 3.0);
            gl_FragColor = vec4(col * uOpacity, 1.0);
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}

/**
 * Particulate.
 *
 * Air, and a scale reference. Density follows the structures rather than
 * filling the volume evenly, so the dust reads as coming off the world
 * instead of as a decorative particle background.
 */
export function Dust({ quality }: { quality: "high" | "low" }) {
  const ref = useRef<THREE.Points>(null);
  const count = quality === "high" ? 1400 : 500;

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Seed each mote near a real structure.
      const e = entities[i % entities.length];
      const a = (i * 2.3999632) % (Math.PI * 2); // golden angle, deterministic
      const r = 6 + ((i * 7919) % 100) / 100 * 34;
      pos[i * 3] = e.x + Math.cos(a) * r;
      pos[i * 3 + 1] = 0.6 + ((i * 104729) % 100) / 100 * 26;
      pos[i * 3 + 2] = e.z + Math.sin(a) * r - ((i * 1299709) % 60);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      // Barely moving. Motion here is for air, not for spectacle.
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.06) * 0.7;
    }
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled>
      <pointsMaterial
        size={0.16}
        sizeAttenuation
        color={LIGHT.fill}
        transparent
        opacity={0.28}
        depthWrite={false}
      />
    </points>
  );
}

/** Ground haze: a soft band that hides where the ground plane ends. */
export function GroundHaze() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, -WORLD.depth / 2]}>
      <planeGeometry args={[900, WORLD.depth + 700]} />
      <meshBasicMaterial
        color={LIGHT.aerial}
        transparent
        opacity={0.22}
        depthWrite={false}
      />
    </mesh>
  );
}
