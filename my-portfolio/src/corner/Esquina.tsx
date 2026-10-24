import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { makeNeonTexture, makeSignTexture, makeStopTexture } from "./signTexture";
import { getLight, goTo, street, type Light } from "../lib/street";
import { useLang, COPY } from "../lib/i18n";

/* Diorama de plastilina: una esquina de Monterrey de noche, vista en isométrico.
   Todo es geometría con cantos muy redondeados y material mate; el brillo
   (semáforo, neón, arbotante) es emisivo y lo levanta el bloom. */

const POLE_R = 0.08;
const SIGN_BLUE = "#1d4e9e";

const clay = (color: string, roughness = 0.88) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });

/* Materiales compartidos: una instancia por color. Tonos cercanos entre sí para que todo se funda. */
const M = {
  asphalt: clay("#252a38"),
  sidewalk: clay("#454b5e"),
  curb: clay("#d9ad2c", 0.8),
  curbDark: clay("#2c3140"),
  stripe: clay("#d9d6cf", 0.85),
  pole: clay("#8f97a6", 0.65),
  housing: clay("#1f2622", 0.8),
  plateYellow: clay("#dcb526", 0.8),
  signBlue: clay(SIGN_BLUE, 0.78),
  stopRed: clay("#c21a33", 0.8),
  wall: clay("#3b3550"),
  roof: clay("#2b2638"),
  frame: clay("#1d1a24", 0.85),
  window: new THREE.MeshStandardMaterial({
    color: "#2a2216",
    emissive: "#ffb35c",
    emissiveIntensity: 1.5,
    roughness: 0.9,
  }),
  windowDim: new THREE.MeshStandardMaterial({
    color: "#1a1a24",
    emissive: "#5a6ea8",
    emissiveIntensity: 0.35,
    roughness: 0.9,
  }),
};

function useFontsReady() {
  const [ready, setReady] = useState(() => document.fonts.status === "loaded");
  useEffect(() => {
    if (ready) return;
    let alive = true;
    document.fonts.ready.then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [ready]);
  return ready;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ---------- Letreros ---------- */

type SignProps = {
  id: string;
  title: string;
  subtitle?: string;
  arrow?: "left" | "right";
  width: number;
  height: number;
  y: number;
  /** Giro alrededor del poste. 0 = la placa sale hacia +x y su cara mira a +z. */
  angle: number;
  route?: string;
  reduced: boolean;
  fontsReady: boolean;
};

const Sign = memo(function Sign({
  id,
  title,
  subtitle,
  arrow,
  width,
  height,
  y,
  angle,
  route,
  reduced,
  fontsReady,
}: SignProps) {
  const gl = useThree((s) => s.gl);
  const wobble = useRef<THREE.Group>(null);
  const vel = useRef(0);

  const texture = useMemo(
    () =>
      makeSignTexture(
        { width: width * 160, height: height * 160, bg: SIGN_BLUE, ink: "#ffffff", title, subtitle, arrow },
        Math.min(8, gl.capabilities.getMaxAnisotropy()),
      ),
    // fontsReady repinta con Switzer en cuanto carga.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, subtitle, arrow, width, height, fontsReady, gl],
  );
  const face = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.75,
        emissive: "#ffffff",
        emissiveMap: texture,
        emissiveIntensity: 0.16, // lámina retrorreflejante
      }),
    [texture],
  );
  useEffect(
    () => () => {
      texture.dispose();
      face.dispose();
    },
    [texture, face],
  );

  // Al pasar el puntero la placa se columpia como lámina colgada (resorte).
  useFrame((state, delta) => {
    const g = wobble.current;
    if (!g) return;
    const hovered = street.hovered === id;
    face.emissiveIntensity = THREE.MathUtils.damp(face.emissiveIntensity, hovered ? 0.55 : 0.16, 10, delta);
    if (reduced) return;
    const dt = Math.min(delta, 1 / 30);
    const target = hovered ? Math.sin(state.clock.elapsedTime * 7) * 0.05 : 0;
    const force = (target - g.rotation.x) * 90 - vel.current * 9;
    vel.current += force * dt;
    g.rotation.x += vel.current * dt;
  });

  const handlers = route
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          street.hovered = id;
          vel.current += 1.6;
          document.body.style.cursor = "pointer";
        },
        onPointerOut: () => {
          if (street.hovered === id) street.hovered = null;
          document.body.style.cursor = "";
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          goTo(route);
        },
      }
    : {};

  const reach = POLE_R + 0.06 + width / 2;
  const depth = 0.09;
  const r = 0.045;

  return (
    <group rotation-y={angle} position-y={y}>
      {/* Abrazaderas */}
      {[0.28, -0.28].map((k) => (
        <mesh key={k} material={M.pole} position-y={height * k}>
          <capsuleGeometry args={[POLE_R + 0.03, 0.02, 6, 20]} />
        </mesh>
      ))}
      <group ref={wobble} position-x={reach}>
        <RoundedBox args={[width, height, depth]} radius={r} smoothness={5} material={M.signBlue} castShadow {...handlers} />
        <mesh position-z={depth / 2 + 0.002} material={face} {...handlers}>
          <planeGeometry args={[width - r * 1.6, height - r * 1.6]} />
        </mesh>
        <mesh position-z={-depth / 2 - 0.002} rotation-y={Math.PI} material={face}>
          <planeGeometry args={[width - r * 1.6, height - r * 1.6]} />
        </mesh>
      </group>
    </group>
  );
});

