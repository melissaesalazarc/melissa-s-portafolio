import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshWobbleMaterial } from "@react-three/drei";

export default function CanvasScene() {
  const group = useRef<any>(null);
  const meshRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.2;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={group} position={[0, -0.5, 0]}>
      <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
        <icosahedronGeometry args={[1.1, 1]} />
        <MeshWobbleMaterial factor={0.5} speed={1} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.8, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={"#111"} />
      </mesh>
    </group>
  );
}
