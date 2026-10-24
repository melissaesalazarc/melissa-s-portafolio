import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, N8AO, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import Esquina from "./Esquina";

/* Todo lo que depende de Three.js vive en este chunk, que se carga después del texto.
   El lienzo es el fondo fijo de toda la página: la esquina en el hero y la noche después. */
export default function Scene({
  reduced,
  active,
  onReady,
}: {
  reduced: boolean;
  active: boolean;
  onReady: () => void;
}) {
  const narrow = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      orthographic
      shadows={{ type: THREE.VSMShadowMap }}
      dpr={[1, narrow ? 1.5 : 2]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [24, 22, 24], zoom: 60, near: 0.1, far: 220 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onCreated={onReady}
    >
      <Esquina reduced={reduced} />
      <EffectComposer multisampling={0}>
        <N8AO aoRadius={0.9} distanceFalloff={0.8} intensity={narrow ? 1.8 : 2.2} halfRes quality="medium" />
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.25} intensity={0.9} radius={0.75} />
        <Vignette offset={0.3} darkness={0.55} />
        <Noise opacity={0.04} premultiply />
      </EffectComposer>
    </Canvas>
  );
}