function StopSign({ y, angle, word, plate, fontsReady }: { y: number; angle: number; word: string; plate: string; fontsReady: boolean }) {
  const octagon = useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + (i * Math.PI) / 4;
      const x = Math.cos(a) * 0.42;
      const yy = Math.sin(a) * 0.42;
      if (i === 0) s.moveTo(x, yy);
      else s.lineTo(x, yy);
    }
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.04,
      bevelSegments: 8,
    });
    g.translate(0, 0, -0.015);
    return g;
  }, []);

  const stopTex = useMemo(
    () => makeStopTexture(word),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [word, fontsReady],
  );
  const plateTex = useMemo(
    () => makeSignTexture({ width: 150, height: 46, bg: "#ffffff", ink: "#c21a33", title: plate, align: "center" }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plate, fontsReady],
  );
  const stopFace = useMemo(
    () => new THREE.MeshStandardMaterial({ map: stopTex, roughness: 0.75, emissive: "#ffffff", emissiveMap: stopTex, emissiveIntensity: 0.14 }),
    [stopTex],
  );
  const plateFace = useMemo(() => new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.75 }), [plateTex]);
  useEffect(
    () => () => {
      octagon.dispose();
      stopTex.dispose();
      plateTex.dispose();
      stopFace.dispose();
      plateFace.dispose();
    },
    [octagon, stopTex, plateTex, stopFace, plateFace],
  );

  useFrame((_, delta) => {
    stopFace.emissiveIntensity = THREE.MathUtils.damp(
      stopFace.emissiveIntensity,
      street.hovered === "stop" ? 0.5 : 0.14,
      10,
      delta,
    );
  });

  const handlers = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      street.hovered = "stop";
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      if (street.hovered === "stop") street.hovered = null;
      document.body.style.cursor = "";
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      goTo("contact");
    },
  };

  return (
    <group rotation-y={angle} position-y={y}>
      <mesh material={M.pole}>
        <capsuleGeometry args={[POLE_R + 0.03, 0.02, 6, 20]} />
      </mesh>
      <group position-z={POLE_R + 0.1}>
        <mesh geometry={octagon} material={M.stopRed} castShadow {...handlers} />
        <mesh position-z={0.052} material={stopFace} {...handlers}>
          <circleGeometry args={[0.43, 8, Math.PI / 8]} />
        </mesh>
        <RoundedBox args={[0.76, 0.26, 0.06]} radius={0.04} smoothness={4} position-y={-0.64} material={M.pole} castShadow {...handlers} />
        <mesh position={[0, -0.64, 0.032]} material={plateFace} {...handlers}>
          <planeGeometry args={[0.68, 0.19]} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- Semáforo ---------- */

const LIGHT_COLORS: Record<Light, THREE.Color> = {
  alto: new THREE.Color("#ff2a1f"),
  precaucion: new THREE.Color("#ff9a00"),
  siga: new THREE.Color("#00e061"),
};
const LIGHT_ORDER: Light[] = ["alto", "precaucion", "siga"];

function Semaforo({ y, angle }: { y: number; angle: number }) {
  const lamps = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const glow = useRef<THREE.PointLight>(null);
  const visor = useMemo(() => new THREE.CylinderGeometry(0.15, 0.15, 0.15, 32, 1, true, -Math.PI / 2, Math.PI), []);
  useEffect(() => () => visor.dispose(), [visor]);

  useFrame((_, delta) => {
    const active = getLight();
    LIGHT_ORDER.forEach((name, i) => {
      const m = lamps.current[i];
      if (!m) return;
      m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, name === active ? 5 : 0.08, 9, delta);
    });
    if (glow.current) {
      glow.current.color.lerp(LIGHT_COLORS[active], Math.min(1, delta * 8));
      glow.current.position.y = 0.36 - LIGHT_ORDER.indexOf(active) * 0.36;
    }
  });

  return (
    <group rotation-y={angle} position-y={y}>
      <group position-z={POLE_R + 0.24}>
        {[0.3, -0.3].map((k) => (
          <mesh key={k} material={M.pole} position={[0, k, -0.14]} rotation-x={Math.PI / 2}>
            <capsuleGeometry args={[0.035, 0.14, 6, 12]} />
          </mesh>
        ))}
        {/* Placa de contraste amarilla y caja */}
        <RoundedBox args={[0.66, 1.38, 0.06]} radius={0.08} smoothness={5} position-z={-0.05} material={M.plateYellow} castShadow />
        <RoundedBox args={[0.44, 1.18, 0.32]} radius={0.13} smoothness={6} position-z={0.1} material={M.housing} castShadow />
        {LIGHT_ORDER.map((name, i) => (
          <group key={name} position={[0, 0.36 - i * 0.36, 0.26]}>
            <mesh rotation-x={Math.PI / 2}>
              <sphereGeometry args={[0.11, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial
                ref={(m) => {
                  lamps.current[i] = m;
                }}
                color="#0c0c0c"
                emissive={LIGHT_COLORS[name]}
                emissiveIntensity={0.08}
                roughness={0.35}
                toneMapped={false}
              />
            </mesh>
            <mesh geometry={visor} material={M.housing} position={[0, 0.03, 0.06]} rotation-x={Math.PI / 2} />
          </group>
        ))}
        <pointLight ref={glow} position={[0, 0.36, 0.7]} intensity={2.2} distance={3.5} decay={2} />
      </group>
    </group>
  );
}

/* ---------- Luz suave: cono y charco de luz con degradado (sin bordes duros) ---------- */

const coneShader = {
  uniforms: { uColor: { value: new THREE.Color("#ffcf8a") }, uOpacity: { value: 0.22 } },
  vertexShader: /* glsl */ `
    varying float vH;
    varying float vFacing;
    void main() {
      vH = uv.y;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec3 n = normalize(normalMatrix * normal);
      vFacing = abs(dot(n, normalize(-mv.xyz)));
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vH;
    varying float vFacing;
    void main() {
      // Más fuerte junto a la lámpara, se disuelve hacia el piso y en los bordes.
      float a = pow(vH, 1.6) * pow(vFacing, 2.0) * uOpacity;
      gl_FragColor = vec4(uColor * a, a);
    }`,
};

const poolShader = {
  uniforms: { uColor: { value: new THREE.Color("#ffc98a") }, uOpacity: { value: 0.35 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      float d = distance(vUv, vec2(0.5)) * 2.0;
      float a = smoothstep(1.0, 0.0, d);
      a = a * a * uOpacity;
      gl_FragColor = vec4(uColor * a, a);
    }`,
};

function softMaterial(shader: typeof coneShader) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(shader.uniforms),
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

/* ---------- Arbotante con su cono de luz y las palomillas ---------- */

function Arbotante({ reduced }: { reduced: boolean }) {
  const bulb = useRef<THREE.MeshStandardMaterial>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const cone = useMemo(() => {
    const g = new THREE.ConeGeometry(1.3, 4.0, 48, 1, true);
    g.translate(0, -2.0, 0);
    return g;
  }, []);
  const coneMat = useMemo(() => softMaterial(coneShader), []);
  const poolMat = useMemo(() => softMaterial(poolShader), []);
  useEffect(
    () => () => {
      cone.dispose();
      coneMat.dispose();
      poolMat.dispose();
    },
    [cone, coneMat, poolMat],
  );

  // El foco apunta al piso, justo debajo de la lámpara.
  useEffect(() => {
    const s = spot.current;
    if (!s) return;
    s.target.position.set(0, -4, 0);
    s.add(s.target);
  }, []);

  // Parpadeo de vez en cuando, como los arbotantes de verdad.
  useFrame((state) => {
    if (!bulb.current || reduced) return;
    const t = state.clock.elapsedTime;
    const flick = Math.sin(t * 0.7) > 0.985 ? 0.3 + Math.random() * 0.5 : 1;
    bulb.current.emissiveIntensity = 6 * flick;
    coneMat.uniforms.uOpacity.value = 0.22 * flick;
    poolMat.uniforms.uOpacity.value = 0.35 * flick;
  });

  return (
    <group position={[-0.25, 0.3, -3.4]}>
      <mesh material={M.pole} position-y={2.2} castShadow>
        <cylinderGeometry args={[0.065, 0.09, 4.4, 24]} />
      </mesh>
      {/* Brazo curvo hacia la calle */}
      <mesh material={M.pole} position={[0.55, 4.3, 0]} rotation-z={-Math.PI / 2}>
        <capsuleGeometry args={[0.045, 1.0, 6, 16]} />
      </mesh>
      <group position={[1.15, 4.24, 0]}>
        <RoundedBox args={[0.66, 0.2, 0.36]} radius={0.09} smoothness={5} material={M.housing} castShadow />
        <mesh position-y={-0.1}>
          <capsuleGeometry args={[0.06, 0.34, 6, 16]} />
          <meshStandardMaterial ref={bulb} color="#3a2a12" emissive="#ffc46b" emissiveIntensity={6} toneMapped={false} />
        </mesh>
        <mesh geometry={cone} material={coneMat} position-y={-0.12} />
        <spotLight
          ref={spot}
          position={[0, -0.1, 0]}
          angle={0.66}
          penumbra={1}
          intensity={24}
          distance={9}
          decay={1.4}
          color="#ffc98a"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
          shadow-radius={10}
          shadow-blurSamples={16}
        />
      </group>
      {/* Charco de luz en la banqueta */}
      <mesh position={[1.15, 0.02, 0]} rotation-x={-Math.PI / 2} material={poolMat}>
        <planeGeometry args={[3.6, 3.6]} />
      </mesh>
      {/* Palomillas en la luz */}
      <Sparkles
        position={[1.15, 2.2, 0]}
        count={36}
        scale={[1.6, 3.4, 1.6]}
        size={2.4}
        speed={reduced ? 0 : 0.35}
        opacity={0.9}
        color="#ffd9a0"
        noise={1.2}
      />
    </group>
  );
}

/* ---------- Edificio de la esquina con su neón ---------- */

function Edificio({ neonText, reduced, fontsReady }: { neonText: string; reduced: boolean; fontsReady: boolean }) {
  const neonTex = useMemo(
    () => makeNeonTexture(neonText),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [neonText, fontsReady],
  );
  const neonMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: neonTex,
        transparent: true,
        color: new THREE.Color("#ff2d95").multiplyScalar(4),
        toneMapped: false,
        depthWrite: false,
      }),
    [neonTex],
  );
  useEffect(
    () => () => {
      neonTex.dispose();
      neonMat.dispose();
    },
    [neonTex, neonMat],
  );

  // El neón «prende» con chisporroteo al entrar y luego zumba quieto.
  const start = useRef<number | null>(null);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    if (start.current === null) start.current = t;
    const since = t - start.current;
    let on = 1;
    if (since < 1.6) on = Math.random() > 0.45 ? 1 : 0.08;
    else if (Math.sin(t * 1.3) > 0.995) on = 0.3;
    neonMat.opacity = on;
  });

  const W = 2.9;
  const H = 3.4;

  return (
    <group position={[-2.7, 0.3, -2.7]}>
      <RoundedBox args={[W, H, W]} radius={0.24} smoothness={6} position-y={H / 2} material={M.wall} castShadow receiveShadow />
      <RoundedBox args={[W + 0.16, 0.24, W + 0.16]} radius={0.11} smoothness={5} position-y={H + 0.04} material={M.roof} castShadow />
      {/* Toldo de la tienda */}
      <RoundedBox args={[W - 0.4, 0.14, 0.56]} radius={0.065} smoothness={5} position={[0, 1.55, W / 2 + 0.24]} material={M.stopRed} castShadow />
      {/* Escaparate encendido (cara +z) */}
      <RoundedBox args={[W - 0.66, 1.18, 0.06]} radius={0.05} smoothness={4} position={[0, 0.8, W / 2 + 0.01]} material={M.window} />
      <RoundedBox args={[0.06, 1.18, 0.08]} radius={0.025} smoothness={3} position={[0, 0.8, W / 2 + 0.03]} material={M.frame} />
      {/* Neón sobre el toldo */}
      <mesh position={[0, 2.18, W / 2 + 0.03]} material={neonMat}>
        <planeGeometry args={[1.9, 0.6]} />
      </mesh>
      {/* Ventanas del piso de arriba */}
      {[-0.7, 0.7].map((z, i) => (
        <RoundedBox
          key={z}
          args={[0.06, 0.8, 0.7]}
          radius={0.025}
          smoothness={3}
          position={[W / 2 + 0.005, 2.55, z]}
          material={i === 0 ? M.window : M.windowDim}
        />
      ))}
      {[-0.7, 0.7].map((x) => (
        <RoundedBox key={x} args={[0.6, 0.5, 0.06]} radius={0.025} smoothness={3} position={[x, 2.95, W / 2 + 0.005]} material={M.windowDim} />
      ))}
    </group>
  );
}

/* ---------- Banqueta, calle y cebras ---------- */

function Calle() {
  return (
    <group>
      <RoundedBox args={[9.4, 0.7, 9.4]} radius={0.34} smoothness={6} position-y={-0.35} material={M.asphalt} receiveShadow />
      {/* Banqueta en el cuadrante del fondo */}
      <RoundedBox args={[5.2, 0.34, 5.2]} radius={0.14} smoothness={5} position={[-2.1, 0.12, -2.1]} material={M.sidewalk} receiveShadow castShadow />
      {/* Guarnición pintada de amarillo en la esquina (no estacionarse) */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i}>
          <RoundedBox args={[0.14, 0.32, 0.6]} radius={0.06} smoothness={4} position={[0.5, 0.15, 0.2 - i * 1.2]} material={i % 2 ? M.curbDark : M.curb} />
          <RoundedBox args={[0.6, 0.32, 0.14]} radius={0.06} smoothness={4} position={[0.2 - i * 1.2, 0.15, 0.5]} material={i % 2 ? M.curbDark : M.curb} />
        </group>
      ))}
      {/* Cebras */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i}>
          <RoundedBox args={[1.4, 0.05, 0.3]} radius={0.024} smoothness={4} position={[1.75, 0.012, -0.9 - i * 0.55]} material={M.stripe} receiveShadow />
          <RoundedBox args={[0.3, 0.05, 1.4]} radius={0.024} smoothness={4} position={[-0.9 - i * 0.55, 0.012, 1.75]} material={M.stripe} receiveShadow />
        </group>
      ))}
    </group>
  );
}

/* ---------- Cerro de la Silla: relieve esculpido, suave, como maqueta de plastilina ---------- */

// Perfil de la cresta vista desde Monterrey: Pico Norte a la izquierda, la silla al centro
// y los picos del sur (el más alto) a la derecha, sobre una falda larga.
function ridge(x: number) {
  const g = (c: number, h: number, w: number) => h * Math.exp(-((x - c) * (x - c)) / (2 * w * w));
  return g(0, 2.2, 5.4) + g(-4.3, 4.6, 1.5) + g(-2.4, 1.2, 1.1) + g(1.5, 5.4, 1.15) + g(2.9, 3.8, 0.85) + g(5.6, 1.1, 1.6);
}

function useCerroGeometry() {
  return useMemo(() => {
    const W = 26;
    const D = 11;
    const g = new THREE.PlaneGeometry(W, D, 220, 96);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    // RGBA: la falda plana se vuelve transparente para que no se vea el corte contra la noche.
    const colors = new Float32Array(pos.count * 4);
    const low = new THREE.Color("#161d2e");
    const mid = new THREE.Color("#2f3b60");
    const high = new THREE.Color("#55669c");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = ridge(x);
      // Ancho de la ladera: más amplia donde la montaña es más alta.
      const w = 1.4 + r * 0.32;
      let h = r * Math.exp(-(z * z) / (2 * w * w));
      // Barrancas suaves que bajan por las laderas.
      h *= 1 - 0.07 * Math.pow(Math.sin(x * 2.1 + Math.abs(z) * 1.3), 2) * smooth(0.3, 2.5, Math.abs(z));
      // Bordes que se pierden en la noche.
      h *= smooth(W / 2, W / 2 - 3, Math.abs(x));
      pos.setY(i, h * 1.25);
      const t = Math.min(1, h / 5.5);
      c.copy(low).lerp(mid, smooth(0, 0.4, t)).lerp(high, smooth(0.45, 1, t));
      colors.set([c.r, c.g, c.b, smooth(0.04, 1.1, h)], i * 4);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 4));
    g.computeVertexNormals();
    return g;
  }, []);
}

const CERRO_ROT = new THREE.Euler(0.42, Math.PI / 4, 0, "YXZ");

function Cerro({ cerroRef }: { cerroRef: React.RefObject<THREE.Group | null> }) {
  const geometry = useCerroGeometry();
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, roughness: 0.95, metalness: 0 }), []);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  // Luces de la ciudad al pie del cerro.
  const lights = useRef<THREE.InstancedMesh>(null);
  const COUNT = 320;
  useEffect(() => {
    const mesh = lights.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const warm = new THREE.Color("#ffb768");
    const cool = new THREE.Color("#d8e4ff");
    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 24;
      const z = 3.4 + Math.random() * 2.2;
      const s = 0.035 + Math.random() * 0.04;
      m.makeScale(s, s, s);
      m.setPosition(x, 0.08, z);
      mesh.setMatrixAt(i, m);
      c.copy(Math.random() > 0.3 ? warm : cool).multiplyScalar(0.8 + Math.random() * 1.1);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  // La cámara lo coloca en cada cuadro detrás del diorama (ver Rig); queda alineado a la vista.
  return (
    // Inclinado hacia la cámara (YXZ: primero gira, luego se ladea) para que se lea la silueta.
    <group ref={cerroRef} rotation={CERRO_ROT}>
      <mesh geometry={geometry} material={material} receiveShadow />
      <instancedMesh ref={lights} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} transparent />
      </instancedMesh>
    </group>
  );
}

/* ---------- Cielo: estrellas y luces desenfocadas que acompañan toda la página ---------- */

const skyShader = {
  vertexShader: /* glsl */ `
    attribute float aSize;
    attribute float aSeed;
    attribute vec3 aColor;
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uScroll;
    uniform float uCalm;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vSoft;
    void main() {
      vec3 p = position;
      // Las grandes (bokeh) suben más rápido con el scroll: paralaje.
      float depth = smoothstep(4.0, 60.0, aSize);
      // Coordenadas normalizadas a la pantalla (−0.6 … 0.6); el grupo las escala a pixeles.
      p.y += uScroll * (0.15 + depth * 0.5);
      p.y = mod(p.y + 0.6, 1.2) - 0.6;
      p.x += sin(uTime * 0.05 + aSeed * 6.28) * 0.01 * depth;
      vColor = aColor;
      float tw = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed) + aSeed * 40.0);
      vAlpha = mix(tw, 0.09, depth);
      // Después de la esquina la noche se calma: sin luces desenfocadas, estrellas tenues.
      vAlpha *= mix(1.0, mix(0.5, 0.0, depth), uCalm);
      vSoft = depth;
      gl_PointSize = aSize * uPixelRatio;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vColor;
    varying float vAlpha;
    varying float vSoft;
    void main() {
      float d = length(gl_PointCoord - 0.5) * 2.0;
      float a = mix(smoothstep(1.0, 0.0, d * d), smoothstep(1.0, 0.55, d), vSoft) * vAlpha;
      gl_FragColor = vec4(vColor * a, a);
    }`,
};

function Sky({ skyRef, reduced }: { skyRef: React.RefObject<THREE.Group | null>; reduced: boolean }) {
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const { geometry, material } = useMemo(() => {
    const STARS = 260;
    const BOKEH = 16;
    const n = STARS + BOKEH;
    const pos = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    const seeds = new Float32Array(n);
    const colors = new Float32Array(n * 3);
    const palette = ["#ffbf73", "#ffbf73", "#ff2d95", "#5c86ff"].map((h) => new THREE.Color(h));
    for (let i = 0; i < n; i++) {
      const bokeh = i >= STARS;
      pos[i * 3] = (Math.random() - 0.5) * 1.3;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 2] = 0;
      sizes[i] = bokeh ? 18 + Math.random() * 46 : 1 + Math.random() * 2.2;
      seeds[i] = Math.random();
      const c = bokeh ? palette[Math.floor(Math.random() * palette.length)] : new THREE.Color("#dfe6ff");
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uScroll: { value: 0 },
        uCalm: { value: 0 },
      },
      vertexShader: skyShader.vertexShader,
      fragmentShader: skyShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material };
  }, []);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime.value = reduced ? 0 : state.clock.elapsedTime;
    // En teléfono las luces desenfocadas son más chicas: la pantalla también lo es.
    u.uPixelRatio.value = dpr * Math.min(1, Math.max(0.55, size.width / 1200));
    u.uScroll.value = street.heroProgress * 0.3 + street.pageProgress * 1.6;
    u.uCalm.value = smooth(0.85, 1, street.heroProgress) * 0.4 + smooth(0, 0.08, street.pageProgress) * 0.6;
  });

  // Las posiciones van de −0.5 a 0.5: la escala las lleva a pixeles de pantalla (Rig fija el tamaño).
  return (
    <group ref={skyRef}>
      <points geometry={geometry} material={material} scale={[size.width, size.height, 1]} frustumCulled={false} />
    </group>
  );
}

/* ---------- Cámara isométrica guiada por el scroll ---------- */

function Rig({
  reduced,
  diorama,
  cerro,
  sky,
}: {
  reduced: boolean;
  diorama: React.RefObject<THREE.Group | null>;
  cerro: React.RefObject<THREE.Group | null>;
  sky: React.RefObject<THREE.Group | null>;
}) {
  const camera = useThree((s) => s.camera) as THREE.OrthographicCamera;
  const size = useThree((s) => s.size);
  const narrow = size.width < 768;
  const tmp = useMemo(
    () => ({
      target: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      dir: new THREE.Vector3(1, 0.82, 1).normalize(),
      sky: 0,
    }),
    [],
  );

  useFrame((state, delta) => {
    const g = diorama.current;
    if (!g) return;
    const p = street.heroProgress;
    const lambda = reduced ? 1000 : 4.5;
    const ease = p * p * (3 - 2 * p);

    // Después del hero la cámara sube al cielo: el diorama se queda abajo y la noche sigue.
    const skyTarget = smooth(0, 0.1, street.pageProgress);
    tmp.sky = THREE.MathUtils.damp(tmp.sky, skyTarget, lambda, delta);
    const s = tmp.sky;

    // El diorama gira para mostrar cada placa mientras bajas.
    const idle = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.25) * 0.03;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -0.15 - ease * 1.75 + idle + street.pointerX * 0.06, lambda, delta);

    // Encuadre: la esquina completa al inicio; de cerca a las placas al final.
    const base = narrow ? Math.min(size.width / 9.5, size.height / 15) : Math.min(size.width / 17, size.height / 10.5);
    const zoom = base * (1 + ease * 0.9) * (1 - s * 0.35);
    camera.zoom = THREE.MathUtils.damp(camera.zoom, zoom, lambda, delta);
    const unit = 1 / camera.zoom; // unidades de mundo por pixel

    const focusY = (narrow ? 2.4 - ease * 0.6 : 2.6 - ease * 0.9) + s * size.height * 1.1 * unit;
    camera.position.copy(tmp.dir).multiplyScalar(30);
    camera.position.y += focusY;
    tmp.target.set(0, focusY, 0);
    camera.lookAt(tmp.target);
    camera.updateMatrixWorld();

    // En escritorio el diorama vive en la mitad derecha; al acercarse se centra.
    tmp.right.setFromMatrixColumn(camera.matrixWorld, 0);
    const shiftPx = narrow ? 0 : size.width * (0.2 - ease * 0.12) * (1 - s);
    const lift = narrow ? -(size.height * 0.16) * unit : 0;
    camera.position.addScaledVector(tmp.right, -shiftPx * unit);
    tmp.target.addScaledVector(tmp.right, -shiftPx * unit);
    camera.position.y += lift;
    tmp.target.y += lift;
    camera.lookAt(tmp.target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    tmp.up.setFromMatrixColumn(camera.matrixWorld, 1);

    // El Cerro de la Silla vive en el mundo, detrás de la esquina: se acomoda una vez con el
    // encuadre inicial y después se mueve y escala junto con el diorama (no se queda pegado a la pantalla).
    const c = cerro.current;
    if (c) {
      const unit0 = 1 / base;
      const shift0 = narrow ? 0 : size.width * 0.2;
      const focus0 = (narrow ? 2.4 : 2.6) + (narrow ? -(size.height * 0.16) * unit0 : 0);
      const sidePx = narrow ? 0 : shift0 - size.width * 0.14;
      const upPx = size.height * (narrow ? 0.06 : 0.03);
      c.scale.setScalar((size.width * (narrow ? 1.2 : 0.5) * unit0) / 26);
      c.position
        .set(0, focus0, 0)
        .addScaledVector(tmp.right, (sidePx - shift0) * unit0)
        .addScaledVector(tmp.dir, -34)
        .addScaledVector(tmp.up, upPx * unit0);
    }

    // El cielo va pegado a la cámara, detrás de todo, en pixeles de pantalla.
    const k = sky.current;
    if (k) {
      k.quaternion.copy(camera.quaternion);
      k.scale.setScalar(unit);
      k.position.copy(tmp.target).addScaledVector(tmp.dir, -70);
    }
  });

  return null;
}

export default function Esquina({ reduced }: { reduced: boolean }) {
  const fontsReady = useFontsReady();
  const lang = useLang();
  const t = COPY[lang].signs;
  const diorama = useRef<THREE.Group>(null);
  const cerro = useRef<THREE.Group>(null);
  const sky = useRef<THREE.Group>(null);

  return (
    <>
      <color attach="background" args={["#0d0f12"]} />
      {/* La niebla funde el cerro con la noche */}
      <fog attach="fog" args={["#0d0f12", 70, 120]} />

      <hemisphereLight args={["#7486c9", "#1d1612", 0.6]} />
      {/* Luna: luz fría y suave que dibuja el volumen de la plastilina */}
      <directionalLight
        position={[-6, 10, 4]}
        intensity={0.85}
        color="#aebfff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0005}
        shadow-radius={14}
        shadow-blurSamples={20}
      />
      {/* Contraluz rosado del neón de la ciudad: une los colores del diorama */}
      <directionalLight position={[6, 3, -8]} intensity={0.35} color="#ff6fae" />

      <Sky skyRef={sky} reduced={reduced} />
      <Cerro cerroRef={cerro} />

      <group ref={diorama}>
        <Calle />
        <Edificio neonText={t.neon} reduced={reduced} fontsReady={fontsReady} />
        <Arbotante reduced={reduced} />

        {/* El poste de la esquina */}
        <group position={[0.15, 0.3, 0.15]}>
          <mesh material={M.pole} position-y={2.85} castShadow>
            <cylinderGeometry args={[POLE_R, POLE_R * 1.2, 5.7, 28]} />
          </mesh>
          <mesh material={M.pole} position-y={5.72}>
            <sphereGeometry args={[POLE_R + 0.02, 24, 16]} />
          </mesh>
          <mesh material={M.pole} position-y={0.08}>
            <capsuleGeometry args={[POLE_R + 0.08, 0.04, 8, 24]} />
          </mesh>

          {/* Nomenclatura cruzada */}
          <Sign id="avenue" title={t.avenue} subtitle={t.avenueSub} width={2.3} height={0.5} y={5.3} angle={0} reduced={reduced} fontsReady={fontsReady} />
          <Sign id="street" title={t.street} subtitle={t.streetSub} width={2.3} height={0.5} y={4.8} angle={Math.PI / 2} reduced={reduced} fontsReady={fontsReady} />

          <Semaforo y={3.55} angle={Math.PI / 4} />

          {/* Rutas */}
          <Sign id="work" route="work" title={t.work} subtitle={t.workSub} arrow="right" width={1.7} height={0.44} y={2.4} angle={-0.25} reduced={reduced} fontsReady={fontsReady} />
          <Sign id="about" route="about" title={t.about} subtitle={t.aboutSub} arrow="left" width={1.7} height={0.44} y={1.82} angle={Math.PI / 2 + 0.35} reduced={reduced} fontsReady={fontsReady} />
          <StopSign y={1.05} angle={Math.PI * 0.62} word={t.stop} plate={t.contact} fontsReady={fontsReady} />
        </group>
      </group>

      <Rig reduced={reduced} diorama={diorama} cerro={cerro} sky={sky} />
    </>
  );
}
