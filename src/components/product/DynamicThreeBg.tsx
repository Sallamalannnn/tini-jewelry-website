'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useDominantColor } from '@/hooks/useDominantColor';

interface BlobProps {
    color: string;
}

function AnimatedBlob({ color }: BlobProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere ref={meshRef} args={[1.5, 64, 64]} scale={1}>
                <MeshDistortMaterial
                    color={color}
                    speed={3}
                    distort={0.4}
                    radius={1}
                />
            </Sphere>
        </Float>
    );
}

export default function DynamicThreeBg({ imageUrl }: { imageUrl: string | null }) {
    const { bgColor } = useDominantColor(imageUrl);

    // Extract raw color for Three.js
    const color = useMemo(() => {
        if (!bgColor) return '#b8860b';
        return bgColor;
    }, [bgColor]);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
        }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }} alpha>
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={2} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />

                <AnimatedBlob color={color} />

                {/* Secondary smaller blobs for depth */}
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2} position={[-2, 1, -2]}>
                    <Sphere args={[0.8, 32, 32]}>
                        <MeshDistortMaterial color={color} speed={2} distort={0.3} radius={1} opacity={0.4} transparent />
                    </Sphere>
                </Float>

                <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1.5} position={[2, -1.5, -3]}>
                    <Sphere args={[1.2, 32, 32]}>
                        <MeshDistortMaterial color={color} speed={1.5} distort={0.5} radius={1} opacity={0.3} transparent />
                    </Sphere>
                </Float>
            </Canvas>

            {/* Soft gradient overlay to blend into the site better */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
                backdropFilter: 'blur(40px)',
            }} />
        </div>
    );
}
