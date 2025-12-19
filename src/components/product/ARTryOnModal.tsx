'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, SwitchCamera, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

interface ARTryOnModalProps {
    isOpen: boolean;
    onClose: () => void;
    productImage: string;
    productCategory: string; // 'Kolye', 'Küpe', 'Yüzük'
}

export const ARTryOnModal = ({ isOpen, onClose, productImage, productCategory }: ARTryOnModalProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [isFrontCamera, setIsFrontCamera] = useState(true);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
    }, [isOpen, isFrontCamera]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: isFrontCamera ? 'user' : 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setHasPermission(true);
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setHasPermission(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    if (!isOpen) return null;

    // Determine Overlay Position based on Category
    const getOverlayStyle = () => {
        switch (productCategory) {
            case 'Kolye': return { top: '65%', left: '50%', width: '30%', transform: 'translate(-50%, -50%)' };
            case 'Küpe': return { top: '45%', left: '35%', width: '10%', transform: 'translate(-50%, -50%)' };
            case 'Yüzük': return { top: '75%', left: '50%', width: '15%', transform: 'translate(-50%, -50%)' };
            default: return { top: '50%', left: '50%', width: '20%', transform: 'translate(-50%, -50%)' };
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#000',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{
                position: 'absolute',
                top: 0,
                width: '100%',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                    <Sparkles size={20} color="#b8860b" />
                    <span style={{ fontWeight: 600, letterSpacing: '1px' }}>TINI AR TRY-ON</span>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '10px', color: '#fff', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
            </div>

            {/* Video Feed */}
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: isFrontCamera ? 'scaleX(-1)' : 'none'
                    }}
                />

                {/* AR Overlay (The Product) */}
                <div style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    ...getOverlayStyle(),
                    transition: 'all 0.3s ease'
                }}>
                    <img
                        src={productImage}
                        alt="AR Product"
                        style={{
                            width: '100%',
                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3)) brightness(1.1)',
                            animation: 'float 3s ease-in-out infinite'
                        }}
                    />
                </div>

                {/* Visual Guides */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    height: '80%',
                    border: '2px solid rgba(184, 134, 11, 0.3)',
                    borderRadius: '20px',
                    pointerEvents: 'none'
                }} />
            </div>

            {/* Controls */}
            <div style={{
                position: 'absolute',
                bottom: '40px',
                display: 'flex',
                gap: '20px',
                zIndex: 10
            }}>
                <button
                    onClick={() => setIsFrontCamera(!isFrontCamera)}
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                >
                    <SwitchCamera size={24} />
                </button>

                <button
                    style={{ background: '#fff', border: 'none', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 20px rgba(0,0,0,0.3)' }}
                    onClick={() => alert('Fotoğraf kaydedildi!')}
                >
                    <div style={{ width: '64px', height: '64px', border: '4px solid #000', borderRadius: '50%' }} />
                </button>

                <button
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                >
                    <Download size={24} />
                </button>
            </div>

            {!hasPermission && (
                <div style={{ position: 'absolute', backgroundColor: '#000', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    Kamera izni gerekiyor.
                </div>
            )}

            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );
};
