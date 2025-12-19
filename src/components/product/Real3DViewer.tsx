'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Stage, PresentationControls, OrbitControls, Html, useProgress } from '@react-three/drei';

function Loader() {
    const { progress } = useProgress();
    return <Html center>{progress.toFixed(1)} % loaded</Html>;
}

// Placeholder Model (Gold Ring)
// Source: Pmndrs Market (Open Source Models)
const DEMO_MODEL_URL = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/ring/model.gltf";

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

interface Real3DViewerProps {
    modelUrl?: string;
}

export const Real3DViewer = ({ modelUrl }: Real3DViewerProps) => {
    // Determine which URL to use (User provided or Demo)
    // For now, we force the Demo URL if the provided URL is not a valid GLB/GLTF
    // In a real app, this would check valid extensions.
    const finalUrl = (modelUrl && modelUrl.endsWith('.glb')) ? modelUrl : DEMO_MODEL_URL;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas dpr={[1, 2]} shadows camera={{ fov: 45 }} style={{ position: "absolute", borderRadius: '12px' }}>
                <color attach="background" args={['#101010']} />

                <Suspense fallback={<Loader />}>
                    <Stage environment="city" intensity={0.6}>
                        <Model url={finalUrl} />
                    </Stage>
                </Suspense>

                <OrbitControls autoRotate autoRotateSpeed={4} enableZoom={true} makeDefault />
            </Canvas>

            <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.8rem',
                pointerEvents: 'none'
            }}>
                3D Model Görüntüleyici (Beta)
            </div>
        </div>
    );
};
