'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    duration: number;
    delay: number;
}

const COLORS = ['#FFD700', '#FFFACD', '#EEE8AA', '#B8860B', '#DAA520', '#FFFFFF'];

export const StarDust = ({ trigger }: { trigger: number }) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (trigger === 0) return;
        console.log("StarDust Triggered:", trigger);

        // Reset and generate new batch
        const newBatch = Array.from({ length: 30 }).map((_, i) => ({
            id: Date.now() + i,
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.7) * 300,
            size: Math.random() * 10 + 5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            duration: Math.random() * 1.5 + 1.0,
            delay: Math.random() * 0.1
        }));

        setParticles(newBatch);

        const timer = setTimeout(() => setParticles([]), 2000);
        return () => clearTimeout(timer);
    }, [trigger]);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 99999,
            overflow: 'visible'
        }}>
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ x: '50%', y: '50%', opacity: 1, scale: 0 }}
                        animate={{
                            x: `calc(50% + ${p.x}px)`,
                            y: `calc(50% + ${p.y}px)`,
                            opacity: [1, 1, 0.8, 0],
                            scale: [0, 1.2, 0.8, 0],
                            rotate: [0, 180, 360, 540]
                        }}
                        transition={{
                            duration: p.duration,
                            delay: p.delay,
                            ease: "circOut"
                        }}
                        style={{
                            position: 'absolute',
                            width: p.size,
                            height: p.size,
                            top: '50%',
                            left: '50%',
                            marginLeft: -(p.size / 2),
                            marginTop: -(p.size / 2),
                        }}
                    >
                        {/* Improved Star using SVG for guaranteed visibility */}
                        <svg
                            viewBox="0 0 24 24"
                            fill={p.color}
                            style={{
                                width: '100%',
                                height: '100%',
                                filter: `drop-shadow(0 0 8px ${p.color}) drop-shadow(0 0 15px ${p.color})`
                            }}
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>

                        {/* Extreme Glow Center */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '40%',
                            height: '40%',
                            backgroundColor: '#fff',
                            borderRadius: '50%',
                            filter: 'blur(2px)',
                            boxShadow: `0 0 20px 5px ${p.color}`,
                            zIndex: -1
                        }} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
