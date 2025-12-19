'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Cloud, Stars, Sparkles } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

function RotatingScene() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.05; // Very slow rotation
        }
        // Subtle camera movement
        state.camera.position.z = 5 + Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
    });

    return (
        <group ref={groupRef}>
            {/* Soft atmospheric clouds */}
            <Cloud opacity={0.3} speed={0.2} segments={20} position={[0, -2, -5]} color="#2a2a3a" />
            <Cloud opacity={0.3} speed={0.2} segments={10} position={[4, 2, -10]} color="#1a1a2a" />

            {/* Holy particles */}
            <Sparkles count={50} scale={10} size={2} speed={0.3} opacity={0.4} color="#ffffff" />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
}

export default function HeroCanvas() {
    return (
        <div className="absolute inset-0 -z-10 bg-[#050505]">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ antialias: true }} dpr={[1, 2]}>
                <fog attach="fog" args={['#050505', 5, 20]} />
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <RotatingScene />
                </Suspense>
            </Canvas>
            {/* Gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/20 to-[#050505] pointer-events-none" />
        </div>
    );
}
