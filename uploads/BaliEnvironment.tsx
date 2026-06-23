import React, { useMemo } from 'react';

const Tree = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.3, 3, 5]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      {/* Leaves (Low poly spheres) */}
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.8} />
      </mesh>
      <mesh position={[0.8, 3.2, 0.5]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#3a7033" roughness={0.8} />
      </mesh>
      <mesh position={[-0.6, 2.8, -0.6]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial color="#254a20" roughness={0.8} />
      </mesh>
    </group>
  );
};

const Bush = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#3a7033" roughness={0.9} />
      </mesh>
    </group>
  );
};

const BaliEnvironment: React.FC = () => {
  // Generate random tree positions around the complex (behind and on the sides)
  const trees = useMemo(() => {
    const arr = [];
    // Back row
    for (let i = 0; i < 15; i++) {
      arr.push({
        position: [Math.random() * 60 - 10, 0, Math.random() * -10 - 2] as [number, number, number],
        scale: 0.8 + Math.random() * 0.7
      });
    }
    // Front patches
    for (let i = 0; i < 10; i++) {
      arr.push({
        position: [Math.random() * 60 - 10, 0, Math.random() * 10 + 10] as [number, number, number],
        scale: 0.6 + Math.random() * 0.5
      });
    }
    return arr;
  }, []);

  const bushes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        position: [Math.random() * 50 - 5, 0, Math.random() * -6 - 1] as [number, number, number],
        scale: 0.5 + Math.random() * 0.8
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Base Grass Plane around the complex */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[20, -0.05, 5]}>
        <planeGeometry args={[120, 60]} />
        <meshStandardMaterial color="#82A760" roughness={1} />
      </mesh>

      {trees.map((t, i) => (
        <Tree key={`tree-${i}`} position={t.position} scale={t.scale} />
      ))}
      
      {bushes.map((b, i) => (
        <Bush key={`bush-${i}`} position={b.position} scale={b.scale} />
      ))}
    </group>
  );
};

export default BaliEnvironment;
